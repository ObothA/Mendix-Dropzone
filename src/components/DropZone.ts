import { Component, createElement } from "react";
import "../ui/DropZone.css";

import * as Dropzone from "dropzone";

interface DropZoneProps {
  sampleText: string;
}

class DropZone extends Component<DropZoneProps, {}> {
  render() {
    return createElement("form", { className: "dropzone", id: "dropzoneArea" });
  }

  componentDidMount() {
    this.setupDropZone();
  }

  private setupDropZone() {
    const myDropzone = new Dropzone("#dropzoneArea", { url: "/file/post" });

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
