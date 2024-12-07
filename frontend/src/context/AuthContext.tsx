// /frontend/src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/axios";

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchUserData = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/auth/me");
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("authToken", token);
      fetchUserData(token);
    },
    [fetchUserData]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;