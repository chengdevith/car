import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const response = await fetch(
    `${process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online"}/cars/${params.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Failed to update car" },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}
