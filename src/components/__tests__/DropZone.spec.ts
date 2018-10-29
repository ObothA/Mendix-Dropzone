import { createElement } from "react";
import { shallow } from "enzyme";

import { Alert } from "../Alert";
import Dropzone, { DropzoneProps } from "../DropZone";

const renderDropZone = (props: DropzoneProps) => shallow(createElement(Dropzone, props));
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
