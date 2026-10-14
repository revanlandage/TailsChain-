import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Auto attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto handle 401 (token expired)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

// ===== AUTH APIs =====
export const loginAPI      = (data) => API.post("/auth/login", data);
export const registerAPI   = (data) => API.post("/auth/register", data);
export const getMeAPI      = ()     => API.get("/auth/me");
export const updateWalletAPI = (walletAddress) => API.patch("/auth/wallet", { walletAddress });

// ===== ANIMALS APIs =====
export const getAnimalsAPI    = (category) => API.get("/animals", { params: category && category !== "all" ? { category } : {} });
export const getAnimalByIdAPI = (id)       => API.get(`/animals/${id}`);
export const addAnimalAPI     = (data)     => API.post("/animals", data);
export const updateAnimalAPI  = (id, data) => API.put(`/animals/${id}`, data);
export const deleteAnimalAPI  = (id)       => API.delete(`/animals/${id}`);

// ===== ADOPTIONS APIs =====
export const submitAdoptionAPI    = (data)       => API.post("/adoptions", data);
export const getMyAdoptionsAPI    = ()            => API.get("/adoptions/my");

export default API;

// ===== DONATION APIs =====
export const createDonationOrderAPI = (amount) => API.post("/donation/create-order", { amount });
export const verifyDonationAPI      = (data)   => API.post("/donation/verify", data);
