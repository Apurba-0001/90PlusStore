import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { authService } from "../services/services";

const AuthContext = createContext();

// Inactivity timeout in milliseconds (10 minutes)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Setup inactivity timer
  useEffect(() => {
    if (!user) {
      // Clear timer if user logs out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      return;
    }

    // Function to reset the inactivity timer
    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        // Logout user after inactivity
        authService.logout();
        setUser(null);
        window.location.replace("/login?timeout=true");
      }, INACTIVITY_TIMEOUT);
    };

    // Activity events to track
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "click",
      "touchstart",
      "scroll",
    ];

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initialize the timer on mount
    resetInactivityTimer();

    // Cleanup function
    return () => {
      // Remove event listeners
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });

      // Clear timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      const { token, csrfToken, user } = response.data;
      localStorage.setItem("token", token);
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await authService.register(name, email, password);
      const { token, csrfToken, user } = response.data;
      localStorage.setItem("token", token);
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const detailedMessage =
        Array.isArray(validationErrors) && validationErrors.length > 0
          ? validationErrors[0].message
          : null;
      const message =
        detailedMessage || err.response?.data?.message || "Registration failed";
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Use replace to avoid adding to browser history
    window.location.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
