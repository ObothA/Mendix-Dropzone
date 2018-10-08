import { Component, createElement } from "react";
import Dropzone from "./DropZone";

export interface WrapperProps {
    class?: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style?: string;
    readOnly?: boolean;
    friendlyId?: string;
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
}

export default class DropZoneContainer extends Component<DropZoneContainerProps, {} > {

    render() {
        return createElement(Dropzone, {
            message: this.props.message,
            fileEntity: this.props.fileEntity,
            contextAssociation: this.props.contextAssociation,
            mxObject: this.props.mxObject,
            maxFileSize: this.props.maxFileSize,
            maxFiles: this.props.maxFiles,
            fileTypes: this.props.fileTypes,
            autoUpload: this.props.autoUpload,
            thumbnailHeight: this.props.thumbnailHeight,
            thumbnailWidth: this.props.thumbnailWidth,
            onDropMicroflow: this.props.onDropMicroflow,
            onRemoveMicroflow: this.props.onRemoveMicroflow,
            onUploadMicroflow: this.props.onUploadMicroflow,
            mxform: this.props.mxform
        });
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

    public static logError(message: string, style?: string, error?: any) {
        // tslint:disable-next-line:no-console
        window.logger ? window.logger.error(message) : console.log(message, style, error);
    }

}
