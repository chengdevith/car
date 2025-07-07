"use client"

import secureLocalStorage from "react-secure-storage";

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    user: unknown;
    token: string;
    refreshToken?: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmed_password: string;
}
// handle login Data 
export const loginUser = async (loginData: LoginData): Promise<LoginResponse> => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // DETAILED DEBUG LOGGING
        console.log('=== LOGIN RESPONSE DEBUG 😎😎 ===');
        console.log('Full response data:', data);
        console.log('data.token:', data.token);
        console.log('data.access_token:', data.access_token);
        console.log('data.refreshToken:', data.refreshToken);
        console.log('data.refresh_token:', data.refresh_token);
        console.log('Available keys:', Object.keys(data));

        // Try to detect which field contains the token
        const possibleTokenFields = ['token', 'access_token', 'accessToken', 'authToken'];
        const actualTokenField = possibleTokenFields.find(field => data[field]);
        
        console.log('Detected token field:', actualTokenField);
        if (actualTokenField) {
            console.log('Token value:', data[actualTokenField]);
        } else {
            console.log('Token value: undefined');
        }

        // Store the token using the correct field
        if (actualTokenField && data[actualTokenField]) {
            secureLocalStorage.setItem("authToken", data[actualTokenField]);
            console.log('Token stored successfully');
        } else {
            console.error('No token found in response');
        }

        secureLocalStorage.setItem("user", JSON.stringify(data.user || null));
        
        // Handle refresh token
        const refreshToken = data.refreshToken || data.refresh_token;
        if (refreshToken) {
            secureLocalStorage.setItem("refreshToken", refreshToken);
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Enhanced getAuthToken with more debugging
export const getAuthToken = (): string | null => {
    try {
        if (typeof window === 'undefined') {
            console.log('getAuthToken: Running on server side');
            return null;
        }
        
        console.log('=== GET AUTH TOKEN DEBUG ===');
        
        // Check all possible storage keys
        const possibleKeys = ['authToken', '@secure.s.user', 'token', 'access_token'];
        
        for (const key of possibleKeys) {
            const value = secureLocalStorage.getItem(key) as string | null;
            console.log(`Storage key "${key}":`, value ? `Found (${value.substring(0, 20)}...)` : 'Not found');
            
            if (value) {
                console.log(`Using token from key: ${key}`);
                return value;
            }
        }
        
        console.log('No token found in any storage key');
        return null;
        
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export const getUser = (): unknown | null => {
    try {
        if (typeof window === 'undefined') return null;
        
        const user = secureLocalStorage.getItem("user") as string | null;
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const getRefreshToken = (): string | null => {
    try {
        if (typeof window === 'undefined') return null;
        
        return secureLocalStorage.getItem("refreshToken") as string | null;
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
};

export const logout = (): void => {
    try {
        // Clear all possible token keys
        const keysToRemove = ['authToken', '@secure.s.user', 'token', 'access_token', 'refreshToken', 'refresh_token', 'user'];
        
        keysToRemove.forEach(key => {
            try {
                secureLocalStorage.removeItem(key);
            } catch (e) {
                console.warn(`Failed to remove key ${key}:`, e);
            }
        });
        
        // Redirect to login
        window.location.href = '/login';
    } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = '/login';
    }
};

export const isAuthenticated = (): boolean => {
    const token = getAuthToken();
    return !!token;
};

export const registerUser = async (signupData: SignupData): Promise<any> => {
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

