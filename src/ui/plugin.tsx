import { h, Component } from "preact";
import { FigmaBus } from "../figma_bus";

import figmaLogo from "./assets/figma_logo.svg";
import "./assets/plugin.css";

interface State {
  count: number;
  selectedText: string;
}

export class Plugin extends Component<{}, State> {
  #bus = new FigmaBus();

  override state: State = {
    count: 0,
    selectedText: "",
  };

  getSelectedText = async (): Promise<void> => {
    const text = await this.#bus.emitPromise("getText");
    this.setState({ selectedText: text });
  };

  override componentDidMount() {
    this.#bus.emit("ready");
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    const { count, selectedText } = this.state;

    return (
      <div class="plugin">
        <p>
          <button onClick={this.getSelectedText}>
            Get current selection's text
          </button>
        </p>
        <p>"{selectedText}"</p>

        <p>
          <button onClick={this.handleClick}>Click count: {count}</button>
        </p>

        <img src={figmaLogo} alt="Figma logo" width="32" />
      </div>
    );
  }
}
