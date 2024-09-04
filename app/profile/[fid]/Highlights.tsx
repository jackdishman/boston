import React from "react";

interface IHighlightsProps {
  highlights: { title: string; url: string }[];
}

const Highlights: React.FC<IHighlightsProps> = ({ highlights }) => {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold">Highlights</h3>
      {highlights.map((highlight, index) => (
        <div key={index}>
          <p className="text-gray-700">
            <a
              href={highlight.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {highlight.title}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
};

export default Highlights;
