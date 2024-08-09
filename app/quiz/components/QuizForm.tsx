"use client";

import React from "react";
import { IQuizBuilder } from "@/types/quiz";

interface QuizFormProps {
  quiz: IQuizBuilder;
  setQuiz: React.Dispatch<React.SetStateAction<IQuizBuilder>>;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, setQuiz }) => {
  return (
    <>
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Quiz Title
        </label>
        <input
          id="title"
          type="text"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Title"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description of Quiz
        </label>
        <input
          id="description"
          type="text"
          value={quiz.description || ""}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
          className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Description"
        />
      </div>
    </>
  );
};

export default QuizForm;
