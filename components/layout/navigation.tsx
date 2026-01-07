"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/videos", label: "Media" },
  { href: "/courses", label: "Courses" },
  { href: "/shop", label: "Shop" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0A1A33] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/smart.png"
              alt="SmartSecurity Consult"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out",
                  "text-[#F3F4F6] hover:bg-[#007CFF]/10 hover:border-b-2 hover:border-[#007CFF]",
                  pathname === item.href
                    ? "border-b-2 border-[#007CFF] font-semibold text-[#F3F4F6]"
                    : "border-b-2 border-transparent text-[#F3F4F6]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-white hover:text-[#007CFF] text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <i className="fa-solid fa-xmark fa-text"></i>
            ) : (
              <i className="fa-solid fa-bars fa-text"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#007CFF]/20">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium transition-all duration-300 ease-in-out",
                  "text-[#F3F4F6] hover:bg-[#007CFF]/10",
                  pathname === item.href
                    ? "bg-[#007CFF]/10 font-semibold border-l-2 border-[#007CFF] text-[#F3F4F6]"
                    : "text-[#F3F4F6]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

