import {
  command,
  CommandFunction,
  extension,
  PlainExtension,
  PrimitiveSelection,
} from "@remirror/core";

const pickImagesOptions: Remirror.CommandDecoratorOptions = {
  icon: "bold",
  label: () => "Image picker",
  description: () => "Select images to embed",
};

class ImageExtension extends PlainExtension {
  //decoratedHelpers = {
  //  pickImages: pickImagesOptions,
  //};

  get name() {
    return "ImagePicker" as const;
  }

  createCommands() {
    return {
      pickImages: (): CommandFunction => ({ tr }) => {
        const input = document.getElementsByClassName("filepicker")[0];
        (input as HTMLInputElement).click();

        // TODO: add onchange handler

        return true;
      },
    };
  }

  //@command(pickImagesOptions)
  //pickImages(selection?: PrimitiveSelection): CommandFunction {
  //  return ({tr}) => {
  //    return true;
  //  };
  //}

  //@command(toggleBoldOptions)
  //toggleBold(selection?: PrimitiveSelection): CommandFunction {
  //  return toggleMark({ type: this.type, selection });
  //}
}

//(ImageExtension.decoratedHelpers ??= {}).pickImages = options;

export default extension({ defaultOptions: {} })(ImageExtension);
