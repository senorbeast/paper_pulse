
import { z } from "zod";
import axios, { AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchTyped<T>(
  url: string,
  schema: z.ZodType<T>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get(url, config);
  
  // Runtime Validation
  const result = schema.safeParse(response.data);
  if (!result.success) {
    console.error("API Validation Error:", result.error);
    throw new Error("API response did not match expected schema");
  }
  
  return result.data;
}

export async function postTyped<T, B>(
  url: string,
  body: B,
  schema: z.ZodType<T>,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post(url, body, config);
  
  // Runtime Validation
  const result = schema.safeParse(response.data);
  if (!result.success) {
    console.error("API Validation Error:", result.error);
    throw new Error("API response did not match expected schema");
  }
  
  return result.data;
}

export default apiClient;
