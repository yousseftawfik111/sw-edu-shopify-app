import { useState, useCallback, useMemo } from "react";
import { useLoaderData } from "react-router";
import {
  Page,
  Card,
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
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

  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["id asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();

  const sortOptions = [
    { label: "ID", value: "id asc", directionLabel: "Ascending", direction: "asc" },
    { label: "ID", value: "id desc", directionLabel: "Descending", direction: "desc" },
    { label: "Brand", value: "brand asc", directionLabel: "A-Z", direction: "asc" },
    { label: "Brand", value: "brand desc", directionLabel: "Z-A", direction: "desc" },
    { label: "Year", value: "year asc", directionLabel: "Oldest first", direction: "asc" },
    { label: "Year", value: "year desc", directionLabel: "Newest first", direction: "desc" },
  ];

  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortSelected(value);
  }, []);

  const filteredAndSortedCars = useMemo(() => {
    let result = [...cars];

    // Apply search filter
    if (queryValue) {
      const searchLower = queryValue.toLowerCase();
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchLower) ||
          car.licensePlate.toLowerCase().includes(searchLower) ||
          car.driverName?.toLowerCase().includes(searchLower) ||
          car.year.toString().includes(searchLower) ||
          car.fuelType.name.toLowerCase().includes(searchLower)
      );
    }

    // Sorting constants
    const SORT_BEFORE = -1;
    const SORT_AFTER = 1;
    const SORT_EQUAL = 0;

    // Fields to sort
    const numericFields = ["id", "year"];
    const stringFields = ["brand"];

    // Apply sorting
    const [sortKey, sortDirection] = sortSelected[0].split(" ");
    result.sort((a, b) => {
      let aVal, bVal;

      if (numericFields.includes(sortKey)) {
        aVal = a[sortKey];
        bVal = b[sortKey];
      } else if (stringFields.includes(sortKey)) {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      } else {
        return SORT_EQUAL;
      }

      if (aVal < bVal) return sortDirection === "asc" ? SORT_BEFORE : SORT_AFTER;
      if (aVal > bVal) return sortDirection === "asc" ? SORT_AFTER : SORT_BEFORE;
      return SORT_EQUAL;
    });

    return result;
  }, [cars, queryValue, sortSelected]);

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

  const rowMarkup = filteredAndSortedCars.map((car, index) => (
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
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          onSort={handleSortChange}
          queryValue={queryValue}
          queryPlaceholder="Search cars..."
          onQueryChange={handleQueryChange}
          onQueryClear={handleQueryClear}
          mode={mode}
          setMode={setMode}
          tabs={[]}
          selected={0}
          filters={[]}
          onClearAll={handleQueryClear}
          canCreateNewView={false}
        />
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredAndSortedCars.length}
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
