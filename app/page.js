import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllLevelConfigs } from "@/lib/levels";

export default async function Home() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/login");
  }

  const levels = await getAllLevelConfigs();

  return (
    <Dashboard initialLevels={levels} adminEmail={admin.email} />
  );
}
