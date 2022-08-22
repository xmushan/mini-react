/**
 * 在 commit 阶段同步执行 dom 的挂载
 * 在 workLoop 中，当 nextUnitOfWork 为 null 且 rootFiber 存在时，
 * 表示 render 阶段执行结束，开始调用 commitRoot 函数进入 commit 阶段
 */


/**
 * @param {*} rootFiber 
 * 执行 dom 的挂载操作，这个阶段是同步执行的，不可被打断
 */
function commitRoot(rootFiber) {
  debugger
  commitWork(rootFiber.child)
}

// 递归执行 commit，此过程不中断
function commitWork(fiber) {
  if (!fiber) return
  // 深度优先遍历，先遍历 child，后遍历 sibling
  commitWork(fiber.child)
  let parentDom = fiber.return.stateNode
  parentDom.appendChild(fiber.stateNode)
  commitWork(fiber.sibling)
}

export default commitRoot