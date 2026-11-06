"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { CAPTION_LIMIT } from "@/lib/composer/schema";
import type { CalendarAccount } from "@/lib/calendar/types";

import { createPost, type ComposerState } from "./actions";
import { PlatformMark } from "./platform-mark";

const initialState: ComposerState = { error: null };

type ComposerProps = {
  accounts: CalendarAccount[];
  preselectedAccountIds: string[];
  defaultDate: string;
  defaultTime: string;
  accountsParam: string | null;
  closeHref: string;
};

export function Composer({
  accounts,
  preselectedAccountIds,
  defaultDate,
  defaultTime,
  accountsParam,
  closeHref,
}: ComposerProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, actionPending] = useActionState(createPost, initialState);
  const [isPending, startTransition] = useTransition();
  const pending = actionPending || isPending;
  // Field dikendalikan state: React 19 mereset form tak-terkontrol setelah
  // server action selesai, yang akan menghapus isian saat validasi gagal.
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(preselectedAccountIds),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      captionRef.current?.focus();
    }
  }, []);

  const toggleAccount = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  // Submit lewat handler, bukan `action` form: React 19 mereset form tak
  // terkontrol setelah action selesai, yang mengembalikan pilihan akun ke awal
  // saat validasi gagal.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-labelledby="composer-title"
      onClose={() => router.replace(closeHref, { scroll: false })}
    >
      <div className="drawer__head">
        <h2 id="composer-title">Post baru</h2>
        <button
          type="button"
          className="icon-btn"
          onClick={() => dialogRef.current?.close()}
          aria-label="Tutup composer"
        >
          <svg className="ic" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={onSubmit} className="drawer__form">
        {accountsParam !== null ? (
          <input type="hidden" name="accounts" value={accountsParam} />
        ) : null}

        <label className="field">
          <span className="field__label">Caption</span>
          <textarea
            ref={captionRef}
            name="caption"
            rows={5}
            required
            value={caption}
            onChange={(event) => setCaption(event.currentTarget.value)}
            placeholder="Tulis post untuk Threads"
          />
          <span className="field__hint mono">
            {caption.length}/{CAPTION_LIMIT}
          </span>
        </label>

        <fieldset className="field">
          <legend className="field__label">Akun</legend>
          <div className="drawer__accounts">
            {accounts.map((account) => (
              <label key={account.id} className="drawer__account">
                <input
                  type="checkbox"
                  name="accountIds"
                  value={account.id}
                  checked={selected.has(account.id)}
                  onChange={() => toggleAccount(account.id)}
                />
                <PlatformMark platform={account.platform} />
                <span>{account.handle}</span>
                {account.needsReconnect ? (
                  <span className="acct__warn" title="Perlu reconnect" />
                ) : null}
              </label>
            ))}
            {accounts.length === 0 ? (
              <p className="drawer__empty">
                Belum ada akun Threads. Sambungkan akun dulu dari pengaturan akun.
              </p>
            ) : null}
          </div>
        </fieldset>

        <div className="drawer__when">
          <label className="field">
            <span className="field__label">Tanggal</span>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(event) => setDate(event.currentTarget.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Jam</span>
            <input
              type="time"
              name="time"
              step={900}
              value={time}
              onChange={(event) => setTime(event.currentTarget.value)}
              required
            />
          </label>
        </div>

        {state.error ? (
          <p className="drawer__error" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="drawer__actions">
          <button type="button" className="btn btn--quiet" onClick={() => dialogRef.current?.close()}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Jadwalkan"}
          </button>
        </div>
        <p className="drawer__tz mono">Asia/Jakarta</p>
      </form>
    </dialog>
  );
}
