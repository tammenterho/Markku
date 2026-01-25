import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Container, Loader, Text, TextInput, Group } from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleMinus,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";

type SortKey = keyof Campaign | null;
type SortDirection = "asc" | "desc";

interface Campaign {
  id: string;
  clientId: string;
  companyId: string;
  company: string;
  customer: string;
  name: string;
  title: string;
  copyText: string;
  targetAge: string;
  targetArea: string;
  budget: number;
  start: Date;
  end: Date;
  status: string;
  type: string;
}

export const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    axios
      .get("http://localhost:3000/campaigns")
      .then((response) => {
        setCampaigns(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching campaigns:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Loader />
      </Container>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Container>
        <Text>No campaigns found</Text>
      </Container>
    );
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase();
    return (
      campaign.company.toLowerCase().includes(query) ||
      campaign.name.toLowerCase().includes(query) ||
      campaign.title.toLowerCase().includes(query) ||
      campaign.customer.toLowerCase().includes(query) ||
      campaign.type.toLowerCase().includes(query)
    );
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue = a[sortKey];
    let bValue = b[sortKey];

    // Handle budget as numerical sorting
    if (sortKey === "budget") {
      const aNum = typeof aValue === "string" ? parseFloat(aValue) : Number(aValue);
      const bNum = typeof bValue === "string" ? parseFloat(bValue) : Number(bValue);
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortableHeader = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <Table.Th
      onClick={() => handleSort(sortBy)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <Group gap="xs" justify="flex-start">
        <span>{label}</span>
        {sortKey === sortBy &&
          (sortDirection === "asc" ? (
            <IconChevronUp size={14} />
          ) : (
            <IconChevronDown size={14} />
          ))}
      </Group>
    </Table.Th>
  );

  const rows = sortedCampaigns.map((campaign) => (
    <Table.Tr key={campaign.id}>
      <Table.Td>{campaign.company}</Table.Td>
      <Table.Td>{campaign.name}</Table.Td>
      <Table.Td>{campaign.title}</Table.Td>
      <Table.Td>{new Date(campaign.start).toLocaleDateString()}</Table.Td>
      <Table.Td>{new Date(campaign.end).toLocaleDateString()}</Table.Td>
      <Table.Td>{campaign.budget}€</Table.Td>
      <Table.Td>{campaign.type}</Table.Td>
      <Table.Td>
        {campaign.status == "Y" ? (
          <IconCircleCheck color="green" />
        ) : (
          <IconCircleMinus color="red" />
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div style={{ width: "100%" }}>
      <h1>Kampanjat</h1>
      <TextInput
        placeholder="Hae kampanjaa..."
        leftSection={<IconSearch />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="md"
      />
      {filteredCampaigns.length === 0 ? (
        <Text>Ei kampanjoita löytynyt haulla "{searchQuery}"</Text>
      ) : (
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          verticalSpacing="md"
        >
          <Table.Thead>
            <Table.Tr>
              <SortableHeader label="Yritys" sortBy="company" />
              <SortableHeader label="Nimi" sortBy="name" />
              <SortableHeader label="Otsikko" sortBy="title" />
              <SortableHeader label="Alku pvm" sortBy="start" />
              <SortableHeader label="Loppu pvm" sortBy="end" />
              <SortableHeader label="Budjetti" sortBy="budget" />
              <SortableHeader label="Tyyppi" sortBy="type" />
              <Table.Th>Tila</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </div>
  );
};
