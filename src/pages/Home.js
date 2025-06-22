import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Home = () => {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Your UID:", user.uid);
      } else {
        console.log("⛔ Not logged in");
      }
    });
    return unsub;
  }, []);

  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1>Welcome to Our Building Consultancy</h1>
      <p>Explore our key service areas:</p>
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
        <Link to="/architecture" style={btnStyle}>Architecture</Link>
        <Link to="/structures" style={btnStyle}>Structures</Link>
        <Link to="/bqs" style={btnStyle}>Bill of Quantities</Link>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: "1rem 2rem",
  backgroundColor: "#007BFF",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "6px",
};

export default Home;
