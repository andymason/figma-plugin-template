// Main backend plugin code goes in here
import { FigmaBus } from "./figma_bus";

const bus = new FigmaBus();

function onUiReady() {
  console.log("Figma plugin: Received 'READY' event from UI");
}

bus.on("ready", onUiReady, true);

function getText(): void {
  const { selection } = figma.currentPage;
  const textNode = selection.find(({ type }) => type === "TEXT");
  const text = textNode?.type === "TEXT" ? textNode.characters : "";

  bus.emit("getText", text);
}

bus.on("getText", getText);

figma.showUI(__html__);
