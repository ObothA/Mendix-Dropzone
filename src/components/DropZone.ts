import { Component, createElement } from "react";

import * as Dropzone from "dropzone";

interface DropZoneProps {
  sampleText: string;
}

class DropZone extends Component<DropZoneProps, {}> {
  render() {
      // return createElement("div", {}, this.renderDropZone());
      // const myDropzone = new Dropzone("div#myId", { url: "/file/post" });
    return createElement("div", { className: "dropzone", id: "myId" });
  }

  componentDidMount() {
    const myDropzone = new Dropzone("#myId", { url: "/file/post" });

    myDropzone.on("success", () => alert("..."));
  }

  // private renderDropZone = () => {
  //       const dropZone = new Dropzone(this.DropContainer(), { url: "/file/post" }) as any;

  //       return dropZone;
  //   }

  // private DropContainer = (): HTMLElement => {

  //     return document.getElementById("root") as HTMLElement;
  //   }
}

export default DropZone;
