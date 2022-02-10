import { HappyEmojiIcon } from "./Icons";

const HappySpinner = ({ className = "" }) => {
  return (
    <HappyEmojiIcon
      className={`w-12 h-12 text-gray-500 animation-spin ${className}`}
    />
  );
};

export default HappySpinner;
