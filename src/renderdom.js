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
  // 列表渲染
  if (Array.isArray(element)) {
    dom = document.createDocumentFragment();
    for (let item of element) {
      const child = renderDom(item);
      dom.appendChild(child);
    }
    return dom;
  }

  const {
    type,
    props: { children,...attributes },
  } = element;
  // 常规 dom 节点的渲染
  if (typeof type === 'string') {
    dom = document.createElement(type);
  } else if (typeof type === 'function') {
    // React组件的渲染
    if (type.prototype.isReactComponent) {
      // 类组件
      const { props, type: Comp } = element;
      const component = new Comp(props);
      const jsx = component.render();
      dom = renderDom(jsx);
    } else {
      // 函数组件
      const { props, type: Fn } = element;
      const jsx = Fn(props);
      dom = renderDom(jsx);
    }
  } else {
    // 其他情况暂不考虑
    return null
  }

  if (children) {
    // children 存在，对子节点递归渲染
    const childrenDom = renderDom(children);
    if (childrenDom) {
      dom.appendChild(childrenDom);
    }
  }
  updateAttributes(dom, attributes);
  return dom;
}

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

// 将element添加到根容器中
function render(element, container) {
  const dom = renderDom(element);
  container.appendChild(dom);
}

const ReactDOM = {
  render,
};
export default ReactDOM;