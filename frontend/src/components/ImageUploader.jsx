// src/components/ImageUploader.jsx
import React, { useState, useRef } from "react";
import { API_BASE_URL } from "../lib/api";
import { Upload, X, AlertCircle, CheckCircle2, Image } from "lucide-react";

const MAX_SIZE_MB = 5;
const MAX_FILES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader({ listingId, token, existingImages = [], onUploadComplete }) {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef(null);

  const validateFiles = (files) => {
    const errors = [];
    const valid = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: only JPG, PNG, WebP allowed`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: exceeds ${MAX_SIZE_MB}MB limit`);
        continue;
      }
      valid.push(file);
    }

    return { valid, errors };
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setError("");
    setSuccess("");

    const totalAfter = previews.length + existingImages.length + files.length;
    if (totalAfter > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed per listing`);
      return;
    }

    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    const newPreviews = valid.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePreview = (index) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return setError("Select at least one image first.");
    if (!listingId) return setError("Listing must be created before uploading images.");

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      previews.forEach((p) => formData.append("images", p.file));

      const res = await fetch(`${API_BASE_URL}/api/upload/listing/${listingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Clean up object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setSuccess(`${data.images.length} image(s) uploaded successfully`);

      if (onUploadComplete) onUploadComplete(data.allImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExisting = async (imageUrl) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload/listing/${listingId}/image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove image");
      if (onUploadComplete) onUploadComplete(data.allImages);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Current Images ({existingImages.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {existingImages.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-24 object-cover rounded-xl border border-gray-200"
                />
                {listingId && (
                  <button
                    onClick={() => handleDeleteExisting(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New image previews */}
      {previews.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Ready to upload ({previews.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative group">
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-24 object-cover rounded-xl border-2 border-emerald-300"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-lg">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone / file picker */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition"
      >
        <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-1">
          Click to select images
        </p>
        <p className="text-xs text-gray-400">
          JPG, PNG or WebP — max {MAX_SIZE_MB}MB each, up to {MAX_FILES} total
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Upload button */}
      {previews.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading {previews.length} image{previews.length > 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {previews.length} image{previews.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}