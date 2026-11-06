"use client";

import { useRouter } from "next/navigation";

import {
  buildCalendarHref,
  serializeAccountsParam,
  toggleAccountInSelection,
} from "@/lib/calendar/filter";
import type { CalendarAccount } from "@/lib/calendar/types";

import { PlatformMark } from "./platform-mark";

type FilterControls = {
  accounts: CalendarAccount[];
  countsByAccount: Record<string, number>;
  selectedAccountIds: string[] | null;
  weekIso: string;
  day: number;
};

// URL adalah sumber kebenaran; komponen ini hanya menulis param `accounts`
// (menjaga week/day) lewat router. Keputusan tampil dibuat server-rendered.
function useAccountToggle({
  accounts,
  selectedAccountIds,
  weekIso,
  day,
}: FilterControls) {
  const router = useRouter();
  const allIds = accounts.map((account) => account.id);
  const selected = selectedAccountIds === null ? null : new Set(selectedAccountIds);

  const navigateTo = (next: Set<string> | null) => {
    const accountsParam =
      next === null ? null : serializeAccountsParam(next, allIds);
    router.replace(
      buildCalendarHref({ week: weekIso, day, accounts: accountsParam }),
      { scroll: false },
    );
  };

  const toggle = (accountId: string) =>
    navigateTo(toggleAccountInSelection(selected, accountId, allIds));
  const showAll = () => navigateTo(null);
  const isOn = (accountId: string) =>
    selected === null || selected.has(accountId);

  return { selected, toggle, showAll, isOn };
}

export function RailFilterRows(props: FilterControls) {
  const { toggle, isOn } = useAccountToggle(props);

  return (
    <>
      {props.accounts.map((account) => (
        <label
          key={account.id}
          className={`acct${isOn(account.id) ? "" : " is-off"}`}
        >
          <input
            type="checkbox"
            checked={isOn(account.id)}
            onChange={() => toggle(account.id)}
            aria-label={`${account.label} ${account.handle}`}
          />
          <span className="acct__mark">
            <PlatformMark platform={account.platform} />
          </span>
          <span className="acct__handle">{account.handle}</span>
          {account.needsReconnect ? (
            <span className="acct__warn" title="Perlu reconnect" />
          ) : null}
          <span className="acct__n mono">{props.countsByAccount[account.id] ?? 0}</span>
        </label>
      ))}
    </>
  );
}

export function ChipFilter({
  totalPosts,
  ...props
}: FilterControls & { totalPosts: number }) {
  const { selected, toggle, showAll, isOn } = useAccountToggle(props);

  return (
    <>
      <button
        type="button"
        className={`chip chip--all${selected === null ? " is-on" : ""}`}
        onClick={showAll}
        aria-pressed={selected === null}
      >
        <span>Semua</span>
        <span className="chip__n mono">{totalPosts}</span>
      </button>
      {props.accounts.map((account) => (
        <button
          key={account.id}
          type="button"
          className={`chip${isOn(account.id) ? " is-on" : ""}`}
          onClick={() => toggle(account.id)}
          aria-pressed={isOn(account.id)}
          title={`${account.label} ${account.handle}`}
        >
          <PlatformMark platform={account.platform} />
          <span className="chip__handle">{account.handle}</span>
          <span className="chip__short">{account.short}</span>
          <span className="chip__n mono">{props.countsByAccount[account.id] ?? 0}</span>
          {account.needsReconnect ? (
            <span className="acct__warn" title="Perlu reconnect" />
          ) : null}
        </button>
      ))}
    </>
  );
}
