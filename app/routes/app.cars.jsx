import { useState, useCallback, useMemo } from "react";
import { useLoaderData } from "react-router";
import {
  Page,
  Card,
  IndexTable,
  IndexFilters,
  useSetIndexFiltersMode,
  Text,
  ChoiceList,
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

const tabs = [
  { id: "all", content: "All", filter: [] },
  { id: "electric", content: "Electric", filter: ["Electric"] },
  { id: "hybrid", content: "Hybrid", filter: ["Hybrid"] },
  { id: "gasoline", content: "Gasoline", filter: ["Gasoline"] },
  { id: "diesel", content: "Diesel", filter: ["Diesel"] },
];

export default function CarsPage() {
  const { cars } = useLoaderData();

  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["id asc"]);
  const [fuelTypeFilter, setFuelTypeFilter] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const { mode, setMode } = useSetIndexFiltersMode();

  const handleTabChange = useCallback((index) => {
    setSelectedTab(index);
    setFuelTypeFilter(tabs[index].filter);
  }, []);

  const sortOptions = [
    { label: "ID", value: "id asc", directionLabel: "Ascending", direction: "asc" },
    { label: "ID", value: "id desc", directionLabel: "Descending", direction: "desc" },
    { label: "Brand", value: "brand asc", directionLabel: "A-Z", direction: "asc" },
    { label: "Brand", value: "brand desc", directionLabel: "Z-A", direction: "desc" },
    { label: "Year", value: "year asc", directionLabel: "Oldest first", direction: "asc" },
    { label: "Year", value: "year desc", directionLabel: "Newest first", direction: "desc" },
  ];

  const fuelTypeChoices = [
    { label: "Gasoline", value: "Gasoline" },
    { label: "Diesel", value: "Diesel" },
    { label: "Electric", value: "Electric" },
    { label: "Hybrid", value: "Hybrid" },
  ];

  const filters = [
    {
      key: "fuelType",
      label: "Fuel Type",
      filter: (
        <ChoiceList
          title="Fuel Type"
          titleHidden
          choices={fuelTypeChoices}
          selected={fuelTypeFilter}
          onChange={setFuelTypeFilter}
          allowMultiple
        />
      ),
      shortcut: false,
    },
  ];

  const appliedFilters = fuelTypeFilter.length > 0
    ? [
        {
          key: "fuelType",
          label: `Fuel Type: ${fuelTypeFilter.join(", ")}`,
          onRemove: () => setFuelTypeFilter([]),
        },
      ]
    : [];

  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortSelected(value);
  }, []);

  const handleClearAll = useCallback(() => {
    setQueryValue("");
    setFuelTypeFilter([]);
    setSelectedTab(0);
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

    // Apply fuel type filter
    if (fuelTypeFilter.length > 0) {
      result = result.filter((car) =>
        fuelTypeFilter.includes(car.fuelType.name)
      );
    }

    // Apply sorting
    const [sortKey, sortDirection] = sortSelected[0].split(" ");
    const numericFields = ["id", "year"];
    const isNumeric = numericFields.includes(sortKey);
    const direction = sortDirection === "asc" ? 1 : -1;

    result.sort((a, b) => {
      return String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, {
        sensitivity: "base",
        numeric: isNumeric,
      }) * direction;
    });

    return result;
  }, [cars, queryValue, fuelTypeFilter, sortSelected]);

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
    <Page title="Cars">
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
          tabs={tabs}
          selected={selectedTab}
          onSelect={handleTabChange}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
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
