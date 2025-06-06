import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ProjectCard from "../components/ProjectCard"; // ✅ this is key

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const projectData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectData);
    };

    fetchProjects();
  }, []);

  return (
    <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "1.5rem",
  padding: "2rem 1rem"
}}>
  {projects.map(project => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
  );
};

export default ProjectsPage;
