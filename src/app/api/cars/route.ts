import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CAR_BASE_URL = process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies(); // Await the cookies promise
  const token = cookieStore.get("access_token")?.value;
  return !!token;
}

export async function GET() {
  const auth = await isAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${CAR_BASE_URL}/cars`, {
    headers: {
      Authorization: `Bearer ${(await cookies()).get("access_token")?.value || ""}`,
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await isAuthenticated();
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const response = await fetch(`${CAR_BASE_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await cookies()).get("access_token")?.value || ""}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json(data);
}