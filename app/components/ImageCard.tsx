import React from "react";
import Image from "next/image";
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
      </Link>
    </div>
  );
};

export default ImageCard;
