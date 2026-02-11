import {
  Search,
  Home,
  Building,
  ChevronDown,
  Phone,
  Menu,
  Send,
  X,
  Mail,
  MapPin,
  Award,
  Users,
  Palette,
  Hammer,
  Star,
  Globe,
  Shield,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

const Header = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  showMobileMenu,
  setShowMobileMenu,
  setShowSearch,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);
    checkMobile(); 

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <>
      <div className="w-full h-0.5 bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-400 opacity-60" />
      </div>

      {/* Main Header */}
      <header
        className={`fixed top-0.5 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-2xl border-b border-slate-200/80"
            : "bg-white shadow-xl border-b border-slate-200/50"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Responsive */}
            <div
              className="flex items-center gap-2 lg:gap-4 group cursor-pointer flex-shrink-0"
              onClick={() => handleNavigation("/")}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-lime-600 text-white p-2 lg:p-4 rounded-xl lg:rounded-2xl shadow-2xl group-hover:shadow-emerald-300/40 transition-all duration-500 group-hover:scale-105">
                  <Building className="w-5 h-5 lg:w-8 lg:h-8" />
                </div>
                </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-black bg-gradient-to-r from-slate-800 via-emerald-700 to-lime-600 bg-clip-text text-transparent tracking-tight">
                  Hillersons
                  <span className="text-emerald-600 font-light sm:inline">
                    Spaces
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide hidden lg:block">
                  Your Vision,{" "}
                  <span className="text-lime-600 font-semibold">
                    Our Efficient Solution
                  </span>
                </p>
              </div>
            </div>
            

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-0">
              {[
                { href: "/", icon: Home, label: "Home", badge: null },
              
                {
                  href: "/custom-design",
                  icon: Building,
                  label: "Custom design",
                  badge: null,
                },
              ].map(({ href, icon: Icon, label, badge }) => (
                <a
                  key={label}
                  href={href}
                  className="relative flex items-center gap-0 px-3 xl:px-5 py-2 xl:py-3 text-slate-700 font-medium hover:text-lime-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 group text-sm xl:text-base"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {label}
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
                      {badge}
                    </span>
                  )}
                </a>
              ))}

              {/* Contact Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => !isMobile && setActiveDropdown("Contact")}
                onMouseLeave={() => !isMobile && setActiveDropdown(null)}
              >
                <button
                  className="flex items-center gap-2 px-3 xl:px-5 py-2 xl:py-3 text-slate-700 font-medium hover:text-lime-600 transition duration-300 rounded-xl hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 group text-sm xl:text-base"
                  onClick={() =>
                    isMobile &&
                    setActiveDropdown(
                      activeDropdown === "Contact" ? null : "Contact"
                    )
                  }
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Contact
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      activeDropdown === "Contact" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "Contact" && (
                  <div className="absolute left-0 top-full mt-3 w-[300px] bg-white rounded-2xl shadow-2xl py-4 border border-slate-200/60 z-40">
                    <div className="space-y-2 px-6">
                      {/*Whatsapp*/}
                      <a
                        href="https://wa.me/254763831806?text=Hello%20Hillersons%20Spaces,%20I%20would%20like%20to%20inquire%20about%20your%20services."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                      >
                        <span className="bg-gradient-to-br from-green-500 to-lime-600 p-2 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="white"
                            className="w-5 h-5"
                          >
                            <path d="M20.52 3.48A11.949 11.949 0 0012 0C5.373 0 .001 5.373.001 12c0 2.121.657 4.084 1.779 5.722L0 24l6.378-1.675A11.949 11.949 0 0012 24c6.627 0 12-5.373 12-12 0-3.195-1.246-6.198-3.48-8.52zM12 22c-1.905 0-3.713-.612-5.205-1.654l-.372-.22-3.787.995.997-3.692-.242-.374A9.958 9.958 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.338-7.667c-.297-.149-1.758-.867-2.031-.967-.273-.1-.472-.149-.672.15-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.520.151-.174.2-.298.3-.497.1-.198.05-.372-.025-.520-.075-.149-.672-1.612-.921-2.206-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          </svg>
                        </span>
                        <span className="text-slate-700 font-medium">
                          {" "}
                          WhatsApp Us
                        </span>
                      </a>

                      {/*Email*/}
                      <a
                        href="mailto:HillersonsDesigns@gmail.com"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                      >
                        <span className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-slate-700 font-medium">
                          Email Us
                        </span>
                      </a>

                      {/*Location*/}
                      <a
                        href="https://www.google.com/maps/place/Rehema+House,+6th+floor+Standard+St,+Nairobi/@-1.2847631,36.8228179,21z/data=!4m6!3m5!1s0x182f10d65b59080d:0x2ea5107c8248e808!8m2!3d-1.2847285!4d36.8229559!16s%2Fg%2F11l5hn9x7x?entry=ttu&g_ep=EgoyMDI1MDkxNi4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                      >
                        <span className="bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-slate-700 font-medium">
                          Our Location
                        </span>
                      </a>

                      {/*Phone*/}
                      <a
                        href="tel:+254763831806"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                      >
                        <span className="bg-gradient-to-br from-green-500 to-lime-600 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-slate-700 font-medium">
                          Call Us
                        </span>
                      </a>

                      {/*Full contact page*/}
                      <a
                        href="/contact"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                      >
                        <span className="bg-white/20 p-2 rounded-lg">
                          <Send className="w-4 h-4" />
                        </span>
                        <span className="text-slate-700 font-medium">
                          Contact Page
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => !isMobile && setActiveDropdown("services")}
                onMouseLeave={() => !isMobile && setActiveDropdown(null)}
              >
                <button
                  className="flex items-center gap-2 px-3 xl:px-5 py-2 xl:py-3 text-slate-700 font-medium hover:text-lime-600 transition duration-300 rounded-xl hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 group text-sm xl:text-base"
                  onClick={() =>
                    isMobile &&
                    setActiveDropdown(
                      activeDropdown === "services" ? null : "services"
                    )
                  }
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Services
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform duration-300 ${
                      activeDropdown === "services" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "services" && (
                  <div
                    className="absolute left-0 top-full mt-3 w-[380px] xl:w-[420px] bg-white rounded-2xl shadow-2xl py-6 xl:py-8 border border-slate-200/60 z-40
               max-h-[70vh] overflow-y-auto"
                  >
                    <div className="px-6 xl:px-8 pb-4 xl:pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 xl:w-8 xl:h-8 bg-gradient-to-br from-emerald-500 to-lime-600 rounded-lg flex items-center justify-center">
                          <Award className="w-3 h-3 xl:w-4 xl:h-4 text-white" />
                        </div>
                        <h3 className="text-lg xl:text-xl font-bold text-slate-800">
                          Our Expertise
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Comprehensive architectural solutions with 15+ years of
                        excellence
                      </p>
                    </div>
                    <div className="p-6 xl:p-8 space-y-2 xl:space-y-3">
                      {[
                        {
                          icon: Home,
                          label: "Architectural house plans",
                          desc: "Custom homes, luxury villas & modern apartments",
                          color: "from-emerald-500 to-emerald-600",
                          href: "/allProducts",
                        },
                        {
                          icon: Globe,
                          label: "Commercial Projects",
                          desc: "Office buildings, retail spaces & more",
                          color: "from-blue-500 to-cyan-600",
                          href: "/categories/commercial projects",
                        },
                        {
                          icon: Users,
                          label: "Residential Projects",
                          desc: "Residential apartments, estates & developments",
                          color: "from-green-500 to-lime-600",
                          href: "/categories/Residential projects",
                        },
                        {
                          icon: Star,
                          label: "Social Amenities",
                          desc: "Hospitals, schools & community facilities",
                          color: "from-yellow-500 to-amber-600",
                          href: "/categories/social amenities projects",
                        },
                        {
                          icon: Hammer,
                          label: "Renovation & Remodeling",
                          desc: "Transform and modernize your existing space",
                          color: "from-amber-500 to-orange-600",
                          href: "/categories/renovation work",
                        },
                        {
                          icon: Palette,
                          label: "Interior Design",
                          desc: "Complete interior solutions & space planning",
                          color: "from-purple-500 to-pink-600",
                          href: "/categories/interior design",
                        },
                      ].map(({ icon: Icon, label, desc, color, href }) => (
                        <a
                          key={label}
                          href={href}
                          className="flex items-center gap-4 xl:gap-5 px-4 xl:px-5 py-3 xl:py-4 rounded-xl xl:rounded-2xl hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 group transition-all duration-300 relative"
                        >
                          <div
                            className={`w-10 h-10 xl:w-14 xl:h-14 bg-gradient-to-br ${color} rounded-lg xl:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                          >
                            <Icon className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 group-hover:text-lime-600 transition-colors text-sm xl:text-base">
                              {label}
                            </h4>
                            <p className="text-xs xl:text-sm text-slate-600 leading-relaxed">
                              {desc}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lime-600 group-hover:translate-x-1 transition-all" />
                        </a>
                      ))}
                    </div>
                    <div className="px-6 xl:px-8 pt-4 xl:pt-6 border-t border-slate-100">
                      <button className="w-full bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-700 text-white px-6 py-2.5 xl:py-3 rounded-xl xl:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm xl:text-base">
                        <Shield className="w-4 h-4" />
                        View All Services
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Search + Icons */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search designs..."
                  className="w-36 xl:w-60 pl-10 xl:pl-12 pr-4 py-2 xl:py-3 border-2 border-slate-300 rounded-xl xl:rounded-2xl focus:ring-4 focus:ring-lime-200 focus:border-lime-500 bg-white/90 text-sm shadow-lg transition-all duration-300 group-hover:shadow-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 xl:left-4 top-2.5 xl:top-3.5 text-slate-400 w-4 h-4 xl:w-5 xl:h-5 group-hover:text-lime-600 transition-colors" />
              </div>

              {/* Cart Icon */}
              <button
                onClick={() => handleNavigation("/cart")}
                className="relative p-2 xl:p-3 text-slate-700 hover:text-lime-600 hover:bg-lime-50 rounded-xl transition-all duration-300 shadow-md group"
              >
                <ShoppingCart className="w-5 h-5 xl:w-6 xl:h-6 group-hover:scale-110 transition-transform" />
              </button>

              {/* Profile Icon */}
              <button
                onClick={() => handleNavigation("/profile")}
                className="p-2 xl:p-3 text-slate-700 hover:text-lime-600 hover:bg-lime-50 rounded-xl transition-all duration-300 shadow-md group"
              >
                <User className="w-5 h-5 xl:w-6 xl:h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Mobile Cart Icon */}
              <button
                onClick={() => handleNavigation("/cart")}
                className="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-lime-50 rounded-lg transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>

              {/* Mobile Profile Icon */}
              <button
                onClick={() => handleNavigation("/profile")}
                className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-lime-50 rounded-lg transition-all duration-300"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-lime-50 rounded-lg transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-slate-700 hover:text-emerald-600 hover:bg-lime-50 rounded-lg transition-all duration-300"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="py-4 lg:hidden border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search architectural designs..."
                  className="w-full pl-12 pr-20 py-3 border-2 border-lime-300 rounded-xl focus:ring-4 focus:ring-lime-200 focus:border-lime-500 bg-white/95 shadow-lg text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-lime-600 w-5 h-5" />
                <button className="absolute right-2 top-1.5 bg-gradient-to-r from-emerald-600 to-lime-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-lime-700 hover:to-emerald-800 shadow-lg">
                  Search
                </button>
              </div>
            </div>
          )}
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div
              className="lg:hidden bg-white/98 rounded-2xl shadow-2xl my-4 py-6 border border-slate-200/60
                  max-h-[80vh] overflow-y-auto"
            >
              <div className="px-6 space-y-1">
                {/* Top nav links */}
                {[
                  { href: "/", icon: Home, label: "Home" },
                  {
                    href: "/custom-design",
                    icon: Building,
                    label: "Custom Design",
                  },
                 
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-4 px-4 py-3 text-slate-700 hover:text-lime-600 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{label}</span>
                  </a>
                ))}

                {/* 📞 Contact Section */}
                <div className="px-4 py-3 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-lime-600" />
                    <h3 className="text-slate-800 font-bold">Contact Us</h3>
                  </div>
                  <div className="space-y-2">
                    {/*Whatsapp*/}
                    <a
                      href="https://wa.me/254763831806?text=Hello%20Hillersons%20Spaces,%20I%20would%20like%20to%20inquire%20about%20your%20services."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                    >
                      <span className="bg-gradient-to-br from-green-500 to-lime-600 p-2 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="w-5 h-5"
                        >
                          <path d="M20.52 3.48A11.949 11.949 0 0012 0C5.373 0 .001 5.373.001 12c0 2.121.657 4.084 1.779 5.722L0 24l6.378-1.675A11.949 11.949 0 0012 24c6.627 0 12-5.373 12-12 0-3.195-1.246-6.198-3.48-8.52zM12 22c-1.905 0-3.713-.612-5.205-1.654l-.372-.22-3.787.995.997-3.692-.242-.374A9.958 9.958 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.338-7.667c-.297-.149-1.758-.867-2.031-.967-.273-.1-.472-.149-.672.150-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.130-.606.134-.133.298-.347.447-.520.151-.174.200-.298.300-.497.100-.198.050-.372-.025-.520-.075-.149-.672-1.612-.921-2.206-.242-.579-.487-.500-.672-.510l-.573-.010c-.198 0-.520.074-.792.372s-1.040 1.016-1.040 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.200 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.360.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.570-.347z" />
                        </svg>
                      </span>
                      <span className="text-slate-700 font-medium">
                        {" "}
                        WhatsApp Us
                      </span>
                    </a>

                    {/*Email*/}
                    <a
                      href="mailto:HillersonsDesigns@gmail.com"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                    >
                      <span className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                        <Mail className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-slate-700 font-medium">
                        Email Us
                      </span>
                    </a>

                    {/*Location*/}
                    <a
                      href="https://www.google.com/maps/place/Rehema+House,+6th+floor+Standard+St,+Nairobi/@-1.2847631,36.8228179,21z/data=!4m6!3m5!1s0x182f10d65b59080d:0x2ea5107c8248e808!8m2!3d-1.2847285!4d36.8229559!16s%2Fg%2F11l5hn9x7x?entry=ttu&g_ep=EgoyMDI5MDkxNi4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                    >
                      <span className="bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-slate-700 font-medium">
                        Our Location
                      </span>
                    </a>

                    {/*Phone*/}
                    <a
                      href="tel:+254763831806"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                    >
                      <span className="bg-gradient-to-br from-green-500 to-lime-600 p-2 rounded-lg">
                        <Phone className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-slate-700 font-medium">
                        Call Us
                      </span>
                    </a>

                    {/*Full contact page*/}
                    <a
                      href="/contact"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-lime-50 hover:to-emerald-50 rounded-xl transition-all duration-300"
                    >
                      <span className="bg-white/20 p-2 rounded-lg">
                        <Send className="w-4 h-4" />
                      </span>
                      <span className="text-slate-700 font-medium">
                        Contact Page
                      </span>
                    </a>
                  </div>
                </div>

                {/* Services Section */}
                <div className="px-4 py-3 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-lime-600" />
                    <h3 className="text-slate-800 font-bold">Our Services</h3>
                  </div>
                  <div className="space-y-1">
                    {[
                      {
                        href: "/allProducts",
                        icon: Home,
                        label: "Architectural Plans",
                      },
                      {
                        href: "/categories/commercial projects",
                        icon: Globe,
                        label: "Commercial Projects",
                      },
                      {
                        href: "/categories/residential projects",
                        icon: Users,
                        label: "Residential Projects",
                      },
                      {
                        href: "/categories/social amenities projects",
                        icon: Star,
                        label: "Social Amenities",
                      },
                      {
                        href: "/categories/renovation work",
                        icon: Hammer,
                        label: "Renovation Work",
                      },
                      {
                        href: "/categories/interior design",
                        icon: Palette,
                        label: "Interior Design",
                      },
                    ].map(({ href, icon: Icon, label }) => (
                      <a
                        key={label}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-lime-600 hover:bg-lime-50 rounded-lg transition-all duration-300"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Header;
