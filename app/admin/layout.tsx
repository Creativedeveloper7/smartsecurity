import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminLayout from "@/components/admin/AdminLayout";

// Mark admin routes as dynamic since they use session/auth
export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current pathname from headers (set by proxy.ts)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Check if we're on the login page
  const isLoginPage = pathname === "/admin/login";
  
  // Skip authentication check for login page to prevent redirect loop
  if (!isLoginPage) {
    try {
      const session = await getSession();

      if (!session) {
        // No session - redirect to login
        redirect("/admin/login");
      }

      // Check if user has admin role
      const userRole = (session.user as any)?.role;
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        // User exists but doesn't have admin role - redirect to login
        redirect("/admin/login");
      }
      
      // User is authenticated and has admin role - render admin layout
      return <AdminLayout>{children}</AdminLayout>;
    } catch (error) {
      // If there's an error getting session, redirect to login
      console.error("Error in admin layout:", error);
      redirect("/admin/login");
    }
  }

  // For login page, render without AdminLayout wrapper
  return <>{children}</>;
}
