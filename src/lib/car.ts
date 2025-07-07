export const createCar = async (carData: any) => {
  const response = await fetch(`${process.env.CAR_BASE_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${document.cookie.split("access_token=")[1]?.split(";")[0] || ""}`,
    },
    body: JSON.stringify(carData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};