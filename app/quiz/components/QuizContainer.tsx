"use client";

import React, { useEffect, useState } from "react";
import QuizBuilder from "./QuizBuilder";
import QuizList from "./QuizList";
import { IQuiz } from "@/types/quiz";

interface IProps {
  quizzes: IQuiz[];
}

export default function QuizToggle(props: IProps) {
  const { quizzes } = props;
  const [quizList, setQuizList] = useState<IQuiz[]>(quizzes);
  const [toggle, setToggle] = useState(false);

  return (
    <div>
      <div className="mt-64">
        <div className="flex items-center">
          <div className="relative bg-gray-300 w-full rounded-full h-8">
            <div
              className={`absolute left-0 top-0 rounded-full h-12 transition-all duration-300 ${
                toggle ? "w-1/2" : "w-full"
              }`}
            ></div>
            <button
              onClick={() => setToggle(false)}
              className={`absolute left-0 w-1/2 h-full flex items-center justify-center text-white font-bold transition-all duration-300 rounded-full ${
                !toggle ? "z-10 bg-blue-700" : "bg-transparent"
              }`}
            >
              Create a Quiz
            </button>
            <button
              onClick={() => setToggle(true)}
              className={`absolute right-0 w-1/2 h-full flex items-center justify-center text-white font-bold transition-all duration-300 rounded-full ${
                toggle ? "z-10 bg-blue-700" : "bg-transparent"
              }`}
            >
              View Quizzes
            </button>
          </div>
        </div>
        <div className="w-full">
          {!toggle ? <QuizBuilder /> : <QuizList quizzes={quizList} />}
        </div>
      </div>
    </div>
  );
}
