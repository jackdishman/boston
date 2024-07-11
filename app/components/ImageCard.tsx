import React from "react";
import Image from "next/image";

interface ImageCardProps {
  imageUrl: string;
  linkUrl: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, linkUrl }) => {
  return (
    <div className="relative w-full h-full">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
            width={300}
            height={300}
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200" />
        )}
      </a>
    </div>
  );
};

export default ImageCard;
