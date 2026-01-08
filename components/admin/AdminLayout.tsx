"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
