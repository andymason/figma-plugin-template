import { h, Component } from "preact";

import figmaLogo from "./assets/figma_logo.svg";
import "./assets/plugin.css";

interface State {
  count: number;
}

export class Plugin extends Component<{}, State> {
  override state = {
    count: 0,
  };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    const { count } = this.state;

    return (
      <div class="plugin">
        <h1>Hello</h1>
        <img src={figmaLogo} alt="Figma logo" />
        <button onClick={this.handleClick}>Click count: {count}</button>
      </div>
    );
  }
}
