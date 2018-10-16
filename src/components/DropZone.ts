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
    onDropEvent: string;
    onRemoveEvent: string;
    onUploadEvent: string;
}

interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

interface DropzoneState {
    fileError: string;
}

export default class Dropzone extends Component<DropzoneProps, DropzoneState> {
    private dropzoneObject!: DropzoneLib;
    private contextObject!: mendix.lib.MxObject;
    private formNode!: HTMLElement;
    private reference!: string;
    private maxFiles!: number;
    private arrayOfFiles: DropzoneLib.DropzoneFile[] = [];
    private numberOfFilesAdded = 1;
    private removeErrorDisplay = false;

    readonly state: DropzoneState = {
        fileError: ""
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
            return createElement("div", { className: "dropzoneContainer" },
                this.props.autoUpload ? "" : createElement("button", {  className: "btn mx-button uploadButton", onClick: this.handleUploud }, "upload file(s)"),
                createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFormNode }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileError)
            );
    }

    // private alert(validationError: string) {
    //     return createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, validationError);
    // }

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
                this.enableRemoveError();
                this.handleUploud();
            });
        } else {
            myDropzone.on("addedfile", (file) => {
                this.arrayOfFiles.push(file);
                this.enableRemoveError();
            });
        }

        myDropzone.on("removedfile", (file) => { this.handleRemovedFile(file); });
        myDropzone.on("drop", this.handleOnDropEvent);

        return myDropzone;
    }

    private enableRemoveError = () => {
        setTimeout(() => { this.removeErrorDisplay = true; }, 1000);
    }

    private handleOnDropEvent = () => {
        /* deal with on drop events */
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

        if (this.props.onDropEvent !== "doNothing") {
            this.executeAction(this.props.onDropEvent, this.props.onDropMicroflow, this.props.onDropNanoflow);
        }
     }

    private customErrorHandler = (file: DropzoneLib.DropzoneFile) => {
        const fileExtension = file.name.split(".").pop();
        /* File size limit in bytes */
        const sizeLimit = this.props.maxFileSize * (2 ** 20);
        if (file.size > sizeLimit) {
            const displayMessage = `${file.name} wont be uploaded, file too big, limit is ${this.props.maxFileSize} MB(s)\n`;
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        } else if (this.numberOfFilesAdded > this.maxFiles) {
            const displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.maxFiles} files\n`;
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        } else if (this.props.fileTypes && fileExtension && !this.props.fileTypes.includes(fileExtension)) {
            /* file type error */
            /* Check if file type prop is set, file extesion is set and if the extension is on our list */
            const displayMessage = `${file.name} wont be uploaded, file type not support for upload\n`;
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
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
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

        if (this.arrayOfFiles.length) {
            const indexOfFile = this.dropzoneObject.files.indexOf(file);
            this.arrayOfFiles.splice(indexOfFile, 1);
        }
        if (typeof file.status.split("?guid=")[1] === "string") {
            mx.data.remove({
                guid: file.status.split("?guid=")[1],
                callback: () => {
                    this.numberOfFilesAdded--;
                    /* deal with on remove events */
                    if (this.props.onRemoveEvent !== "doNothing") {
                        this.executeAction(this.props.onRemoveEvent, this.props.onRemoveMicroflow, this.props.onRemoveNanoflow);
                    }
                },
                error: error => {
                    mx.ui.error(`Error attempting to remove dropzone item  ${error}`);
                }
            });
        } else {
            /* deal with on remove events */
            if (this.props.onRemoveEvent !== "doNothing") {
                this.executeAction(this.props.onRemoveEvent, this.props.onRemoveMicroflow, this.props.onRemoveNanoflow);
            }
        }
    }

    /* check for errors before upload */
    private handleUploud = () => {
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

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
                        () => { this.saveFile(file, newFileObject); },
                        saveDocumentError => mx.ui.error(`${saveDocumentError}`)
                    );
                }
            },
            error: (createMxObjectError) => {
                mx.ui.error(`Could not commit object:, ${createMxObjectError}`);
            }
        });
    }

    private saveFile(file: DropzoneLib.DropzoneFile, newFileObject: mendix.lib.MxObject) {
        /* Remove file from array after upload */
        const indexOfFile = this.dropzoneObject.files.indexOf(file);
        const newFileStatus = `${this.dropzoneObject.files[indexOfFile].status}?guid=${newFileObject.getGuid()}`;
        this.dropzoneObject.files[indexOfFile].status = newFileStatus;
        this.arrayOfFiles.splice(0, 1);
        this.dropzoneObject.emit("uploadprogress", file, 50);
        this.dropzoneObject.emit("complete", file);
        this.dropzoneObject.emit("success", file);
         /* deal with on upload events */
        if (this.props.onUploadEvent !== "doNothing") {
            this.executeAction(this.props.onUploadEvent, this.props.onUploadMicroflow, this.props.onUploadNanoflow);
        }
    }

    private handleErrorsFromLibrary = (file: DropzoneLib.DropzoneFile, message: string) => {
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

        const displayMessage = `${file.name} wont be uploaded, ${message}\n`;
        if (this.dropzoneObject) {
            this.dropzoneObject.removeFile(file);
        }
        this.setState({
            fileError: `${this.state.fileError} ${displayMessage}`
        });
    }

    private getFormNode = (node: HTMLElement) => {
        this.formNode = node;
    }
    private executeAction(event: string, microflow?: string, nanoflow?: Nanoflow) {
        const { mxObject, mxform } = this.props;

        if (event === "callMicroflow" && microflow) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: microflow,
                    guids: [ mxObject.getGuid() ]
                },
                origin: mxform,
                error: error => mx.ui.error(`error while executing action ${microflow} ${error.message}`)
            });

        } else if (event === "callNanoflow" && nanoflow && nanoflow.nanoflow) {
            const context = new mendix.lib.MxContext();
            mx.data.callNanoflow({
                nanoflow,
                origin: mxform,
                context,
                error: error => mx.ui.error(`error while executing action nanoflow ${error.message}`)
            });
        }
    }
}
