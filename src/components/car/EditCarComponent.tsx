"use client";

import { useState, useEffect } from "react";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  description: string;
  color: string;
  fuel_type: string;
  transmission: string;
  image: string;
  seller_id?: string;
  created_at?: string;
  is_sold?: boolean;
}

interface EditCarComponentProps {
  car: Car;
  onUpdate: (updatedCar: Car) => void;
  onCancel: () => void;
}

export default function EditCarComponent({ car, onUpdate, onCancel }: EditCarComponentProps) {
  const [formData, setFormData] = useState<Partial<Car>>({
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    mileage: car.mileage,
    description: car.description,
    color: car.color,
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    image: car.image,
    is_sold: car.is_sold || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSellerId, setUserSellerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const baseUrl = process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";
      const token = document.cookie.split("access_token=")[1]?.split(";")[0] || "";
      console.log("Token present:", !!token ? "Yes" : "No");

      try {
        const userRes = await fetch(`${baseUrl}/user`, { // Adjust endpoint as needed (e.g., /me)
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const userData = await userRes.json();
        if (userRes.ok && userData.seller_id) {
          setUserSellerId(userData.seller_id);
        } else {
          throw new Error("Failed to fetch user info");
        }
      } catch (e) {
        console.error("User fetch error:", e);
        setError("Unable to verify user identity");
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;

    setFormData((prev) => {
      let updatedValue: string | number | boolean = value;

      if (type === "checkbox" && "checked" in target) {
        updatedValue = target.checked; // boolean for is_sold
      } else if (["year", "price", "mileage"].includes(name)) {
        updatedValue = Number(value); // number for year, price, mileage
      }

      // Ensure name is a keyof Car
      if (name in prev) {
        return {
          ...prev,
          [name as keyof Car]: updatedValue,
        };
      }
      return prev; // Fallback if name is invalid
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSellerId || car.seller_id !== userSellerId) {
      setError("You are not authorized to edit this car");
      return;
    }

    setLoading(true);
    setError("");

    const baseUrl = process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";
    const token = document.cookie.split("access_token=")[1]?.split(";")[0] || "";

    try {
      const res = await fetch(`${baseUrl}/cars/${car.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Put response status:", res.status);
      const text = await res.text();
      console.log("Raw put response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Received non-JSON response: " + text.substring(0, 100));
      }

      if (!res.ok) throw new Error(data.message || `Failed with status ${res.status}`);
      onUpdate({ ...car, ...formData }); // Pass updated car to parent
      onCancel(); // Close the edit form
    } catch (e: any) {
      console.error("Put error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userSellerId) return <p>Loading user info...</p>;
  if (car.seller_id !== userSellerId) return <p className="text-red-600">You are not authorized to edit this car</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Edit Car</h2>
      {(["make", "model", "color", "fuel_type", "transmission", "image"] as const).map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field.replace("_", " ")}
          value={(formData[field] as string | undefined) ?? ""}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      ))}
      <input
        type="number"
        name="year"
        value={formData.year || 0}
        onChange={handleChange}
        placeholder="Year"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="price"
        value={formData.price || 0}
        onChange={handleChange}
        placeholder="Price"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="number"
        name="mileage"
        value={formData.mileage || 0}
        onChange={handleChange}
        placeholder="Mileage"
        className="w-full border px-3 py-2 rounded"
      />
      <textarea
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border px-3 py-2 rounded"
        rows={3}
      />
      <label className="block">
        <input
          type="checkbox"
          name="is_sold"
          checked={formData.is_sold || false}
          onChange={handleChange}
          className="mr-2"
        />
        Sold
      </label>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Car"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}