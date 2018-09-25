import { Component, createElement } from "react";
import "../ui/DropZone.css";
import "dropzone/dist/dropzone.css";

import * as Dropzone from "dropzone";

interface DropZoneProps {
  sampleText: string;
  message: string;
}

class DropZone extends Component<DropZoneProps, {}> {
  render() {
    return createElement("div", { className: "dropzoneContainer" },
      createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton" }),
      createElement("form", { className: "dropzone", id: "dropzoneArea" })
    );
  }

  componentDidMount() {
    this.setupDropZone();
  }

  private setupDropZone() {
    const myDropzone = new Dropzone("#dropzoneArea", {
        url: "/file/post",
        maxFilesize: 3,
        maxFiles: 1,
        dictDefaultMessage: this.props.message,
        uploadMultiple: true,
        autoProcessQueue: false,
        acceptedFiles: "",
        addRemoveLinks: true});

    myDropzone.on("success", () => alert("..."));
  }
}

export default DropZone;
