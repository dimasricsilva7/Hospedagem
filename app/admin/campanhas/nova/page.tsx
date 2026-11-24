import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/server/auth";
import { db } from "@/app/lib/db";
import { NewCampaignForm } from "../NewCampaignForm";

export const dynamic = "force-dynamic";

export default async function NovaCampanha() {
  await requireAdmin();
  const hotels = await db.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  if (hotels.length === 0) redirect("/admin/hoteis/novo");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Nova campanha</h1>
      <p className="text-sm text-slate-500">Defina o básico. Em seguida você edita todo o conteúdo da landing.</p>
      <NewCampaignForm hotels={hotels} />
    </div>
  );
}
