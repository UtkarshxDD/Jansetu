const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? "http://localhost:8000" 
  : import.meta.env.VITE_API_BASE_URL || "https://jan-setu-backend.vercel.app";

export const API: string = `${API_BASE_URL}/api/v1/users`;
export const FEED_API: string = `${API_BASE_URL}/api/v1/feed`;
export const ADMIN_API: string = `${API_BASE_URL}/api/v1/admin`;
export const CAMPAIGN_API: string = `${API_BASE_URL}/api/v1/campaign`;