import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fuel types
  const gasoline = await prisma.carFuelType.create({
    data: { name: 'Gasoline' },
  });

  const diesel = await prisma.carFuelType.create({
    data: { name: 'Diesel' },
  });

  const electric = await prisma.carFuelType.create({
    data: { name: 'Electric' },
  });

  const hybrid = await prisma.carFuelType.create({
    data: { name: 'Hybrid' },
  });

  // Cars
  await prisma.car.createMany({
    data: [
      {
        brand: 'Toyota',
        licensePlate: 'ABC-1234',
        year: 2022,
        fuelTypeId: gasoline.id,
        driverName: 'John Doe',
      },
      {
        brand: 'Honda',
        licensePlate: 'XYZ-5678',
        year: 2021,
        fuelTypeId: gasoline.id,
        driverName: 'Jane Smith',
      },
      {
        brand: 'Tesla',
        licensePlate: 'EV-0001',
        year: 2023,
        fuelTypeId: electric.id,
        driverName: 'Elon Fan',
      },
      {
        brand: 'BMW',
        licensePlate: 'BMW-9999',
        year: 2020,
        fuelTypeId: diesel.id,
        driverName: null,
      },
      {
        brand: 'Toyota',
        licensePlate: 'HYB-2024',
        year: 2024,
        fuelTypeId: hybrid.id,
        driverName: 'Sarah Green',
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
