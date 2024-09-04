import React from "react";
import Link from "next/link";

interface TextToParagraphProps {
  text: string;
}

export const TextToParagraph: React.FC<TextToParagraphProps> = ({ text }) => {
  const renderText = (text: string) => {
    return text.split(" ").map((word, index) => {
      if (word.startsWith("/")) {
        const channel = word.substring(1);
        return (
          <React.Fragment key={index}>
            <Link
              href={`/channel/${channel}`}
              className="underline text-purple-600"
            >
              {word}
            </Link>{" "}
          </React.Fragment>
        );
      } else if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <React.Fragment key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {word}
            </a>{" "}
          </React.Fragment>
        );
      } else {
        return <span key={index}>{word} </span>;
      }
    });
  };

  return <p>{renderText(text)}</p>;
};
