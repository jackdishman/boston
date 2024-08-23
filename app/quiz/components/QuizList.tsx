"use client";

import { IQuiz, IQuizStats } from "@/types/quiz";
import { useRouter } from "next/navigation";
interface IProps {
  quizzes: IQuiz[];
  quizStats: Map<number, IQuizStats>;
}

export default function QuizList(props: IProps) {
  const { quizzes, quizStats } = props;
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
            <div className="flex w-full justify-between">
              {quiz.image && (
                <img
                  src={quiz.image}
                  alt={quiz.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                <p className="text-gray-500">{quiz.description}</p>
              </div>
              <div className="flex flex-col ml-4">
                <p>
                  <span className="font-semibold">
                    {quizStats.get(quiz.id)?.totalSubmissions}
                  </span>{" "}
                  Questions
                </p>
                <p>
                  <span className="font-semibold">
                    {quizStats.get(quiz.id)?.completedSubmissions}
                    {" of "}
                    {quizStats.get(quiz.id)?.totalSubmissions}
                  </span>{" "}
                  Submissions completed
                </p>
                <p>
                  <span className="font-semibold">
                    {quizStats.get(quiz.id)?.averageScore.toFixed(2)}%
                  </span>{" "}
                  Average Score
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
