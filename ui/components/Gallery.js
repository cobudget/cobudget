import Modal from "@material-ui/core/Modal";
import React from "react";
import styled from "styled-components";
import _Card from "./styled/Card";

const Card = styled(_Card)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 15px;
  outline: 0;
`;

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Thumb = styled.a`
  display: block;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  background: 50% 50% no-repeat;
  background-image: url(${({ src }) => src});
  background-size: cover;
  margin-bottom: 15px;
  margin-right: 15px;
  border-radius: 5px;
`;

const Image = styled.img`
  border-radius: 5px;
  display: block;
  max-height: calc(100vh - 60px);
  max-width: calc(100vw - 60px);
`;

export default ({ images, size }) => (
  <Gallery>
    {images.map(image => (
      <GalleryItem image={image} size={size} />
    ))}
  </Gallery>
);

function GalleryItem({ image, size }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const close = () => setIsOpen(false);
  const open = e => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      <Thumb
        href={image.large}
        key={image.small}
        onClick={open}
        size={size}
        src={image.small}
        target="_blank"
      >
        &nbsp;
      </Thumb>

      <Modal open={isOpen} onClose={close}>
        <Card>
          <Image src={image.large} />
        </Card>
      </Modal>
    </>
  );
}
