import { signOut } from "@/shared/auth";

export function LogoutButton() {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-md border border-line bg-paper px-3 text-sm text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
      >
        Salir
      </button>
    </form>
  );
}
