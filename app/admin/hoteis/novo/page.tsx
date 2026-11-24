import { requireAdmin } from "@/app/server/auth";
import { HotelForm } from "../HotelForm";

export const dynamic = "force-dynamic";

export default async function NovoHotel() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Novo hotel</h1>
      <HotelForm />
    </div>
  );
}
