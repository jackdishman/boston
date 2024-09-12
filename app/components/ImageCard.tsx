import React from "react";
import Link from "next/link";

interface ImageCardProps {
  imageUrl: string;
  linkUrl: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, linkUrl }) => {
  // Check if the image URL is valid and secure (not http://)
  const isValidImageUrl = imageUrl && !imageUrl.startsWith("http://");

  return (
    <div className="relative w-full h-full">
      <Link href={linkUrl}>
        {isValidImageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-64 h-64 absolute top-0 left-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200" />
        )}
      </Link>
    </div>
  );
};

export default ImageCard;
