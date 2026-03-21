import {
  Building,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Award,
  CheckCircle,
  Shield,
  Sparkles,
  Heart,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Bookmark,
  Send,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

/* ─── Newsletter form state ───────────────────────────────────── */
function useNewsletter() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState(""); // "" | "sending" | "sent" | "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      // Replace with your real newsletter endpoint
      await new Promise((r) => setTimeout(r, 800)); // stub
      setEmail("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return { email, setEmail, status, handleSubmit };
}

const Footer = () => {
  const newsletter = useNewsletter();

  const quickLinks = [
    { name: "Privacy Policy",   href: "/privacy",  Icon: Shield },
    { name: "Terms of Service", href: "/terms",    Icon: CheckCircle },
    { name: "Sitemap",          href: "/sitemap",  Icon: Globe },
    { name: "Careers",          href: "/careers",  Icon: Target },
    { name: "Blog",             href: "/blog",     Icon: Bookmark },
  ];

  const socialLinks = [
    { Icon: Facebook,  href: "#", label: "Facebook on Facebook" },
    { Icon: Twitter,   href: "#", label: "Hillersons on X (Twitter)" },
    { Icon: Instagram, href: "#", label: "Hillersons on Instagram" },
    { Icon: Linkedin,  href: "#", label: "Hillersons on LinkedIn" },
  ];

  const whyUs = [
    { Icon: Zap,        text: "Professional Excellence" },
    { Icon: Shield,     text: "Quality Guarantee" },
    { Icon: Clock,      text: "Timely Delivery" },
  ];

  return (
    <footer
      aria-label="Site footer"
      className="relative bg-brand-900 text-white overflow-hidden"
    >
      {/* Ambient glow blobs — brand colors only */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-lime-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-brand-400 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-lime-400 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M0 0h40v40H0zM40 40h40v40H40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top accent bar */}
      <div
        className="w-full h-1 bg-gradient-to-r from-brand-500 via-lime-400 to-brand-500"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-8">

        {/* CTA headline */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4 flex-wrap justify-center">
            <div
              className="w-12 h-12 bg-gradient-to-br from-brand-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-xl"
              aria-hidden="true"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Ready to Build Your Dream?
            </h2>
          </div>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
            Let's bring your architectural vision to life with our professional
            design services across Kenya.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* ── Brand column ── */}
          <div>
            {/* Logo + name */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-brand-400 rounded-2xl blur-xl opacity-60" aria-hidden="true" />
                <div className="relative bg-gradient-to-br from-brand-600 to-brand-700 p-4 rounded-2xl shadow-2xl">
                  <Building className="w-9 h-9 text-white" aria-hidden="true" />
                </div>
                {/* Online indicator */}
                <div
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-lime-400 rounded-full border-2 border-brand-900 animate-pulse"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-tight">
                  Hillersons<span className="text-lime-300">Spaces</span>
                </p>
                <p className="text-lime-300 text-xs font-semibold tracking-wider uppercase">
                  Your Vision, Our Solution
                </p>
              </div>
            </div>

            {/* About blurb */}
            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 mb-4">
              <p className="text-brand-100 leading-relaxed text-base mb-3">
                Kenya's leading platform for premium, ready-to-build
                architectural designs — spaces that inspire, function
                beautifully, and stand the test of time.
              </p>
              <div className="flex items-center gap-2 text-lime-300 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Licensed &amp; Certified
              </div>
            </div>

            {/* Why choose us */}
            <div className="p-5 bg-brand-800/50 backdrop-blur-sm rounded-2xl border border-brand-700/50 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-brand-500 to-lime-500 rounded-lg flex items-center justify-center"
                  aria-hidden="true"
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">Why Choose Us?</h3>
              </div>
              <ul className="space-y-2" aria-label="Our strengths">
                {whyUs.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-brand-100">
                    <Icon className="w-4 h-4 text-lime-400 flex-shrink-0" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* ✅ Newsletter — now a real <form> with validation + feedback */}
            <div className="p-5 bg-brand-800/50 backdrop-blur-sm rounded-2xl border border-brand-700/50">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-lime-500 to-brand-500 rounded-lg flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">Stay Updated</h3>
              </div>
              <p className="text-brand-200 text-sm mb-4">
                Get design insights and project updates delivered to you.
              </p>

              {newsletter.status === "sent" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-sm text-lime-300 font-medium"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  You're subscribed — thank you!
                </div>
              ) : (
                <form
                  onSubmit={newsletter.handleSubmit}
                  noValidate
                  aria-label="Newsletter signup"
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <label htmlFor="footer-email" className="sr-only">
                      Email address for newsletter
                    </label>
                    <input
                      id="footer-email"
                      type="email"
                      value={newsletter.email}
                      onChange={(e) => newsletter.setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      aria-required="true"
                      aria-invalid={newsletter.status === "error"}
                      aria-describedby={newsletter.status === "error" ? "nl-error" : undefined}
                      className="flex-1 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-brand-300 text-sm focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/40 transition"
                    />
                    <button
                      type="submit"
                      disabled={newsletter.status === "sending"}
                      aria-label="Subscribe to newsletter"
                      className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-lime-600 rounded-xl hover:from-brand-500 hover:to-lime-500 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-lime-400 flex items-center gap-1.5"
                    >
                      {newsletter.status === "sending" ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {newsletter.status === "error" && (
                    <p id="nl-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-300">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Please enter a valid email address.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* ── Contact column ── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 bg-gradient-to-br from-brand-500 to-lime-500 rounded-lg flex items-center justify-center"
                aria-hidden="true"
              >
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Get In Touch</h3>
            </div>

            <address className="not-italic space-y-4 mb-8">
              {/* Phone */}
              <a
                href="tel:+254763831806"
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 hover:bg-white/15 hover:border-lime-400/40 transition group focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-brand-900"
              >
                <div className="bg-gradient-to-br from-brand-500 to-lime-500 p-3.5 rounded-xl group-hover:scale-105 transition-transform shadow-lg flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-lime-300 transition-colors text-sm">Call Us</p>
                  <p className="text-lime-300 font-semibold">+254 763 831 806</p>
                  <p className="text-xs text-brand-300 mt-0.5">Let's discuss your project</p>
                </div>
              </a>

              {/* ✅ Bug fix: removed leading "@" from mailto href */}
              <a
                href="mailto:hillersonsdesigns@gmail.com"
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 hover:bg-white/15 hover:border-lime-400/40 transition group focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-brand-900"
              >
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-3.5 rounded-xl group-hover:scale-105 transition-transform shadow-lg flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-lime-300 transition-colors text-sm">Email Us</p>
                  <p className="text-lime-300 font-semibold">hillersonsdesigns@gmail.com</p>
                  <p className="text-xs text-brand-300 mt-0.5">Professional enquiries</p>
                </div>
              </a>

              {/* Location — not a link, use div */}
              <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15">
                <div className="bg-gradient-to-br from-brand-600 to-lime-700 p-3.5 rounded-xl shadow-lg flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Our Location</p>
                  <p className="text-lime-300 font-semibold">Nairobi, Kenya</p>
                  <p className="text-xs text-brand-300 mt-0.5">Serving nationwide</p>
                </div>
              </div>
            </address>

            {/* CTA card */}
            <div className="p-6 bg-gradient-to-br from-brand-700/50 to-lime-900/30 backdrop-blur-sm rounded-2xl border border-lime-500/30">
              <h4 className="text-lg font-bold text-white mb-1">Ready to Start?</h4>
              <p className="text-brand-200 text-sm mb-5">Get your free consultation today.</p>
              <a
                href="tel:+254763831806"
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-lime-600 rounded-xl hover:from-brand-500 hover:to-lime-500 transition font-semibold flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-brand-900"
                aria-label="Call us to get started"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Social + quick links */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

            {/* Social icons */}
            <div className="flex items-center gap-4">
              <span className="text-brand-300 text-sm font-semibold">Follow Us:</span>
              <div className="flex gap-2" role="list" aria-label="Social media links">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    rel="noopener noreferrer"
                    role="listitem"
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 text-white hover:bg-brand-600 hover:border-brand-500 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer quick links">
              <ul className="flex flex-wrap gap-5 text-sm justify-center lg:justify-end">
                {quickLinks.map(({ name, href, Icon }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="flex items-center gap-1.5 text-brand-200 hover:text-lime-300 transition-colors hover:underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-lime-400 rounded"
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-brand-200 text-sm mb-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-lime-400" aria-hidden="true" />
              <span>Licensed &amp; Insured</span>
            </div>
            <span className="w-1 h-1 bg-brand-500 rounded-full hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-lime-400" aria-hidden="true" />
              <span>Professional Service</span>
            </div>
            <span className="w-1 h-1 bg-brand-500 rounded-full hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-lime-400" aria-hidden="true" />
              <span>Quality Assured</span>
            </div>
          </div>

          <p className="text-brand-300 text-xs leading-relaxed">
            &copy; {new Date().getFullYear()} Hillersons Spaces. All rights reserved.{" "}
            <span className="text-lime-400 font-semibold">
              Crafted with{" "}
              <Heart className="w-3.5 h-3.5 inline text-red-400" aria-label="love" />{" "}
              in Kenya.
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;