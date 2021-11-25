import { CommandFunction, extension, PlainExtension } from "@remirror/core";

class ImageExtension extends PlainExtension {
  get name() {
    return "ImagePicker" as const;
  }

  onView() {}

  createCommands() {
    return {
      pickImages: ({
        filePicker,
      }: {
        filePicker: HTMLInputElement;
      }): CommandFunction => ({ tr, dispatch }) => {
        filePicker.click();
        //dispatch()

        // TODO: add onchange handler

        return true;
      },
    };
  }
}

export default extension({ defaultOptions: {} })(ImageExtension);
