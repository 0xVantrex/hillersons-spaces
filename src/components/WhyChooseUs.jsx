import { Shield, Zap, TrendingUp, Download } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Verified Architects",
      description: "All designs created by licensed architects with proven track records in Kenya"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Ready to Build",
      description: "Complete construction documents included with every plan purchase"
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Value Engineering",
      description: "Cost-effective designs that maximize space and minimize construction waste"
    },
    {
      icon: <Download className="w-7 h-7" />,
      title: "Instant Delivery",
      description: "Digital downloads available immediately after purchase"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          Premium Service
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
          Why Choose <span className="text-lime-600">hillersonsDesigns</span>
        </h2>
        <p className="text-lg text-emerald-700">
          We combine architectural excellence with local expertise to deliver designs perfectly suited for Kenyan living
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">{feature.title}</h3>
            <p className="text-emerald-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;