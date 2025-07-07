"use client";

import { useEffect, useState } from "react";
import DeleteCarComponent from "./DeleteCarComponent"; // Adjust path

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

export default function CarComponent() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);

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

      try {
        const res = await fetch("/api/cars", {
          method: "GET",
          credentials: "include", // ✅ ensures cookies are sent
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response: " + text);
        }

        if (!res.ok) throw new Error(data.message || `Failed with status ${res.status}`);
        if (!Array.isArray(data)) throw new Error("Expected an array of cars");

        setCars(data);
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

    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        credentials: "include", // ✅ send cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response: " + text);
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

  const startDeleting = (carId: string) => {
    setDeletingCarId(carId);
  };

  const handleDelete = () => {
    setCars((prev) => prev.filter((car) => car.id !== deletingCarId));
    setDeletingCarId(null);
  };

  const handleCancel = () => {
    setDeletingCarId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {deletingCarId && (
        <DeleteCarComponent
          car={cars.find((car) => car.id === deletingCarId)!}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      )}
      {!deletingCarId && (
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
      )}

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
                  src={car.image || "https://via.placeholder.com/150"}
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
                <button
                  onClick={() => startDeleting(car.id)}
                  className="mt-2 w-full bg-red-600 text-white py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}