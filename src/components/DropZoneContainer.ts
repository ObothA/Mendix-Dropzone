import { Component, createElement } from "react";
import DropZone from "./DropZone";

export interface DropZoneContainerProps {
  sampleText: string;
}

export default class DropZoneContainer extends Component<DropZoneContainerProps, {}> {
  render() {
      return createElement(DropZone, {
          sampleText: this.props.sampleText
      });
  }
}
