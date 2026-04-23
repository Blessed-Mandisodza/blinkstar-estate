import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const normalizeUser = (userData) =>
  userData
    ? {
        ...userData,
        _id: userData._id || userData.id,
        id: userData.id || userData._id,
      }
    : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    const nextUser = normalizeUser(userData);
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("token", token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  }, []);

  const updateUser = useCallback((userData) => {
    const nextUser = normalizeUser(userData);
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
