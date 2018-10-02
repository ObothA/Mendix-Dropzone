import { Component, createElement } from "react";
import * as DropzoneLib from "dropzone";
import { Alert } from "./Alert";
import "dropzone/dist/dropzone.css";
import "../ui/DropZone.css";

interface DropzoneProps {
    message: string;
    fileEntity: string;
    contextAssociation: string;
    mxObject: mendix.lib.MxObject;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    thumbnailHeight: number;
    thumbnailWidth: number;
}

interface DropzoneState {
    maxFileSizeError: string;
    fileTypeError: string;
    generalError: string;
}

export default class Dropzone extends Component<DropzoneProps, DropzoneState> {
    private dropzoneObject?: DropzoneLib;
    private contextObject?: mendix.lib.MxObject;

    readonly state: DropzoneState = {
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
            this.dropzoneObject = this.setupDropZone();
    }

    componentWillReceiveProps(newProps: DropzoneProps) {
        this.contextObject = newProps.mxObject;
    }

    private setupDropZone() {
        const myDropzone = new DropzoneLib("#dropzoneArea", {
            url: "/file/post",
            maxFilesize: this.props.maxFileSize,
            maxFiles: this.props.maxFiles,
            dictDefaultMessage: this.props.message,
            uploadMultiple: true,
            autoProcessQueue: false,
            acceptedFiles: this.props.fileTypes.replace(/;/gi, ","),
            addRemoveLinks: true,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            createImageThumbnails: true
        });

        myDropzone.on("error", this.handleErrors);

        return myDropzone;
    }

    private handleUploud = () => {
        let reference: string;
        if (this.props.contextAssociation && typeof this.props.contextAssociation.split("/")[0] === "string") {
            reference = this.props.contextAssociation.split("/")[0];
        }

        if (this.dropzoneObject) {
            this.dropzoneObject.files.map((file) => {
                mx.data.create({
                    entity: this.props.fileEntity,
                    callback: (newFileObject) => {
                        if (typeof reference === "string" && newFileObject.isObjectReference(reference) && this.contextObject) {
                            newFileObject.set(reference, this.contextObject.getGuid());
                        }
                        if (this.dropzoneObject) {
                            mx.data.saveDocument(newFileObject.getGuid(), file.name, {}, file,
                                () => {
                                    if (this.dropzoneObject) {
                                        // Process queue here state.dropzoneObject.processQueue();
                                        this.dropzoneObject.removeAllFiles();
                                    }
                                },
                                saveDocumentError => window.logger.error(saveDocumentError)
                            );
                        }
                    },
                    error: (createMxObjectError) => {
                        window.logger.error("Could not commit object:", createMxObjectError);
                    }
                });
            });
        }

    }

    private handleErrors = (file: DropzoneLib.DropzoneFile, message: string) => {
        if (message.toLowerCase().includes("file is too big")) {
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            this.setState({
                maxFileSizeError: displayMessage
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
        }

        if (message.toLowerCase().includes("You can't upload files of this type")) {
            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            this.setState({
                fileTypeError: displayMessage
            });
        } else {
            const displayMessage = `${file.name} wont be uploaded, ${message}`;
            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }

            this.setState({
                generalError: displayMessage
            });
        }
    }
}
