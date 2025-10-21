import api from "../services/api";
import cloudinary from "cloudinary-core";

import { USER_FUNDS_URL, USER_ASSETS_URL, ASSETS_URL } from "./constants";

const cloudinaryCore = new cloudinary.Cloudinary({
  cloud_name: "your_cloud_name",
});

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset");

  try {
    const response = await fetch(cloudinaryCore.url("image/upload", {}, true), {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw new Error("Error uploading image to Cloudinary");
  }
};

export const fetchUserFunds = async () => {
  try {
    const response = await api.get(USER_FUNDS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching user funds:", error);
    return { amount: 0 };
  }
};

export const fetchUserAssets = async () => {
  try {
    const response = await api.get(USER_ASSETS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching user assets:", error);
    return [];
  }
};

export const fetchAssets = async () => {
  try {
    const response = await api.get(ASSETS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
};
