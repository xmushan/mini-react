import { updateAttributes } from './renderDom'
import { getDeletions } from './fiber'

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
  const deletions = getDeletions()
  deletions.forEach(commitWork)
  commitWork(rootFiber.child)
}

// 递归执行 commit，此过程不中断
function commitWork(fiber) {
  if (!fiber) return


  let parentDom = fiber.return.stateNode
  if (fiber.flag === 'Deletion') {
    if (typeof fiber.element?.type !== 'function') {
      parentDom.removeChild(fiber.stateNode)
    }
    return
  }

  // 深度优先遍历。先遍历child，后遍历sibling
  commitWork(fiber.child)
  if (fiber.flag === 'Placement') {
    // 添加 dom
    const targetPositionDom = parentDom?.childNodes && parentDom.childNodes[fiber.index] // 插入到哪个dom之前
    if (targetPositionDom) { 
      //targetPositionDom 存在，则插入
      parentDom.insertBefore(fiber.stateNode,targetPositionDom)
    } else {
      // targetPositionDom不存在，插入到最后
      parentDom.appendChild(fiber.stateNode)
    }
  } else if (fiber.flag == 'Update') {
    const { children, ...newAttributes } = fiber.elemet.props
    const oldAttributes = Object.assign({},fiber.alternate.element.props)
    delete oldAttributes.children
    updateAttributes(fiber.stateNode, newAttributes,oldAttributes)
  }
  commitWork(fiber.sibling)
}

export default commitRoot