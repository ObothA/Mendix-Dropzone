import { Component, createElement } from "react";
import * as DropzoneLib from "dropzone";
import { Alert } from "./Alert";
import "dropzone/dist/dropzone.css";
import "../ui/DropZone.css";

export interface DropzoneProps {
    message: string;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    autoUpload: boolean;
    thumbnailWidth: number;
    thumbnailHeight: number;
    fileobject: ReturnObject;
    executeAction?: (event: string) => void;
    createObject?: (file: DropzoneLib.DropzoneFile) => void;
    saveFileToDatabase?: (guid: string, file: DropzoneLib.DropzoneFile, dropzone: DropzoneLib) => void;
}

export interface ReturnObject {
    file?: DropzoneLib.DropzoneFile;
    guid: string;
    status: "pending" | "uploaded";
}

interface DropzoneState {
    fileError: string;
}

export default class Dropzone extends Component<DropzoneProps, DropzoneState> {
    private dropzone!: DropzoneLib;
    private formNode!: HTMLElement;
    private arrayOfFiles: ReturnObject[] = [];
    private numberOfFilesUploaded = 0;
    private fileRemover = "user";
    private lastAddedTime = new Date().getSeconds();

    readonly state: DropzoneState = {
        fileError: ""
    };

    render() {
        return this.renderDropzone();
    }

    componentDidMount() {
        if (this.formNode) {
            this.dropzone = this.setupDropZone();
        }
    }

    componentWillUnmount() {
        if (this.dropzone) {
            this.dropzone.destroy();
        }
    }

    componentWillReceiveProps(newProps: DropzoneProps) {
        if (newProps.fileobject.file) {
            this.arrayOfFiles.push(newProps.fileobject);
            if (this.props.autoUpload) {
                this.handleUploud();
            }
        }
    }

    private renderDropzone = () => {
        return createElement("div", { className: "dropzoneContainer" },
            this.props.autoUpload ? "" : createElement("button", { className: "btn mx-button uploadButton", onClick: this.handleUploud }, "upload file(s)"),
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
            thumbnailHeight: this.props.thumbnailHeight,
            previewTemplate: `
            <div class="dz-preview dz-file-preview">
            <div class="dz-details">
            <div class="dz-members">
                <div class="dz-filename"><span data-dz-name></span></div>
                <div class="dz-size" data-dz-size></div>
            </div>
             <div class="dz-img">
                <img data-dz-thumbnail />
             </div>
             <div class="dz-progress-upload">
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
            </div>
                <div class="dz-success-mark"><span>✔</span></div>
                <div class="dz-error-mark"><span>✘</span></div>
                <div class="dz-error-message"><span data-dz-errormessage></span></div>
            </div>
          </div>`
        });

        myDropzone.on("error", this.handleErrorsFromLibrary);

        myDropzone.on("addedfile", (file) => { this.handleAddedFile(file); });

        myDropzone.on("removedfile", (file) => { this.handleRemovedFile(file); });
        myDropzone.on("drop", this.handleOnDropEvent);

        return myDropzone;
    }

    private handleAddedFile(file: DropzoneLib.DropzoneFile) {
        // deal with clearing error using epoch
        const currentTime = new Date().getSeconds();
        if (currentTime - this.lastAddedTime > 1.5) {
            /* clear errors coz this slow speed is a human*/
            this.setState({ fileError: "" });
        }

        this.lastAddedTime = currentTime;
        if (this.props.createObject) { this.props.createObject(file); }
    }

    private handleOnDropEvent = () => {
        /* deal with on drop events */

        if (this.props.executeAction) {
            this.props.executeAction("onDrop");
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
            return true;
        } else if (this.numberOfFilesUploaded === this.props.maxFiles) {
            const displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.props.maxFiles} files\n`;
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
            });
            return true;
        } else if (this.props.fileTypes && fileExtension && !this.props.fileTypes.includes(fileExtension)) {
            /* file type error */
            /* Check if file type prop is set, file extesion is set and if the extension is on our list */
            const displayMessage = `${file.name} wont be uploaded, file type not support for upload\n`;
            this.setState({
                fileError: `${this.state.fileError} ${displayMessage}`
            });
            return true;
        } else {
            return false;
        }
    }

    /* handle remove file */
    private handleRemovedFile = (file: DropzoneLib.DropzoneFile) => {
        if (this.fileRemover === "user" && this.state.fileError) {
            this.setState({ fileError: "" });
        } else if (this.fileRemover === "errorHandler") {
            /* reset removing entity*/
            this.fileRemover = "user";
        }

        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (file === fileobject.file) {
                    if (fileobject.status === "uploaded") {
                        this.numberOfFilesUploaded--;
                    }
                    this.arrayOfFiles.splice(this.arrayOfFiles.indexOf(fileobject), 1);
                    mx.data.remove({
                        guid: fileobject.guid,
                        callback: () => {
                            /* deal with on remove events */
                            if (this.props.executeAction) {
                                this.props.executeAction("onRemove");
                            }
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

        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((fileobject) => {
                if (fileobject.file && fileobject.status === "pending") {
                    /* Perform validation */
                    if (this.customErrorHandler(fileobject.file)) {
                        // this.arrayOfFiles.splice(0, 1);
                        if (this.dropzone) {
                            this.fileRemover = "errorHandler";
                            this.dropzone.removeFile(fileobject.file);
                        }
                    } else {
                        this.upload(fileobject);
                    }
                }
            });
        }

    }

    /* Generic upload function */
    private upload = (returnedObject: ReturnObject) => {
        if (returnedObject.file && this.props.saveFileToDatabase) {
            returnedObject.status = "uploaded";
            this.numberOfFilesUploaded++;
            this.props.saveFileToDatabase(returnedObject.guid, returnedObject.file, this.dropzone);
            // think about handling the progress
            if (this.props.executeAction) {
                this.props.executeAction("onUpload");
            }
        }
    }

    private handleErrorsFromLibrary = (file: DropzoneLib.DropzoneFile, message: string) => {

        const displayMessage = `${file.name} wont be uploaded, ${message}\n`;
        if (this.dropzone) {
            this.dropzone.removeFile(file);
        }
        this.setState({
            fileError: `${this.state.fileError} ${displayMessage}`
        });
    }

    private getFormNode = (node: HTMLElement) => {
        this.formNode = node;
    }

}
