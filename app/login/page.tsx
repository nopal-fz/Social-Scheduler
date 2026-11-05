import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";

import { login } from "./actions";
import styles from "./login.module.css";

export const instant = false;

const errors = {
  invalid: "Email atau password salah.",
  rate: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
} as const;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) {
    redirect("/");
  }

  const { error } = await searchParams;
  const message = error === "invalid" || error === "rate" ? errors[error] : null;

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <p className={styles.brand}>jadwalin</p>
        <h1 id="login-title">Masuk ke jadwalin</h1>
        <p className={styles.lead}>Atur jadwal post Threads, Instagram, dan TikTok dari satu tempat.</p>

        {message ? (
          <p className={styles.error} role="alert">
            {message}
          </p>
        ) : null}

        <form action={login} className={styles.form}>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className={styles.submit}>
            Masuk
          </button>
        </form>
      </section>
    </main>
  );
}
