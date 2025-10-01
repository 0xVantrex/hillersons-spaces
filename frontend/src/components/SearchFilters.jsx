import { Filter, Grid3X3 } from "lucide-react";

const SearchFilters = ({ filters, setFilters, onSearch }) => {
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFilters = {
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    };
    setFilters(newFilters);
    if (onSearch) onSearch(newFilters); // call parent whenever filters change
  };

  const planTypes = [
    "All Types",
    "Modern Bungalow",
    "Luxury Villa",
    "Eco Cottage",
    "Grand Mansion",
  ];

  const bedroomOptions = [
    "Any",
    "1+ Bedroom",
    "2+ Bedrooms",
    "3+ Bedrooms",
    "4+ Bedrooms",
    "5+ Bedrooms",
  ];

  const floorOptions = ["Any", "Single Story", "Two Story", "Three+ Stories"];

  const budgetOptions = [
    "Any Budget",
    "Under KES 300K",
    "KES 300K - 600K",
    "KES 600K - 1M",
    "Over KES 1M",
  ];

  const areaOptions = [
    "Any Size",
    "Under 100 sqm",
    "100-200 sqm",
    "200-400 sqm",
    "Over 400 sqm",
  ];

  return (
    <section className="container mx-auto px-4 -mt-12 relative z-20">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-emerald-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-800">
            Find Your Perfect Plan
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
              aria-label="Filter options"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
              aria-label="Change view mode"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label
              htmlFor="planType"
              className="block text-sm font-semibold text-emerald-700 mb-2"
            >
              Plan Type
            </label>
            <select
              id="planType"
              name="planType"
              value={filters.planType}
              onChange={handleFilterChange}
              className="w-full p-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-gradient-to-r from-emerald-50 to-lime-50"
            >
              {planTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-semibold text-emerald-700 mb-2"
            >
              Bedrooms
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full p-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-gradient-to-r from-emerald-50 to-lime-50"
            >
              {bedroomOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="floors"
              className="block text-sm font-semibold text-emerald-700 mb-2"
            >
              Floors
            </label>
            <select
              id="floors"
              name="floors"
              value={filters.floors}
              onChange={handleFilterChange}
              className="w-full p-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-gradient-to-r from-emerald-50 to-lime-50"
            >
              {floorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-semibold text-emerald-700 mb-2"
            >
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              value={filters.budget}
              onChange={handleFilterChange}
              className="w-full p-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-gradient-to-r from-emerald-50 to-lime-50"
            >
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="area"
              className="block text-sm font-semibold text-emerald-700 mb-2"
            >
              Area (sqm)
            </label>
            <select
              id="area"
              name="area"
              value={filters.area}
              onChange={handleFilterChange}
              className="w-full p-4 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 bg-gradient-to-r from-emerald-50 to-lime-50"
            >
              {areaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customizable"
                name="customizable"
                checked={filters.customizable}
                onChange={handleFilterChange}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label
                htmlFor="customizable"
                className="text-sm text-emerald-700"
              >
                Customizable Plans
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="readyToBuild"
                name="readyToBuild"
                checked={filters.readyToBuild}
                onChange={handleFilterChange}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label
                htmlFor="readyToBuild"
                className="text-sm text-emerald-700"
              >
                Ready to Build
              </label>
            </div>
          </div>
          <button
            className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
            onClick={() => onSearch(filters)}
          >
            Search Plans
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
