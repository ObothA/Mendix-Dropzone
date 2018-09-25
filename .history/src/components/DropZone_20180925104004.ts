import { Component, createElement } from "react";
import "../ui/DropZone.css";
import "dropzone/dist/dropzone.css";

import * as Dropzone from "dropzone";

interface DropZoneProps {
    message: string;
    fileEntity: string;
    contextAssociation: string;
}

interface DropZoneState {
    dropzoneObject: Dropzone | null;
}

class DropZone extends Component<DropZoneProps, DropZoneState> {
    state: DropZoneState = {
        dropzoneObject: null
    };
    render() {
        return createElement("div", { className: "dropzoneContainer" },
            createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton" }),
            createElement("form", { className: "dropzone", id: "dropzoneArea" })
        );
    }

    componentDidMount() {
        this.setState({
            dropzoneObject: this.setupDropZone()
        });
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
            addRemoveLinks: true
        });

        myDropzone.on("success", () => alert("..."));

        myDropzone.on("addedfile", (file) => alert(file.name));
        return myDropzone;
    }

    private handleUploud() {

    }
}

export default DropZone;
