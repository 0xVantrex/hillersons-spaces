import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import UploadProject from "./pages/UploadProject";
import ProductDetail from "./pages/productDetail";
import AllProducts from "./pages/AllProducts";
import Categories from "./pages/Categories";
import CategoryListing from "./pages/CategoryListing";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./App/cart/page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div><h1>Welcome to Building Consultancy</h1></div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<UploadProject />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/productDetail" element={< ProductDetail />}/>
      <Route path="/category/:mainCategory" element={<CategoryListing />} />
      <Route path="/category/:mainCategory/:subCategory" element={<CategoryListing />} />
      <Route path="/AllProducts" element={<AllProducts/>}/>
      <Route path="/Categories" element={<Categories/>}/>
      <Route path="/CategoryListing" element={<CategoryListing/>}/>
      <Route path="/admin/dashboard" element={<AdminDashboard /> } />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/quick-buy/:id" element={<CartPage/>} />
    </Routes>
  );
}
export default App;
