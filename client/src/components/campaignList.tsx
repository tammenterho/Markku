import axios from "axios";
import { useEffect, useState } from "react";
import {
  Table,
  Container,
  Loader,
  Text,
  TextInput,
  Group,
  Button,
  Menu,
  Checkbox,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleMinus,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconTrash,
  IconColumns,
} from "@tabler/icons-react";
import Campaign, { type Campaign as CampaignType } from "./Campaign";
import classes from "./campaignList.module.css";

type SortKey = keyof CampaignType | null;
type SortDirection = "asc" | "desc";
type FilterType = "all" | "past" | "current" | "future";

export const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);

  const [columns, setColumns] = useState([
    { key: "company", label: "Yritys", visible: true },
    { key: "name", label: "Nimi", visible: true },
    { key: "title", label: "Otsikko", visible: true },
    { key: "start", label: "Alku pvm", visible: true },
    { key: "end", label: "Loppu pvm", visible: true },
    { key: "budget", label: "Budjetti", visible: true },
    { key: "type", label: "Tyyppi", visible: true },
    { key: "status", label: "Tila", visible: true },
    { key: "actions", label: "Poista", visible: true },
    // Hidden by default
    { key: "id", label: "ID", visible: false },
    { key: "clientId", label: "Client ID", visible: false },
    { key: "companyId", label: "Company ID", visible: false },
    { key: "customer", label: "Asiakas", visible: false },
    { key: "payer", label: "Maksaja", visible: false },
    { key: "copyText", label: "Teksti", visible: false },
    { key: "mediaInfo", label: "Media Info", visible: false },
    { key: "url", label: "URL", visible: false },
    { key: "cta", label: "CTA", visible: false },
    { key: "targetAge", label: "Kohdeikä", visible: false },
    { key: "targetGender", label: "Sukupuoli", visible: false },
    { key: "targetArea", label: "Alue", visible: false },
    { key: "budgetPeriod", label: "Budjettikausi", visible: false },
    { key: "createdAt", label: "Luotu", visible: false },
    { key: "updatedAt", label: "Päivitetty", visible: false },
    { key: "createdBy", label: "Luonut", visible: false },
  ]);

  const fetchCampaigns = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchCampaigns();
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

  const searchedCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase();
    return (
      campaign.company.toLowerCase().includes(query) ||
      campaign.name.toLowerCase().includes(query) ||
      campaign.title.toLowerCase().includes(query) ||
      campaign.customer.toLowerCase().includes(query) ||
      campaign.type.toLowerCase().includes(query)
    );
  });

  const filteredCampaigns = searchedCampaigns.filter((campaign) => {
    if (filter === "all") {
      return true;
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(campaign.start);
    const end = new Date(campaign.end);

    switch (filter) {
      case "past":
        return end < now;
      case "current":
        return start <= now && end >= now;
      case "future":
        return start > now;
      default:
        return true;
    }
  });

  const handleStatusUpdate = async (
    e: React.MouseEvent,
    campaignToUpdate: CampaignType,
  ) => {
    e.stopPropagation();
    const newStatus = !campaignToUpdate.status;
    try {
      await axios.patch(
        `http://localhost:3000/campaigns/${campaignToUpdate.id}`,
        { status: newStatus },
      );
      setCampaigns(
        campaigns.map((c) =>
          c.id === campaignToUpdate.id ? { ...c, status: newStatus } : c,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Haluatko varmasti poistaa tämän kampanjan?")) {
      try {
        await axios.delete(`http://localhost:3000/campaigns/${id}`);
        setCampaigns(campaigns.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

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

    const aValue = a[sortKey];
    const bValue = b[sortKey];

    // Handle budget as numerical sorting
    if (sortKey === "budget") {
      const aNum =
        typeof aValue === "string" ? parseFloat(aValue) : Number(aValue);
      const bNum =
        typeof bValue === "string" ? parseFloat(bValue) : Number(bValue);
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

  const SortableHeader = ({
    label,
    sortBy,
  }: {
    label: string;
    sortBy: SortKey;
  }) => (
    <Table.Th
      onClick={() => handleSort(sortBy)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <Group gap="xs" justify="flex-start">
        <span>{label}</span>
        {sortKey === sortBy &&
          (sortDirection === "asc" ? <IconChevronUp /> : <IconChevronDown />)}
      </Group>
    </Table.Th>
  );

  const rows = sortedCampaigns.map((campaign) => (
    <Table.Tr
      key={campaign.id}
      onClick={() => {
        setSelectedCampaign(campaign);
        setModalOpened(true);
      }}
      style={{ cursor: "pointer" }}
    >
      {columns
        .filter((c) => c.visible)
        .map((col) => {
          if (col.key === "actions") {
            return (
              <Table.Td key={col.key}>
                <IconTrash
                  className={classes.trashIcon}
                  onClick={(e) => handleDelete(e, campaign.id)}
                />
              </Table.Td>
            );
          }
          if (col.key === "status") {
            return (
              <Table.Td key={col.key}>
                <div
                  onClick={(e) => handleStatusUpdate(e, campaign)}
                  style={{ display: "inline-block" }}
                >
                  {campaign.status ? (
                    <IconCircleCheck color="green" />
                  ) : (
                    <IconCircleMinus color="red" />
                  )}
                </div>
              </Table.Td>
            );
          }
          let content: any = campaign[col.key as keyof CampaignType];
          if (
            col.key === "start" ||
            col.key === "end" ||
            col.key === "createdAt" ||
            col.key === "updatedAt"
          ) {
            content = new Date(content as Date).toLocaleDateString();
          } else if (col.key === "budget") {
            content = `${content}€`;
          }
          return <Table.Td key={col.key}>{content}</Table.Td>;
        })}
    </Table.Tr>
  ));

  return (
    <div style={{ width: "100%" }}>
      <h1>Kampanjat</h1>
      <Group mb="md">
        <Button
          variant={filter === "all" ? "filled" : "outline"}
          onClick={() => setFilter("all")}
        >
          Kaikki
        </Button>
        <Button
          variant={filter === "past" ? "filled" : "outline"}
          onClick={() => setFilter("past")}
        >
          Menneet
        </Button>
        <Button
          variant={filter === "current" ? "filled" : "outline"}
          onClick={() => setFilter("current")}
        >
          Käynnissä
        </Button>
        <Button
          variant={filter === "future" ? "filled" : "outline"}
          onClick={() => setFilter("future")}
        >
          Tulevat
        </Button>
      </Group>
      <Group mb="md">
        <TextInput
          placeholder="Hae kampanjaa..."
          leftSection={<IconSearch />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Menu shadow="md" width={200} closeOnItemClick={false}>
          <Menu.Target>
            <Button variant="default" leftSection={<IconColumns size={16} />}>
              Sarakkeet
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Näytä sarakkeet</Menu.Label>
            {columns.map((col, index) => (
              <Menu.Item
                key={col.key}
                onClick={() => {
                  const newColumns = [...columns];
                  newColumns[index].visible = !newColumns[index].visible;
                  setColumns(newColumns);
                }}
              >
                <Checkbox
                  label={col.label}
                  checked={col.visible}
                  readOnly
                  style={{ pointerEvents: "none" }}
                />
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
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
              {columns
                .filter((c) => c.visible)
                .map((col) =>
                  col.key === "actions" ? (
                    <Table.Th key={col.key}>{col.label}</Table.Th>
                  ) : (
                    <SortableHeader
                      key={col.key}
                      label={col.label}
                      sortBy={col.key as SortKey}
                    />
                  ),
                )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      <Campaign
        campaign={selectedCampaign}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onUpdate={fetchCampaigns}
      />
    </div>
  );
};
