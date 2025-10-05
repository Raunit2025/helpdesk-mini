import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const AuthContext = createContext();

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    isAuthenticated: null,
    loading: true,
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setAuth({ token: null, isAuthenticated: false, loading: false, user: null });
        } else {
          setAuthToken(token);
          setAuth({ token: token, isAuthenticated: true, loading: false, user: decoded.user });
        }
      } catch (e) {
         localStorage.removeItem("token");
         setAuth({ token: null, isAuthenticated: false, loading: false, user: null });
      }
    } else {
      setAuth(prev => ({ ...prev, isAuthenticated: false, loading: false }));
    }
  }, []);

  const login = async (formData) => {
    setAuth(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, formData);
      const { token } = res.data;
      localStorage.setItem('token', token);
      setAuthToken(token);
      const decoded = jwtDecode(token); 
      setAuth({
        token,
        isAuthenticated: true,
        loading: false, 
        user: decoded.user, 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      setAuth(prev => ({ 
        ...prev,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false 
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setAuth({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;