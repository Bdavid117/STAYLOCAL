import { redirect } from "next/navigation";
import { auth } from "@/shared/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}
