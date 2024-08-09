import { createClient } from "@supabase/supabase-js";
import { IQuiz } from "@/types/quiz";
import { Metadata } from "next";
import QuizBuilder from "@/app/quiz/QuizBuilder";
import { usePrivy } from "@privy-io/react-auth";
import { getQuizzes } from "@/middleware/quiz";

export async function generateMetadata(): Promise<Metadata> {
  const quizzes = await getQuizzes();
  // randomly select a quiz to use for the frame
  if (!quizzes) {
    return {
      title: "No quizzes found",
      openGraph: {
        title: "No quizzes found",
        description: "No quizzes found",
      },
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }
  const randomindex = Math.floor(Math.random() * quizzes?.length);
  const randomId = quizzes?.[randomindex]?.id;

  // const randomId = quizzes?.[0]?.id;

  const title = "Cast-A-Quiz";
  const description = "Farcaster Quiz Frame Builder & Explorer";
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/quiz/image?title=${title}&description=${description}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/${randomId}`,
    "fc:frame:image": imageUrl,

    "fc:frame:button:1": `Proctor Quiz`,
    "fc:frame:button:1:action": `link`,
    "fc:frame:button:1:target": `${process.env["NEXT_PUBLIC_HOST"]}/quiz`,

    "fc:frame:button:2": `Take Random Quiz`,
    "fc:frame:button:2:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/quiz/${randomId}`,
  };

  return {
    title: `Farcaster Quiz Frame Builder & Explorer`,
    openGraph: {
      title: `Farcaster Quiz Frame Builder & Explorer`,
      description: `Farcaster Quiz Frame Builder & Explorer`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}
