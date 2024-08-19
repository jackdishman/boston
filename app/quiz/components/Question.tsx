"use client";

import React from "react";
import { IQuestionBuilder } from "@/types/quiz";

interface QuestionProps {
  index: number;
  question: IQuestionBuilder;
  handleQuestionChange: (
    index: number,
    field: keyof IQuestionBuilder,
    value: string
  ) => void;
  handleOptionChange: (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  addOption: (questionIndex: number) => void;
  removeOption: (questionIndex: number, optionIndex: number) => void;
  handleCorrectAnswerChange: (questionIndex: number, value: string) => void;
  removeQuestion: (index: number) => void;
}

const Question: React.FC<QuestionProps> = ({
  index,
  question,
  handleQuestionChange,
  handleOptionChange,
  addOption,
  removeOption,
  handleCorrectAnswerChange,
  removeQuestion,
}) => {
  return (
    <div className="mb-6 border p-4 rounded">
      <div className="mb-4">
        <label
          htmlFor={`question-${index}`}
          className="block text-sm font-medium text-gray-700"
        >
          Question {index + 1}
        </label>
        <input
          id={`question-${index}`}
          type="text"
          value={question.text}
          onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
          className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Question"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor={`image_url-${index}`}
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <input
          id={`image_url-${index}`}
          type="text"
          value={question.image_url || ""}
          onChange={(e) =>
            handleQuestionChange(index, "image_url", e.target.value)
          }
          className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Image URL"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor={`question_type-${index}`}
          className="block text-sm font-medium text-gray-700"
        >
          Question Type
        </label>
        <select
          id={`question_type-${index}`}
          value={question.question_type}
          onChange={(e) =>
            handleQuestionChange(index, "question_type", e.target.value)
          }
          className="mt-1 block w-full p-2 shadow-sm sm:text-sm border-gray-300 rounded-md"
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="short_answer">Short Answer</option>
        </select>
      </div>
      {question.question_type === "multiple_choice" && (
        <>
          {question.options?.map((option, optionIndex) => (
            <div key={optionIndex} className="mb-4">
              <label
                htmlFor={`option-${index}-${optionIndex}`}
                className="block text-sm font-medium text-gray-700"
              >
                Option {optionIndex + 1}
              </label>
              <input
                id={`option-${index}-${optionIndex}`}
                type="text"
                value={option}
                onChange={(e) =>
                  handleOptionChange(index, optionIndex, e.target.value)
                }
                className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder={`Option ${optionIndex + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(index, optionIndex)}
                className="mt-2 py-1 px-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-200"
              >
                Remove Option
              </button>
            </div>
          ))}
          {question.options && question.options.length < 4 && (
            <button
              type="button"
              onClick={() => addOption(index)}
              className="mb-4 py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200"
            >
              Add Option
            </button>
          )}
          <div className="mb-4">
            <label
              htmlFor={`answer-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Correct Answer
            </label>
            <select
              id={`answer-${index}`}
              value={question.answer || ""}
              onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
              className="mt-1 block w-full p-2 shadow-sm sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Select Correct Answer</option>
              {question.options?.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      {question.question_type === "short_answer" && (
        <div className="mb-4">
          <label
            htmlFor={`short_answer-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Expected Answer
          </label>
          <input
            id={`short_answer-${index}`}
            type="text"
            value={question.answer || ""}
            onChange={(e) =>
              handleQuestionChange(index, "answer", e.target.value)
            }
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Expected Answer"
          />
        </div>
      )}
      <div className="mb-4">
        <label
          htmlFor={`explanation-${index}`}
          className="block text-sm font-medium text-gray-700"
        >
          Explanation
        </label>
        <textarea
          id={`explanation-${index}`}
          value={question.explanation}
          onChange={(e) =>
            handleQuestionChange(index, "explanation", e.target.value)
          }
          className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Explanation"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => removeQuestion(index)}
          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-200"
        >
          Remove Question
        </button>
      </div>
    </div>
  );
};

export default Question;
