import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ArchitecturePage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(
        collection(db, "projects"),
        where("topLevelCategory", "==", "Architecture")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    };

    fetchProjects();
  }, []);

  const grouped = {};
  projects.forEach((project) => {
    const group = project.subCategoryGroup;
    const sub = project.subCategory;
    if (!grouped[group]) grouped[group] = {};
    if (!grouped[group][sub]) grouped[group][sub] = [];
    grouped[group][sub].push(project);
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Architecture Projects</h1>

      {Object.entries(grouped).map(([group, subGroups]) => (
        <div key={group} style={styles.categoryBlock}>
          <h2 style={styles.categoryTitle}>{group}</h2>
          {Object.entries(subGroups).map(([sub, projects]) => (
            <div key={sub} style={styles.subCategoryBlock}>
              <h3 style={styles.subCategoryTitle}>{sub}</h3>
              <div style={styles.projectGrid}>
                {projects.map((proj) => (
                  <div key={proj.id} style={styles.projectCard}>
                    <h4>{proj.title}</h4>
                    <p>{proj.description}</p>
                    {proj.duringDevURL && (
                      <img
                        src={proj.duringDevURL}
                        alt="During"
                        style={styles.image}
                      />
                    )}
                    {proj.afterDevURL && (
                      <img
                        src={proj.afterDevURL}
                        alt="After"
                        style={styles.image}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    fontSize: "2.5rem",
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  categoryBlock: {
    marginBottom: "40px",
  },
  categoryTitle: {
    fontSize: "1.8rem",
    color: "#007BFF",
    marginBottom: "10px",
  },
  subCategoryBlock: {
    marginBottom: "20px",
  },
  subCategoryTitle: {
    fontSize: "1.4rem",
    color: "#444",
    marginBottom: "10px",
  },
  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  projectCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%", 
    borderRadius: "6px",
    marginTop: "10px",
  },
};

export default ArchitecturePage;
