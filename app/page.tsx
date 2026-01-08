"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const galleryImages = [
    "/gallery/President.jpeg",
    "/gallery/US.jpeg",
    "/gallery/Bishop.jpeg",
    "/gallery/salute.jpeg",
    "/gallery/service.jpeg",
    "/gallery/Swearing.jpeg",
    "/gallery/UN .jpeg",
    "/images/DG.png",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (isBioModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBioModalOpen]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Full-width Background Image Carousel */}
        <div className="absolute inset-0">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
          
          {/* Gradient Overlay - Fades from left (darker) to right (lighter) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A33]/90 via-[#0A1A33]/60 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 min-h-[500px] lg:min-h-[600px]">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-6">
                <img
                  src="/smart.png"
                  alt="SmartSecurity Consult"
                  className="h-auto w-auto max-w-[200px]"
                  style={{ 
                    background: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 12px rgba(0, 124, 255, 0.6)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.4))',
                  }}
                />
              </div>
              <h1 
                className="mb-6 text-3xl font-heading font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
                style={{ color: 'white' }}
              >
                SmartSecurity Consult
              </h1>
              <p className="mb-4 text-base text-white/90 drop-shadow-md">
                Expert Security Services in Kenya
              </p>
              <p className="mb-8 text-sm leading-relaxed text-white/80 drop-shadow-md">
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
                  className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-3 text-base font-medium text-white transition-all hover:bg-white/10 hover:border-white/80"
                >
                  Book Consultation
                  <i className="fa-regular fa-calendar fa-text ml-2"></i>
                </Link>
              </div>
            </div>

            {/* Right: Empty space for layout balance */}
            <div className="hidden lg:block"></div>
          </div>
        </div>

        {/* Navigation Arrows - Positioned on the right side */}
        <button
          onClick={goToPrevious}
          className="absolute right-20 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 hover:scale-110"
          aria-label="Previous image"
        >
          <i className="fa-solid fa-chevron-left fa-text text-xl"></i>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 hover:scale-110"
          aria-label="Next image"
        >
          <i className="fa-solid fa-chevron-right fa-text text-xl"></i>
        </button>

        {/* Dots Indicator - Positioned at bottom right */}
        <div className="absolute bottom-8 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-8 z-20 flex gap-2">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Biography Section */}
      <section className="relative bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6] py-20 lg:py-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#007CFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#005B6E]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[450px_1fr] lg:gap-16">
            {/* Left Column: Portrait */}
            <div className="relative group flex flex-col items-center">
              <div className="relative h-[400px] w-full max-w-[400px] mx-auto lg:mx-0 overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 group-hover:shadow-[#007CFF]/20 group-hover:shadow-2xl">
                {/* Decorative Border */}
                <div className="absolute inset-0 rounded-2xl border-4 border-white/50 group-hover:border-[#007CFF]/30 transition-colors duration-500 z-10"></div>
                <div className="absolute -left-2 top-8 w-4 h-32 bg-gradient-to-b from-[#007CFF] to-[#005B6E] rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Image
                  src="/gallery/Swearing.jpeg"
                  alt="Bruno Isohi Shioso"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
              
              {/* Name Badge - Moved outside the image container */}
              <div className="w-full max-w-[400px] -mt-6 px-6 z-10">
                <div className="bg-gradient-to-r from-[#007CFF] to-[#005B6E] rounded-lg p-4 shadow-lg">
                  <h3 className="text-white text-xl font-heading font-bold text-center mb-1">
                    Bruno Shioso
                  </h3>
                  <p className="text-white/90 text-sm font-medium text-center">
                    Distinguished Security Expert
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Bio Content + Logo Slider + Stats */}
            <div className="flex flex-col gap-10">
              {/* Bio Content */}
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="text-sm font-semibold text-[#007CFF] uppercase tracking-wider mb-2 block">About</span>
                  <h2 className="text-4xl lg:text-5xl font-heading font-bold text-[#0A1A33] leading-tight">
                    Distinguished Security Expert
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-[#2D3748] max-w-2xl">
                  Mr. Bruno Isohi Shioso is a seasoned security and law enforcement professional with extensive experience in Kenya and internationally, having served in both the National Police Service (NPS) and the United Nations (UN) in various senior capacities.
                </p>
                <button
                  onClick={() => setIsBioModalOpen(true)}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-[#007CFF] text-white font-medium rounded-lg shadow-lg hover:bg-[#0066CC] hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <span>Read More</span>
                  <i className="fa-solid fa-arrow-right fa-text transition-transform duration-300 group-hover:translate-x-1"></i>
                </button>
              </div>

              {/* Statistical Highlights - Simple */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { number: "30+", label: "Years Experience" },
                  { number: "5", label: "Books Published" },
                  { number: "100+", label: "Articles" },
                  { number: "50+", label: "Media Engagements" },
                ].map((stat) => (
                  <div key={stat.label} className="text-left">
                    <div className="mb-2 text-3xl font-heading font-bold text-[#0A1A33]">
                      {stat.number}
                    </div>
                    <div className="text-sm text-[#4A5768] leading-relaxed">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Logo Slider Section - Enhanced */}
              <div className="mt-4">
                <p className="text-sm font-medium text-[#4A5768] mb-4">Trusted by Leading Organizations</p>
                <div className="logo-marquee-container p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#E5E7EB]">
                  <div className="logo-marquee-track">
                    <div className="logo-marquee">
                      {[
                        { src: "/logos/coast guards.jpg", alt: "Kenya Coast Guard Service" },
                        { src: "/logos/DCI.jpg", alt: "Directorate of Criminal Investigations" },
                        { src: "/logos/npslogo.jpg", alt: "National Police Service" },
                        { src: "/logos/UN_emblem_blue.svg.png", alt: "United Nations" },
                      ].map((logo, index) => (
                        <div
                          key={index}
                          className="h-14 w-auto flex items-center opacity-90 hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
                        >
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={140}
                            height={56}
                            className="h-14 w-auto object-contain"
                          />
                        </div>
                      ))}
                      {[
                        { src: "/logos/coast guards.jpg", alt: "Kenya Coast Guard Service" },
                        { src: "/logos/DCI.jpg", alt: "Directorate of Criminal Investigations" },
                        { src: "/logos/npslogo.jpg", alt: "National Police Service" },
                        { src: "/logos/UN_emblem_blue.svg.png", alt: "United Nations" },
                      ].map((logo, index) => (
                        <div
                          key={`dup-${index}`}
                          className="h-14 w-auto flex items-center opacity-90 hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
                        >
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={140}
                            height={56}
                            className="h-14 w-auto object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Expertise Section */}
      <section className="bg-[#f5f5f5] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-6 text-lg font-heading font-semibold text-[#1F2937]">
            Areas of Expertise
          </h3>
              <div className="grid grid-cols-2 gap-4 text-[#F3F4F6]">
                {[
                  {
                    title: "Criminal Investigation",
                    icon: "fa-solid fa-magnifying-glass",
                    image: "/images/criminal investigation.png",
                    fallbackGradient: "from-[#0A1A33] to-[#1F2937]",
                  },
                  {
                    title: "Maritime Security",
                    icon: "fa-solid fa-ship",
                    image: "/images/maritime security.png",
                    fallbackGradient: "from-[#005B6E] to-[#007CFF]",
                  },
                  {
                    title: "Police Leadership",
                    icon: "fa-solid fa-user-tie",
                    image: "/images/police leadership.png",
                    fallbackGradient: "from-[#007CFF] to-[#005B6E]",
                  },
                  {
                    title: "Transnational Organized Crime",
                    icon: "fa-solid fa-globe",
                    image: "/images/transnational organized crime.png",
                    fallbackGradient: "from-[#1F2937] to-[#0A1A33]",
                  },
                ].map((area, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border border-[#E5E7EB] transition-all hover:border-[#007CFF] hover:shadow-lg"
                  >
                    {/* Background Image with Fallback */}
                    <div className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${area.fallbackGradient}`}>
                      <Image
                        src={area.image}
                        alt={area.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                          <i className={`${area.icon} fa-subtitle text-2xl`}></i>
                        </div>
                        <h4 className="text-sm font-heading font-semibold leading-tight text-[#F3F4F6]">
                          {area.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-heading font-bold text-[#0A1A33] lg:text-3xl">
              Explore My Work
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[#4A5768]">
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
              <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
                Articles
              </h3>
              <p className="mb-4 text-xs text-[#4A5768]">
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
              <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
                Videos
              </h3>
              <p className="mb-4 text-xs text-[#4A5768]">
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
              <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
                Shop
              </h3>
              <p className="mb-4 text-xs text-[#4A5768]">
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
              <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
                Consultation
              </h3>
              <p className="mb-4 text-xs text-[#4A5768]">
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
                <h3 className="mb-2 text-base font-heading font-semibold text-[#1F2937]">
                  {indicator.title}
                </h3>
                <p className="text-xs text-[#4A5768]">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Modal */}
      {isBioModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsBioModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsBioModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2D3748] shadow-lg transition-colors hover:bg-white hover:text-[#6b5cff]"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark fa-text text-xl"></i>
            </button>

            {/* Modal Content */}
            <div className="max-h-[90vh] overflow-y-auto p-8">
              <h2 className="mb-6 text-[36px] font-heading font-bold" style={{ color: "#6b5cff" }}>
                About
              </h2>
              <div className="space-y-4 text-[16px] leading-relaxed" style={{ color: "#4a5568" }}>
                <p>
                  Mr. Bruno Isohi Shioso is a seasoned security and law enforcement professional with extensive experience in Kenya and internationally, having served in both the National Police Service (NPS) and the United Nations (UN) in various senior capacities. His distinguished career includes roles as Police Instructor at the National Police Service Campus A – Kiganjo, Principal Assistant of the Directorate of Criminal Investigations (DCI), Deputy Director of the Banking Fraud Investigation Unit, County Criminal Investigations Officer (CCIO), National Police Service Spokesperson, and Commandant of the National Police Service Campus A – Kiganjo Police College.
                </p>
                <p>
                  Mr. Shioso holds a Master of Science degree in Criminology (Police Leadership and Management) from the University of Leicester, UK, and is currently the Director General of the Kenya Coast Guard Service, where he provides strategic leadership in enforcing maritime security, patrolling Kenya&apos;s territorial waters, preventing unlawful fishing, piracy, human and drug trafficking, smuggling, and environmental damage.
                </p>
                <p>
                  He is also a published author, having contributed articles to national newspapers and authored books, including Unreported Cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
