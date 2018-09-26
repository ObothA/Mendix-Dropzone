import { Component, createElement } from "react";
import "../ui/DropZone.css";
import "dropzone/dist/dropzone.css";
import { Alert } from "./Alert";

import * as Dropzone from "dropzone";

interface DropZoneProps {
    message: string;
    fileEntity: string;
    contextAssociation: string;
    mxObject: mendix.lib.MxObject;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
}

interface DropZoneState {
    dropzoneObject: Dropzone | null;
    contextObject: mendix.lib.MxObject;
    maxFileSizeError: string;
    fileTypeError: string;
    generalError: string;
}

class DropZone extends Component<DropZoneProps, DropZoneState> {
    state: DropZoneState = {
        dropzoneObject: null,
        contextObject: this.props.mxObject,
        maxFileSizeError: "",
        fileTypeError: "",
        generalError: ""
    };

    render() {
        return createElement("div", { className: "dropzoneContainer" },
            createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton", onClick: this.handleUploud }),
            createElement("form", { className: "dropzone", id: "dropzoneArea" }),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.maxFileSizeError),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileTypeError),
            createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.generalError)
        );
    }

    componentDidMount() {
        this.setState({
            dropzoneObject: this.setupDropZone()
        });
    }

    componentWillReceiveProps(newProps: DropZoneProps) {
        this.setState({
            contextObject: newProps.mxObject
        });
    }

    private setupDropZone() {
        const myDropzone = new Dropzone("#dropzoneArea", {
            url: "/file/post",
            maxFilesize: this.props.maxFileSize,
            maxFiles: this.props.maxFiles,
            dictDefaultMessage: this.props.message,
            uploadMultiple: true,
            autoProcessQueue: false,
            acceptedFiles: this.props.fileTypes,
            addRemoveLinks: true
        });

        myDropzone.on("error", this.handleErrors);

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
                        }
                        if (this.state.dropzoneObject) {
                            mx.data.saveDocument(obj.getGuid(), file.name, {}, file,
                                () => {
                                    if (this.state.dropzoneObject) {
                                        // process queue here state.dropzoneObject.processQueue();
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

    private handleErrors = (file: Dropzone.DropzoneFile, message: string) => {
        if (message.toLowerCase().includes("file is too big")) {
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            this.setState({
                maxFileSizeError: displayMessage
            });

            if (this.state.dropzoneObject) {
                this.state.dropzoneObject.removeFile(file);
            }
        }

        if (message.toLowerCase().includes("You can't upload files of this type")) {
            if (this.state.dropzoneObject) {
                this.state.dropzoneObject.removeFile(file);
            }
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            this.setState({
                fileTypeError: displayMessage
            });
        } else {
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            if (this.state.dropzoneObject) {
                this.state.dropzoneObject.removeFile(file);
            }

            this.setState({
                generalError: displayMessage
            });
        }
    }
}

export default DropZone;
