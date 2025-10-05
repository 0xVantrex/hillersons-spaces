import React, { useState } from "react";
import { Upload, Image, FileText, Building, Home, Heart, Palette, Wrench } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

const token = localStorage.getItem("token");
const UploadProject = () => {
  const [formData, setFormData] = useState({
        title: "",
        description: "",
        subCategoryGroup: "Commercial",       
        subCategory: "Mixed use development",          
        floorCount: "",
        length: "",
        width: "",
        height: "",
        rooms: "",
        price: "",
        planImageURLs: [],
        finalImageURLs: [],
        featured: false,        
        newListing: false,      
        premium: false,
  });
  const [planFiles, setPlanFiles] = useState(null);
  const [finalFiles, setFinalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    switch(category) {
      case "Commercial": return <Building className="w-5 h-5" />;
      case "Residential": return <Home className="w-5 h-5" />;
      case "Social": return <Heart className="w-5 h-5" />;
      case "Interior": return <Palette className="w-5 h-5" />;
      case "Renovation": return <Wrench className="w-5 h-5" />;
      default: return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Reset subcategory when main category changes
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

    // Append text fields
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('price', Number(formData.price));
    uploadData.append('rooms', formData.rooms);
    uploadData.append('subCategoryGroup', formData.subCategoryGroup);
    uploadData.append('subCategory', formData.subCategory);
    uploadData.append('premium', formData.premium);
    uploadData.append('featured', formData.featured);
    uploadData.append('newListing', formData.newListing);

    // Append ALL images under the key "images" (matches backend multer)
    if (planFiles) {
      Array.from(planFiles).forEach(file => uploadData.append('planImages', file));
    }
    if (finalFiles) {
      Array.from(finalFiles).forEach(file => uploadData.append('finalImages', file));
    }

    // Send request
    const res = await fetch(`${API_BASE_URL}/api/plans/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // keep auth
      },
      body: uploadData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to upload project');
    }

    alert('Project uploaded successfully!');

    // Reset state
    setFormData({
      title: "",
      description: "",
      subCategoryGroup: "Commercial",
      subCategory: "Mixed use development",
      floorCount: "",
      length: "",
      width: "",
      height: "",
      rooms: "",
      price: "",
      planImageURLs: [],
      finalImageURLs: [],
      featured: false,
      newListing: false,
      premium: false,
    });
    setPlanFiles(null);
    setFinalFiles([]);
  } catch (error) {
    console.error("Upload failed", error);
    alert(`Upload failed: ${error.message}`);
  }

  setUploading(false);
};

  const subOptions = categoryOptions[formData.subCategoryGroup] || [];
  const showSubCategory = subOptions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-lime-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Upload New Project</h1>
            </div>
            <p className="text-emerald-100 mt-2">Share your amazing work with the community</p>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Project Title */}
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
              />
            </div>

            {/* Description */}
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
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none resize-vertical"
              />
            </div>

            {/* Category Selection */}
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none bg-white"
                >
                  {Object.keys(categoryOptions).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none bg-white"
                  >
                    {subOptions.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Number of Rooms</label>
                <input
                  name="rooms"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Length (m)</label>
                <input
                  name="length"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.length}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Width (m)</label>
                <input
                  name="width"
                  type="number"
                  placeholder="e.g., 12"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Height (m)</label>
                <input
                  name="height"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Price (KES)</label>
              <input
                name="price"
                type="number"
                placeholder="e.g., 2500000"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 outline-none"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Image className="w-4 h-4" />
                  Plan Images (2-5 images)
                </label>
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPlanFiles(e.target.files)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload your architectural plans and blueprints
                  </p>
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
                    accept="image/*"
                    multiple
                    onChange={(e) => setFinalFiles(e.target.files)}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload photos of your completed project
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProject;