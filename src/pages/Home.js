import React from "react";
import { Link } from "react-router-dom";
import jsxRuntime from "react/jsx-runtime";

const Home = () => (
    <div style={{ padding: "3rem", textAlign: "center" }}>
        <h1>Welcome to Our Building Consultancy</h1>
        <p>Explore our key service areas:</p>
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "2rem"}}>
            <Link to="/architecture" style={btnStyle}>Architecture</Link>
            <Link to="/structures" style={btnStyle}>Structures</Link>
            <Link to="/bqs" style={btnStyle}>Bill of Quantities</Link>
        </div>
    </div>
);

const btnStyle = {
    padding: "1rem 2rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
};

export default Home;