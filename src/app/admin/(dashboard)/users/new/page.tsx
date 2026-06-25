import Link from "next/link";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

export default function AdminNewUserPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-amber-400"
        >
          ← Admin users
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Add admin user</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create another account for dashboard access.
        </p>
      </div>
      <AdminUserForm />
    </div>
  );
}
