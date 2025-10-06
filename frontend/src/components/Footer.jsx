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
  Users,
  Calendar,
  CheckCircle,
  Star,
  Shield,
  Globe,
  Sparkles,
  Heart,
  ExternalLink,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Bookmark,
  Send,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [emailFocused, setEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletterHovered, setNewsletterHovered] = useState(false);

  const quickLinks = [
    {
      name: "Privacy Policy",
      href: "/privacy",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      name: "Terms of Service",
      href: "/terms",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    { name: "Sitemap", href: "/sitemap", icon: <Globe className="w-4 h-4" /> },
    { name: "Careers", href: "/careers", icon: <Target className="w-4 h-4" /> },
    { name: "Blog", href: "/blog", icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-lime-900 text-white overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-emerald-400 to-lime-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-lime-400 to-cyan-400 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Premium Geometric Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0zM40 40h40v40H40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-600 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-400 animate-gradient-x opacity-60" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white via-lime-200 to-emerald-200 bg-clip-text text-transparent">
              Ready to Build Your Dream?
            </h2>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Let's bring your architectural vision to life with our professional
            design services
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <div className="flex items-center mb-8 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-lime-600 p-5 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg animate-pulse" />
                </div>
                <div className="ml-5">
                  <h3 className="text-3xl font-black bg-gradient-to-r from-white via-lime-200 to-emerald-200 bg-clip-text text-transparent">
                    Hillersons
                    <span className="text-lime-300">InvestmentCo.</span>
                  </h3>
                  <p className="text-lime-300 font-semibold text-sm tracking-wide">
                    Your Vision, Our Efficient Solution
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20">
                  <p className="text-slate-200 leading-relaxed text-lg mb-4">
                    Kenya's leading platform for premium, ready-to-build
                    architectural designs. We create spaces that inspire,
                    function beautifully, and stand the test of time.
                  </p>
                  <div className="flex items-center gap-2 text-lime-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Licensed & Certified</span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-600/20 to-lime-600/20 backdrop-blur-2xl rounded-2xl border border-lime-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Why Choose Us?
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-lime-400" />
                      <span>Professional Excellence</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-lime-400" />
                      <span>Quality Guarantee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-lime-400" />
                      <span>Timely Delivery</span>
                    </li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div className="p-6 bg-gradient-to-br from-lime-600/20 to-emerald-600/20 backdrop-blur-2xl rounded-2xl border border-lime-400/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Stay Updated
                    </h4>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">
                    Get design insights and project updates
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-2xl rounded-xl border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-lime-400/50 transition-all duration-300"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-xl hover:from-emerald-500 hover:to-lime-500 transition-all duration-300 hover:scale-105 group"
                      onMouseEnter={() => setNewsletterHovered(true)}
                      onMouseLeave={() => setNewsletterHovered(false)}
                    >
                      <Send
                        className={`w-5 h-5 transition-transform duration-300 ${
                          newsletterHovered ? "translate-x-1" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white">Get In Touch</h4>
            </div>

            <div className="space-y-4 mb-8">
              <a
                href="tel:+254763831806"
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 hover:bg-white/15 hover:border-lime-400/40 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-lime-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-lime-300 transition-colors">
                    Call Us
                  </div>
                  <div className="text-lime-300 font-semibold">
                    +254 763 831 806
                  </div>
                  <div className="text-xs text-slate-400">
                    Let's discuss your project
                  </div>
                </div>
              </a>

              <a
                href="mailto:@hillersonsdesigns@gmail.com"
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 hover:bg-white/15 hover:border-lime-400/40 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-lime-300 transition-colors">
                    Email Us
                  </div>
                  <div className="text-lime-300 font-semibold">
                    hillersonsdesigns@gmail.com
                  </div>
                  <div className="text-xs text-slate-400">
                    Professional inquiries
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">Our Location</div>
                  <div className="text-lime-300 font-semibold">
                    Nairobi, Kenya
                  </div>
                  <div className="text-xs text-slate-400">
                    Serving nationwide
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-6 bg-gradient-to-br from-emerald-600/30 to-lime-600/30 backdrop-blur-2xl rounded-2xl border border-lime-400/40">
              <h5 className="text-lg font-bold text-white mb-2">
                Ready to Start?
              </h5>
              <p className="text-slate-300 text-sm mb-4">
                Get your free consultation today
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-xl hover:from-emerald-500 hover:to-lime-500 transition-all duration-300 hover:scale-105 font-semibold flex items-center justify-center gap-2 group">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Social & Links */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <span className="text-slate-300 font-semibold">Follow Us:</span>
              <div className="flex gap-3">
                {[
                  {
                    icon: <Facebook className="w-5 h-5" />,
                    href: "#",
                    color: "hover:bg-blue-600",
                    label: "Facebook",
                  },
                  {
                    icon: <Twitter className="w-5 h-5" />,
                    href: "#",
                    color: "hover:bg-sky-500",
                    label: "Twitter",
                  },
                  {
                    icon: <Instagram className="w-5 h-5" />,
                    href: "#",
                    color: "hover:bg-pink-600",
                    label: "Instagram",
                  },
                  {
                    icon: <Linkedin className="w-5 h-5" />,
                    href: "#",
                    color: "hover:bg-blue-700",
                    label: "LinkedIn",
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`p-4 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 text-white ${social.color} hover:scale-110 transition-all duration-300 group`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-2 text-slate-300 hover:text-lime-300 transition-colors duration-300 hover:underline underline-offset-4 group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </span>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 text-slate-300 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-lime-400" />
              <span className="font-semibold">Licensed & Insured</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-lime-400" />
              <span className="font-semibold">Professional Service</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-lime-400" />
              <span className="font-semibold">Quality Assured</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Hillersons InvestmentsCo. All
            rights reserved.
            <span className="text-lime-400 ml-2 font-semibold">
              Crafted with <Heart className="w-4 h-4 inline text-red-400" /> in
              Kenya
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
