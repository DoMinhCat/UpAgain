import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { showInfoNotification } from "../components/NotificationToast";

interface User {
  token: string;
  id: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<User>(token);

        setUser({
          token: token,
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
        });
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);

    const decoded: any = jwtDecode(token);

    const userData = {
      token,
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    showInfoNotification(
      "Logged Out Successfully",
      "You have been logged out successfully.",
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
