import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1A33] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold">About</h3>
            <p className="text-sm text-gray-300">
              Senior security consultant with extensive experience in high-level
              policing, security detail, intelligence, and criminal handling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-[#007CFF] transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-300 hover:text-[#007CFF] transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-300 hover:text-[#007CFF] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-[#007CFF] transition-colors">
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Security Consultation</li>
              <li>Criminal Justice Advisory</li>
              <li>Expert Witness Testimony</li>
              <li>Training & Workshops</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Nairobi, Kenya</li>
              <li>
                <a href="mailto:contact@example.com" className="hover:text-[#007CFF] transition-colors">
                  contact@example.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} SmartSecurity Consult. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

