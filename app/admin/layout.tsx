import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
