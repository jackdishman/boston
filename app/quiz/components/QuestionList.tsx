"use client";

import React from "react";
import { IQuestionBuilder } from "@/types/quiz";
import Question from "./Question";

interface QuestionListProps {
  questions: IQuestionBuilder[];
  setQuestions: React.Dispatch<React.SetStateAction<IQuestionBuilder[]>>;
  removeQuestion: (index: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  setQuestions,
  removeQuestion,
}) => {
  const handleQuestionChange = (
    index: number,
    field: keyof IQuestionBuilder,
    value: string
  ) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const options = newQuestions[questionIndex].options || [];
      options[optionIndex] = value;
      newQuestions[questionIndex].options = options;
      return newQuestions;
    });
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const options = newQuestions[questionIndex].options || [];
      if (options.length < 4) {
        options.push("");
      }
      newQuestions[questionIndex].options = options;
      return newQuestions;
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const options = newQuestions[questionIndex].options || [];
      options.splice(optionIndex, 1);
      newQuestions[questionIndex].options = options;
      return newQuestions;
    });
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[questionIndex].answer = value;
      return newQuestions;
    });
  };

  return (
    <>
      {questions.map((question, index) => (
        <Question
          key={index}
          index={index}
          question={question}
          handleQuestionChange={handleQuestionChange}
          handleOptionChange={handleOptionChange}
          addOption={addOption}
          removeOption={removeOption}
          handleCorrectAnswerChange={handleCorrectAnswerChange}
          removeQuestion={removeQuestion}
        />
      ))}
    </>
  );
};

export default QuestionList;
