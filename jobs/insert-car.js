import { parentPort } from "worker_threads";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function insertMockCar() {
  console.log("Running cron task at", new Date());

  // Mock Data pools
  const brands = [
    "Mercedes-Benz",
    "BMW",
    "Audi",
    "Volkswagen",
    "Ford",
    "Chevrolet",
    "Toyota",
    "Honda",
    "Nissan",
    "Hyundai",
  ];
  const uniquePlate = `CRON-${Date.now()}`;
  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  try {
    let fuelTypes = await prisma.carFuelType.findMany();
    if (!fuelTypes.length) {
      console.warn("No fuel types found - skipping car insertion");
      throw new Error("No fuel types found");
    }

    const car = await prisma.car.create({
      data: {
        brand: brands[Math.floor(Math.random() * brands.length)],
        licensePlate: uniquePlate,
        year: years[Math.floor(Math.random() * years.length)],
        fuelTypeId: fuelTypes[Math.floor(Math.random() * fuelTypes.length)].id,
        driverName: "Youssef Tawfik",
      },
    });

    console.log("Car inserted successfully:", car);
  } catch (error) {
    console.error("Error inserting car:", error);
  } finally {
    await prisma.$disconnect();

    if (parentPort) {
      parentPort.postMessage("done");
    } else {
      process.exit(0);
    }
  }
}

insertMockCar();
