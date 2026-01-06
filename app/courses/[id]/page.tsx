import { notFound } from "next/navigation";
import Link from "next/link";

const courses = {
  "strategic-risk-threat-assessment": {
    title: "Strategic Risk & Threat Assessment",
    description: "Comprehensive methodology for identifying, analyzing, and mitigating security risks at organizational and strategic levels.",
    content: `
      <p>This course provides a systematic approach to risk and threat assessment, enabling organizations to identify vulnerabilities, evaluate potential impacts, and develop strategic mitigation frameworks.</p>
      
      <h3>Course Objectives</h3>
      <ul>
        <li>Master risk identification and analysis methodologies</li>
        <li>Develop threat assessment frameworks aligned with international standards</li>
        <li>Create strategic risk mitigation and management plans</li>
        <li>Implement continuous monitoring and assessment processes</li>
      </ul>
      
      <h3>Delivery Method</h3>
      <p>This course is delivered through personalized consultation sessions, tailored to your organization's specific security context and requirements. Sessions combine theoretical frameworks with practical application exercises.</p>
      
      <h3>Target Audience</h3>
      <p>Security professionals, risk managers, organizational leaders, and decision-makers responsible for strategic security planning.</p>
    `,
  },
  "organizational-security-resilience": {
    title: "Organizational Security & Resilience Planning",
    description: "Develop robust security frameworks and resilience strategies to protect organizational assets and operations.",
    content: `
      <p>Learn to design and implement comprehensive security frameworks that enhance organizational resilience and operational continuity.</p>
      
      <h3>Course Objectives</h3>
      <ul>
        <li>Design integrated security frameworks</li>
        <li>Develop business continuity and resilience strategies</li>
        <li>Establish security governance structures</li>
        <li>Create incident response and recovery protocols</li>
      </ul>
      
      <h3>Delivery Method</h3>
      <p>Delivered through structured consultation sessions and guided planning workshops, customized to your organization's operational environment and security requirements.</p>
      
      <h3>Target Audience</h3>
      <p>Security directors, operations managers, business continuity planners, and organizational leadership teams.</p>
    `,
  },
  "cybersecurity-awareness-leadership": {
    title: "Cybersecurity Awareness for Leadership",
    description: "Executive-level cybersecurity education and strategic decision-making frameworks for senior management.",
    content: `
      <p>Equip leadership teams with the knowledge and frameworks needed to make informed cybersecurity decisions and manage digital risks effectively.</p>
      
      <h3>Course Objectives</h3>
      <ul>
        <li>Understand cybersecurity threats and their business impact</li>
        <li>Develop strategic cybersecurity governance approaches</li>
        <li>Establish executive-level risk management frameworks</li>
        <li>Create cybersecurity awareness and training programs</li>
      </ul>
      
      <h3>Delivery Method</h3>
      <p>Executive consultation sessions and strategic workshops designed for senior leadership, focusing on decision-making frameworks and organizational cybersecurity posture.</p>
      
      <h3>Target Audience</h3>
      <p>C-suite executives, board members, senior management, and organizational leaders responsible for cybersecurity strategy.</p>
    `,
  },
  "crisis-response-incident-management": {
    title: "Crisis Response & Incident Management",
    description: "Structured approaches to crisis management, incident response protocols, and organizational recovery planning.",
    content: `
      <p>Master crisis response methodologies and incident management protocols to ensure effective organizational response and recovery.</p>
      
      <h3>Course Objectives</h3>
      <ul>
        <li>Develop comprehensive crisis response frameworks</li>
        <li>Establish incident management protocols and procedures</li>
        <li>Create communication strategies for crisis situations</li>
        <li>Design recovery and business continuity plans</li>
      </ul>
      
      <h3>Delivery Method</h3>
      <p>Delivered through consultation sessions and scenario-based training exercises, tailored to your organization's specific risk profile and operational context.</p>
      
      <h3>Target Audience</h3>
      <p>Security managers, emergency response coordinators, crisis management teams, and organizational leaders responsible for incident response.</p>
    `,
  },
  "governance-compliance-policy": {
    title: "Governance, Compliance & Security Policy Design",
    description: "Establish effective security governance structures, compliance frameworks, and policy development methodologies.",
    content: `
      <p>Learn to design and implement effective security governance structures, compliance frameworks, and organizational security policies.</p>
      
      <h3>Course Objectives</h3>
      <ul>
        <li>Design security governance frameworks and structures</li>
        <li>Develop compliance management systems</li>
        <li>Create comprehensive security policy frameworks</li>
        <li>Establish monitoring and audit processes</li>
      </ul>
      
      <h3>Delivery Method</h3>
      <p>Structured consultation sessions and policy development workshops, customized to align with relevant regulatory requirements and organizational needs.</p>
      
      <h3>Target Audience</h3>
      <p>Compliance officers, policy developers, security managers, and organizational leaders responsible for governance and regulatory compliance.</p>
    `,
  },
};

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = courses[params.id as keyof typeof courses];

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center text-sm text-[#007CFF] hover:underline"
        >
          <i className="fa-solid fa-arrow-left fa-text mr-2"></i>
          Back to Courses
        </Link>

        {/* Course Header */}
        <header className="mb-8">
          <h1 className="mb-4 text-2xl font-heading font-bold leading-tight text-[#0A1A33] lg:text-3xl">
            {course.title}
          </h1>
          <p className="text-sm leading-relaxed text-[#4A5768]">
            {course.description}
          </p>
        </header>

        {/* Course Content */}
        <article
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: course.content }}
          style={{
            color: "#2D3748",
          }}
        />

        {/* Consultation CTA */}
        <div className="rounded-lg border-2 border-[#E5E7EB] bg-[#F3F4F6] p-8">
          <div className="mb-6 text-center">
            <h2 className="mb-3 text-lg font-heading font-semibold text-[#1F2937]">
              Begin Your Consultation
            </h2>
            <p className="text-sm text-[#4A5768] leading-relaxed">
              This course is delivered through personalized consultation sessions tailored to your organization&apos;s specific needs. 
              Book a consultation to discuss how this course can be customized for your security context.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/bookings"
              className="inline-flex items-center justify-center rounded-lg bg-[#007CFF] px-8 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-[#0066CC] hover:shadow-lg"
            >
              Book Consultation
              <i className="fa-solid fa-arrow-right fa-text ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

