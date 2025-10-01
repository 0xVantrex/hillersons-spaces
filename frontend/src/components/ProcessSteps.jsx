import { ChevronRight } from 'lucide-react';

const ProcessSteps = () => {
  const steps = [
    {
      number: 1,
      title: "Browse Plans",
      description: "Explore our extensive collection of architectural designs"
    },
    {
      number: 2,
      title: "Select & Customize",
      description: "Choose your favorite plan and request modifications if needed"
    },
    {
      number: 3,
      title: "Complete Purchase",
      description: "Securely checkout and receive your digital files immediately"
    },
    {
      number: 4,
      title: "Start Building",
      description: "Work with your contractor to bring your dream home to life"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          Simple Process
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
          How <span className="text-lime-600">It Works</span>
        </h2>
        <p className="text-lg text-emerald-700">
          Get from dream to doorstep in just a few simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative text-center">
            <div className="mx-auto bg-emerald-100 w-20 h-20 rounded-xl flex items-center justify-center mb-6 text-emerald-600 relative z-10">
              <span className="text-2xl font-bold text-emerald-800">{step.number}</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">{step.title}</h3>
            <p className="text-emerald-700">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                <ChevronRight className="w-8 h-8 text-emerald-300" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-16">
        <button className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
          Get Started Today
        </button>
      </div>
    </section>
  );
};

export default ProcessSteps;