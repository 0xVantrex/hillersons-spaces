import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    area: "",
    price: "",
    rooms: "",
  });
  const [sort, setSort] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    return (
      (!filters.category || p.subCategoryGroup === filters.category) &&
      (!filters.area || parseFloat(p.length || 0) * parseFloat(p.width || 0) >= parseFloat(filters.area)) &&
      (!filters.price || parseFloat(p.price || 0) <= parseFloat(filters.price)) &&
      (!filters.rooms || parseInt(p.rooms || 0) >= parseInt(filters.rooms))
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <div>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>All Products</h1>
        <p style={styles.heroText}>
          Browse our complete collection of architectural designs. Each plan is carefully crafted for functionality, beauty, and sustainability.
        </p>
      </div>

      <div style={styles.container}>
        <div style={styles.sidebar}>
          <h3>Filters</h3>
          <label>Category</label>
          <select onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All</option>
            <option value="Commercial Projects">Commercial</option>
            <option value="Residential Projects">Residential</option>
            <option value="Social Amenities Projects">Social Amenities</option>
          </select>
          <label>Min Area (sqm)</label>
          <input type="number" onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
          <label>Max Price</label>
          <input type="number" onChange={(e) => setFilters({ ...filters, price: e.target.value })} />
          <label>Min Rooms</label>
          <input type="number" onChange={(e) => setFilters({ ...filters, rooms: e.target.value })} />

          <h4 style={{ marginTop: "20px" }}>Sort By</h4>
          <select onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div style={styles.productsGrid}>
          {sortedProducts.map((p) => (
            <Link to={`/product/${p.id}`} key={p.id} style={styles.card}>
              <div
                style={{
                  ...styles.imageContainer,
                  backgroundImage: `url(${p.finalImageURLs?.[0] || ""})`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundImage = `url(${p.finalImageURLs?.[1] || p.finalImageURLs?.[0]})`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundImage = `url(${p.finalImageURLs?.[0] || ""})`)
                }
              >
                <button style={styles.buyButton}>Buy Now</button>
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardTitle}>{p.title}</h3>
                <p>Price: {p.price}</p>
                <p>⭐ {Math.floor(Math.random() * 2 + 4)} / 5 (12 Reviews)</p>
                <p>Rooms: {p.rooms}, Floors: {p.floorCount}</p>
                <p>Area: {p.length} x {p.width}, Height: {p.height}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  heroSection: {
    padding: "60px 20px",
    textAlign: "center",
    background: "url(/hero.jpg) center/cover no-repeat",
    color: "white",
  },
  heroTitle: { fontSize: "2.5rem", fontWeight: "bold" },
  heroText: { fontSize: "1.1rem", maxWidth: "700px", margin: "0 auto" },
  container: {
    display: "flex",
    flexWrap: "wrap",
    padding: "20px",
  },
  sidebar: {
    flex: "1 1 250px",
    maxWidth: "250px",
    marginRight: "20px",
  },
  productsGrid: {
    flex: "3 1 700px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    background: "#fff",
  },
  imageContainer: {
    height: "200px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    transition: "0.3s ease",
  },
  buyButton: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#007BFF",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "none",
  },
  cardInfo: {
    padding: "15px",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
};

export default AllProducts;
