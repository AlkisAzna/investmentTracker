import axios from "axios";
import cloudinary from "cloudinary-core"; // Import Cloudinary SDK

import { REFRESH_TOKEN_URL, USER_FUNDS_URL, USER_ASSETS_URL,ASSETS_URL } from "./constants";

export function startTokenRefreshInterval() {
  const refreshToken = async () => {
    try {
      // Fetch refresh token from localStorage
      const refreshToken = localStorage.getItem("refreshToken");

      // Make an API call to refresh the token
      const response = await axios.post(REFRESH_TOKEN_URL, {
        refresh_token: refreshToken,
      });

      const { access, refresh } = response.data;

      // Update the token in localStorage
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Handle token refresh failure
    }
  };

  // Call refreshToken initially and then every 8 minutes
  refreshToken();
  const intervalId = setInterval(refreshToken, 8 * 60 * 1000);

  // Clear interval on component unmount
  return () => clearInterval(intervalId);
}

export function stopTokenRefreshInterval(intervalId) {
  clearInterval(intervalId);
}

const cloudinaryCore = new cloudinary.Cloudinary({
  cloud_name: "your_cloud_name",
});

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset"); // Set your upload preset

  try {
    const response = await fetch(cloudinaryCore.url("image/upload", {}, true), {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url; // Return the uploaded image URL
  } catch (error) {
    throw new Error("Error uploading image to Cloudinary");
  }
};

export const fetchUserFunds = async () => {
  try {
    const response = await axios.get(USER_FUNDS_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("user");
      return { amount: 0 };
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user funds:", error);
    return { amount: 0 };
  }
};

export const fetchUserAssets = async () => {
  try {
    const response = await axios.get(USER_ASSETS_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("user");
      return [];
    }

    return response.data;
  }
  catch (error) {
    console.error("Error fetching user assets:", error);
    return [];
  }
}


export const fetchAssets = async () => {
  try {
    const response = await axios.get(ASSETS_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("user");
      return [];
    }

    return response.data;
  }
  catch (error) {
    console.error("Error fetching user assets:", error);
    return [];
  }
}
