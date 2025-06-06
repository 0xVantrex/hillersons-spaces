import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import UploadProject from "./pages/UploadProject";
import ArchitecturePage from "./pages/ArchitecturePage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<div><h1>Welcome to Building Consultancy</h1></div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<UploadProject />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/architecture" element={< ArchitecturePage />} />
    </Routes>
  );
}

export default App;
