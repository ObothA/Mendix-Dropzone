import { Component, createElement } from "react";
import "../ui/DropZone.css";
import "dropzone/dist/dropzone.css";

import * as Dropzone from "dropzone";

interface DropZoneProps {
    message: string;
    fileEntity: string;
    contextAssociation: string;
    mxObject: mendix.lib.MxObject;
}

interface DropZoneState {
    dropzoneObject: Dropzone | null;
    contextObject: mendix.lib.MxObject;
}

class DropZone extends Component<DropZoneProps, DropZoneState> {
    state: DropZoneState = {
        dropzoneObject: null,
        contextObject: this.props.mxObject
    };
    render() {
        return createElement("div", { className: "dropzoneContainer" },
            createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton", onClick: this.handleUploud }),
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

        return myDropzone;
    }

    private handleUploud = () => {
        let reference = "";
        if (this.props.contextAssociation && typeof this.props.contextAssociation.split("/")[0] === "string") {
            reference = this.props.contextAssociation.split("/")[0];
        }

        if (this.state.dropzoneObject) {
        this.state.dropzoneObject.files.map((file) => {
            mx.data.create({
                entity: this.props.fileEntity,
                callback: (obj) => {
                    if (obj.isObjectReference(reference)) {
                        obj.set(reference, this.state.contextObject.getGuid());
                        // obj2 = obj;
                    }
                    if (this.state.dropzoneObject) {
                        mx.data.saveDocument(obj.getGuid(), file.name, {}, file,
                            () => {
                                if (this.state.dropzoneObject) {
                                    // state.dropzoneObject.processQueue();
                                    this.state.dropzoneObject.removeAllFiles();
                                }
                            },
                            // tslint:disable-next-line:no-console
                            (e) => { console.error(e); });
                    }
                },
                error(e) {
                    // tslint:disable-next-line:no-console
                    console.error("Could not commit object:", e);
                }
            });
        });
    }

    }
}

export default DropZone;
