"use client";

import { useEffect, useState } from "react";

interface Car {
  id: string; // Changed to string to match UUID from API
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
  seller_id?: string; // Optional fields from API
  created_at?: string;
  is_sold?: boolean;
}

export default function CarComponent() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<Omit<Car, "id" | "seller_id" | "created_at" | "is_sold">>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    description: "",
    color: "",
    fuel_type: "",
    transmission: "",
    image: "",
  });

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError("");
      const baseUrl = process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";
      const token = document.cookie.split("access_token=")[1]?.split(";")[0] || "";
      console.log("Fetching cars from:", `${baseUrl}/cars`);
      console.log("Token present:", !!token ? "Yes" : "No");

      try {
        const res = await fetch(`${baseUrl}/cars`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", res.status);
        const text = await res.text();
        console.log("Raw response:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Received non-JSON response: " + text.substring(0, 100));
        }

        console.log("Parsed data:", data);
        if (!res.ok) throw new Error(data.message || `Failed with status ${res.status}`);

        // Handle raw array response
        if (Array.isArray(data)) {
          setCars(data);
        } else {
          throw new Error("Unexpected data format: Expected an array of cars");
        }
      } catch (e: any) {
        console.error("Fetch error:", e);
        setError(e.message || "An error occurred while fetching cars");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["year", "price", "mileage"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const baseUrl = process.env.CAR_BASE_URL || "https://car-nextjs-api.cheatdev.online";
    const token = document.cookie.split("access_token=")[1]?.split(";")[0] || "";

    try {
      const res = await fetch(`${baseUrl}/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Post response status:", res.status);
      const text = await res.text();
      console.log("Raw post response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Received non-JSON response: " + text.substring(0, 100));
      }

      if (!res.ok) throw new Error(data.message || `Failed with status ${res.status}`);
      setCars((prev) => [...prev, data.car]);
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        description: "",
        color: "",
        fuel_type: "",
        transmission: "",
        image: "",
      });
    } catch (e: any) {
      console.error("Post error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Add a New Car</h2>
        {["make", "model", "color", "fuel_type", "transmission", "image"].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace("_", " ")}
            value={(formData as any)[field]}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        ))}
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="mileage"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="Mileage"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Car"}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Cars</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : cars.length === 0 ? (
          <p>No cars available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="border rounded shadow p-4 bg-white">
                <img
                  src={car.image || "https://via.placeholder.com/150"} // Fallback for empty image
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-semibold">
                  {car.make} {car.model} ({car.year})
                </h3>
                <p className="text-sm text-gray-600">{car.description}</p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1">
                  <li>Price: ${car.price}</li>
                  <li>Mileage: {car.mileage} km</li>
                  <li>Color: {car.color}</li>
                  <li>Fuel: {car.fuel_type}</li>
                  <li>Transmission: {car.transmission}</li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
