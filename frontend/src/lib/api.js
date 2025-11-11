// src/lib/api.js
const LOCALHOST_URL = import.meta.env.VITE_API_BASE_URL;
const LAN_URL = "http://192.168.3.102:5000"; 

export const API_BASE_URL =
  window.location.hostname === "localhost" ? LOCALHOST_URL : LAN_URL;
