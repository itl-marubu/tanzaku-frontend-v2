import type { ManageEvent } from "@/api/adminClient";
import { useState } from "react";

export type TanzakuFormValues = {
  content: string;
  userName: string;
  validationResult: number;
  eventId: string | null;
};

type EditModalProps = {
  title: string;
  submitLabel: string;
  initial: TanzakuFormValues;
  events: ManageEvent[];
  onClose: () => void;
  onSubmit: (values: TanzakuFormValues) => Promise<void>;
  onValidationError: (message: string) => void;
};

export const EditModal: React.FC<EditModalProps> = ({
  title,
  submitLabel,
  initial,
  events,
  onClose,
  onSubmit,
  onValidationError,
}) => {
  const [content, setContent] = useState(initial.content);
  const [userName, setUserName] = useState(initial.userName);
  const [validationResult, setValidationResult] = useState(
    initial.validationResult,
  );
  const [eventId, setEventId] = useState(initial.eventId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    const trimmedUserName = userName.trim();

    if (!trimmedContent || !trimmedUserName) {
      onValidationError("内容とユーザー名は必須です");
      return;
    }
    if (trimmedContent.length > 14) {
      onValidationError("内容は14文字以内で入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        content: trimmedContent,
        userName: trimmedUserName,
        validationResult,
        eventId: eventId || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: モーダル外クリックで閉じる補助操作（Escはフォーム側で提供しない旧挙動を踏襲）
    <div
      className="fixed inset-0 z-1000 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto mt-[15%] w-4/5 max-w-[500px] rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2c3e50]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-2xl text-[#7f8c8d] hover:text-[#2c3e50]"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="edit-content"
              className="mb-2 block font-semibold text-[#2c3e50]"
            >
              内容 (14文字以内)
            </label>
            <input
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={14}
              required
              className="w-full rounded border border-[#bdc3c7] p-2 text-sm focus:border-[#3498db] focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="edit-username"
              className="mb-2 block font-semibold text-[#2c3e50]"
            >
              ユーザー名
            </label>
            <input
              id="edit-username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full rounded border border-[#bdc3c7] p-2 text-sm focus:border-[#3498db] focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="edit-validation"
              className="mb-2 block font-semibold text-[#2c3e50]"
            >
              バリデーション結果
            </label>
            <select
              id="edit-validation"
              value={validationResult}
              onChange={(e) => setValidationResult(Number(e.target.value))}
              className="w-full rounded border border-[#bdc3c7] bg-white p-2 text-sm"
            >
              <option value={0}>適切</option>
              <option value={1}>不適切</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="edit-event"
              className="mb-2 block font-semibold text-[#2c3e50]"
            >
              イベント
            </label>
            <select
              id="edit-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded border border-[#bdc3c7] bg-white p-2 text-sm"
            >
              <option value="">レガシー（なし）</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                  {ev.isActive ? " ★" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded bg-[#95a5a6] px-4 py-2 text-sm text-white hover:opacity-80"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded bg-[#3498db] px-4 py-2 text-sm text-white ${
                isSubmitting
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:opacity-80"
              }`}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
