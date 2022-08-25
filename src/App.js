
import './App.css'
import { Component } from './source/react'

console.log(new Component,'Component')
class ClassComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
  addCount = () => {
    console.log(this)
    this.setState({
      count: this.state.count + 1
    })
  }



  render() {
    return (
      <div className="class-component">
        <div>this is a class Component</div>
        <div>prop value is: {this.props.value}</div>
        <button onClick={this.addCount}>click{ this.state.count }</button>
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

console.log( new ClassComponent )
const App = (
  <div>
    {/* <div className="red">123123</div> */}
    <ClassComponent/>
  </div>
)

export default App;
