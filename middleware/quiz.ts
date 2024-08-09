import {
  IQuiz,
  IAnswerEntry,
  IQuestion,
  IQuestionBuilder,
  IQuizBuilder,
  ISubmission,
} from "@/types/quiz";
import { supabase } from "./supabase";

export async function getQuizzes(): Promise<IQuiz[] | undefined> {
  try {
    const { data, error } = await supabase.from("quizzes").select("*");
    console.log(data);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching quizzes", error);
  }
}

export async function getQuiz(quizId: number): Promise<IQuiz | undefined> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    if (error) throw error;
    return data as IQuiz;
  } catch (error) {
    console.error("Error fetching quiz", error);
  }
}

export async function getQuestions(
  quizId: number
): Promise<IQuestion[] | undefined> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });
    if (error) throw error;
    return data as IQuestion[];
  } catch (error) {
    console.error("Error fetching questions", error);
  }
}

export async function createSubmission(
  quizId: number,
  fid: string
): Promise<ISubmission | undefined> {
  try {
    // Check if the submission already exists
    const { data: existingSubmission, error: existingSubmissionError } =
      await supabase
        .from("submissions")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("fid", fid)
        .single();
    if (existingSubmissionError && existingSubmissionError.code !== "PGRST116")
      throw existingSubmissionError;
    if (existingSubmission) return existingSubmission as ISubmission;

    // Create a new submission with an empty array for answers
    const { data, error } = await supabase
      .from("submissions")
      .insert([{ quiz_id: quizId, fid, answers: [] }]) // Initialize answers as an empty array
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error creating submission", error);
  }
}

export async function uploadQuiz(
  quiz: IQuizBuilder,
  questions: IQuestionBuilder[]
): Promise<IQuiz | undefined> {
  try {
    // Add the quiz
    const { data, error } = await supabase
      .from("quizzes")
      .insert(quiz)
      .select();
    if (error) throw error;

    // Use quiz id to add questions without next_question_id first
    const newQuiz = data[0] as IQuiz;
    const questionData = questions.map((question) => ({
      ...question,
      quiz_id: newQuiz.id,
      next_question_id: null, // Initially set to null
    }));

    const { data: questionDataResponse, error: questionDataError } =
      await supabase.from("questions").insert(questionData).select();
    if (questionDataError) throw questionDataError;

    // Now, update each question with the next_question_id
    for (let i = 0; i < questionDataResponse.length - 1; i++) {
      const currentQuestionId = questionDataResponse[i].id;
      const nextQuestionId = questionDataResponse[i + 1].id;

      const { error: updateError } = await supabase
        .from("questions")
        .update({ next_question_id: nextQuestionId })
        .eq("id", currentQuestionId);

      if (updateError) throw updateError;
    }

    // Get first question ID and update quiz
    const firstQuestionId = questionDataResponse[0].id;
    const { data: updatedQuiz, error: updatedQuizError } = await supabase
      .from("quizzes")
      .update({ first_question_id: firstQuestionId })
      .eq("id", newQuiz.id)
      .select();
    if (updatedQuizError) throw updatedQuizError;

    return updatedQuiz[0] as IQuiz;
  } catch (error) {
    console.error("Error uploading quiz", error);
  }
}

export async function getQuestion(
  quizId: number,
  questionId: number
): Promise<IQuestion | undefined> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("id", questionId)
      .single();
    if (error) throw error;
    return data as IQuestion;
  } catch (error) {
    console.error("Error fetching question", error);
  }
}

export async function updateSubmission(
  fid: string,
  submissionState: ISubmission,
  questionId: string,
  answer: string,
  isCorrect: boolean
): Promise<ISubmission | undefined> {
  const questionIdNumber = parseInt(questionId, 10); // Convert to number
  if (isNaN(questionIdNumber)) {
    console.error("Invalid question ID");
    return;
  }

  const answerEntry: IAnswerEntry = {
    question_id: questionIdNumber,
    answer,
    is_correct: isCorrect,
  };

  const answers = submissionState.answers
    ? [...submissionState.answers, answerEntry]
    : [answerEntry];

  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ answers })
      .eq("id", submissionState.id)
      .eq("fid", fid)
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error updating submission", error);
  }
}

export async function updateSubmissionScore(
  submissionId: number,
  score: number
): Promise<ISubmission | undefined> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ score, time_completed: new Date().toISOString() })
      .eq("id", submissionId)
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error updating submission", error);
  }
}

export async function getSubmissions(
  quizId: number
): Promise<ISubmission[] | undefined> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("score", { ascending: false });
    if (error) throw error;
    return data as ISubmission[];
  } catch (error) {
    console.error("Error fetching submissions", error);
  }
}

export function getElapsedTimeString(
  createdAtTimestamp: string,
  completedAtTimestamp?: string | null
): string {
  const start = new Date(createdAtTimestamp);
  const end = completedAtTimestamp
    ? new Date(completedAtTimestamp)
    : new Date();
  const elapsed = end.getTime() - start.getTime();
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  let timeString = "";
  if (hours > 0) {
    timeString += hours + "h ";
  }
  if (minutes > 0) {
    timeString += (minutes % 60) + "m ";
  }
  timeString += (seconds % 60) + "s";
  return timeString;
}
