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

interface DeleteCarComponentProps {
  car: Car;
  onDelete: () => void;
  onCancel: () => void;
}

export default function DeleteCarComponent({ car, onDelete, onCancel }: DeleteCarComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSellerId, setUserSellerId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/me", { // Changed from /api/user to /api/me (adjust based on your API)
          method: "GET",
          credentials: "include", // Send cookies
        });
        console.log("User response status:", res.status);
        console.log("User response headers:", Object.fromEntries(res.headers.entries()));
        const text = await res.text(); // Get raw response text
        console.log("User response text:", text);

        if (!res.ok) {
          throw new Error(`Failed to fetch user info: Status ${res.status}`);
        }

        let userData;
        if (text) {
          try {
            userData = JSON.parse(text);
            console.log("Parsed user data:", userData);
            if (userData.seller_id) {
              setUserSellerId(userData.seller_id);
            } else {
              throw new Error("No seller_id in user data");
            }
          } catch (parseError) {
            console.warn("User response is not JSON:", text);
            throw new Error("Invalid user data format");
          }
        } else {
          throw new Error("Empty user response");
        }
      } catch (e) {
        console.error("User fetch error:", e);
        setError("Unable to verify user identity");
      }
    };
    fetchUserInfo();
  }, []);

  const handleDelete = async () => {
    if (!userSellerId || car.seller_id !== userSellerId) {
      setError("You are not authorized to delete this car");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: "DELETE",
        credentials: "include", // Send cookies
      });

      console.log("Delete response status:", res.status);
      console.log("Delete response headers:", Object.fromEntries(res.headers.entries()));
      const text = await res.text(); // Get raw response text
      console.log("Delete response text:", text);

      if (!res.ok) {
        throw new Error(`Failed to delete car: ${text || `Status ${res.status}`}`);
      }

      onDelete(); // Notify parent of successful deletion
    } catch (e: any) {
      console.error("Delete error:", e);
      setError(e.message || "An error occurred while deleting the car");
    } finally {
      setLoading(false);
      setShowConfirm(false); // Hide confirmation after action
    }
  };

  if (!userSellerId) return <p>Loading user info...</p>;
  if (car.seller_id !== userSellerId) return <p className="text-red-600">You are not authorized to delete this car</p>;

  return (
    <div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-600 text-white py-1 rounded hover:bg-red-700"
        >
          Delete
        </button>
      ) : (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <p className="text-lg">
            Are you sure you want to delete {car.make} {car.model} ({car.year})?
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-600 text-white py-1 rounded hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                onCancel();
              }}
              className="w-full bg-gray-500 text-white py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}