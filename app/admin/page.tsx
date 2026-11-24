import { redirect } from "next/navigation";
import { getSession } from "@/app/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const user = await getSession();
  redirect(user ? "/admin/dashboard" : "/admin/login");
}
