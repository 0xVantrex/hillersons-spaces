import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  {
    number: 1,
    title: "Browse Plans",
    description: "Explore our extensive collection of architectural designs.",
  },
  {
    number: 2,
    title: "Select & Customize",
    description: "Choose your favourite plan and request modifications if needed.",
  },
  {
    number: 3,
    title: "Complete Purchase",
    description: "Securely check out and receive your digital files immediately.",
  },
  {
    number: 4,
    title: "Start Building",
    description: "Work with your contractor to bring your dream home to life.",
  },
];

const ProcessSteps = () => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="process-heading" className="container mx-auto px-4 py-16">

      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          Simple Process
        </span>
        <h2 id="process-heading" className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">
          How <span className="text-lime-600">It Works</span>
        </h2>
        <p className="text-lg text-brand-700">
          Get from dream to doorstep in just a few simple steps.
        </p>
      </div>

      {/* ✅ Semantic ordered list — screen readers announce step count + order */}
      <ol
        className="grid grid-cols-1 md:grid-cols-4 gap-8"
        aria-label="How the process works"
      >
        {STEPS.map((step, index) => (
          <li key={step.number} className="relative text-center list-none">

            {/* Step number circle */}
            <div
              className="mx-auto bg-brand-100 w-20 h-20 rounded-xl flex items-center justify-center mb-6 relative z-10"
              aria-label={`Step ${step.number}`}
            >
              <span className="text-2xl font-bold text-brand-800" aria-hidden="true">
                {step.number}
              </span>
            </div>

            <h3 className="text-xl font-bold text-brand-900 mb-3">{step.title}</h3>
            <p className="text-brand-700 text-sm leading-relaxed">{step.description}</p>

            {/* Connector arrow */}
            {index < STEPS.length - 1 && (
              <div
                className="hidden md:block absolute top-10 right-0 translate-x-1/2 z-20"
                aria-hidden="true"
              >
                <ChevronRight className="w-8 h-8 text-brand-300" />
              </div>
            )}
          </li>
        ))}
      </ol>

      {/* CTA */}
      <div className="text-center mt-16">
        <button
          type="button"
          onClick={() => navigate("/allProducts")}
          aria-label="Get started — browse our plans"
          className="bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Get Started Today
        </button>
      </div>
    </section>
  );
};

export default ProcessSteps;