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
});

describe("dropzone methods", () => {
    it("lets just test 1 method", () => {
        const dropzone = fullRenderDropZone(dropZoneProps);
        const dropzoneInstance: any = dropzone.instance();
        dropzoneInstance.formNode = document.createElement("div");
        const setupSpy = spyOn(dropzoneInstance, "setupDropZone").and.callThrough();
        dropzoneInstance.componentDidMount();

        expect(setupSpy).toHaveBeenCalled();
    });
});
