// import { createElement } from "react";
// import { shallow } from "enzyme";

// import Dropzone, { DropzoneProps } from "../DropZone";

// const renderDropZone = (props: DropzoneProps) => shallow(createElement(Dropzone, props));
// const dropZoneProps: DropzoneProps = {
//     message: "",
//     fileEntity: string;
//     contextAssociation: string;
//     mxObject: mendix.lib.MxObject;
//     maxFileSize: number;
//     maxFiles: number;
//     fileTypes: string;
//     autoUpload: string;
//     thumbnailWidth: number;
//     thumbnailHeight: number;
//     onDropMicroflow: string;
//     onRemoveMicroflow: string;
//     onUploadMicroflow: string;
//     mxform: mxui.lib.form._FormBase;
//     onDropNanoflow: Nanoflow;
//     onRemoveNanoflow: Nanoflow;
//     onUploadNanoflow: Nanoflow;
//     mxContext: mendix.lib.MxContext;
//     onDropEvent: string;
//     onRemoveEvent: string;
//     onUploadEvent: string;
//     reference: string;
//     fileobject: ReturnObject;
//     createObject: (fileEntity: string, reference: string, mxObject: mendix.lib.MxObject, file: DropzoneLib.DropzoneFile) => void;
//     saveFileToDatabase: (guid: string, file: DropzoneLib.DropzoneFile) => void;
// };

// describe("Dropzone", () => {
//     it("renders structure correctly", () => {
//         const dropzone = renderDropZone(dropZoneProps);
//         expect(dropzone).toBeElement(
//             createElement("div", { className: "dropzoneContainer" },
//                 this.props.autoUpload ? "" : createElement("button", { className: "btn mx-button uploadButton", onClick: this.handleUploud }, "upload file(s)"),
//                 createElement("form", { className: "dropzone", id: "dropzoneArea", ref: this.getFormNode }),
//                 createElement(Alert, { className: "widget-dropdown-type-ahead-alert" }, this.state.fileError)
//             ));
//     });
// });
