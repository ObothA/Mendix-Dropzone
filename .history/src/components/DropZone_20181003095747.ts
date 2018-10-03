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
    private numberOfFilesAdded = 0;

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
                createElement("input", { type: "button", value: "upload file(s)", className: "uploadButton", onClick: () => this.handleUploud() }),
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
            url: "/file/post",
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

        return myDropzone;
    }

    private customErrorHandler = (file: DropzoneLib.DropzoneFile) => {

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
        }

        /* limit number of files */
        if (this.numberOfFilesAdded > this.maxFiles) {
            const displayMessage = `${file.name} wont be uploaded, exceded limit of ${this.maxFiles} files`;
            this.setState({
                maxFilesNumberError: displayMessage
            });

            if (this.dropzoneObject) {
                this.dropzoneObject.removeFile(file);
            }
            return true;
        }

        /* file type error */
        const fileExtension = file.name.split(".").pop();
        /* Check if file type prop is set, file extesion is set and if the extension is on our list */
        if (this.props.fileTypes && fileExtension && !this.props.fileTypes.includes(fileExtension)) {
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

    /* check for errors before upload */
    private handleUploud = () => {
        if (this.arrayOfFiles.length) {
            this.arrayOfFiles.map((file) => {
                if (this.customErrorHandler(file)) {
                    this.arrayOfFiles.splice(0, 1);
                } else {
                    this.upload(file);
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
                    mx.data.saveDocument(newFileObject.getGuid(), file.name, {}, file,
                        () => {
                            if (this.dropzoneObject) {
                                // Remove file from array after upload
                                this.arrayOfFiles.splice(0, 1);

                                // Process queue here state.dropzoneObject.processQueue();
                                // this.dropzoneObject.removeAllFiles();
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

    private getForm = (node: HTMLElement) => {
        this.formNode = node;
    }
}
