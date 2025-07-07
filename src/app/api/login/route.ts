import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("=== LOGIN API DEBUG 😎 ===");
    console.log("Request body:", {
      email,
      password: password ? "***" : "missing",
    });
    console.log("CAR_BASE_URL:", process.env.CAR_BASE_URL);

    const response = await fetch(`${process.env.CAR_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("External API response status:", response.status);
    console.log("External API response ok:", response.ok);

    const data = await response.json();
    console.log("External API response data:", data);

    if (!response.ok) {
      console.error("Login failed:", data);
      return NextResponse.json(
        {
          message: data.message || "Failed to login",
          error: data.error || "Authentication failed",
        },
        { status: response.status }
      );
    }

    const accessToken = data?.access_token || null;
    const refreshToken = data?.refresh_token || null;
    const user = data?.user || null;

    console.log("Extracted tokens:");
    console.log("- accessToken:", accessToken ? "Found" : "Missing");
    console.log("- refreshToken:", refreshToken ? "Found" : "Missing");
    console.log("- user:", user ? "Found" : "Missing");

    if (accessToken) {
      const cookieStore = await cookies(); // Await the cookies promise
      cookieStore.set("access_token", accessToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    // Return response in the format your frontend expects
    const responseData = {
      message: "Login Successfully",
      token: accessToken,
      refreshToken: refreshToken,
      user: user,
    };

    console.log("Sending response:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error,
      },
      { status: 500 }
    );
  }
}