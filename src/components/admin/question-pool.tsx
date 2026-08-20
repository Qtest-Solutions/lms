"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconEdit2 as IconEdit, IconTrash2 as IconTrash, IconHelpCircle } from "@/lib/icons";
import { http } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { errMessage } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string;
  correctIndex: number;
  explanation: string;
}

interface QuestionForm {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const blankForm: QuestionForm = { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" };

export function QuestionPoolManager({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modal, setModal] = useState<{ kind: "create" } | { kind: "edit"; q: Question } | null>(null);
  const [form, setForm] = useState<QuestionForm>(blankForm);
  const [deleting, setDeleting] = useState<Question | null>(null);

  const load = () => {
    if (courseId) http.get<Question[]>(`/questions?courseId=${courseId}`).then(setQuestions).catch(console.error);
  };

  useEffect(load, [courseId]);

  const openCreate = () => {
    setForm(blankForm);
    setModal({ kind: "create" });
  };

  const openEdit = (q: Question) => {
    setForm({
      question: q.question,
      options: (JSON.parse(q.options) as string[]).concat(["", "", "", ""]).slice(0, 4),
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    });
    setModal({ kind: "edit", q });
  };

  const save = async () => {
    if (!modal) return;
    if (!form.question.trim() || form.options.some((o) => !o.trim())) {
      toast.error("Fill in the question and all 4 options");
      return;
    }
    try {
      if (modal.kind === "edit") {
        await http.put(`/questions/${modal.q.id}`, form);
        toast.success("Question updated");
      } else {
        await http.post("/questions", { ...form, courseId });
        toast.success("Question added to pool");
      }
    } catch (err) {
      toast.error(errMessage(err));
    }
    setModal(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await http.del(`/questions/${deleting.id}`);
      toast.success("Question removed");
    } catch (err) {
      toast.error(errMessage(err));
    }
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/5 flex items-center justify-center">
            <IconHelpCircle size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-headline-md text-sm text-primary">Question pool</h2>
            <p className="font-label-caps text-on-surface-variant">{questions.length} questions · 20 are picked randomly for each quiz</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <IconPlus size={16} /> Add question
        </Button>
      </div>

      <div className="space-y-2">
        {questions.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">No questions yet — the quiz will skip this course until the pool is filled.</p>
        )}
        {questions.map((q) => {
          const options = JSON.parse(q.options) as string[];
          return (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-on-surface text-sm flex-1">{q.question}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)} aria-label={`Edit question`}>
                    <IconEdit size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(q)} aria-label={`Delete question`}>
                    <IconTrash size={15} className="text-error" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-body-sm ${
                      i === q.correctIndex
                        ? "bg-leaf-green/10 text-leaf-green font-semibold"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    <Badge variant={i === q.correctIndex ? "success" : "soft"} size="sm">
                      {String.fromCharCode(65 + i)}
                    </Badge>
                    <span className="truncate">{opt}</span>
                  </div>
                ))}
              </div>
              {q.explanation && <p className="text-label-caps text-on-surface-variant mt-2">Explanation: {q.explanation}</p>}
            </Card>
          );
        })}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.kind === "edit" ? "Edit question" : "Add question"} maxWidth="max-w-xl">
        <div className="space-y-3">
          <Input
            label="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder="Write the question…"
            autoFocus
          />
          <div>
            <label className="font-label-caps text-on-surface-variant">Options & correct answer</label>
            <div className="mt-1.5 space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: i })}
                    className={`w-7 h-7 shrink-0 rounded-[var(--radius-md)] border text-xs font-bold transition-colors cursor-pointer ${
                      form.correctIndex === i
                        ? "bg-leaf-green text-white border-leaf-green"
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
                    }`}
                    title="Mark as correct"
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const options = [...form.options];
                      options[i] = e.target.value;
                      setForm({ ...form, options });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
            </div>
            <p className="font-label-caps text-on-surface-variant mt-1.5">Click a letter to mark it as the correct answer.</p>
          </div>
          <Input
            label="Explanation (shown after grading)"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            placeholder="Why is this the right answer?"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save}>{modal?.kind === "edit" ? "Save changes" : "Add question"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete question"
        message={`Remove "${deleting?.question}" from the pool?`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}