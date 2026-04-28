import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  showInfoNotification,
  showSuccessNotification,
} from "../components/common/NotificationToast";
import OneSignal from "react-onesignal";

interface User {
  token: string;
  id: number;
  role: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => User;
  logout: () => void;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        const userData = {
          token: token,
          id: decoded.id_account,
          role: decoded.role,
          email: decoded.email,
          username: decoded.username,
        };
        setUser(userData);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setIsInitializing(false);

    const handleAuthLogout = () => {
      logout();
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, []);

  // OneSignal synchronization
  useEffect(() => {
    if (isInitializing) return;

    const syncOneSignal = async () => {
      await new Promise((res) => setTimeout(res, 500));

      try {
        if (user) {
          await OneSignal.login(user.id.toString());
        } else {
          await OneSignal.logout();
        }
      } catch (error) {
        console.error("OneSignal sync error:", error);
      }
    };

    syncOneSignal();
  }, [user, isInitializing]);

  const login = (token: string) => {
    localStorage.setItem("token", token);

    const decoded: any = jwtDecode(token);

    const userData = {
      token,
      id: decoded.id_account,
      role: decoded.role,
      email: decoded.email,
      username: decoded.username,
    };

    setUser(userData);

    showSuccessNotification(
      "Logged In successfully",
      `Welcome back, ${userData.username}.`,
    );
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
    <AuthContext.Provider value={{ user, login, logout, isInitializing }}>
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
