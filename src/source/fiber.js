import { renderDom } from './react-dom';
import { commitRoot } from './commit';
import { reconcileChildren } from './reconciler';

let nextUnitOfWork = null;
let workInProgressRoot = null; // 当前工作的 fiber 树
let currentRoot = null; // 上一次渲染的 fiber 树
let deletions = []; // 要执行删除 dom 的 fiber

// 将某个 fiber 加入 deletions 数组
export function deleteFiber(fiber) {
  deletions.push(fiber);
}

// 获取 deletions 数组
export function getDeletions() {
  return deletions;
}

// 触发渲染
export function commitRender() {
  workInProgressRoot = {
    stateNode: currentRoot.stateNode, // 记录对应的真实 dom 节点
    element: currentRoot.element,
    alternate: currentRoot, // 指向对应的current fiber
  };
  nextUnitOfWork = workInProgressRoot;
}

// 创建 rootFiber 作为首个 nextUnitOfWork
export function createRoot(element, container) {
  workInProgressRoot = {
    stateNode: container, // 记录对应的真实 dom 节点
    element: {
      // 挂载 element
      props: { children: [element] },
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = workInProgressRoot;
}

/**
 * fiber 树的遍历采用深度优先遍历，如果当前 fiber 有 child，则设置 child 作为下一个工作单元,
 * 若无 child 但是有 sibling，则设置 sibling 作为下一个工作单元；如果都没有则深度优先遍历通过 return 返回父 fiber.
 * 
 * performUnitOfWork 只处理 fiber 创建对应 dom 但是并不挂载
 */
function performUnitOfWork(workInProgress) {
  if (!workInProgress.stateNode) {
    // 若当前 fiber 没有 stateNode，则根据 fiber 挂载的 element 的属性创建
    workInProgress.stateNode = renderDom(workInProgress.element);
  }
  // if (workInProgress.return && workInProgress.stateNode) {
  //   // 如果 fiber 有父 fiber且有 dom
  //   // 向上寻找能挂载 dom 的节点进行 dom 挂载
  //   let parentFiber = workInProgress.return;
  //   while (!parentFiber.stateNode) {
  //     parentFiber = parentFiber.return;
  //   }
  //   parentFiber.stateNode.appendChild(workInProgress.stateNode);
  // }

  let children = workInProgress.element?.props?.children;

  let type = workInProgress.element?.type;
  // 当 React.element 的 type 属性是 function 时，表示 react 组件，我们将其渲染后所得到的 jsx 作为 children 处理
  if (typeof type === 'function') {
    // 当前 fiber 对应 React 组件时，对其 return 迭代
    if (type.prototype.isReactComponent) {
      // 类组件
      updateClassComponent(workInProgress);
    } else {
      // 函数组件
      const { props, type: Fn } = workInProgress.element;
      const jsx = Fn(props);
      children = [jsx];
    }
  }

  if (children || children === 0) {
    // children 存在时，对 children 迭代
    let elements = Array.isArray(children) ? children : [children];
    // 打平列表渲染时二维数组的情况（暂不考虑三维及以上数组的情形）
    elements = elements.flat();
    reconcileChildren(workInProgress, elements);
  }

  // 设置下一个工作单元
  if (workInProgress.child) {
    // 如果有子 fiber，则下一个工作单元是子 fiber
    nextUnitOfWork = workInProgress.child;
  } else {
    let nextFiber = workInProgress;
    while (nextFiber) {
      if (nextFiber.sibling) {
        // 没有子 fiber 有兄弟 fiber，则下一个工作单元是兄弟 fiber
        nextUnitOfWork = nextFiber.sibling;
        return;
      } else {
        // 子 fiber 和兄弟 fiber 都没有，深度优先遍历返回上一层
        nextFiber = nextFiber.return;
      }
    }
    if (!nextFiber) {
      // 若返回最顶层，表示迭代结束，将 nextUnitOfWork 置空
      nextUnitOfWork = null;
    }
  }
}

// 类组件的更新
function updateClassComponent(fiber) {
  let jsx;
  if (fiber.alternate) {
    // 有旧组件，复用
    const component = fiber.alternate.component;
    fiber.component = component;
    component._UpdateProps(fiber.element.props);
    jsx = component.render();
  } else {
    // 没有则创建新组件
    const { props, type: Comp } = fiber.element;
    const component = new Comp(props);
    fiber.component = component;
    jsx = component.render();
  }

  reconcileChildren(fiber, [jsx]);
}

/**
 * 浏览器每帧的空闲时间段迭代处理 nextUnitOfWork，若一帧处理不完，则中断当前迭代，留到下一帧继续处理
 */
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 循环执行工作单元任务
    performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 当 nextUnitOfWork 为 null 且 workInProgressRoot 存在时,表示render结束，进入commit阶段
  if (!nextUnitOfWork && workInProgressRoot) {
    // 表示进入 commit 阶段
    commitRoot(workInProgressRoot);
    currentRoot = workInProgressRoot;
    workInProgressRoot = null;
    deletions = [];
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
