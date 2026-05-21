import { requireAdminPage } from "@/lib/admin-api";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminPage();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 lg:flex-row">
      <AdminNav email={user.email} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
