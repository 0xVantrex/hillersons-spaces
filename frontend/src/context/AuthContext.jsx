import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("authToken", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  // ── Derived role helpers ───────────────────────────────────────────────────
  const isAdmin = user?.role === "admin";
  const isVendor = ["vendor", "bnbHost", "contractor"].includes(user?.role);
  const isApprovedVendor = isVendor && user?.vendorStatus === "approved";
  const isPendingVendor = isVendor && user?.vendorStatus === "pending";
  const role = user?.role || "user";
  const vendorStatus = user?.vendorStatus || "none";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        // Role helpers — use these in components instead of checking user.role directly
        isAdmin,
        isVendor,
        isApprovedVendor,
        isPendingVendor,
        role,
        vendorStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};