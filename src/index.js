// import React from 'react';
// import ReactDOM from 'react-dom/client';
import { Component } from 'react';
import ReactDOM from './source/render'
import App from './App';

class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="class-component">
        <div>this is a class Component</div>
        <div>prop value is: {this.props.value}</div>
      </div>
    );
  }
}

function FunctionComponent(props) {
  return (
    <div className="function-component">
      <div>this is a function Component</div>
      <div>prop value is: {props.value}</div>
    </div>
  );
}

setTimeout(() => {
  const jsx = (
    <div className="deep1-box">
      <ClassComponent value={666} />
      <FunctionComponent value={100} />
      <div className="deep2-box-1">
        <p> this is a red p</p>
        <div className="deep3-box">
          {true && <div>condition true</div>}
          {false && <div>condition false</div>}
          <input
            type="button"
            value="say hello"
            onClick={() => {
              alert('hello');
            }}
          />
        </div>
      </div>
      <div className="deep2-box-2">
        {['item1', 'item2', 'item3'].map((item) => (
          <li style={{ fontSize: '20px' }} key={item}>
            {item}
          </li>
        ))}
      </div>
    </div>
  );

  ReactDOM.render(jsx, document.getElementById('root'));
}, 1000);


ReactDOM.render(App, document.getElementById('root')); 
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
