// src/components/ImageUploader.jsx
import React, { useState, useRef, useEffect, useId } from "react";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext"; // ✅ AuthContext only
import { Upload, X, AlertCircle, CheckCircle2, ImageIcon, Trash2 } from "lucide-react";

const MAX_SIZE_MB = 5;
const MAX_FILES   = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ─── Inline alert ────────────────────────────────────────────── */
function InlineAlert({ type, message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-red-50   border-red-200   text-red-700",
    success: "bg-brand-50 border-brand-200 text-brand-800",
  };
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-start gap-2.5 p-3 border rounded-xl text-sm ${styles[type]}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/* ─── Inline confirm dialog (replaces window.confirm) ────────── */
function InlineConfirm({ message, onConfirm, onCancel }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ic-msg"
      className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center gap-2 p-2 z-10"
    >
      <p id="ic-msg" className="text-white text-xs font-medium text-center leading-snug">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
          autoFocus
        >
          Remove
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition focus:outline-none focus:ring-2 focus:ring-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Image tile ──────────────────────────────────────────────── */
function ImageTile({ src, alt, badge, onRemove, removeLabel, deletingUrl }) {
  const [confirming, setConfirming] = useState(false);

  const handleRemoveClick = () => {
    if (onRemove.isAsync) {
      setConfirming(true); // existing image — confirm first
    } else {
      onRemove.fn();        // preview — remove immediately
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border-2 border-brand-200 bg-gray-50">
      <img
        src={src}
        alt={alt}
        className="w-full h-24 object-cover"
        loading="lazy"
      />

      {/* ✅ Bug fix: remove button always visible on touch, fades on hover for desktop */}
      <button
        onClick={handleRemoveClick}
        disabled={deletingUrl === src}
        aria-label={removeLabel}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center
          opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
          disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
      >
        {deletingUrl === src
          ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
          : <X className="w-3 h-3" aria-hidden="true" />
        }
      </button>

      {badge && (
        <div className="absolute bottom-1.5 left-1.5 bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-md font-semibold pointer-events-none">
          {badge}
        </div>
      )}

      {/* Inline confirm overlay */}
      {confirming && (
        <InlineConfirm
          message="Remove this image?"
          onConfirm={() => { setConfirming(false); onRemove.fn(); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function ImageUploader({
  listingId,
  existingImages = [],
  onUploadComplete,
}) {
  const { token } = useAuth(); // ✅ no prop, no localStorage
  const uid        = useId();
  const inputRef   = useRef(null);
  const mountedRef = useRef(true); // ✅ unmount guard

  const [previews,    setPreviews]    = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [deletingUrl, setDeletingUrl] = useState(""); // URL currently being deleted
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  // ✅ Bug fix: prevent setState on unmounted component
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Revoke any remaining object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── File validation ── */
  const validateFiles = (files) => {
    const errors = [];
    const valid  = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: only JPG, PNG, WebP allowed`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: exceeds ${MAX_SIZE_MB} MB limit`);
        continue;
      }
      valid.push(file);
    }
    return { valid, errors };
  };

  /* ── File select ── */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setError("");
    setSuccess("");

    if (!files.length) return;

    const totalAfter = previews.length + existingImages.length + files.length;
    if (totalAfter > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed (${existingImages.length + previews.length} already selected).`);
      return;
    }

    const { valid, errors } = validateFiles(files);
    if (errors.length > 0) { setError(errors.join(" ")); return; }

    const newPreviews = valid.map((file) => ({
      file,
      url:  URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ── Remove preview ── */
  const removePreview = (index) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ── Upload new images ── */
  const handleUpload = async () => {
    if (previews.length === 0) return setError("Select at least one image first.");
    if (!listingId)            return setError("Listing must be created before uploading images.");

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    previews.forEach((p) => formData.append("images", p.file));

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload/listing/${listingId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // ✅ no localStorage
        body: formData,
        // Do NOT set Content-Type — browser sets it with multipart boundary
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed. Please try again.");

      // Clean up object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));

      if (mountedRef.current) {
        setPreviews([]);
        setSuccess(`${data.images?.length ?? previews.length} image(s) uploaded successfully.`);
        onUploadComplete?.(data.allImages);
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };

  /* ── Delete existing image ── */
  const handleDeleteExisting = async (imageUrl) => {
    if (!listingId) return;
    setDeletingUrl(imageUrl); // ✅ Bug fix: prevents double-click duplicate requests
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload/listing/${listingId}/image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to remove image.");

      if (mountedRef.current) onUploadComplete?.(data.allImages);
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setDeletingUrl("");
    }
  };

  const totalCount    = existingImages.length + previews.length;
  const remainingSlots = MAX_FILES - totalCount;
  const inputId       = `${uid}-file-input`;

  return (
    <div className="space-y-5">

      {/* Alerts */}
      <InlineAlert type="error"   message={error}   />
      <InlineAlert type="success" message={success} />

      {/* Existing images */}
      {existingImages.length > 0 && (
        <section aria-label="Current uploaded images">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Current Images
            <span className="text-gray-400 font-normal ml-1">({existingImages.length})</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {existingImages.map((url, i) => (
              <ImageTile
                key={url}
                src={url}
                alt={`Uploaded image ${i + 1}`}
                removeLabel={`Remove uploaded image ${i + 1}`}
                deletingUrl={deletingUrl}
                onRemove={{
                  isAsync: true,
                  fn: () => handleDeleteExisting(url),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* New image previews */}
      {previews.length > 0 && (
        <section aria-label="Images ready to upload">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Ready to Upload
            <span className="text-gray-400 font-normal ml-1">({previews.length})</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {previews.map((p, i) => (
              <ImageTile
                key={p.url}
                src={p.url}
                alt={p.name}
                badge="New"
                removeLabel={`Remove ${p.name} from upload queue`}
                deletingUrl=""
                onRemove={{
                  isAsync: false,
                  fn: () => removePreview(i),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Drop zone — ✅ Bug fix: proper <label> for keyboard accessibility */}
      {remainingSlots > 0 && (
        <div>
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center border-2 border-dashed border-brand-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors group focus-within:ring-2 focus-within:ring-brand-400"
          >
            <ImageIcon
              className="w-10 h-10 text-brand-200 group-hover:text-brand-400 transition-colors mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-gray-600 mb-1 group-hover:text-brand-700 transition-colors">
              Click to select images
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG or WebP — max {MAX_SIZE_MB} MB each
            </p>
            <p className="text-xs text-brand-500 font-medium mt-1">
              {remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} remaining (max {MAX_FILES})
            </p>
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
              aria-label="Select images to upload"
            />
          </label>
        </div>
      )}

      {remainingSlots === 0 && (
        <p role="status" className="text-xs text-center text-gray-400">
          Maximum {MAX_FILES} images reached. Remove an existing image to add more.
        </p>
      )}

      {/* Upload button */}
      {previews.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          aria-busy={uploading}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md"
        >
          {uploading ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              Uploading {previews.length} image{previews.length !== 1 ? "s" : ""}…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" aria-hidden="true" />
              Upload {previews.length} image{previews.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}