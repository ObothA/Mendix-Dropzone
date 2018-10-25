import { Component, createElement } from "react";
import * as DropzoneLib from "dropzone";
import Dropzone, { ReturnObject } from "./DropZone";

export interface WrapperProps {
    class?: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style?: string;
    readOnly?: boolean;
    friendlyId?: string;
    mxContext: mendix.lib.MxContext;
}

export interface DropZoneContainerProps extends WrapperProps {
    fileEntity: string;
    message: string;
    contextAssociation: string;
    maxFileSize: number;
    maxFiles: number;
    fileTypes: string;
    autoUpload: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    onDropMicroflow: string;
    onRemoveMicroflow: string;
    onUploadMicroflow: string;
    onDropNanoflow: mx.Nanoflow;
    onRemoveNanoflow: mx.Nanoflow;
    onUploadNanoflow: mx.Nanoflow;
    onDropEvent: string;
    onRemoveEvent: string;
    onUploadEvent: string;
}

interface DropZoneContainerState {
    fileObject: ReturnObject;
}

export default class DropZoneContainer extends Component<DropZoneContainerProps, DropZoneContainerState> {
    private contextObject!: mendix.lib.MxObject;
    private reference!: string;
    private maxFiles!: number;
    returnObject!: ReturnObject;

    constructor(props: DropZoneContainerProps) {
        super(props);
        if (this.props.contextAssociation && typeof this.props.contextAssociation.split("/")[0] === "string") {
            this.reference = this.props.contextAssociation.split("/")[0];
            this.maxFiles = this.props.maxFiles;
        } else {
            this.reference = "";
            this.maxFiles = 1;
        }

        this.state = {
            fileObject: {
                file: undefined,
                guid: ""
            }
        };
    }

    render() {
        return createElement(Dropzone, {
            message: this.props.message,
            maxFileSize: this.props.maxFileSize,
            maxFiles: this.maxFiles,
            fileTypes: this.props.fileTypes,
            autoUpload: this.props.autoUpload,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            executeAction: this.executeAction,
            createObject: this.createObject,
            fileobject: this.state.fileObject,
            saveFileToDatabase: this.saveFileToMendix
        });
    }

    componentWillReceiveProps(newProps: DropZoneContainerProps) {
        this.contextObject = newProps.mxObject;
    }

    private executeAction = (event: string) => {
        const { mxform } = this.props;
        let microflow = "";
        let nanoflow: mx.Nanoflow | null = null;

        if (event === "onDrop" && this.props.onDropEvent === "callMicroflow") {
            microflow = this.props.onDropMicroflow;
        }

        if (event === "onDrop" && this.props.onDropEvent === "callNanoflow") {
            nanoflow = this.props.onDropNanoflow;
        }

        if (event === "onRemove" && this.props.onRemoveEvent === "callMicroflow") {
            microflow = this.props.onRemoveMicroflow;
        }

        if (event === "onRemove" && this.props.onRemoveEvent === "callNanoflow") {
            nanoflow = this.props.onRemoveNanoflow;
        }

        if (event === "onUpload" && this.props.onUploadEvent === "callMicroflow") {
            microflow = this.props.onUploadMicroflow;
        }

        if (event === "onUpload" && this.props.onUploadEvent === "callNanoflow") {
            nanoflow = this.props.onUploadNanoflow;
        }

        if (microflow) {
            mx.data.action({
                params: {
                    applyto: "selection",
                    actionname: microflow,
                    guids: [ this.contextObject.getGuid() ]
                },
                origin: mxform,
                error: error => mx.ui.error(`error while executing action ${microflow} ${error.message}`)
            });

        } else if (nanoflow) {
            const context = new mendix.lib.MxContext();
            mx.data.callNanoflow({
                nanoflow,
                origin: mxform,
                context,
                error: error => mx.ui.error(`error while executing action nanoflow ${error.message}`)
            });
        }
    }

    private createObject = (file: DropzoneLib.DropzoneFile) => {
        mx.data.create({
            entity: this.props.fileEntity,
            callback: (newFileObject) => {
                if (newFileObject.isObjectReference(this.reference) && this.contextObject) {
                    newFileObject.set(this.reference, this.contextObject.getGuid());
                }
                this.getValue(newFileObject.getGuid(), file);
            },
            error: (createMxObjectError) => {
                mx.ui.error(`Could not commit object:, ${createMxObjectError}`);
            }
        });
    }

    private getValue = (guid: string, file: any) => {
        this.setState({ fileObject: {
            guid,
            file
        }
        });
    }

    private saveFileToMendix(guid: string, file: DropzoneLib.DropzoneFile) {
        mx.data.saveDocument(guid, file.name, {}, file,
                        () => {
                            // tslint:disable-next-line:no-console
                            console.log("file successfully saved");
                        },
                        saveDocumentError => mx.ui.error(`${saveDocumentError}`)
                    );
    }

    public static parseStyle(style = ""): { [key: string]: string } {
        try {
            return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }
                return styleObject;
            }, {});
        } catch (error) {
            DropZoneContainer.logError("Failed to parse style", style, error);
        }

        return {};
    }
    // ask jose
    public static logError(message: string, style?: string, error?: any) {
        // tslint:disable-next-line:no-console
        window.logger ? window.logger.error(message) : console.log(message, style, error);
    }

}
