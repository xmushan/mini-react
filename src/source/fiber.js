import renderDom from './renderDom'
import commitRoot from './commit'
// 下一个要处理的任务单元
let nextUnitofWork = null
let rootFiber = null

function performUnitOfWork(workInProgress) {
  /**
   * 根据 fiber 创建 dom
   */
  // 根据 fiber 去创建 dom，当 fiber 的 stateNode 属性为空时，表示还没有对其创建 dom，调用 renderDom 函数，根据 fiber 的 element 属性去创建对应的 dom，并将其挂载到父节点下
  if (!workInProgress.stateNode) {
    workInProgress.stateNode = renderDom(workInProgress.ele)
  }
  // 如果 fiber有父fiber且有 dom，向上寻找能挂载 dom 的节点进行 dom 挂载
  // if (workInProgress.return && workInProgress.stateNode) {
  //   let parentFiber = workInProgress.return;
  //   while (!parentFiber.stateNode) {
  //     parentFiber = parentFiber.return;
  //   }
  //   console.log(parentFiber.stateNode,'lopo')
  //   parentFiber.stateNode.appendChild(workInProgress.stateNode);
  // }

  /**
   * 构建Fiber树
   */
  let children = workInProgress.ele?.props?.children;
  let type = workInProgress.ele?.type;

  if (typeof type === 'function') {
    // 当前 fiber 对应React组件，对其return 迭代
    if (type.prototype.isReactComponent) {
      // 类组件，通过生成的类实例的 render 方法返回 jsx
      const { props, type: Comp } = workInProgress.ele;
      const component = new Comp(props);
      const jsx = component.render();
      children = [jsx]
    } else {
      // 函数组件，直接调用函数返回 jsx
      const { props, type: Fn } = workInProgress.ele
      const jsx = Fn(props)
      children = [jsx]
    }
  }

  // 对 children 迭代
  if (children || children === 0) {
    let eles = Array.isArray(children) ? children : [children]
    // 打平列表渲染时二维数组的情况
    eles = eles.flat();
    // 当前遍历的子元素在父节点下的下标
    let index = 0
    // 记录上一个兄弟节点
    let prevSibling = null

    // 对子元素迭代
    while (index < eles.length) {
      const ele = eles[index]
      const newFiber = {
        ele,
        return: workInProgress,
        stateNode: null
      }
      // 如果下标为 0，则将当前 fiber 设置为父 fiber 的 child
      if (index === 0) {
        workInProgress.child = newFiber
      } else {
        // 否则通过 sibling 作为兄弟 fiber 连接
        prevSibling.sibling = newFiber
      }
      prevSibling = newFiber
      index++
    }
  }

  /**
   * 设置下一个工作单元
   * 
   * fiber 树的遍历采用深度优先遍历，如果当前 fiber 有 child，
   * 则设置 child 作为下一个工作单元；若无 child 但是有 sibling，
   * 则设置 sibling 作为下一个工作单元；
   * 如果都没有则深度优先遍历通过 return 返回父 fiber
   * 
   */
  if (workInProgress.child) {
    // 如果有子 fiber，则下一个工作单元是子 fiber
    nextUnitofWork = workInProgress.child
  } else {
    let nextFiber = workInProgress
    while (nextFiber) {
      if (nextFiber.sibling) {
        // 没有子 fiber 有兄弟 fiber，则下一个工作单元是兄弟 fiber
        nextUnitofWork = nextFiber.sibling
        return
      } else {
        // 子 fiber 和兄弟 fiber 都没有，深度优先遍历返回上一层
        nextFiber = nextFiber.return
      }
    }
    if (!nextFiber) {
      // 若返回最顶层，表示迭代结束，将 nextUnitOfWork 置空
      nextUnitofWork = null
    }
  }
}

/**
 * 这个函数中我们会浏览器每帧的空闲时间段迭代处理 nextUnitOfWork，
 * 若一帧处理不完，则中断当前迭代，留到下一帧继续处理
 */
function workLoop(deadLine){
  let shouldYield = false;
  while (nextUnitofWork && !shouldYield){
    // 循环执行工作单元
    performUnitOfWork(nextUnitofWork)
    shouldYield = deadLine.timeRemaining() < 1
  }
  // 进入commit阶段
  if (!nextUnitofWork && rootFiber){
    commitRoot(rootFiber)
    rootFiber = null
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function createRoot(ele, container) {
  rootFiber = {
    // 记录真实的DOM节点
    stateNode: container,
    ele: {
      props: { children: [ele] }
    }
  }
  nextUnitofWork = rootFiber
}

export default createRoot