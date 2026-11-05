import { logout } from "./actions";
import { requireUser } from "@/lib/auth/current-user";

export const instant = false;

export default async function Home() {
  const user = await requireUser();

  return (
    <main className="app-shell">
      <h1>jadwalin</h1>
      <p>Masuk sebagai {user.email}.</p>
      <p>Kalender minggu menyusul.</p>
      <form action={logout}>
        <button type="submit">Keluar</button>
      </form>
    </main>
  );
}
