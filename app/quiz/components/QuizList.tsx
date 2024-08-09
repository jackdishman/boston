"use client";

import { IQuiz } from "@/types/quiz";
import { useRouter } from "next/navigation";
interface IProps {
  quizzes: IQuiz[];
}

export default function QuizList(props: IProps) {
  const { quizzes } = props;
  const router = useRouter();

  const handleClick = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>
      <div className="grid grid-cols-1 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer hover:bg-[#7c65c1]/10 hover:border-[#7c65c1]/10 border border-gray-200"
            onClick={() => handleClick(quiz.id)}
          >
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
