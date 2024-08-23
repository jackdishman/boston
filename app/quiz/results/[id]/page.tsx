import {
  getQuestionsByIds,
  getQuiz,
  getSubmissionById,
} from "@/middleware/quiz";
import { IAnswerEntry, IQuestion, ISubmission } from "@/types/quiz";
import PageContainer from "./PageContainer";

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

  // fetch submission data
  try {
    const submissionRes = await getSubmissionById(Number(id));
    if (!submissionRes) return <div>no submissions</div>;
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
    proctorFid = quizRes.proctor_fid;
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

  return (
    <PageContainer
      id={id}
      quizId={quizId}
      proctorFid={proctorFid ?? ""}
      submissions={submissions}
      joinedData={joinedData}
    />
  );
}
