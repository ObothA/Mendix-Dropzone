import { Component, createElement } from "react";
import * as DropzoneLib from "dropzone";
import { Alert } from "./Alert";
import "dropzone/dist/dropzone.css";
import "../ui/DropZone.css";
import { Nanoflow } from "./DropZoneContainer";

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
    reference: string;
    fileobject: ReturnObject;
    executeAction: (event: string, microflow?: string, nanoflow?: Nanoflow) => void;
    createObject: (fileEntity: string, reference: string, mxObject: mendix.lib.MxObject, file: DropzoneLib.DropzoneFile) => void;
    saveFileToDatabase: (guid: string, file: DropzoneLib.DropzoneFile) => void;
}

export interface ReturnObject {
    file?: DropzoneLib.DropzoneFile;
    guid: string;
}

interface DropzoneState {
    fileError: string;
}

export default class Dropzone extends Component<DropzoneProps, DropzoneState> {
    private dropzoneObject!: DropzoneLib;
    private formNode!: HTMLElement;
    private arrayOfFiles: ReturnObject[] = [];
    private numberOfFilesAdded = 0;
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
        if (newProps.fileobject.file) {
            this.arrayOfFiles.push(newProps.fileobject);
            this.numberOfFilesAdded++;
        }
        if (this.props.autoUpload) {
            this.handleUploud();
        }
    }

    private renderDropzone = () => {
            return createElement("div", { className: "dropzoneContainer" },
                this.props.autoUpload ? "" : createElement("button", {  className: "btn mx-button uploadButton", onClick: this.handleUploud }, "upload file(s)"),
                createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFormNode }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileError)
            );
    }

    private setupDropZone() {

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

        myDropzone.on("addedfile", (file) => {
                this.enableRemoveError();
                const { fileEntity, reference, mxObject } = this.props;
                this.props.createObject(fileEntity, reference, mxObject, file);
            });

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
            this.props.executeAction(this.props.onDropEvent, this.props.onDropMicroflow, this.props.onDropNanoflow);
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
        } else if (this.numberOfFilesAdded > this.props.maxFiles) {
            const displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.props.maxFiles} files\n`;
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
            return false;
        }
    }

    /* handle remove file */
    private handleRemovedFile = (file: DropzoneLib.DropzoneFile) => {
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (file === fileobject.file) {
                    mx.data.remove({
                        guid: fileobject.guid,
                        callback: () => {
                            this.numberOfFilesAdded--;
                            this.arrayOfFiles.splice(this.arrayOfFiles.indexOf(fileobject), 1);
                            /* deal with on remove events */
                            if (this.props.onRemoveEvent !== "doNothing") {
                                this.props.executeAction(this.props.onRemoveEvent, this.props.onRemoveMicroflow, this.props.onRemoveNanoflow);
                            }
                            // break out of map loop
                        },
                        error: error => {
                            mx.ui.error(`Error attempting to remove dropzone item  ${error}`);
                        }
                    });
                }
            });
    }
}

    /* check for errors before upload */
    private handleUploud = () => {
        if (this.removeErrorDisplay && this.state.fileError) {
            this.setState({ fileError: "" });
        }

        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (fileobject.file) {
                    /* Perform validation */
                    if (this.customErrorHandler(fileobject.file)) {
                        this.arrayOfFiles.splice(0, 1);
                    } else {
                        this.upload(fileobject);
                    }
                }
            });
        }

    }

    /* Generic upload function */
    private upload = (returnedObject: ReturnObject) => {
        if (returnedObject.file) {
            this.props.saveFileToDatabase(returnedObject.guid, returnedObject.file);
            // think about handling the progress
            this.saveFile(returnedObject.file);
        }
    }

    private saveFile(file: DropzoneLib.DropzoneFile) {
        /* Remove file from array after upload */
        this.dropzoneObject.emit("uploadprogress", file, 50);
        this.dropzoneObject.emit("complete", file);
        this.dropzoneObject.emit("success", file);
         /* deal with on upload events */
        if (this.props.onUploadEvent !== "doNothing") {
            this.props.executeAction(this.props.onUploadEvent, this.props.onUploadMicroflow, this.props.onUploadNanoflow);
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

}
