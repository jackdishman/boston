import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { IQuestion, ISubmission } from "@/types/quiz";
import { getElapsedTimeString } from "@/middleware/quiz";
import Link from "next/link";

interface IProps {
  quizQuestions: IQuestion[] | undefined;
}

export default function QuizTaker(props: IProps) {
  const params = useParams<{ id: string }>();
  const { getAccessToken, user } = usePrivy();
  const { quizQuestions } = props;
  const fid = user?.farcaster?.fid?.toString() || null;
  const [activeQuestion, setActiveQuestion] = useState<IQuestion>();
  const [submissionState, setSubmissionState] = useState<ISubmission>();
  const [elapsedTime, setElapsedTime] = useState<string>("");
  const [loading, setLoading] = useState(true); // Add loading state
  const shortAnswer = useRef<HTMLInputElement>(null);
  const hasFetchedSubmission = useRef(false);
  const [isComplete, setIsComplete] = useState(false);

  async function getSubmission(
    fid: string,
    quizId: number
  ): Promise<ISubmission | undefined> {
    const accessToken = await getAccessToken();
    try {
      const req = await fetch(`/api/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fid, quizId }),
      });

      if (!req.ok) {
        console.error("Failed to fetch submission. Status:", req.status);
        return undefined;
      }

      const submission = await req.json();

      if (!submission) {
        console.error("No submission data returned.");
        return undefined;
      }

      return submission as ISubmission;
    } catch (error) {
      console.error("Error fetching submission:", error);
      return undefined;
    }
  }

  async function updateSubmissionScore() {
    const accessToken = await getAccessToken();

    const correctAnswers = submissionState?.answers.filter(
      (a) => a.is_correct
    ).length;
    const totalQuestions = quizQuestions?.length ?? 1;
    const score = correctAnswers
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    await fetch("/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        submissionId: submissionState?.id,
        score,
      }),
    });
  }

  async function handleAnswerSubmit(answer: string, isCorrect: boolean) {
    const accessToken = await getAccessToken();

    await fetch("/api/quiz/question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fid,
        submissionState,
        questionId: activeQuestion?.id ?? 0,
        answer,
        isCorrect,
      }),
    });

    // Refetch the latest submission state after answering
    if (!fid) return;
    const updatedSubmission = await getSubmission(fid, Number(params.id));
    if (updatedSubmission) {
      setSubmissionState(updatedSubmission);
      const nextQuestion = quizQuestions?.find(
        (q) => !updatedSubmission.answers.find((a) => a.question_id === q.id)
      );
      if (!nextQuestion) {
        console.log("No more questions to answer");
        await updateSubmissionScore(); // Update the submission score
        setIsComplete(true);
        return;
      }
      setActiveQuestion(nextQuestion);
    }
  }

  async function handleMultipleChoiceSubmit(answer: string) {
    if (!activeQuestion) return;
    const isCorrect = activeQuestion.answer === answer;
    await handleAnswerSubmit(answer, isCorrect);
  }

  async function handleShortAnswerSubmit() {
    if (!activeQuestion) return;
    const answer = shortAnswer.current?.value.trim();
    if (!answer) {
      alert("Please enter an answer");
      return;
    }
    const isCorrect =
      activeQuestion.answer?.toUpperCase().trim() ===
      answer.toUpperCase().trim();
    await handleAnswerSubmit(answer, isCorrect);
  }

  useEffect(() => {
    if (!fid || hasFetchedSubmission.current) return;

    hasFetchedSubmission.current = true;

    getSubmission(fid, Number(params.id))
      .then((s) => {
        if (!s) {
          console.error("No submission found after fetching.");
          setLoading(false);
          return;
        }
        setSubmissionState(s);

        if (s?.answers.length === 0) {
          setActiveQuestion(quizQuestions?.[0]);
        } else {
          const nextQuestion = quizQuestions?.find(
            (q) => !s.answers.find((a) => a.question_id === q.id)
          );
          setActiveQuestion(nextQuestion);
        }

        if (s?.created_at) {
          const intervalId = setInterval(() => {
            setElapsedTime(getElapsedTimeString(s.created_at));
          }, 1000);

          return () => clearInterval(intervalId);
        }
      })
      .catch((error) => {
        console.error("Error in submission fetching process:", error);
      })
      .finally(() => {
        setLoading(false); // Ensure loading is set to false in all cases
      });
  }, [fid, quizQuestions, params.id]);

  if (loading) return <div>Loading...</div>;

  if (!activeQuestion)
    return (
      <div>
        <h4>No active question found</h4>
        <Link
          href={`/quiz/results/${submissionState?.id}`}
          className="text-lg underline text-blue-500 font-semibold text-center"
        >
          View results
        </Link>
      </div>
    );

  if (isComplete)
    return (
      <div>
        <h2 className="text-xl text-amber-600	">Quiz Complete!</h2>
        <Link
          className="text-lg underline text-blue-500 font-semibold text-center"
          href={`/quiz/results/${submissionState?.id}`}
        >
          View results
        </Link>
      </div>
    );

  return (
    <div className="w-full rounded-lg border-gray-200 border-2 p-10 mt-10">
      {/* top header */}
      <div className="flex justify-between mb-5 text-sm items-center">
        <h6 className="font-semibold">
          Question{" "}
          {quizQuestions?.indexOf(activeQuestion) !== undefined
            ? quizQuestions?.indexOf(activeQuestion) + 1
            : 0}{" "}
          of {quizQuestions?.length}
        </h6>
        {elapsedTime && <p>Time: {elapsedTime}</p>}
      </div>
      <h2 className="text-xl">{activeQuestion.text}</h2>
      {activeQuestion.image_url && (
        <div className="flex justify-center my-2">
          <img
            src={activeQuestion.image_url}
            alt="Question Image"
            width={600}
            height={400}
          />
        </div>
      )}
      {activeQuestion.question_type === "short_answer" && (
        <div className="w-full flex items-center justify-center mt-5">
          <input
            ref={shortAnswer}
            type="text"
            placeholder="Answer"
            className="bg-gray-200 hover:border-gray-300 border-2 shadow hover:shadow-lg px-3 py-2 md:px-6 md:py-4 text-xl rounded-tl-lg rounded-bl-lg outline-none"
          />
          <button
            onClick={handleShortAnswerSubmit}
            className="h-full bg-blue-200 p-2 md:p-4 text-xl rounded-r-lg border-2 border-blue-200 hover:bg-blue-300 hover:border-blue-400 shadow hover:shadow-lg"
          >
            Submit
          </button>
        </div>
      )}
      {activeQuestion.question_type === "multiple_choice" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-5 gap-5">
          {activeQuestion.options?.map((q) => (
            <button
              key={q}
              className="w-full px-6 py-4 rounded-lg bg-gray-200 hover:bg-gray-300 hover:border-gray-400 shadow hover:shadow-lg"
              onClick={() => {
                handleMultipleChoiceSubmit(q);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
