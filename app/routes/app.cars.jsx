import { useLoaderData } from "react-router";
import {
  Page,
  Card,
  IndexTable,
  Text,
} from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const cars = await prisma.car.findMany({
    include: {
      fuelType: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return { cars };
};

export default function CarsPage() {
  const { cars } = useLoaderData();

  const resourceName = {
    singular: "car",
    plural: "cars",
  };

  const headings = [
    { title: "ID" },
    { title: "Brand" },
    { title: "License Plate" },
    { title: "Year" },
    { title: "Driver Name" },
    { title: "Fuel Type" },
  ];

  const rowMarkup = cars.map((car, index) => (
    <IndexTable.Row id={car.id.toString()} key={car.id} position={index}>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold">
          {car.id}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{car.brand}</IndexTable.Cell>
      <IndexTable.Cell>{car.licensePlate}</IndexTable.Cell>
      <IndexTable.Cell>{car.year}</IndexTable.Cell>
      <IndexTable.Cell>{car.driverName || "—"}</IndexTable.Cell>
      <IndexTable.Cell>{car.fuelType.name}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Cars" fullWidth>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={cars.length}
          headings={headings}
          selectable={false}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
