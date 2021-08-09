import { h, Component } from "preact";

require("./app.css");

interface AppState {
  count: number;
}

export class App extends Component<{}, AppState> {
  override state = {
    count: 0,
  };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    const { count } = this.state;

    return (
      <div class="app">
        <h1>Hello</h1>
        <button onClick={this.handleClick}>Click count: {count}</button>
      </div>
    );
  }
}
