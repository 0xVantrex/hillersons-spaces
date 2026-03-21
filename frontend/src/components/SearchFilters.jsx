import { Filter, Grid3X3, LayoutList, Search } from "lucide-react";
import { useState } from "react";

/* ─── Filter option constants — module level, not re-created per render ── */
const PLAN_TYPES = [
  "All Types",
  "Modern Bungalow",
  "Luxury Villa",
  "Eco Cottage",
  "Grand Mansion",
];

const BEDROOM_OPTIONS = [
  "Any",
  "1+ Bedroom",
  "2+ Bedrooms",
  "3+ Bedrooms",
  "4+ Bedrooms",
  "5+ Bedrooms",
];

const FLOOR_OPTIONS = ["Any", "Single Story", "Two Story", "Three+ Stories"];

const BUDGET_OPTIONS = [
  "Any Budget",
  "Under KES 300K",
  "KES 300K – 600K",
  "KES 600K – 1M",
  "Over KES 1M",
];

const AREA_OPTIONS = [
  "Any Size",
  "Under 100 sqm",
  "100–200 sqm",
  "200–400 sqm",
  "Over 400 sqm",
];

const SELECT_FIELDS = [
  { id: "planType",  label: "Plan Type",    options: PLAN_TYPES      },
  { id: "bedrooms",  label: "Bedrooms",     options: BEDROOM_OPTIONS },
  { id: "floors",    label: "Floors",       options: FLOOR_OPTIONS   },
  { id: "budget",    label: "Budget Range", options: BUDGET_OPTIONS  },
  { id: "area",      label: "Area (sqm)",   options: AREA_OPTIONS    },
];

/* ─── Shared select class ─────────────────────────────────────── */
const selectCls =
  "w-full px-3 py-3 border-2 border-brand-200 rounded-xl bg-white text-sm text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 " +
  "hover:border-brand-300 transition cursor-pointer";

/* ════════════════════════════════════════════════════════════════ */
const SearchFilters = ({ filters, setFilters, onSearch, viewMode, onViewModeChange }) => {
  // ✅ Local view-mode state if parent doesn't provide it
  const [localView, setLocalView] = useState("grid");
  const activeView   = viewMode ?? localView;
  const setView      = onViewModeChange ?? setLocalView;

  /* ── Filter change — update state only, don't fire search on every change ── */
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ── Explicit search submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(filters);
  };

  /* ── Reset all filters ── */
  const handleReset = () => {
    const reset = {
      planType:     "All Types",
      bedrooms:     "Any",
      floors:       "Any",
      budget:       "Any Budget",
      area:         "Any Size",
      customizable: false,
      readyToBuild: false,
    };
    setFilters(reset);
    if (onSearch) onSearch(reset);
  };

  return (
    <section
      aria-label="Search and filter plans"
      className="container mx-auto px-4 -mt-12 relative z-20"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-brand-800">
            Find Your Perfect Plan
          </h2>

          {/* View mode toggles — now functional */}
          <div className="flex items-center gap-2" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={activeView === "grid"}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                activeView === "grid"
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100"
              }`}
            >
              <Grid3X3 className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={activeView === "list"}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                activeView === "list"
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100"
              }`}
            >
              <LayoutList className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ✅ Wrapped in <form> — Enter key on any field triggers search */}
        <form onSubmit={handleSubmit} noValidate aria-label="Plan search filters">

          {/* Select filters grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {SELECT_FIELDS.map(({ id, label, options }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1.5"
                >
                  {label}
                </label>
                <select
                  id={id}
                  name={id}
                  value={filters[id] ?? options[0]}
                  onChange={handleFilterChange}
                  className={selectCls}
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Checkboxes + CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Checkbox filters */}
            <fieldset className="flex flex-wrap items-center gap-5 border-0 p-0 m-0">
              <legend className="sr-only">Additional filter options</legend>

              {[
                { id: "customizable", label: "Customizable Plans" },
                { id: "readyToBuild", label: "Ready to Build" },
              ].map(({ id, label }) => (
                <label
                  key={id}
                  htmlFor={id}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id={id}
                    name={id}
                    checked={filters[id] ?? false}
                    onChange={handleFilterChange}
                    className="w-4 h-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-brand-700 font-medium">{label}</span>
                </label>
              ))}
            </fieldset>

            {/* Action buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 rounded-xl border-2 border-brand-200 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 whitespace-nowrap"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                Search Plans
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchFilters;