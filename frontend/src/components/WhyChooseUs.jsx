import { Shield, Zap, TrendingUp, Download } from "lucide-react";

const FEATURES = [
  {
    Icon:        Shield,
    title:       "Verified Architects",
    description: "All designs created by licensed architects with proven track records in Kenya.",
  },
  {
    Icon:        Zap,
    title:       "Ready to Build",
    description: "Complete construction documents included with every plan purchase.",
  },
  {
    Icon:        TrendingUp,
    title:       "Value Engineering",
    description: "Cost-effective designs that maximise space and minimise construction waste.",
  },
  {
    Icon:        Download,
    title:       "Instant Delivery",
    description: "Digital downloads available immediately after purchase.",
  },
];

const WhyChooseUs = () => (
  <section aria-labelledby="why-heading" className="container mx-auto px-4 py-16">

    {/* Heading */}
    <div className="text-center max-w-3xl mx-auto mb-16">
      <span className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
        Premium Service
      </span>
      <h2 id="why-heading" className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">
        Why Choose{" "}
        <span className="text-lime-600">Hillersons Spaces</span>
      </h2>
      <p className="text-lg text-brand-700">
        We combine architectural excellence with local expertise to deliver
        designs perfectly suited for Kenyan living.
      </p>
    </div>

    {/* Feature cards */}
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" aria-label="Our key advantages">
      {FEATURES.map(({ Icon, title, description }) => (
        <li
          key={title}
          className="bg-white p-6 rounded-xl shadow-md border border-brand-100 hover:shadow-lg transition-shadow list-none"
        >
          <div
            className="bg-brand-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-brand-600"
            aria-hidden="true"
          >
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-brand-900 mb-2">{title}</h3>
          <p className="text-brand-700 text-sm leading-relaxed">{description}</p>
        </li>
      ))}
    </ul>

  </section>
);

export default WhyChooseUs;