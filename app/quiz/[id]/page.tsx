import { Metadata, ResolvingMetadata } from "next";
import { getQuiz, getSubmissions } from "@/middleware/quiz";
import { getUsersByFids } from "@/middleware/helpers";
import ShareQuiz from "./ShareQuiz";
import SubmissionList from "./SubmissionList";
import { ISubmission } from "@/types/quiz";

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
    "fc:frame:button:2": `Leaderboard`,
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

async function getQuizSubmissionsWithUsers(quizId: number) {
  try {
    const submissions = await getSubmissions(quizId);
    if (!submissions || submissions.length === 0) return [];

    // Create a map of FIDs from submissions
    const fidMap = submissions.reduce((acc, submission) => {
      const fid = submission.fid?.toString();
      if (fid) acc[fid] = submission;
      return acc;
    }, {} as Record<string, ISubmission>);

    const fids = Object.keys(fidMap);
    const users = await getUsersByFids(fids);

    // Combine submission and user data
    const combinedData = users.map((user) => ({
      ...fidMap[user.fid.toString()],
      ...user,
      object: "user", // Ensure 'object' is set to 'user'
    }));

    return combinedData;
  } catch (error) {
    console.error("Error fetching submissions or users", error);
    return [];
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const quiz = await getQuiz(Number(params.id));
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl">{quiz.title}</h1>
        <h6 className="text-xl">{quiz.description}</h6>
        <p>
          by{" "}
          {quiz.proctor_fid && submissionsWithUsers.length > 0
            ? `${submissionsWithUsers[0].username} (${quiz.proctor_fid})`
            : ""}
        </p>
        <div className="my-4 w-full">
          <ShareQuiz quiz={quiz} />
        </div>
        <img
          src={`${process.env.NEXT_PUBLIC_HOST}/api/frames/quiz/image?title=${quiz.title}&description=${quiz.description}`}
          alt="Quiz"
        />
        <div className="my-4 w-full">
          <h2 className="text-2xl font-semibold mt-5">Quiz Stats</h2>
          {submissionsWithUsers.length > 0 ? (
            // @ts-ignore
            <SubmissionList submissions={submissionsWithUsers} />
          ) : (
            <p>No submissions yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
