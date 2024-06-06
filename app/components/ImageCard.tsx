import React from "react";

interface ImageCardProps {
  imageUrl: string;
  linkUrl: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, linkUrl }) => {
  return (
    <div className="relative w-full h-full">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={imageUrl}
          alt="Profile"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </a>
    </div>
  );
};

export default ImageCard;
