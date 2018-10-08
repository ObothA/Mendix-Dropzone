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
    autoUpload: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    onDropMicroflow: string;
    onRemoveMicroflow: string;
    onUploadMicroflow: string;
    mxform: mxui.lib.form._FormBase;
    onDropNanoflow: Nanoflow;
    onRemoveNanoflow: Nanoflow;
    onUploadNanoflow: Nanoflow;
    mxContext: mendix.lib.MxContext;
}

interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}
interface DropzoneState {
    maxFileSizeError: string;
    fileTypeError: string;
    generalError: string;
    maxFilesNumberError: string;

}

export default class Dropzone extends Component<DropzoneProps, DropzoneState> {
    private dropzoneObject!: DropzoneLib;
    private contextObject!: mendix.lib.MxObject;
    private formNode!: HTMLElement;
    private reference!: string;
    private maxFiles!: number;
    private arrayOfFiles: DropzoneLib.DropzoneFile[] = [];
    private numberOfFilesAdded = 1;

    readonly state: DropzoneState = {
        maxFileSizeError: "",
        fileTypeError: "",
        generalError: "",
        maxFilesNumberError: ""
    };

    render() {
        return this.renderDropzone();
    }

    componentDidMount() {
        this.dropzoneObject = this.setupDropZone();
    }

    componentWillReceiveProps(newProps: DropzoneProps) {
        this.contextObject = newProps.mxObject;
    }

    private renderDropzone = () => {
        if (this.props.autoUpload) {
            return createElement("div", { className: "dropzoneContainer" },
                createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getForm }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.maxFileSizeError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileTypeError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.generalError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.maxFilesNumberError)
            );
        } else {
            return createElement("div", { className: "dropzoneContainer" },
                createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton", onClick: this.handleUploud }),
                createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getForm }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.maxFileSizeError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileTypeError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.generalError),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.maxFilesNumberError)
            );
        }
    }

    private setupDropZone() {
        if (this.props.contextAssociation && typeof this.props.contextAssociation.split("/")[0] === "string") {
            this.reference = this.props.contextAssociation.split("/")[0];
            this.maxFiles = this.props.maxFiles;
        } else {
            this.reference = "";
            this.maxFiles = 1;
        }

        const myDropzone = new DropzoneLib(this.formNode, {
            url: "/not/required/",
            dictDefaultMessage: this.props.message,
            uploadMultiple: true,
            autoProcessQueue: false,
            addRemoveLinks: true,
            createImageThumbnails: true,
            thumbnailWidth: this.props.thumbnailWidth,
            thumbnailHeight: this.props.thumbnailHeight
        });

        myDropzone.on("error", this.handleErrorsFromLibrary);

        if (this.props.autoUpload) {
            myDropzone.on("addedfile", (file) => {
                this.arrayOfFiles.push(file);
                this.handleUploud();
            });
        } else {
            myDropzone.on("addedfile", (file) => this.arrayOfFiles.push(file));
        }

        myDropzone.on("removedfile", (file) => { this.handleRemovedFile(file); });
        myDropzone.on("drop", () => { this.onDropMicroflow(this.props.mxObject); });
        return myDropzone;
    }

    private customErrorHandler = (file: DropzoneLib.DropzoneFile) => {
        const fileExtension = file.name.split(".").pop();
        /* File size limit in bytes */
        const sizeLimit = this.props.maxFileSize * (2 ** 20);
        if (file.size > sizeLimit) {
            const displayMessage = `${file.name} wont be uploaded, file too big, limit is ${this.props.maxFileSize} MB(s)`;
            this.setState({
                maxFileSizeError: displayMessage
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        } else if (this.numberOfFilesAdded > this.maxFiles) {
            const displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.maxFiles} files`;
            this.setState({
                maxFilesNumberError: displayMessage
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        } else if (this.props.fileTypes && fileExtension && !this.props.fileTypes.includes(fileExtension)) {
            /* file type error */
            /* Check if file type prop is set, file extesion is set and if the extension is on our list */
            const displayMessage = `${file.name} wont be uploaded, file type not support for upload`;
            this.setState({
                fileTypeError: displayMessage
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        } else {
            this.numberOfFilesAdded++;
            return false;
        }
    }

    /* handle remove file */
    private handleRemovedFile = (file: DropzoneLib.DropzoneFile) => {
        if (this.arrayOfFiles.length) {
            const indexOfFile = this.dropzoneObject.files.indexOf(file);
            this.arrayOfFiles.splice(indexOfFile, 1);
        }
        if (typeof file.status.split("?guid=")[1] === "string") {
            mx.data.remove({
                guid: file.status.split("?guid=")[1],
                callback: () => {
                    this.numberOfFilesAdded--;
                    this.onRemoveMicroflow(this.props.mxObject);
                    this.onRemoveNanoflow();
                },
                error: (removeFileError) => {
                    window.logger.error(`Error attempting to remove mendix object ${removeFileError}`);
                }
            });
        } else {
            this.onRemoveMicroflow(this.props.mxObject);
            this.onRemoveNanoflow();
        }
    }

    /* check for errors before upload */
    private handleUploud = () => {
        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((file) => {
                if (file.status === "added") {
                    /* Perform validation */
                    if (this.customErrorHandler(file)) {
                        this.arrayOfFiles.splice(0, 1);
                    } else {
                        this.upload(file);
                    }
                } else if (!this.props.autoUpload) {
                    /* Perform validation */
                    if (this.customErrorHandler(file)) {
                        this.arrayOfFiles.splice(0, 1);
                    } else {
                        this.upload(file);
                    }
                }
            });
        }

    }

    /* Generic upload function */
    private upload = (file: DropzoneLib.DropzoneFile) => {
        mx.data.create({
            entity: this.props.fileEntity,
            callback: (newFileObject) => {
                if (newFileObject.isObjectReference(this.reference) && this.contextObject) {
                    newFileObject.set(this.reference, this.contextObject.getGuid());
                }
                if (this.dropzoneObject) {
                    /* emit progress initial stage */
                    this.dropzoneObject.emit("uploadprogress", file, 0);
                    mx.data.saveDocument(newFileObject.getGuid(), file.name, {}, file,
                        () => {
                            /* Remove file from array after upload */
                            const indexOfFile = this.dropzoneObject.files.indexOf(file);
                            const newFileStatus = `${this.dropzoneObject.files[indexOfFile].status}?guid=${newFileObject.getGuid()}`;
                            this.dropzoneObject.files[indexOfFile].status = newFileStatus;
                            this.arrayOfFiles.splice(0, 1);
                            this.dropzoneObject.emit("uploadprogress", file, 50);
                            this.dropzoneObject.emit("complete", file);
                            this.dropzoneObject.emit("success", file);
                            this.onUploadMicroflow(this.props.mxObject);
                        },
                        saveDocumentError => window.logger.error(saveDocumentError)
                    );
                }
            },
            error: (createMxObjectError) => {
                window.logger.error("Could not commit object:", createMxObjectError);
            }
        });
    }

    private handleErrorsFromLibrary = (file: DropzoneLib.DropzoneFile, message: string) => {
        const displayMessage = `${file.name} wont be uploaded, ${message}`;
        if (this.dropzoneObject) {
            this.dropzoneObject.removeFile(file);
        }
        this.setState({
            generalError: displayMessage
        });
    }
    private onRemoveMicroflow(mxObject: mendix.lib.MxObject) {
        if (this.props.onRemoveMicroflow) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: this.props.onRemoveMicroflow,
                    guids: [ mxObject.getGuid() ]
                },
                origin: this.props.mxform,
                error: (error) => {
                    mx.ui.error(error.message);
                }
            });
        }

    }
    private onUploadMicroflow(mxObject: mendix.lib.MxObject) {
        if (this.props.onUploadMicroflow) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: this.props.onUploadMicroflow,
                    guids: [ mxObject.getGuid() ]
                },
                origin: this.props.mxform,
                error: (error) => {
                    mx.ui.error(error.message);
                }
            });
        }

    }
    private onDropMicroflow(mxObject: mendix.lib.MxObject) {
        if (this.props.onDropMicroflow) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: this.props.onDropMicroflow,
                    guids: [ mxObject.getGuid() ]
                },
                origin: this.props.mxform,
                error: (error) => {
                    mx.ui.error(error.message);
                }
            });
        }

    }
    private onRemoveNanoflow() {
        mx.data.callNanoflow({
            nanoflow: this.props.onRemoveNanoflow,
            origin: this.props.mxform,
            context: this.props.mxContext,
            error: (error) => {
                mx.ui.error(error.message);
            }
        });
    }

    private getForm = (node: HTMLElement) => {
    this.formNode = node;
}
}
