/**
 * api.js
 * ------
 * Thin wrapper around axios for all backend communication.
 * Centralizing this here means components never construct URLs
 * or handle raw fetch/axios errors directly.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // AI calls can take a little while
});

/**
 * Extracts a user-friendly error message from any axios error shape.
 */
function toFriendlyError(error) {
  if (error.code === "ECONNABORTED") {
    return new Error("The request timed out. Please try again.");
  }
  if (!error.response) {
    return new Error(
      "Network error: couldn't reach the server. Check your connection and that the backend is running."
    );
  }
  const backendMessage = error.response.data?.error;
  return new Error(backendMessage || "Something went wrong. Please try again.");
}

/**
 * Runs the full resume-vs-JD analysis pipeline.
 * @param {File} resumeFile - the uploaded PDF resume
 * @param {string} jobDescription - plain text job description
 */
export async function analyzeResume(resumeFile, jobDescription) {
  const formData = new FormData();
  formData.append("file", resumeFile);
  formData.append("job_description", jobDescription);

  try {
    const response = await client.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/**
 * Fetches the last few analyses performed this session.
 */
export async function fetchHistory() {
  try {
    const response = await client.get("/history");
    return response.data.history || [];
  } catch (error) {
    throw toFriendlyError(error);
  }
}

export async function checkHealth() {
  try {
    const response = await client.get("/health");
    return response.data;
  } catch (error) {
    throw toFriendlyError(error);
  }
}
