import React from "react";

const ProjectCard = ({ project }) => (
  <div style={{
    background: "#fff", borderRadius: "12px", overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.3s"
  }}>
    {project.fileURL.includes("video") ? (
      <video src={project.fileURL} controls style={{ width: "100%", height: "200px", objectFit: "cover" }} />
    ) : (
      <img src={project.fileURL} alt={project.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
    )}
    <div style={{ padding: "20px" }}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span style={{
        display: "inline-block", background: "#007BFF", color: "#fff",
        padding: "5px 10px", borderRadius: "6px", fontSize: "0.8rem"
      }}>{project.category}</span>
    </div>
  </div>
);

export default ProjectCard;
