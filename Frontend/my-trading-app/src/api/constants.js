export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:8001';

export const LOGIN_URL = `${API_BASE_URL}/login`;
export const SIGNUP_URL = `${API_BASE_URL}/signup`;
export const REFRESH_TOKEN_URL = `${API_BASE_URL}/token/refresh`;
export const PROFILE_URL = `${API_BASE_URL}/user`;
export const USER_ASSETS_URL = `${API_BASE_URL}/user-assets`;
export const ASSETS_URL = `${API_BASE_URL}/assets`;
export const USER_FUNDS_URL = `${API_BASE_URL}/user-funds`;
export const TRANSACTION_CREATE_URL = `${API_BASE_URL}/transactions/create`;
export const TRANSACTION_LIST_URL = `${API_BASE_URL}/transactions/list`;
export const RESET_PASSWORD_URL = `${API_BASE_URL}/reset-password`
