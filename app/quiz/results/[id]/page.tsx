import {
  getQuestionsByIds,
  getQuiz,
  getSubmissionById,
} from "@/middleware/quiz";
import { IAnswerEntry, IQuestion, IQuiz, ISubmission } from "@/types/quiz";
import PageContainer from "./PageContainer";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from "next";
import ShareLink from "../../[id]/ShareLink";
import { getUsersByFids } from "@/middleware/helpers";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  // get submission
  const submission = await getSubmissionById(Number(id));
  if (!submission) {
    return {
      title: "Submission not found",
      openGraph: {
        title: "Submission not found",
        description: "Submission not found",
      },
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }
  // get quiz
  const quiz = await getQuiz(submission.quiz_id);
  if (!quiz) {
    return {
      title: "Quiz not found",
      openGraph: {
        title: "Quiz not found",
        description: "Quiz not found",
      },
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image/share-results?submissionId=${id}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${quiz.id}&question_id=${quiz.first_question_id}`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Take Quiz`,
    "fc:frame:button:2": `View Report`,
    "fc:frame:button:2:action": `link`,
    "fc:frame:button:2:target": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/results/${id}`,
  };

  return {
    title: quiz.title,
    openGraph: {
      title: quiz.title ?? `Quiz ${id}`,
      description: quiz.description ?? `Quiz ${id}`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const submissions: ISubmission[] = [];
  const questions: IQuestion[] = [];
  const joinedData: Map<
    number,
    { submission: IAnswerEntry; question: IQuestion }
  > = new Map();
  let quizId: number | null = null;
  let proctorFid: string | null = null;
  let finalScore = 0;
  let fid = "";
  let quiz: IQuiz | null = null;

  // fetch submission data
  try {
    const submissionRes = await getSubmissionById(Number(id));
    if (!submissionRes) return <div>no submissions</div>;
    finalScore = submissionRes.score ?? 0;
    fid = submissionRes.fid ?? "";
    submissions.push(submissionRes);
    quizId = submissionRes.quiz_id;
  } catch (error) {
    console.error("Error fetching submission", error);
  }

  if (!quizId) return <div>no quiz id</div>;

  // fetch quiz data
  try {
    const quizRes = await getQuiz(quizId);
    if (!quizRes) return <div>no quiz</div>;
    quiz = quizRes;
    proctorFid = quizRes.proctor_fid ?? null;
  } catch (error) {
    console.error("Error fetching quiz", error);
  }

  // pull question_id from submission to compare
  const questionIds: number[] = [];
  submissions.forEach((submission) => {
    submission.answers.forEach((answer) => {
      questionIds.push(answer.question_id);
    });
  });

  // fetch questions by ids
  try {
    const questionRes = await getQuestionsByIds(questionIds);
    if (!questionRes) return <div>no questions</div>;
    questions.push(...questionRes);
  } catch (error) {
    console.error("Error fetching questions", error);
  }

  questions.forEach((question) => {
    const submission = submissions.find((submission) =>
      submission.answers.find((answer) => answer.question_id === question.id)
    );
    const answer = submission?.answers.find(
      (answer) => answer.question_id === question.id
    );
    if (submission && answer) {
      joinedData.set(question.id, { submission: answer, question });
    }
  });

  if (!quiz) return <div>cannot find quiz</div>;

  // fetch user by fid
  const user = await getUsersByFids([fid, proctorFid ?? ""]);
  const p = user[0];
  const proctor = user[1] ?? user[0];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Link
        href={`/quiz/${quizId}`}
        className="text-blue-500 p-4 flex items-center mb-6"
      >
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
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl mb-5">
        Submission for quiz{" "}
        <Link
          className="underline hover:text-blue-500"
          href={`/quiz/${quiz.id}`}
        >
          {quiz.id}: {quiz.title}
        </Link>
      </h1>
      <div className="flex justify-between  mb-5 text-lg">
        <p className="">Final Score: {finalScore}%</p>
        <p className="">Submission of FID: {fid}</p>
      </div>

      <ShareLink url={`/quiz/results/${id}`} />

      <PageContainer
        id={id}
        quizId={quizId}
        submissions={submissions}
        joinedData={joinedData}
        quizTaker={p}
        score={finalScore}
        proctor={proctor}
      />
    </div>
  );
}
