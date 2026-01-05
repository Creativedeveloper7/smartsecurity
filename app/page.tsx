import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center">
              <h1 className="mb-6 text-4xl font-heading font-bold leading-tight text-[#0A1A33] sm:text-5xl lg:text-6xl">
                SmartSecurity Consult
          </h1>
              <p className="mb-4 text-xl text-[#2D3748]">
                Expert Security Services in Kenya
              </p>
              <p className="mb-8 text-lg leading-relaxed text-[#4A5768]">
                With extensive experience in high-level policing, security detail, intelligence,
                criminal handling, and consultancy. Providing authoritative security solutions
                for government and private sector clients.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-8 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg"
                >
                  Read Articles
                  <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
                </Link>
                <Link
                  href="/bookings"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-[#005B6E] bg-transparent px-8 py-3 text-base font-medium text-[#005B6E] transition-all hover:bg-[#005B6E] hover:text-white"
                >
                  Book Consultation
                  <i className="fa-regular fa-calendar fa-text ml-2"></i>
                </Link>
              </div>
            </div>

            {/* Right: Professional Portrait */}
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
                <div className="h-full w-full bg-gradient-to-br from-[#0A1A33] to-[#005B6E] flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved fa-title text-8xl text-white/20"></i>
                </div>
                {/* Placeholder for professional photo */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#F3F4F6]">
                  <p className="text-[#4A5768]">Professional Photo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="bg-[#F3F4F6] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-heading font-bold text-[#0A1A33] lg:text-4xl">
              Professional Biography
            </h2>
            <div className="mx-auto h-1 w-24 bg-[#005B6E]"></div>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg bg-white p-8 shadow-md">
              <p className="mb-6 text-lg leading-relaxed text-[#2D3748]">
                With over three decades of distinguished service in Kenya&apos;s security sector,
                I bring unparalleled expertise in high-level policing, executive protection,
                intelligence operations, and criminal justice consultation. My career has spanned
                critical roles in government security, where I have been instrumental in developing
                and implementing comprehensive security strategies for high-profile individuals
                and institutions.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-[#2D3748]">
                My extensive background includes specialized training in threat assessment,
                risk management, and crisis response. I have successfully managed complex security
                operations, provided expert testimony in high-stakes legal proceedings, and
                delivered strategic security consultations to both public and private sector
                organizations across East Africa.
              </p>
              <p className="text-lg leading-relaxed text-[#2D3748]">
                Now transitioning into private consultancy, I am committed to sharing my knowledge
                and expertise to help organizations enhance their security posture, navigate
                complex security challenges, and build resilient protection frameworks.
              </p>
            </div>

            {/* Areas of Expertise */}
            <div className="mt-12">
              <h3 className="mb-6 text-2xl font-heading font-semibold text-[#1F2937]">
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "High-Level Policing",
                  "Executive Protection",
                  "Intelligence Operations",
                  "Criminal Investigation",
                  "Security Strategy",
                  "Risk Assessment",
                  "Crisis Management",
                  "Expert Testimony",
                ].map((expertise) => (
                  <span
                    key={expertise}
                    className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#005B6E]"
                  >
                    {expertise}
                  </span>
                ))}
              </div>
            </div>

            {/* Statistical Highlights */}
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { number: "30+", label: "Years Experience" },
                { number: "500+", label: "Security Operations" },
                { number: "100+", label: "Consultations" },
                { number: "50+", label: "Expert Testimonies" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 text-4xl font-heading font-bold text-[#0A1A33]">
                    {stat.number}
                  </div>
                  <div className="text-sm text-[#4A5768]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-heading font-bold text-[#0A1A33] lg:text-4xl">
              Explore My Work
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#4A5768]">
              Access articles, videos, publications, and book consultations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Articles Card */}
            <Link
              href="/blog"
              className="group rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E] group-hover:bg-[#007CFF] group-hover:text-white transition-colors">
                <i className="fa-regular fa-book fa-subtitle text-2xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-heading font-semibold text-[#1F2937]">
                Articles
              </h3>
              <p className="mb-4 text-sm text-[#4A5768]">
                Read insights on security, criminal justice, and professional expertise
              </p>
              <span className="text-sm font-medium text-[#007CFF] group-hover:underline">
                Read More →
              </span>
            </Link>

            {/* Videos Card */}
            <Link
              href="/videos"
              className="group rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E] group-hover:bg-[#007CFF] group-hover:text-white transition-colors">
                <i className="fa-regular fa-video fa-subtitle text-2xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-heading font-semibold text-[#1F2937]">
                Videos
              </h3>
              <p className="mb-4 text-sm text-[#4A5768]">
                Watch interviews, podcasts, webinars, and expert presentations
              </p>
              <span className="text-sm font-medium text-[#007CFF] group-hover:underline">
                Watch Now →
              </span>
            </Link>

            {/* Shop Card */}
            <Link
              href="/shop"
              className="group rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E] group-hover:bg-[#007CFF] group-hover:text-white transition-colors">
                <i className="fa-regular fa-trophy fa-subtitle text-2xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-heading font-semibold text-[#1F2937]">
                Shop
              </h3>
              <p className="mb-4 text-sm text-[#4A5768]">
                Browse publications, reports, and professional resources
              </p>
              <span className="text-sm font-medium text-[#007CFF] group-hover:underline">
                Browse Shop →
              </span>
            </Link>

            {/* Bookings Card */}
            <Link
              href="/bookings"
              className="group rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:border-[#007CFF] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#005B6E] group-hover:bg-[#007CFF] group-hover:text-white transition-colors">
                <i className="fa-regular fa-calendar fa-subtitle text-2xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-heading font-semibold text-[#1F2937]">
                Consultation
              </h3>
              <p className="mb-4 text-sm text-[#4A5768]">
                Book a professional consultation for expert security advice
              </p>
              <span className="text-sm font-medium text-[#007CFF] group-hover:underline">
                Book Now →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-[#F3F4F6] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: "fa-solid fa-shield-halved",
                title: "Certified Professional",
                description: "Extensive certifications in security and law enforcement",
              },
              {
                icon: "fa-regular fa-users",
                title: "Trusted Advisor",
                description: "Serving high-profile clients and government institutions",
              },
              {
                icon: "fa-regular fa-trophy",
                title: "Proven Track Record",
                description: "Decades of successful security operations and consultations",
              },
            ].map((indicator) => (
              <div
                key={indicator.title}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#005B6E] shadow-md">
                  <i className={`${indicator.icon} fa-subtitle text-3xl`}></i>
                </div>
                <h3 className="mb-2 text-xl font-heading font-semibold text-[#1F2937]">
                  {indicator.title}
                </h3>
                <p className="text-sm text-[#4A5768]">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
