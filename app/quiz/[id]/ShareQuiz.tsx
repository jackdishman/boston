"use client";
import { IQuiz } from "@/types/quiz";
import React from "react";
import { toast } from "react-toastify";

interface IProps {
  quiz: IQuiz;
}

export default function ShareQuiz(props: IProps) {
  const { quiz } = props;

  const handleClick = () => {
    navigator.clipboard.writeText(
      `${process.env["NEXT_PUBLIC_HOST"]}/quiz/${quiz.id}`
    );
    toast("Copied to clipboard");
  };
  return (
    <div
      className="w-full h-20 border rounded-lg bg-[#7c65c1]/10 hover:bg-[#7c65c1]/30 hover:border-[#7c65c1]/10 border-gray-200 flex items-center justify-around cursor-pointer transition duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <h2 className="text-xl font-semibold mx-4">Share this quiz</h2>(
      {process.env["NEXT_PUBLIC_HOST"]}/quiz/{quiz.id})
      {/* copy to clipboard icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
        />
      </svg>
    </div>
  );
}
