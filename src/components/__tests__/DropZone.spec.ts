import { createElement } from "react";
import { mount, shallow } from "enzyme";

import { Alert } from "../Alert";
import Dropzone, { DropzoneProps } from "../DropZone";

const renderDropZone = (props: DropzoneProps) => shallow(createElement(Dropzone, props));
const fullRenderDropZone = (props: DropzoneProps) => mount(createElement(Dropzone, props));
const dropZoneProps: DropzoneProps = {
    message: "click or drop to upload files",
    maxFileSize: 5,
    maxFiles: 3,
    fileTypes: "",
    autoUpload: true,
    thumbnailWidth: 250,
    thumbnailHeight: 250,
    fileobject: {
        file: undefined,
        guid: "",
        status: "pending"
    }
};

describe("Dropzone", () => {
    it("with auto upload renders structure correctly", () => {
        const dropzone = renderDropZone(dropZoneProps);

        expect(dropzone).toBeElement(
            createElement("div", { className: "dropzoneContainer" },
                "",
                createElement("form", { className: "dropzone", id: "dropzoneArea" }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" })
            )
        );
    });

    it("without auto upload renders structure correctly", () => {
        const dropzone = renderDropZone(dropZoneProps);
        dropzone.setProps({ autoUpload: false });

        expect(dropzone).toBeElement(
            createElement("div", { className: "dropzoneContainer" },
                createElement("button", { className: "btn mx-button uploadButton", onClick: jasmine.any(Function) }, "upload file(s)"),
                createElement("form", { className: "dropzone", id: "dropzoneArea" }),
                createElement(Alert, { className: "widget-dropdown-type-ahead-alert" })
            )
        );
    });

    it("test the method that setsup the dropzone", () => {
        const dropzone = fullRenderDropZone(dropZoneProps);
        const dropzoneInstance: any = dropzone.instance();
        dropzoneInstance.formNode = document.createElement("div");
        const setupSpy = spyOn(dropzoneInstance, "setupDropZone").and.callThrough();
        dropzoneInstance.componentDidMount();

        expect(setupSpy).toHaveBeenCalled();
    });

    it("test on drop event", () => {
        const dropzone = fullRenderDropZone(dropZoneProps);
        const dropzoneInstance: any = dropzone.instance();
        dropzoneInstance.formNode = document.createElement("div");
        const onDrop = spyOn(dropzoneInstance, "handleOnDropEvent").and.callThrough();
        dropzoneInstance.componentDidMount();
        dropzoneInstance.dropzone.emit("drop");

        expect(onDrop).toHaveBeenCalled();
    });

    it("test on error event from dropzone", () => {
        const dropzone = fullRenderDropZone(dropZoneProps);
        const dropzoneInstance: any = dropzone.instance();
        dropzoneInstance.formNode = document.createElement("div");
        const onError = spyOn(dropzoneInstance, "handleErrorsFromLibrary").and.callThrough();
        dropzoneInstance.componentDidMount();
        dropzoneInstance.dropzone.emit("error", "C:\Users\oboth\Pictures\subi - Copy - Copy.jfif", "error");

        expect(onError).toHaveBeenCalled();
    });

});
