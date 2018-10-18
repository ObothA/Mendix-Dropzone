import { Component, createElement } from "react";
import Dropzone from "./DropZone";

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
    onDropNanoflow: Nanoflow;
    onRemoveNanoflow: Nanoflow;
    onUploadNanoflow: Nanoflow;
    onDropEvent: string;
    onRemoveEvent: string;
    onUploadEvent: string;
}

interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

export default class DropZoneContainer extends Component<DropZoneContainerProps, {} > {
    private contextObject!: mendix.lib.MxObject;
    private reference!: string;
    private maxFiles!: number;

    constructor(props: DropZoneContainerProps) {
        super(props);
        if (this.props.contextAssociation && typeof this.props.contextAssociation.split("/")[0] === "string") {
            this.reference = this.props.contextAssociation.split("/")[0];
            this.maxFiles = this.props.maxFiles;
        } else {
            this.reference = "";
            this.maxFiles = 1;
        }
    }

    render() {
        return createElement(Dropzone, {
            message: this.props.message,
            fileEntity: this.props.fileEntity,
            contextAssociation: this.props.contextAssociation,
            mxObject: this.contextObject,
            maxFileSize: this.props.maxFileSize,
            maxFiles: this.maxFiles,
            fileTypes: this.props.fileTypes,
            autoUpload: this.props.autoUpload,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            onDropMicroflow: this.props.onDropMicroflow,
            onRemoveMicroflow: this.props.onRemoveMicroflow,
            onUploadMicroflow: this.props.onUploadMicroflow,
            mxform: this.props.mxform,
            onRemoveNanoflow: this.props.onRemoveNanoflow,
            onDropNanoflow: this.props.onDropNanoflow,
            onUploadNanoflow: this.props.onUploadNanoflow,
            mxContext: this.props.mxContext,
            onDropEvent: this.props.onDropEvent,
            onRemoveEvent: this.props.onRemoveEvent,
            onUploadEvent: this.props.onUploadEvent,
            reference: this.reference,
            executeAction: this.executeAction

        });
    }

    componentWillReceiveProps(newProps: DropZoneContainerProps) {
        this.contextObject = newProps.mxObject;
    }

    private executeAction = (event: string, microflow?: string, nanoflow?: Nanoflow) => {
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
