import React, { useState } from "react";
import { Upload, Image, FileText, Building, Home, Heart, Palette, Wrench, MapPin, Users, Bed, Bath, Clock } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const AMENITY_OPTIONS = ["wifi", "parking", "pool", "ac", "breakfast", "security"];

const categoryOptions = {
  "Commercial": [
    "Mixed use development",
    "Office park",
    "Commercial plaza",
    "Retail shops",
    "Godowns & warehouses",
    "Service station",
    "Hospitality development"
  ],
  "Residential": [
    "Residential apartment development",
    "Residential house development",
    "Residential estate development"
  ],
  "Social": [
    "Hospital development",
    "Education facility development",
    "Social market development",
    "Religion facility development"
  ],
  "Interior": [],
  "Renovation": []
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "Commercial": return <Building className="w-5 h-5" />;
    case "Residential": return <Home className="w-5 h-5" />;
    case "Social": return <Heart className="w-5 h-5" />;
    case "Interior": return <Palette className="w-5 h-5" />;
    case "Renovation": return <Wrench className="w-5 h-5" />;
    default: return null;
  }
};

const UploadProject = () => {
  const { token } = useAuth(); // ✅ use AuthContext token not localStorage directly
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "bnb"

  // ── Plan state (unchanged) ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subCategoryGroup: "Commercial",
    subCategory: "Mixed use development",
    floorCount: "",
    rooms: "",
    price: "",
    area: "",
    planImageURLs: [],
    finalImageURLs: [],
    featured: false,
    newListing: false,
    premium: false,
  });
  const [planFiles, setPlanFiles] = useState(null);
  const [finalFiles, setFinalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ── BNB state ──────────────────────────────────────────────────────────────
  const [bnbForm, setBnbForm] = useState({
    title: "",
    description: "",
    location: "",
    county: "",
    town: "",
    pricePerNight: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    amenities: [],
    rules: "",
  });
  const [bnbFiles, setBnbFiles] = useState([]);
  const [bnbUploading, setBnbUploading] = useState(false);

  // ── Plan handlers (unchanged logic) ───────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "subCategoryGroup") {
        const subOptions = categoryOptions[value] || [];
        newData.subCategory = subOptions[0] || "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("price", Number(formData.price));
      uploadData.append("area", formData.area);
      uploadData.append("floorCount", formData.floorCount);
      uploadData.append("rooms", formData.rooms);
      uploadData.append("subCategoryGroup", formData.subCategoryGroup);
      uploadData.append("subCategory", formData.subCategory);
      uploadData.append("premium", formData.premium);
      uploadData.append("featured", formData.featured);
      uploadData.append("newListing", formData.newListing);

      if (planFiles) Array.from(planFiles).forEach((file) => uploadData.append("planImages", file));
      if (finalFiles) Array.from(finalFiles).forEach((file) => uploadData.append("finalImages", file));

      const res = await fetch(`${API_BASE_URL}/api/plans/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload project");
      }

      alert("Project uploaded successfully!");
      setFormData({
        title: "", description: "", subCategoryGroup: "Commercial",
        subCategory: "Mixed use development", floorCount: "", rooms: "",
        price: "", area: "", planImageURLs: [], finalImageURLs: [],
        featured: false, newListing: false, premium: false,
      });
      setPlanFiles(null);
      setFinalFiles([]);
    } catch (error) {
      console.error("Upload failed", error);
      alert(`Upload failed: ${error.message}`);
    }

    setUploading(false);
  };

  // ── BNB handlers ───────────────────────────────────────────────────────────
  const handleBnbChange = (e) => {
    const { name, value } = e.target;
    setBnbForm((f) => ({ ...f, [name]: value }));
  };

  const toggleAmenity = (a) => {
    setBnbForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleBnbSubmit = async (e) => {
    e.preventDefault();

    if (!bnbForm.title.trim()) return alert("Title is required.");
    if (!bnbForm.description.trim()) return alert("Description is required.");
    if (!bnbForm.pricePerNight) return alert("Price per night is required.");
    if (bnbFiles.length === 0) return alert("Please upload at least one image.");

    setBnbUploading(true);

    try {
      const authToken = token || localStorage.getItem("authToken");

      // Step 1: Create the BNB listing via admin endpoint (goes live immediately)
      const listingRes = await fetch(`${API_BASE_URL}/api/bnb/admin/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: bnbForm.title,
          description: bnbForm.description,
          location: bnbForm.location,
          county: bnbForm.county,
          town: bnbForm.town,
          price: Number(bnbForm.pricePerNight),
          listingType: "bnb",
          bnb: {
            pricePerNight: Number(bnbForm.pricePerNight),
            maxGuests: Number(bnbForm.maxGuests) || 1,
            bedrooms: Number(bnbForm.bedrooms) || 1,
            bathrooms: Number(bnbForm.bathrooms) || 1,
            checkInTime: bnbForm.checkInTime,
            checkOutTime: bnbForm.checkOutTime,
            amenities: bnbForm.amenities,
            rules: bnbForm.rules ? bnbForm.rules.split("\n").filter(Boolean) : [],
          },
        }),
      });

      const listingData = await listingRes.json();
      if (!listingRes.ok) throw new Error(listingData.error || "Failed to create BNB listing");

      const listingId = listingData.listing._id;

      // Step 2: Upload images to the new listing using secure upload route
      const imageData = new FormData();
      Array.from(bnbFiles).forEach((file) => imageData.append("images", file));

      const imageRes = await fetch(`${API_BASE_URL}/api/upload/bnb/${listingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: imageData,
      });

      const imageResult = await imageRes.json();
      if (!imageRes.ok) throw new Error(imageResult.error || "Images uploaded but listing created — add images later from dashboard");

      alert(`BNB listing created with ${imageResult.images.length} image(s)!`);

      setBnbForm({
        title: "", description: "", location: "", county: "", town: "",
        pricePerNight: "", maxGuests: "", bedrooms: "", bathrooms: "",
        checkInTime: "14:00", checkOutTime: "11:00", amenities: [], rules: "",
      });
      setBnbFiles([]);
    } catch (error) {
      console.error("BNB upload failed", error);
      alert(`Error: ${error.message}`);
    }

    setBnbUploading(false);
  };

  const subOptions = categoryOptions[formData.subCategoryGroup] || [];
  const showSubCategory = subOptions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Upload New Listing</h1>
            </div>
            <p className="text-emerald-100 mt-2">Add a house plan or BNB listing</p>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("plan")}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                activeTab === "plan"
                  ? "bg-white border-b-2 border-emerald-600 text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              House Plan
            </button>
            <button
              onClick={() => setActiveTab("bnb")}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                activeTab === "bnb"
                  ? "bg-white border-b-2 border-emerald-600 text-emerald-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              BNB Listing
            </button>
          </div>

          {/* ── PLAN FORM (unchanged) ── */}
          {activeTab === "plan" && (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Project Title
                </label>
                <input
                  name="title"
                  placeholder="Enter your project title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Project Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your project in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-vertical"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="w-4 h-4" />
                    Main Category
                  </label>
                  <select
                    name="subCategoryGroup"
                    value={formData.subCategoryGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                  >
                    {Object.keys(categoryOptions).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {showSubCategory && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      {getCategoryIcon(formData.subCategoryGroup)}
                      Sub Category
                    </label>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                    >
                      {subOptions.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Number of Rooms</label>
                  <input
                    name="rooms"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.rooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Floor Count</label>
                  <input
                    name="floorCount"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.floorCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Area (sqm)</label>
                  <input
                    name="area"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Price (KES)</label>
                <input
                  name="price"
                  type="number"
                  placeholder="e.g., 2500000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Image className="w-4 h-4" />
                    Plan Images (blueprints)
                  </label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setPlanFiles(e.target.files)}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">Upload architectural plans and blueprints</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Image className="w-4 h-4" />
                    Final Product Images (3-10 images)
                  </label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setFinalFiles(e.target.files)}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">Upload photos of your completed project</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <><Upload className="w-5 h-5" />Upload Project</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── BNB FORM ── */}
          {activeTab === "bnb" && (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Title *</label>
                <input
                  name="title"
                  value={bnbForm.title}
                  onChange={handleBnbChange}
                  placeholder="e.g. Hillersons Luxury Suite - Karen"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea
                  name="description"
                  value={bnbForm.description}
                  onChange={handleBnbChange}
                  placeholder="Describe the property..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-vertical"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4" />Location
                  </label>
                  <input name="location" value={bnbForm.location} onChange={handleBnbChange}
                    placeholder="e.g. Karen, Nairobi"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">County</label>
                  <input name="county" value={bnbForm.county} onChange={handleBnbChange}
                    placeholder="e.g. Nairobi"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Town / Area</label>
                  <input name="town" value={bnbForm.town} onChange={handleBnbChange}
                    placeholder="e.g. Karen"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Price/Night (KES) *</label>
                  <input name="pricePerNight" type="number" value={bnbForm.pricePerNight} onChange={handleBnbChange}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4" />Max Guests
                  </label>
                  <input name="maxGuests" type="number" value={bnbForm.maxGuests} onChange={handleBnbChange}
                    placeholder="4" min="1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Bed className="w-4 h-4" />Bedrooms
                  </label>
                  <input name="bedrooms" type="number" value={bnbForm.bedrooms} onChange={handleBnbChange}
                    placeholder="2" min="1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Bath className="w-4 h-4" />Bathrooms
                  </label>
                  <input name="bathrooms" type="number" value={bnbForm.bathrooms} onChange={handleBnbChange}
                    placeholder="1" min="1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4" />Check-in Time
                  </label>
                  <input name="checkInTime" type="time" value={bnbForm.checkInTime} onChange={handleBnbChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4" />Check-out Time
                  </label>
                  <input name="checkOutTime" type="time" value={bnbForm.checkOutTime} onChange={handleBnbChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 capitalize transition ${
                        bnbForm.amenities.includes(a)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-emerald-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">House Rules (one per line)</label>
                <textarea
                  name="rules"
                  value={bnbForm.rules}
                  onChange={handleBnbChange}
                  placeholder={"No smoking\nNo pets\nNo parties"}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Image className="w-4 h-4" />
                  Property Images (JPG, PNG, WebP — max 5MB each)
                </label>
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setBnbFiles(e.target.files)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload photos of the property — up to 10 images
                  </p>
                  {bnbFiles.length > 0 && (
                    <p className="text-sm text-emerald-600 font-medium mt-2">
                      {bnbFiles.length} file{bnbFiles.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleBnbSubmit}
                  disabled={bnbUploading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bnbUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating BNB Listing...
                    </>
                  ) : (
                    <><Upload className="w-5 h-5" />Create BNB Listing</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProject;