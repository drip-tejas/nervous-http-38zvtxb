import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: (token: string) => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  }, []);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("authToken", token);
      fetchUserData(token);
    },
    [fetchUserData]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      fetchUserData(storedToken);
    }
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
