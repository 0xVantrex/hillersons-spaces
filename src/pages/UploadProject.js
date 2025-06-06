import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp }from "firebase/firestore";
import axios from "axios";
import { reauthenticateWithCredential } from "firebase/auth";

const UploadProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topLevelCategory: "Architecture",
    subCategory: "Mixed use development",
    floorCount: "",
    length: "",
    width: "",
    height: "",
    rooms: "",
    price: "",
    planImageURL: "",
    finalImageURLs: "",
    mainCategory: "",
    subCategoryForInterior: "",
    mainCategoryForRenovation: "",
    subCategoryForRenovation: "",
  });
  const [planFile, setplanFile] = useState(null);
  const [finalFiles, setfinalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const subCategoryOptions = {
    "Commercial Projects": [
      "Mixed use development",
      "Office park",
      "Commercial plaza",
      "Retail shops",
      "Godowns & warehouses",
      "Service station",
      "Hospitality devlopment",
    ],
    "Residential Projects": [
      "Residential apartment development",
      "Residential house development",
      "Residential estate development",
    ],
    "Social Amenities Projects": [
      "Hospital development",
      "Education facility development",
      "Social market development",
      "Religion facility develpment",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "project_upload");

    const res =await axios.post(
      "https://api.cloudinary.com/v1_1/dbj7nhyy4/auto/upload",
      data
    );
    return res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const planImageURL= await handleUpload(planFile);

      const finalImageURLs = await Promise.all(
        Array.from(finalFiles).map((file) => handleUpload(file))
      );

      await addDoc(collection(db, "projects"), {
        ...formData,
        planImageURL,
        finalImageURLs,
        createdAt: serverTimestamp(),
      });
      alert("Project uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        topLevelCategory: "Architecture",
        subCategory: "Mixed use development",
        floorCount: "",
        length: "",
        width: "",
        height: "",
        rooms: "",
        price: "",
        planImageURL: "",
        finalImageURLs: "",
        mainCategory: "",
        subCategoryForInterior: "",
        mainCategoryForRenovation: "",
        subCategoryForRenovation: "",
      });
      setplanFile(null);
      setfinalFiles([]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    }
    setUploading(false);
  };
  const subGroups = 
  formData.topLevelCategory === "Architecture"
    ? ["Commercial Projects", "Residential Projects", "Social Amenities Projects"]
    : [formData.topLevelCategory];

  const subOptions = subCategoryOptions[formData.subCategoryGroup] || [];

  return (
    <div style = {styles.container}>
      <h2 style={styles.heading}>Upload a New Project</h2>
      <form onSubmit= {handleSubmit} style= {styles.form}>
        <input
          name="title"
          placeholder="Project Title"
          value={formData.title}
          onChange={handleChange}
          required
          styles={styles.input}
         />
         <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          style={styles.textarea}
         />
         <input
          name="rooms"
          placeholder="Number of Rooms"
          value={formData.rooms}
          onChange={handleChange}
          required
          style={styles.input}
         />
         <input
         name="floorCount"
         placeholder="Floor Count"
         value={formData.floorCount}
         onChange={handleChange}
         required
         style={styles.input}
         />
         <input
         name="length"
         placeholder="Length (m/ft)"
         value={formData.length}
         onChange={handleChange}
         required
         style={styles.input}
         />
         <input
         name="width"
         placeholder="Width (m/ft)"
         value={formData.width}
         onChange={handleChange}
         required
         style={styles.input}
         />
         <input
         name="height"
         placeholder="Height"
         value={formData.height}
         onChange={handleChange}
         required
         style={styles.input}
         />
         <input
         name="price"
         placeholder="Price (KES/USD)"
         value={formData.price}
         onChange={handleChange}
         required
         style={styles.input}
         />

         <label style={styles.label}> Top Level Category</label>
         <select 
          name="topLevelCategory"
          value={formData.topLevelCategory}
          onChange={handleChange}
          style={styles.select}
          >
            <option>Architecture</option>
            <option>Interior Design</option>
            <option>Renovation Work</option>
          </select>

          {formData.topLevelCategory === "Architecture" && (
            <>
            <label style={styles.label}>Sub Category Group</label>
            <select
              name="subCategoryGroup"
              value={formData.subCategoryGroup}
              onChange={handleChange}
              style={styles.select}
              >
                {subGroups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
                </select>
                
                <label style={styles.label}> Sub Category</label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  style={styles.select}
                  >
                    {subOptions.map((sub) => (
                      <option key={sub}>{sub}</option>
                    ))}

                  </select>
                </>
          )}

          {formData.topLevelCategory === "Interior Design" && (
            <>
            <label style={styles.label}>Main Category (e.g. Living Room, Kitchen) </label>
            <input 
              name="mainCategory"
              placeholder="Main Category"
              value={formData.mainCategory}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="subCategoryForInterior"
              placeholder="Sub Category (optional)"
              value={formData.subCategoryForInterior}
              onChange={handleChange}
              style={styles.input}
            />  

              </>
          )}

          {formData.topLevelCategory === "Renovation Work" && (
            <>
            <label style={styles.label}>Main Category (e.g. Roof Repair)</label>
            <input
              name="mainCategoryForRenovation"
              placeholder="Main Category"
              value={formData.mainCategoryForRenovation}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              name="subCategoryForRenovation"
              placeholder="Sub Category (optional)"
              value={formData.mainCategoryForRenovation}
              onChange={handleChange}
              style={styles.input}
              required
              />
            </>
          )}

          <label style={styles.label}>Plan Image (Drawn Plan)</label>
          <input
            type='file'
            accept="image/*"
            onChange={(e) => setplanFile(e.target.files[0])}
            required
            style={styles.fileInput}
            />

            <label style={styles.label}>Final Product Images (3-5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setfinalFiles(e.target.files)}
              required
              style={styles.fileInput}
              />

              <button type="submit" disabled={uploading} style={styles.button}>
                {uploading ? "Uploading..." : "Upload Project"}
              </button>
            </form>
    </div>
  );

};

const styles ={
  container: {
    padding: "40px 20px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",

  },
  heading: {
    fontSize: "2rem",
    color: "#333",
    textAlign: "center",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  textarea: {
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    resize: "vertical",
  },
  select: {
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#555",
  },
  fileInput: {
    marginBottom: "20px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default UploadProject;