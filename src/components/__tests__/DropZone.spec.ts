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

const myRequest = new Request("C:\Users\oboth\Pictures\subi - Copy - Copy.jfif");

let bl: Blob;
fetch(myRequest)
.then(response => {
  return response.blob();
})
.then(myBlob => {
  bl = myBlob;
});

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

    // fit("test handle added file method", () => {
    //     const dropzone = fullRenderDropZone(dropZoneProps);
    //     const dropzoneInstance: any = dropzone.instance();
    //     dropzoneInstance.formNode = document.createElement("div");
    //     const onAddedFile = spyOn(dropzoneInstance, "handleAddedFile").and.callThrough();
    //     dropzoneInstance.componentDidMount();
    //     dropzoneInstance.dropzone.emit("addedfile", "C:\Users\oboth\Pictures\subi - Copy - Copy.jfif");

    //     expect(onAddedFile).toHaveBeenCalled();
    // });

    it("test handle removed file method", () => {
        const dropzone = fullRenderDropZone(dropZoneProps);
        const dropzoneInstance: any = dropzone.instance();
        dropzoneInstance.formNode = document.createElement("div");
        const onRemovedFile = spyOn(dropzoneInstance, "handleRemovedFile").and.callThrough();
        dropzoneInstance.componentDidMount();
        dropzoneInstance.dropzone.emit("removedfile", "C:\Users\oboth\Pictures\subi - Copy - Copy.jfif");

        expect(onRemovedFile).toHaveBeenCalled();
    });

    // today
    fit("test handle handle upload when...", () => {
        // const fileobject = {
        //     file: "C:\Users\oboth\Pictures\subi - Copy - Copy.jfif" || undefined
        // } as any;
        // const customProps = {
        //     ...dropZoneProps,
        //     autoUpload: true,
        //     fileobject
        // };

        const fileobject = {
            file: bl || "C:\Users\oboth\Pictures\subi - Copy - Copy.jfif"
        } as any;
        const customProps = {
            ...dropZoneProps,
            autoUpload: true,
            fileobject
        };

        const dropzone = fullRenderDropZone(customProps);
        const dropzoneInstance: any = dropzone.instance();
        // dropzoneInstance.formNode = document.createElement("div");
        const onUploadSpy = spyOn(dropzoneInstance, "handleUploud").and.callThrough();

        dropzoneInstance.handleUploud.error = true;
        dropzoneInstance.componentWillReceiveProps(customProps);
        dropzoneInstance.handleUploud.error = true;

        expect(onUploadSpy).toHaveBeenCalled();
    });

});
