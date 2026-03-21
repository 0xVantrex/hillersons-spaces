import React, { useState, useEffect } from "react";
import {
  Shield, Lock, Eye, Users, Database, Globe,
  Mail, Phone, MapPin, CheckCircle, AlertTriangle, ArrowRight,
} from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Deterministic blob positions — avoids Math.random re-render issues
const BLOB_POSITIONS = [
  { left: "10%", top: "20%" },
  { left: "60%", top: "15%" },
  { left: "30%", top: "70%" },
  { left: "80%", top: "60%" },
];

const sections = [
  { id: "collection", title: "Information Collection", icon: Database },
  { id: "usage",      title: "How We Use Data",        icon: Eye },
  { id: "sharing",    title: "Data Sharing",            icon: Users },
  { id: "security",   title: "Security Measures",       icon: Lock },
  { id: "cookies",    title: "Cookies & Tracking",      icon: Globe },
  { id: "rights",     title: "Your Rights",             icon: Shield },
  { id: "contact",    title: "Contact Us",              icon: Mail },
];

const dataTypes = [
  {
    category: "Personal Information",
    icon: Users,
    items: [
      "Full name and preferred display name",
      "Email address for communications",
      "Phone number for project consultations",
      "Mailing address for physical deliveries",
      "Professional credentials (if applicable)",
      "Company information (for business clients)",
    ],
  },
  {
    category: "Account & Authentication",
    icon: Lock,
    items: [
      "Secure login credentials and passwords",
      "Account preferences and settings",
      "User role and permission levels",
      "Security questions and recovery information",
      "Two-factor authentication data",
      "Login history and session information",
    ],
  },
  {
    category: "Purchase & Transaction Data",
    icon: CheckCircle,
    items: [
      "Order history and purchase records",
      "Payment method information (encrypted)",
      "Billing and invoicing details",
      "Download history and file access logs",
      "Refund and dispute records",
      "Subscription and renewal information",
    ],
  },
  {
    category: "Technical & Usage Analytics",
    icon: Globe,
    items: [
      "IP address and geographic location",
      "Browser type, version, and language",
      "Device information and operating system",
      "Website navigation patterns and behaviour",
      "Page views, session duration, and interactions",
      "Referral sources and marketing attribution",
    ],
  },
];

const securityMeasures = [
  {
    title: "Advanced Encryption",
    description: "All sensitive data is protected using AES-256 encryption both in transit and at rest.",
    icon: Lock,
  },
  {
    title: "Secure Infrastructure",
    description: "Our servers are hosted in SOC 2 compliant data centres with 24/7 monitoring.",
    icon: Shield,
  },
  {
    title: "Access Controls",
    description: "Strict role-based access controls ensure only authorised personnel can access your data.",
    icon: Users,
  },
  {
    title: "Regular Audits",
    description: "We conduct quarterly security audits and penetration testing to identify vulnerabilities.",
    icon: Eye,
  },
];

const userRights = [
  {
    right: "Access Your Data",
    description: "Request a complete copy of all personal information we hold about you in a portable format.",
    action: "Contact our support team to receive your data within 30 days",
  },
  {
    right: "Correct Information",
    description: "Update, modify, or correct any inaccurate personal information in your account.",
    action: "Use your account settings or contact support for assistance",
  },
  {
    right: "Delete Your Account",
    description: "Request complete deletion of your account and all associated personal data.",
    action: "Submit a deletion request — we'll process within 60 days",
  },
  {
    right: "Data Portability",
    description: "Export your data to use with other services or providers.",
    action: "Download your data in standard formats (JSON, CSV, PDF)",
  },
  {
    right: "Marketing Opt-out",
    description: "Unsubscribe from promotional emails, newsletters, and marketing communications.",
    action: "Use unsubscribe links or update preferences in your account",
  },
  {
    right: "Restrict Processing",
    description: "Limit how we use your data while keeping your account active.",
    action: "Contact privacy@hillersons.com with specific restrictions",
  },
];

const usagePurposes = [
  {
    title: "Service Delivery",
    items: [
      "Process and fulfil your architectural plan orders",
      "Provide secure download access to purchased designs",
      "Send order confirmations and delivery notifications",
      "Handle refunds, returns, and customer inquiries",
    ],
  },
  {
    title: "Account Management",
    items: [
      "Create and maintain your user account",
      "Provide technical support and customer service",
      "Enable account recovery and password resets",
      "Manage subscription renewals and billing",
    ],
  },
  {
    title: "Communication",
    items: [
      "Send important account and service updates",
      "Share new design releases and promotions (opt-in)",
      "Provide architectural tips and industry insights",
      "Respond to your questions and feedback",
    ],
  },
  {
    title: "Platform Improvement",
    items: [
      "Analyse website usage to enhance user experience",
      "Develop new features and design categories",
      "Optimise site performance and loading speeds",
      "Conduct A/B testing for better functionality",
    ],
  },
  {
    title: "Legal Compliance",
    items: [
      "Comply with applicable laws and regulations",
      "Respond to legal requests and court orders",
      "Protect against fraud and unauthorised access",
      "Maintain records for tax and accounting purposes",
    ],
  },
  {
    title: "Marketing & Analytics",
    items: [
      "Personalise content and design recommendations",
      "Track marketing campaign effectiveness",
      "Understand customer preferences and behaviour",
      "Improve our architectural design offerings",
    ],
  },
];

const sharingScenarios = [
  {
    title: "Payment Processing",
    description: "Secure payment gateways like Stripe, PayPal, and bank processors to handle transactions safely.",
    safeguards: ["PCI DSS compliant", "Encrypted transmission", "Tokenized card data"],
  },
  {
    title: "Cloud Infrastructure",
    description: "Hosting providers and cloud services that store and deliver our content securely.",
    safeguards: ["SOC 2 certified", "GDPR compliant", "Data encryption at rest"],
  },
  {
    title: "Analytics Services",
    description: "Tools like Google Analytics to understand website usage and improve user experience.",
    safeguards: ["Anonymised data", "IP address masking", "Opt-out available"],
  },
  {
    title: "Legal Requirements",
    description: "Government agencies or courts when required by law or to protect our legal rights.",
    safeguards: ["Valid legal process", "Narrow scope", "User notification when possible"],
  },
];

// Shared class helpers
const sectionNumberClass = "w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0";
const cardClass = "bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-100";
const iconCircleClass = "w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0";

export default function PrivacyPolicy() {
  const { projects } = useProjects();
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible]         = useState(false);
  const [showSearch, setShowSearch]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  return (
    <div className="min-h-screen bg-brand-50">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Privacy Policy — Hillersons Designs Kenya",
        "description": "Comprehensive privacy policy for Hillersons Investment Company Ltd. Learn how we collect, use, and protect your personal data when using our architectural design services in Kenya.",
        "url": "https://hillersons-architecture-site.vercel.app/privacy",
        "publisher": {
          "@type": "Organization",
          "name": "Hillersons Designs",
          "url": "https://hillersons-architecture-site.vercel.app"
        },
        "dateModified": "2025-07-15"
      })}} />

      <Header
        showSearch={showSearch} setShowSearch={setShowSearch}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        projects={projects}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="privacy-hero-heading"
        className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-brand-700 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {BLOB_POSITIONS.map((pos, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white/5 animate-pulse"
              style={{ left: pos.left, top: pos.top, animationDelay: `${i * 0.8}s`, animationDuration: `${4 + i}s` }}
            />
          ))}
        </div>

        <div className={`relative z-10 max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 text-white mb-6">
            <Shield className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold text-sm">Your Privacy Matters</span>
          </div>

          <h1 id="privacy-hero-heading" className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Privacy <span className="block text-brand-200">Policy</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
            A comprehensive guide to how Hillersons Designs protects, uses, and manages your
            personal information when you access our architectural services in Kenya
          </p>

          <p className="text-white/70 text-sm">Last Updated: 15 July 2025</p>
        </div>
      </section>

      {/* ── Sticky nav ───────────────────────────────────────────────────────── */}
      <nav
        aria-label="Privacy policy sections"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto py-4 gap-2">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                aria-pressed={activeSection === index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition text-sm font-medium ${
                  activeSection === index
                    ? "bg-brand-600 text-white shadow"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                <section.icon className="w-4 h-4" aria-hidden="true" />
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Introduction */}
        <section aria-labelledby="intro-heading" className="mb-16">
          <div className={cardClass}>
            <div className="flex items-start gap-4 mb-8">
              <div className={iconCircleClass}>
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 id="intro-heading" className="text-2xl sm:text-3xl font-bold text-brand-900 mb-4">
                  Our Commitment to Your Privacy
                </h2>
                <p className="text-brand-800 leading-relaxed text-base">
                  At <strong>Hillersons Investment Company Ltd</strong> ("HillersonsDesigns", "we", "our", or "us"),
                  we understand that your privacy is fundamental to building trust. This Privacy Policy outlines
                  exactly how we collect, use, protect, and manage your personal information when you interact
                  with our website, access our architectural designs, or use our services across Kenya.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Lock, title: "Secure by Design",  desc: "Industry-leading security measures",  bg: "bg-brand-50" },
                { icon: Eye,  title: "Full Transparency", desc: "Clear about how your data is used",   bg: "bg-brand-100" },
                { icon: Users,title: "Your Control",      desc: "Manage your own data preferences",    bg: "bg-brand-50" },
              ].map(({ icon: Icon, title, desc, bg }, i) => (
                <div key={i} className={`text-center p-5 ${bg} rounded-xl border border-brand-100`}>
                  <Icon className="w-8 h-8 text-brand-600 mx-auto mb-2" aria-hidden="true" />
                  <h3 className="font-semibold text-brand-900 mb-1">{title}</h3>
                  <p className="text-sm text-brand-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 1 — Information Collection */}
        <section id="collection" aria-labelledby="collection-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>1</div>
            <h2 id="collection-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              Information We Collect
            </h2>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            {dataTypes.map((type, index) => (
              <div key={index} className={`${cardClass} hover:shadow-md transition`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={iconCircleClass}>
                    <type.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-900">{type.category}</h3>
                </div>
                <ul className="space-y-3">
                  {type.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-brand-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 2 — How We Use Information */}
        <section id="usage" aria-labelledby="usage-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>2</div>
            <h2 id="usage-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              How We Use Your Information
            </h2>
          </header>

          <div className={cardClass}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {usagePurposes.map((purpose, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-base font-bold text-brand-900 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-brand-500" aria-hidden="true" />
                    {purpose.title}
                  </h3>
                  <ul className="space-y-2">
                    {purpose.items.map((item, idx) => (
                      <li key={idx} className="text-brand-700 text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-accent rounded-full flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 — Data Sharing */}
        <section id="sharing" aria-labelledby="sharing-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>3</div>
            <h2 id="sharing-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              Data Sharing & Third Parties
            </h2>
          </header>

          <div className={`${cardClass} mb-8`}>
            <div className="flex items-start gap-4 mb-8">
              <AlertTriangle className="w-7 h-7 text-brand-accent flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-xl font-bold text-brand-900 mb-2">Our Data Sharing Policy</h3>
                <p className="text-brand-700 leading-relaxed text-sm">
                  <strong>We do not sell, rent, or trade your personal information to third parties for
                  marketing purposes.</strong> Your data is only shared in specific, limited circumstances
                  outlined below, and always with appropriate safeguards in place.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sharingScenarios.map((scenario, index) => (
                <div key={index} className="border-2 border-brand-100 rounded-xl p-5">
                  <h4 className="font-bold text-brand-900 mb-2 text-base">{scenario.title}</h4>
                  <p className="text-brand-700 text-sm mb-4">{scenario.description}</p>
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Safeguards:</p>
                  <ul className="space-y-1.5">
                    {scenario.safeguards.map((safeguard, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs text-brand-700">{safeguard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Security */}
        <section id="security" aria-labelledby="security-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>4</div>
            <h2 id="security-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              Security & Data Protection
            </h2>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {securityMeasures.map((measure, index) => (
              <div key={index} className={cardClass}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={iconCircleClass}>
                    <measure.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">{measure.title}</h3>
                </div>
                <p className="text-brand-700 leading-relaxed text-sm">{measure.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-50 rounded-2xl p-7 border border-brand-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 text-brand-accent flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-brand-900 mb-2">Security Disclaimer</h3>
                <p className="text-brand-700 leading-relaxed text-sm">
                  While we implement industry-leading security measures, no online service can guarantee
                  100% security. We encourage users to use strong, unique passwords and enable
                  two-factor authentication where available. If you suspect any security breach, please
                  contact us immediately at{" "}
                  <a href="mailto:security@hillersons.com" className="text-brand-600 underline hover:text-brand-800">
                    security@hillersons.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Your Rights */}
        <section id="rights" aria-labelledby="rights-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>5</div>
            <h2 id="rights-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              Your Privacy Rights
            </h2>
          </header>

          <div className="space-y-5">
            {userRights.map((right, index) => (
              <div key={index} className={cardClass}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-brand-900 mb-2">{right.right}</h3>
                    <p className="text-brand-700 text-sm leading-relaxed">{right.description}</p>
                  </div>
                  <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-brand-50 rounded-xl p-4 border border-brand-200">
                      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">
                        How to Exercise:
                      </p>
                      <p className="text-sm text-brand-800">{right.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6 — Contact */}
        <section id="contact" aria-labelledby="contact-heading" className="mb-16">
          <header className="flex items-center gap-3 mb-8">
            <div className={sectionNumberClass}>6</div>
            <h2 id="contact-heading" className="text-3xl sm:text-4xl font-bold text-brand-900">
              Contact & Support
            </h2>
          </header>

          <div className="bg-brand-700 rounded-2xl p-8 sm:p-10 text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h3>
            <p className="text-white/90 leading-relaxed mb-8 text-sm">
              Our dedicated privacy team is here to help. Whether you have questions about this policy,
              want to exercise your rights, or need assistance with your account, we're ready to assist.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              <a href="mailto:privacy@hillersons.com" className="flex items-center gap-3 group">
                <Mail className="w-6 h-6 text-brand-200 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm">Email Support</p>
                  <p className="text-brand-200 text-xs group-hover:text-white transition">
                    privacy@hillersons.com
                  </p>
                </div>
              </a>
              <a href="tel:+254763831806" className="flex items-center gap-3 group">
                <Phone className="w-6 h-6 text-brand-200 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm">Phone Support</p>
                  <p className="text-brand-200 text-xs group-hover:text-white transition">+254 763 831 806</p>
                </div>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-brand-200 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-sm">Office Address</p>
                  <p className="text-brand-200 text-xs">Rehema House, Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <section aria-labelledby="updates-heading" className={cardClass}>
          <h2 id="updates-heading" className="text-2xl font-bold text-brand-900 mb-5">
            Policy Updates & Changes
          </h2>
          <p className="text-brand-700 leading-relaxed text-sm mb-4">
            We may update this Privacy Policy periodically to reflect changes in our practices,
            technology, legal requirements, or other factors. When we make material changes, we will:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Notify you via email at least 30 days before changes take effect",
              "Display a prominent notice on our website",
              "Update the 'Last Updated' date at the top of this policy",
              "Provide a summary of key changes when significant",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-brand-700 text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-brand-700 leading-relaxed text-sm">
            Your continued use of our services after any changes indicates your acceptance of the
            updated policy. If you disagree with changes, you may close your account and discontinue
            use of our services.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}