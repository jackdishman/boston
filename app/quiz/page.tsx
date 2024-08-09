import { getQuizzes } from "@/middleware/quiz";
import QuizContainer from "./components/QuizContainer";

export default async function Page() {
  const quizzes = await getQuizzes();

  if (!quizzes) return <div>No quizzes Found</div>;

  return (
    <div className="flex justify-center">
      <QuizContainer quizzes={quizzes} />
    </div>
  );
}
