"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { IQuizBuilder, IQuestionBuilder } from "@/types/quiz";
import QuizForm from "./QuizForm";
import QuestionList from "./QuestionList";

export default function QuizBuilder() {
  const { user } = usePrivy();
  const fid = user?.farcaster?.fid?.toString() || null;
  const router = useRouter();

  const [quiz, setQuiz] = useState<IQuizBuilder>({
    title: "",
    description: "",
    proctor_fid: fid,
  });

  const [questions, setQuestions] = useState<IQuestionBuilder[]>([]);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setQuiz((prevQuiz) => ({ ...prevQuiz, proctor_fid: fid }));
  }, [fid]);

  useEffect(() => {
    setDisabled(
      !quiz.title ||
        !quiz.description ||
        questions.length < 1 ||
        questions.some(
          (q) =>
            q.question_type === "multiple_choice" &&
            (!q.options || q.options.length < 2)
        )
    );
  }, [quiz.title, quiz.description, questions.length, questions]);

  const addQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        text: "",
        options: [],
        answer: "",
        explanation: "",
        image_url: "",
        question_type: "multiple_choice",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions.splice(index, 1);
      return newQuestions;
    });
  };

  const buildQuiz = async () => {
    if (disabled) {
      toast.error(
        "Title, description, and at least one question with valid options are required."
      );
      return;
    }
    if (!quiz.proctor_fid) {
      toast.error("Please sign into Farcaster to create a quiz.");
      return;
    }
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`/api/frames/quiz/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ quiz, questions }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/quiz/${data.id}`); // Redirect to the newly created quiz
      } else {
        toast.error("Failed to create quiz.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the quiz.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Build a Quiz</h1>
      <div className="w-full max-w-md">
        <QuizForm quiz={quiz} setQuiz={setQuiz} />
        <QuestionList
          questions={questions}
          setQuestions={setQuestions}
          removeQuestion={removeQuestion}
        />
        <div className="flex justify-around">
          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={buildQuiz}
            className={`mt-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700 transition duration-200 ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={disabled}
          >
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
