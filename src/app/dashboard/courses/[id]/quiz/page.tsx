"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconHelpCircle, IconCheckCircle, IconXCircle, IconTrophy } from "@/lib/icons";
import { http, getMe } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface Result {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

interface LeaderboardEntry {
  id: string;
  score: number;
  total: number;
  createdAt: string;
  student: { name: string };
}

export default function CourseQuiz() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const me = getMe();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; results: Result[] } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    http.get<QuizQuestion[]>(`/quiz/${id}`).then(setQuestions).catch(console.error);
  };

  useEffect(load, [id]);

  const loadLeaderboard = () => {
    http.get<LeaderboardEntry[]>(`/quiz/${id}/leaderboard`).then(setLeaderboard).catch(console.error);
  };

  const submit = async () => {
    if (!me) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      toast.error(`${unanswered} question${unanswered > 1 ? "s" : ""} unanswered — answer all before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] }));
      const res = await http.post<{ score: number; total: number; results: Result[] }>(`/quiz/${id}`, {
        studentId: me.id,
        answers: payload,
      });
      setResult(res);
      loadLeaderboard();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const retake = () => {
    setResult(null);
    setAnswers({});
    load();
  };

  return (
    <StudentShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.push(`/dashboard/courses/${id}`)}
          className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <IconArrowLeft size={15} /> Back to course
        </button>

        <div className="flowmark-card p-6 bg-gradient-to-br from-primary/5 to-leaf-green/5 border-none">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center shrink-0">
              <IconHelpCircle size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display-lg-mobile text-primary">Course Quiz</h1>
              <p className="text-body-sm text-on-surface-variant">
                {result
                  ? "Here's how you did. Review the answers below."
                  : `${questions.length} random questions from the pool · graded instantly`}
              </p>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {questions.length === 0 ? (
              <Card className="p-8 text-center text-body-sm text-on-surface-variant">
                Loading questions…
              </Card>
            ) : (
              <div className="space-y-5">
                {questions.map((q, qi) => (
                  <Card key={q.id} className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Badge variant="soft" size="sm">{qi + 1}</Badge>
                      <p className="font-medium text-on-surface text-sm">{q.question}</p>
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const selected = answers[q.id] === oi;
                        return (
                          <button
                            key={oi}
                            onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] border text-body-sm text-left transition-all duration-200 cursor-pointer ${
                              selected
                                ? "bg-primary/10 border-primary text-on-surface font-semibold"
                                : "bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container-high"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center text-xs font-bold ${
                                selected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                ))}

                <div className="flex items-center justify-between">
                  <p className="text-body-sm text-on-surface-variant">
                    {Object.keys(answers).length} of {questions.length} answered
                  </p>
                  <Button size="lg" onClick={submit} disabled={submitting}>
                    {submitting ? "Grading…" : "Submit quiz"}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 bg-gradient-to-br from-leaf-green/10 via-surface-off-white to-soft-peach/10 border-none">
              <div className="flex-1">
                <p className="font-label-caps text-on-surface-variant mb-1">Your score</p>
                <p className="font-display-lg-mobile text-primary">
                  {result.score}<span className="text-on-surface-variant text-body-lg font-normal">/{result.total}</span>
                </p>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {result.score >= 0.8 * result.total ? "Excellent — top of the class!" : result.score >= 0.5 * result.total ? "Good effort — review the misses below." : "Keep studying — review the answers below."}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={retake}>Retake quiz</Button>
                <Button onClick={() => router.push(`/dashboard/courses/${id}`)}>Back to course</Button>
              </div>
            </Card>

            {leaderboard.length > 0 && (
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <IconTrophy size={18} className="text-secondary" />
                  <h2 className="font-headline-md text-sm text-primary">Leaderboard</h2>
                </div>
                <div className="space-y-1.5">
                  {leaderboard.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-surface-container-low">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-body-sm font-medium text-on-surface truncate">{e.student.name}</span>
                      <span className="text-body-sm font-semibold text-primary">{e.score}/{e.total}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {result.results.map((r, ri) => {
                const q = questions[ri];
                return (
                  <Card key={r.questionId} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {r.correct ? <IconCheckCircle size={20} className="text-leaf-green" /> : <IconXCircle size={20} className="text-error" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface text-sm">{q.question}</p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <p
                              key={oi}
                              className={`text-body-sm px-3 py-1.5 rounded-[var(--radius-md)] ${
                                oi === r.correctIndex
                                  ? "bg-leaf-green/10 text-leaf-green font-semibold"
                                  : oi === r.selectedIndex
                                  ? "bg-error/10 text-error"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                              {oi === r.correctIndex ? " ✓" : ""}
                            </p>
                          ))}
                        </div>
                        {r.explanation && <p className="text-label-caps text-on-surface-variant mt-2">Why: {r.explanation}</p>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}