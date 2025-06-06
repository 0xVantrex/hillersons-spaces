// src/utils/cloudinaryUpload.js
import axios from "axios";

const cloudName = "dbj7nhyy4"; // your cloud name
const uploadPreset = "project_upload"; // your unsigned upload preset

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset); // REQUIRED
  formData.append("folder", "projects"); // Optional: folders within Cloudinary

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );

    console.log("✅ Cloudinary upload success:", response.data.secure_url);
    return response.data.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed", error.response?.data || error.message);
    throw error;
  }
};
