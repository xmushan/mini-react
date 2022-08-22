import { deleteFiber } from './fiber'

function reconcileChildren(workInProgress, eles) {
  // 当前遍历的子元素在父节点下的下标
  let index = 0
  // 记录上一个兄弟节点
  let prevSibling = null
  // 对比旧的fiber节点
  let oldFiber = workInProgress?.alternate?.child

  // 对子元素迭代
  while (index < eles.length || oldFiber) {
    const ele = eles[index]
    let newFiber = null
    const isSameType = ele?.type && oldFiber?.element?.type && ele.type === oldFiber.element.type
    // 标签相同，表示更新
    if (isSameType) {
      newFiber = {
        element: {
          ...ele,
          props: ele.props
        },
        stateNode: oldFiber.stateNode,
        return: workInProgress,
        alternate: oldFiber,
        flag: 'Update'
      }
    } else {  // type 不同，表示添加或者删除
      if (ele || ele === 0) {
        // ele 存在，表示添加
        newFiber = {
          ele,
          stateNode: null,
          return: workInProgress,
          alternate: null,
          flag: 'Placement',
          index
        }
      }
      if (oldFiber) {
        oldFiber.flag = 'Deletion'
        deleteFiber(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      // 如果下标为 0，则将当前fiber设置为父 fiber 的 child
      workInProgress.child = newFiber
      prevSibling = newFiber
    } else if (newFiber){
       // newFiber 和 prevSibling 存在，通过 sibling 作为兄弟 fiber 连接
      prevSibling.sibling = newFiber
      prevSibling = newFiber
    }
    index++
  }
}

export {
  reconcileChildren
}