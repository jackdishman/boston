import React from "react";

interface IProps {
  title: string;
  value: string;
}

export default function StatsTile(props: IProps) {
  const { title, value } = props;
  return (
    <div className="rounded-lg bg-gray-200 shadow-lg w-24 h-24 p-4 flex items-center border border-gray-300">
      <div className="w-full">
        <h3 className="text-2xl text-center">{value}</h3>
        <p className="text-sm text-gray-600 text-center font-semibold">
          {title}
        </p>
      </div>
    </div>
  );
}
