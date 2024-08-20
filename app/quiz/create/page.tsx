import React from "react";
import QuizBuilder from "../components/QuizBuilder";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <Link href="/quiz" className="p-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </Link>
      <QuizBuilder />
    </div>
  );
}
