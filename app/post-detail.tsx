"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { STATUS_LABELS } from "@/lib/calendar/status";
import type { CalendarAccount, CalendarPostStatus } from "@/lib/calendar/types";

import { PlatformMark } from "./platform-mark";

type PostDetailProps = {
  caption: string;
  dateLabel: string;
  time: string;
  status: CalendarPostStatus;
  accounts: CalendarAccount[];
  error?: string;
  closeHref: string;
};

export function PostDetail({
  caption,
  dateLabel,
  time,
  status,
  accounts,
  error,
  closeHref,
}: PostDetailProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-labelledby="detail-title"
      onClose={() => router.replace(closeHref, { scroll: false })}
    >
      <div className="drawer__head">
        <h2 id="detail-title">Detail post</h2>
        <button
          type="button"
          className="icon-btn"
          onClick={() => dialogRef.current?.close()}
          aria-label="Tutup detail"
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

      <div className="detail">
        <p className="detail__caption">{caption}</p>

        <dl className="detail__meta">
          <div className="detail__row">
            <dt>Jadwal</dt>
            <dd>
              {dateLabel}, <span className="mono">{time}</span>
              <span className="detail__tz mono">Asia/Jakarta</span>
            </dd>
          </div>

          <div className="detail__row">
            <dt>Akun</dt>
            <dd className="detail__accounts">
              {accounts.map((account) => (
                <span key={account.id} className="detail__account">
                  <PlatformMark platform={account.platform} />
                  {account.label} {account.handle}
                  {account.needsReconnect ? (
                    <span className="detail__warn">Perlu reconnect</span>
                  ) : null}
                </span>
              ))}
              {accounts.length === 0 ? <span>Tanpa akun</span> : null}
            </dd>
          </div>

          <div className="detail__row">
            <dt>Status</dt>
            <dd className="detail__status">
              <span className={`shape shape--${status}`} aria-hidden="true" />
              {STATUS_LABELS[status]}
            </dd>
          </div>
        </dl>

        {error ? (
          <div className="detail__error">
            <p className="detail__error-title">Error platform</p>
            <p>{error}</p>
          </div>
        ) : null}
      </div>

      <div className="detail__actions">
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => dialogRef.current?.close()}
        >
          Tutup
        </button>
      </div>
    </dialog>
  );
}
