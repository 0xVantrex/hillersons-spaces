import {
  Search, Home, Building, ChevronDown, Phone,
  Menu, Send, X, Mail, MapPin, Award, Users,
  Palette, Hammer, Globe, Shield, ArrowRight,
  Sparkles, ShoppingCart, User, BedDouble,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ─── WhatsApp icon (inline SVG) ─────────────────────────────── */
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
    <path d="M20.52 3.48A11.949 11.949 0 0012 0C5.373 0 .001 5.373.001 12c0 2.121.657 4.084 1.779 5.722L0 24l6.378-1.675A11.949 11.949 0 0012 24c6.627 0 12-5.373 12-12 0-3.195-1.246-6.198-3.48-8.52zM12 22c-1.905 0-3.713-.612-5.205-1.654l-.372-.22-3.787.995.997-3.692-.242-.374A9.958 9.958 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.338-7.667c-.297-.149-1.758-.867-2.031-.967-.273-.1-.472-.149-.672.15-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.151-.174.2-.298.3-.497.1-.198.05-.372-.025-.52-.075-.149-.672-1.612-.921-2.206-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);

/* ─── Contact links data ──────────────────────────────────────── */
const CONTACT_LINKS = [
  {
    href: "https://wa.me/254763831806?text=Hello%20Hillersons%20Spaces,%20I%20would%20like%20to%20inquire%20about%20your%20services.",
    external: true,
    label: "WhatsApp Us",
    iconBg: "bg-brand-600",
    Icon: WhatsAppIcon,
  },
  {
    href: "mailto:HillersonsDesigns@gmail.com",
    label: "Email Us",
    iconBg: "bg-brand-700",
    Icon: Mail,
  },
  {
    href: "https://www.google.com/maps/place/Rehema+House,+6th+floor+Standard+St,+Nairobi/@-1.2847631,36.8228179,21z",
    external: true,
    label: "Our Location",
    iconBg: "bg-brand-600",
    Icon: MapPin,
  },
  {
    href: "tel:+254763831806",
    label: "Call Us",
    iconBg: "bg-brand-600",
    Icon: Phone,
  },
  {
    href: "/contact",
    label: "Contact Page",
    iconBg: "bg-gray-100",
    Icon: Send,
    iconColor: "text-gray-600",
  },
];

/* ─── Services data ───────────────────────────────────────────── */
const SERVICES = [
  { Icon: Home,      label: "Architectural Plans",    desc: "Custom homes, luxury villas & modern apartments",         href: "/allProducts",                           iconBg: "bg-brand-600" },
  { Icon: Globe,     label: "Commercial Projects",    desc: "Office buildings, retail spaces & more",                  href: "/categories/commercial projects",         iconBg: "bg-brand-700" },
  { Icon: Users,     label: "Residential Projects",   desc: "Residential apartments, estates & developments",          href: "/categories/Residential projects",        iconBg: "bg-brand-500" },
  { Icon: Award,     label: "Social Amenities",       desc: "Hospitals, schools & community facilities",              href: "/categories/social amenities projects",   iconBg: "bg-lime-600"  },
  { Icon: Hammer,    label: "Renovation & Remodeling",desc: "Transform and modernize your existing space",             href: "/categories/renovation work",             iconBg: "bg-brand-800" },
  { Icon: Palette,   label: "Interior Design",        desc: "Complete interior solutions & space planning",            href: "/categories/interior design",             iconBg: "bg-lime-700"  },
  { Icon: BedDouble, label: "BNB Stays",              desc: "Book short-stay properties across Kenya",                 href: "/bnb",                                    iconBg: "bg-lime-600"  },
];

/* ─── Dropdown wrapper with outside-click close ───────────────── */
function Dropdown({ id, trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          id={`dd-${id}`}
          role="menu"
          aria-label={id}
          className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

/* ─── Shared nav link class ───────────────────────────────────── */
const navLinkCls =
  "flex items-center gap-3 px-4 py-3 hover:bg-brand-50 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-inset";

/* ════════════════════════════════════════════════════════════════ */
const Header = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  showMobileMenu,
  setShowMobileMenu,
  setShowSearch,
}) => {
  const navigate   = useNavigate(); // ✅ Bug fix: React Router navigation, no full reloads
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Bug fix: close mobile menu on route navigation
  const goTo = useCallback((path) => {
    setShowMobileMenu(false);
    navigate(path);
  }, [navigate, setShowMobileMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Top accent bar */}
      <div className="w-full h-1 bg-gradient-to-r from-brand-600 via-lime-400 to-brand-600 fixed top-0 left-0 right-0 z-50" aria-hidden="true" />

      {/* Main header */}
      <header
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-xl border-b border-gray-200"
            : "bg-white shadow-md border-b border-gray-100"
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 lg:gap-3 group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded-xl"
              aria-label="Hillersons Spaces — go to homepage"
            >
              <div className="bg-brand-600 text-white p-2 lg:p-3 rounded-xl shadow-lg group-hover:shadow-brand-300/40 group-hover:scale-105 transition-all duration-300">
                <Building className="w-5 h-5 lg:w-7 lg:h-7" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg lg:text-2xl font-black text-gray-800 tracking-tight leading-none">
                  Hillersons<span className="text-brand-600 font-light">Spaces</span>
                </p>
                <p className="text-xs text-gray-500 font-medium hidden lg:block mt-0.5">
                  Your Vision,{" "}
                  <span className="text-lime-600 font-semibold">Our Efficient Solution</span>
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0" aria-label="Main navigation">
              {[
                { to: "/",             Icon: Home,      label: "Home" },
                { to: "/custom-design",Icon: Building,  label: "Custom Design" },
                { to: "/bnb",          Icon: BedDouble, label: "BNB Stays" },
              ].map(({ to, Icon, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-1.5 px-4 xl:px-5 py-2.5 text-gray-600 font-medium hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200 rounded-xl text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-inset"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}

              {/* Contact dropdown */}
              <Dropdown
                id="Contact"
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls="dd-Contact"
                    className="flex items-center gap-1.5 px-4 xl:px-5 py-2.5 text-gray-600 font-medium hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200 rounded-xl text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-inset"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Contact
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                )}
              >
                {({ close }) => (
                  <div className="w-72 py-3 px-3">
                    {CONTACT_LINKS.map(({ href, external, label, iconBg, Icon, iconColor }) => (
                      <a
                        key={label}
                        href={href}
                        role="menuitem"
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={close}
                        className={navLinkCls}
                      >
                        <span className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${iconColor || "text-white"}`} />
                        </span>
                        <span className="text-gray-700 font-medium text-sm">{label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </Dropdown>

              {/* Services dropdown */}
              <Dropdown
                id="Services"
                trigger={({ open, toggle }) => (
                  <button
                    onClick={toggle}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls="dd-Services"
                    className="flex items-center gap-1.5 px-4 xl:px-5 py-2.5 text-gray-600 font-medium hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200 rounded-xl text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-inset"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    Services
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                )}
              >
                {({ close }) => (
                  <div className="w-96 xl:w-[420px] max-h-[72vh] overflow-y-auto">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-gray-800">Our Expertise</h3>
                      </div>
                      <p className="text-xs text-gray-500">Comprehensive architectural solutions — 15+ years of excellence</p>
                    </div>

                    {/* Service links */}
                    <div className="p-3 space-y-0.5">
                      {SERVICES.map(({ Icon, label, desc, href, iconBg }) => (
                        <Link
                          key={label}
                          to={href}
                          role="menuitem"
                          onClick={close}
                          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-brand-50 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-inset"
                        >
                          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors text-sm">{label}</p>
                            <p className="text-xs text-gray-500 leading-relaxed truncate">{desc}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>

                    {/* Footer CTA */}
                    <div className="px-5 py-4 border-t border-gray-100">
                      <Link
                        to="/allProducts"
                        role="menuitem"
                        onClick={close}
                        className="w-full bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                      >
                        <Shield className="w-4 h-4" aria-hidden="true" />
                        View All Services
                      </Link>
                    </div>
                  </div>
                )}
              </Dropdown>
            </nav>

            {/* Desktop right — search + icons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* ✅ Bug fix: search is a real <form> with submit handler */}
              <form onSubmit={handleSearch} role="search" aria-label="Search designs">
                <div className="relative">
                  <label htmlFor="desktop-search" className="sr-only">Search architectural designs</label>
                  <input
                    id="desktop-search"
                    type="search"
                    placeholder="Search designs…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 xl:w-56 pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-300 focus:border-brand-500 bg-white text-sm transition-all duration-200 focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
                </div>
              </form>

              <button
                onClick={() => navigate("/cart")}
                aria-label="View shopping cart"
                className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <ShoppingCart className="w-5 h-5 xl:w-6 xl:h-6" aria-hidden="true" />
              </button>

              <button
                onClick={() => navigate("/profile")}
                aria-label="View your profile"
                className="p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <User className="w-5 h-5 xl:w-6 xl:h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={() => navigate("/cart")}
                aria-label="View shopping cart"
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("/profile")}
                aria-label="View your profile"
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                aria-label={showSearch ? "Close search" : "Open search"}
                aria-expanded={showSearch}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                aria-expanded={showMobileMenu}
                aria-controls="mobile-menu"
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {showMobileMenu
                  ? <X className="w-6 h-6" aria-hidden="true" />
                  : <Menu className="w-6 h-6" aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {showSearch && (
            <div className="py-3 lg:hidden border-t border-gray-100">
              <form onSubmit={handleSearch} role="search" aria-label="Search designs">
                <div className="relative">
                  <label htmlFor="mobile-search" className="sr-only">Search architectural designs</label>
                  <input
                    id="mobile-search"
                    type="search"
                    placeholder="Search architectural designs…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 border-2 border-brand-300 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-500 bg-white text-sm focus:outline-none"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-3.5 text-brand-500 w-4 h-4 pointer-events-none" aria-hidden="true" />
                  {/* ✅ Bug fix: button now has type="submit" and actually triggers search */}
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {showMobileMenu && (
            <nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="lg:hidden bg-white rounded-2xl shadow-xl my-3 border border-gray-100 max-h-[80vh] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-1">
                {/* Primary links */}
                {[
                  { to: "/",              Icon: Home,      label: "Home" },
                  { to: "/custom-design", Icon: Building,  label: "Custom Design" },
                  { to: "/bnb",           Icon: BedDouble, label: "BNB Stays" },
                ].map(({ to, Icon, label }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {label}
                  </Link>
                ))}

                {/* Contact section */}
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 px-4 mb-2">
                    <Phone className="w-4 h-4 text-brand-600" aria-hidden="true" />
                    <h3 className="text-gray-800 font-bold text-sm">Contact Us</h3>
                  </div>
                  <div className="space-y-0.5">
                    {CONTACT_LINKS.map(({ href, external, label, iconBg, Icon, iconColor }) => (
                      <a
                        key={label}
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => setShowMobileMenu(false)}
                        className={navLinkCls + " text-sm"}
                      >
                        <span className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${iconColor || "text-white"}`} />
                        </span>
                        <span className="text-gray-700 font-medium">{label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Services section */}
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 px-4 mb-2">
                    <Sparkles className="w-4 h-4 text-brand-600" aria-hidden="true" />
                    <h3 className="text-gray-800 font-bold text-sm">Our Services</h3>
                  </div>
                  <div className="space-y-0.5">
                    {SERVICES.map(({ Icon, label, href, iconBg }) => (
                      <Link
                        key={label}
                        to={href}
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      >
                        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                        </div>
                        <span className="font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Spacer — accounts for 4px accent bar + 64px/80px header */}
      <div className="h-[68px] lg:h-[84px]" aria-hidden="true" />
    </>
  );
};

export default Header;