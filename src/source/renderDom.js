// 更新dom属性
function updateAttributes(dom,attributes){
  Object.keys(attributes).forEach(objKey => {
    // 事件的处理
    if (objKey.startsWith('on')) {
      const eventName  = objKey.slice(2).toLowerCase()
      dom.addEventListener(eventName, attributes[objKey])
    } else if(objKey === 'className') {
      const classes = attributes[objKey].split(' ')
      classes.forEach(className => {
        dom.classList.add(className)
      })
    } else if (objKey === 'style') {
      const style = attributes[objKey]
      Object.keys(style).forEach(styleKey => {
        dom.style[styleKey] = style[styleKey]
      })
    }
  })
}

// 将 React.Element 渲染为真实 dom
function renderDom(element) {
  let dom = null; // 要返回的 dom

  // 条件渲染为假，返回 null
  if (!element && element !== 0) {
    return null;
  }
  // 如果 element 本身为 string，返回文本节点
  if (typeof element === 'string') {
    dom = document.createTextNode(element);
    return dom;
  }
  // 如果 element 本身为 number，将其转为 string 后返回文本节点
  if (typeof element === 'number') {
    dom = document.createTextNode(String(element));
    return dom;
  }

  // react 组件的渲染
  if(typeof element === 'function') {
    dom = document.createDocumentFragment()
  }


  const {
    type,
    props: { children,...attributes },
  } = element;
  // 常规 dom 节点的渲染
  if (typeof type === 'string') {
    dom = document.createElement(type);
  } else {
    // 其他情况暂不考虑
    return null
  }

  updateAttributes(dom, attributes);
  return dom;
}

export default renderDom