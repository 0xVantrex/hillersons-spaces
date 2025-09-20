import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Users, Database, Globe, Mail, Phone, MapPin, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    { id: 'collection', title: 'Information Collection', icon: Database },
    { id: 'usage', title: 'How We Use Data', icon: Eye },
    { id: 'sharing', title: 'Data Sharing', icon: Users },
    { id: 'security', title: 'Security Measures', icon: Lock },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Globe },
    { id: 'rights', title: 'Your Rights', icon: Shield },
    { id: 'contact', title: 'Contact Us', icon: Mail }
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
        "Company information (for business clients)"
      ]
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
        "Login history and session information"
      ]
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
        "Subscription and renewal information"
      ]
    },
    {
      category: "Technical & Usage Analytics",
      icon: Globe,
      items: [
        "IP address and geographic location",
        "Browser type, version, and language",
        "Device information and operating system",
        "Website navigation patterns and behavior",
        "Page views, session duration, and interactions",
        "Referral sources and marketing attribution"
      ]
    }
  ];

  const securityMeasures = [
    {
      title: "Advanced Encryption",
      description: "All sensitive data is protected using AES-256 encryption both in transit and at rest.",
      icon: Lock
    },
    {
      title: "Secure Infrastructure",
      description: "Our servers are hosted in SOC 2 compliant data centers with 24/7 monitoring.",
      icon: Shield
    },
    {
      title: "Access Controls",
      description: "Strict role-based access controls ensure only authorized personnel can access your data.",
      icon: Users
    },
    {
      title: "Regular Audits",
      description: "We conduct quarterly security audits and penetration testing to identify vulnerabilities.",
      icon: Eye
    }
  ];

  const userRights = [
    {
      right: "Access Your Data",
      description: "Request a complete copy of all personal information we have about you in a portable format.",
      action: "Contact our support team to receive your data within 30 days"
    },
    {
      right: "Correct Information",
      description: "Update, modify, or correct any inaccurate personal information in your account.",
      action: "Use your account settings or contact support for assistance"
    },
    {
      right: "Delete Your Account",
      description: "Request complete deletion of your account and all associated personal data.",
      action: "Submit a deletion request - we'll process within 60 days"
    },
    {
      right: "Data Portability",
      description: "Export your data to use with other services or providers.",
      action: "Download your data in standard formats (JSON, CSV, PDF)"
    },
    {
      right: "Marketing Opt-out",
      description: "Unsubscribe from promotional emails, newsletters, and marketing communications.",
      action: "Use unsubscribe links or update preferences in your account"
    },
    {
      right: "Restrict Processing",
      description: "Limit how we use your data while keeping your account active.",
      action: "Contact privacy@hillersons.com with specific restrictions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-lime-50">

      <Header
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white/5 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i}s`
              }}
            ></div>
          ))}
        </div>

        <div className={`relative z-10 max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 text-white mb-6">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">Your Privacy Matters</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Privacy
            <span className="block bg-gradient-to-r from-lime-300 to-white bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Comprehensive guide to how HillersonsDesigns protects, uses, and manages your personal information
          </p>
          
          <div className="inline-flex items-center gap-2 text-white/80 text-sm">
            <span>Last Updated: July 15, 2025</span>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto py-4 gap-2 scrollbar-hide">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  activeSection === index
                    ? 'bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Introduction */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  At <strong>Hillersons Investment Company Ltd</strong> ("HillersonsDesigns", "we", "our", or "us"), 
                  we understand that your privacy is fundamental to building trust. This comprehensive Privacy Policy 
                  outlines exactly how we collect, use, protect, and manage your personal information when you interact 
                  with our website, purchase our architectural designs, or use our services.
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Secure by Design</h3>
                <p className="text-sm text-gray-600 mt-1">Industry-leading security measures</p>
              </div>
              <div className="text-center p-4 bg-lime-50 rounded-xl">
                <Eye className="w-8 h-8 text-lime-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Full Transparency</h3>
                <p className="text-sm text-gray-600 mt-1">Clear about data usage</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Your Control</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your data preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Information Collection */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {dataTypes.map((type, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center">
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{type.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {type.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: How We Use Information */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Service Delivery",
                  items: [
                    "Process and fulfill your architectural plan orders",
                    "Provide secure download access to purchased designs",
                    "Send order confirmations and delivery notifications",
                    "Handle refunds, returns, and customer inquiries"
                  ]
                },
                {
                  title: "Account Management",
                  items: [
                    "Create and maintain your user account",
                    "Provide technical support and customer service",
                    "Enable account recovery and password resets",
                    "Manage subscription renewals and billing"
                  ]
                },
                {
                  title: "Communication",
                  items: [
                    "Send important account and service updates",
                    "Share new design releases and promotions (opt-in)",
                    "Provide architectural tips and industry insights",
                    "Respond to your questions and feedback"
                  ]
                },
                {
                  title: "Platform Improvement",
                  items: [
                    "Analyze website usage to enhance user experience",
                    "Develop new features and design categories",
                    "Optimize site performance and loading speeds",
                    "Conduct A/B testing for better functionality"
                  ]
                },
                {
                  title: "Legal Compliance",
                  items: [
                    "Comply with applicable laws and regulations",
                    "Respond to legal requests and court orders",
                    "Protect against fraud and unauthorized access",
                    "Maintain records for tax and accounting purposes"
                  ]
                },
                {
                  title: "Marketing & Analytics",
                  items: [
                    "Personalize content and design recommendations",
                    "Track marketing campaign effectiveness",
                    "Understand customer preferences and behavior",
                    "Improve our architectural design offerings"
                  ]
                }
              ].map((purpose, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-500" />
                    {purpose.title}
                  </h3>
                  <ul className="space-y-2">
                    {purpose.items.map((item, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-lime-500 rounded-full flex-shrink-0 mt-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Data Sharing */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Data Sharing & Third Parties</h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Data Sharing Policy</h3>
                <p className="text-gray-600 leading-relaxed">
                  <strong>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</strong> 
                  Your data is only shared in specific, limited circumstances outlined below, and always with appropriate 
                  safeguards in place.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {[
                {
                  title: "Payment Processing",
                  description: "Secure payment gateways like Stripe, PayPal, and bank processors to handle transactions safely.",
                  safeguards: ["PCI DSS compliant", "Encrypted transmission", "Tokenized card data"]
                },
                {
                  title: "Cloud Infrastructure",
                  description: "Hosting providers and cloud services that store and deliver our content securely.",
                  safeguards: ["SOC 2 certified", "GDPR compliant", "Data encryption at rest"]
                },
                {
                  title: "Analytics Services",
                  description: "Tools like Google Analytics to understand website usage and improve user experience.",
                  safeguards: ["Anonymized data", "IP address masking", "Opt-out available"]
                },
                {
                  title: "Legal Requirements",
                  description: "Government agencies or courts when required by law or to protect our legal rights.",
                  safeguards: ["Valid legal process", "Narrow scope", "User notification when possible"]
                }
              ].map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-2">{scenario.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{scenario.description}</p>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Safeguards:</span>
                    {scenario.safeguards.map((safeguard, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-gray-600">{safeguard}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Security Measures */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Security & Data Protection</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {securityMeasures.map((measure, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center">
                    <measure.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{measure.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{measure.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-8 border border-emerald-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Security Disclaimer</h3>
                <p className="text-gray-600 leading-relaxed">
                  While we implement industry-leading security measures, no online service can guarantee 100% security. 
                  We encourage users to use strong, unique passwords and enable two-factor authentication where available. 
                  If you suspect any security breach, please contact us immediately at <strong>security@hillersons.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Your Rights */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Privacy Rights</h2>
          </div>
          
          <div className="space-y-6">
            {userRights.map((right, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{right.right}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{right.description}</p>
                  </div>
                  <div className="lg:w-80">
                    <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-xl p-4 border border-emerald-200">
                      <span className="text-sm font-medium text-emerald-700 uppercase tracking-wide mb-1 block">How to Exercise:</span>
                      <p className="text-sm text-gray-700">{right.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Contact & Support</h2>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-600 to-lime-600 rounded-2xl p-8 sm:p-10 text-white">
            <h3 className="text-2xl font-bold mb-6">Questions About Your Privacy?</h3>
            <p className="text-white/90 leading-relaxed mb-8">
              Our dedicated privacy team is here to help. Whether you have questions about this policy, 
              want to exercise your rights, or need assistance with your account, we're ready to assist.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-white/80" />
                <div>
                  <div className="font-semibold">Email Support</div>
                  <div className="text-white/80 text-sm">privacy@hillersons.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-white/80" />
                <div>
                  <div className="font-semibold">Phone Support</div>
                  <div className="text-white/80 text-sm">+254 763 831 806</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-white/80" />
                <div>
                  <div className="font-semibold">Office Address</div>
                  <div className="text-white/80 text-sm">Nairobi, Kenya</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Updates Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Updates & Changes</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, 
              legal requirements, or other factors. When we make material changes, we will:
            </p>
            <ul className="space-y-3 ml-6">
              {[
                "Notify you via email at least 30 days before changes take effect",
                "Display a prominent notice on our website",
                "Update the 'Last Updated' date at the top of this policy",
                "Provide a summary of key changes when significant"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-600 leading-relaxed mt-6">
              Your continued use of our services after any changes indicates your acceptance of the updated policy. 
              If you disagree with changes, you may close your account and discontinue use of our services.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;