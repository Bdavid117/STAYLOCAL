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
        className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
