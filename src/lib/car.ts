// lib/cars.ts
const API_URL = process.env.NEXT_PUBLIC_CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";

function getToken() {
  return document.cookie.split("access_token=")[1]?.split(";")[0] || "";
}

export const getCarById = async (id: string) => {
  const res = await fetch(`${API_URL}/cars/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch car");
  return await res.json();
};

export async function updateCar(id: string, carData: any) {
  const res = await fetch(`/api/car/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carData),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Update error:", data); // Log for debugging
    throw new Error(data.message || "Failed to update car");
  }

  return data;
}


export const createCar = async (carData: any) => {
  const res = await fetch(`${API_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(carData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create car");
  return data;
};
