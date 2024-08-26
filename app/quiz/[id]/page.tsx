import { Metadata, ResolvingMetadata } from "next";
import { getQuestions, getQuiz, getSubmissions } from "@/middleware/quiz";
import { getUsersByFids } from "@/middleware/helpers";
import ShareLink from "./ShareLink";
import { ISubmissionWithUser } from "@/types/quiz";
import Link from "next/link";
import Image from "next/image";
import QuizContainer from "./QuizContainer";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const quiz = await getQuiz(Number(id));
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
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image?title=${quiz.title}&description=${quiz.description}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/question?quiz_id=${id}&question_id=${quiz.first_question_id}`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Start Quiz`,
    "fc:frame:button:2": `Take in App`,
    "fc:frame:button:2:action": `link`,
    "fc:frame:button:2:target": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/${id}`,
    "fc:frame:button:3": `Create a Quiz`,
    "fc:frame:button:3:action": `link`,
    "fc:frame:button:3:target": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/create`,
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

async function getQuizSubmissionsWithUsers(
  quizId: number
): Promise<ISubmissionWithUser[]> {
  try {
    const submissionsWithUsers: ISubmissionWithUser[] = [];

    const submissions = await getSubmissions(quizId);
    if (!submissions || submissions.length === 0) return [];

    // get list of fid's from submissions
    const fids: string[] = submissions
      .filter((submission) => submission.fid !== null)
      .map((submission) => submission.fid!);

    if (fids.length === 0) return [];
    const users = await getUsersByFids(fids);

    // combine submissions and users
    const combinedData = submissions
      .map((submission) => {
        const user = users.find((user) => user.fid === Number(submission.fid));
        if (!user) return null;
        return { user, submission };
      })
      .filter((data) => data !== null) as ISubmissionWithUser[];

    return combinedData;
  } catch (error) {
    console.error("Error fetching submissions or users", error);
    return [];
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const quiz = await getQuiz(Number(params.id));
  const quizQuestions = await getQuestions(Number(params.id));
  const proctorUser = await getUsersByFids([quiz?.proctor_fid ?? ""]);
  if (!quiz) {
    return (
      <div>
        <h1>Quiz not found</h1>
      </div>
    );
  }

  const submissionsWithUsers = await getQuizSubmissionsWithUsers(
    Number(params.id)
  );

  // sort submissions by score
  submissionsWithUsers.sort((a, b) => {
    if (a.submission.score === null) return 1;
    if (b.submission.score === null) return -1;
    return b.submission.score - a.submission.score;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {/* back button */}
      <div className="w-full">
        <Link href="/quiz" className="text-blue-500 p-4 flex items-center">
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
      </div>
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl">{quiz.title}</h1>
        <h6 className="text-xl">{quiz.description}</h6>
        <div className="flex items-center">
          Proctor:{" "}
          <Image
            src={proctorUser[0].pfp_url}
            alt="proctor"
            width={24}
            height={24}
            className="rounded-full m-2"
          />
          {quiz.proctor_fid && submissionsWithUsers.length > 0
            ? `${proctorUser[0].display_name} (${quiz.proctor_fid})`
            : ""}
        </div>
        <div className="my-4 w-full">
          <ShareLink url={`/quiz/${quiz.id}`} />
        </div>
        <QuizContainer
          submissionsWithUsers={submissionsWithUsers}
          quizQuestions={quizQuestions}
        />
      </main>
    </div>
  );
}
