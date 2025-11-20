import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../app/store"

// API
import {
  logout,
  userInfo,
  clearError,
} from "../../features/auth/authSlice"

const AuthListener = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { authData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!authData.isAuthenticated || !localStorage.getItem("token")) {
      dispatch(clearError())
      localStorage.removeItem('token');
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
    }
    if (authData.token && !authData.userInfo) {
      dispatch(userInfo({ filter: `id=${localStorage.getItem('userId')}` }));
    }
  }, [authData.isAuthenticated, navigate]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" && event.newValue === null) {
        dispatch(logout());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);


  return null;
};

export default AuthListener;
