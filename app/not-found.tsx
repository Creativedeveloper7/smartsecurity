import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-heading font-bold text-[#0A1A33]">404</h1>
        <h2 className="mb-4 text-lg font-heading font-semibold text-[#1F2937]">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm text-[#4A5768]">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#007CFF] px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg"
        >
          <i className="fa-solid fa-house fa-text"></i>
          Return Home
        </Link>
      </div>
    </div>
  );
}

