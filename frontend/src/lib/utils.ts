import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiErrorMessage(error: any): string {
  if (error?.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data) && data.length > 0) {
      // Pydantic Validation Error
      const firstError = data[0];
      // Pydantic errors have 'loc' (list of location parts) and 'msg'
      const loc = firstError.loc ? firstError.loc.filter((l: any) => l !== 'body').join('.') : '';
      return `${loc ? loc + ': ' : ''}${firstError.msg}`;
    }
    if (data.message) {
      return data.message;
    }
  }
  return error?.message || "An unknown error occurred";
}
