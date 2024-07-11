import React from "react";

interface ProgressBarProps {
  loaded: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ loaded, total }) => {
  const progress = Math.min((loaded / total) * 100, 100);
  return (
    <div className="w-full bg-gray-200 rounded-full mt-4 overflow-hidden">
      <div
        className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      >
        {`${loaded} / ${total} users loaded`}
      </div>
    </div>
  );
};

export default ProgressBar;
