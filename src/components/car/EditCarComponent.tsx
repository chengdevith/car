"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCarById, updateCar } from "@/lib/car";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditCarComponent() {
  const router = useRouter();

  const [carId, setCarId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    model: "",
    year: "",
    color: "",
  });
  const [carLoaded, setCarLoaded] = useState(false);

  const fetchCar = async () => {
    if (!carId) return;
    setLoading(true);

    try {
      const car = await getCarById(carId);
      setForm({
        name: car.name,
        model: car.model,
        year: car.year.toString(),
        color: car.color,
      });
      setCarLoaded(true);
    } catch (err) {
      console.error("Error fetching car:", err);
      alert("Car not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCar(carId, {
        ...form,
        year: parseInt(form.year),
      });
      alert("Car updated successfully!");
      router.push("/cars");
    } catch (err) {
      console.error("Error updating car:", err);
      alert("Failed to update car.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold text-center">Edit Car</h1>

      {!carLoaded && (
        <>
          <Input
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            placeholder="Enter Car ID"
          />
          <Button className="w-full" onClick={fetchCar} disabled={loading}>
            {loading ? "Loading..." : "Fetch Car"}
          </Button>
        </>
      )}

      {carLoaded && (
        <>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Car Name" />
          <Input name="model" value={form.model} onChange={handleChange} placeholder="Model" />
          <Input name="year" value={form.year} onChange={handleChange} placeholder="Year" />
          <Input name="color" value={form.color} onChange={handleChange} placeholder="Color" />
          <Button className="w-full" onClick={handleUpdate}>
            Update Car
          </Button>
        </>
      )}
    </div>
  );
}
