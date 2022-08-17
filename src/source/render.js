import createRoot from './fiber'

// 将element添加到根容器中
function render(element, container) {
  createRoot(element, container);
}

const ReactDOM = {
  render,
};
export default ReactDOM;