import createRoot from './fiber'

// 将element添加到根容器中
function render(element, container) {
  // const dom = renderDom(element);
  // container.appendChild(dom);
  createRoot(element, container);
}

const ReactDOM = {
  render,
};
export default ReactDOM;