import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Loader,
  Text,
  TextInput,
  Group,
  Button,
  SegmentedControl,
  Menu,
  Checkbox,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconSearch,
  IconColumns,
  IconTriangleFilled,
  IconCircleFilled,
} from "@tabler/icons-react";
import Campaign, { type Campaign as CampaignType } from "./Campaign";
import { CampaignTable } from "./CampaignTable";
import type {
  ColumnConfig,
  ColumnKey,
  SortDirection,
  SortKey,
} from "./CampaignTable";
import { YearClock } from "./YearClock";
import { API_BASE_URL, USER_ID_HEADER } from "../utils/constants";
import { getUserId } from "../utils/auth";

type FilterType = "all" | "past" | "current" | "future";
type ViewType = "list" | "clock";

const INITIAL_COLUMNS: ColumnConfig[] = [
  { key: "company", label: "Yritys", visible: true },
  { key: "name", label: "Kampanjanimi", visible: true },
  { key: "title", label: "Otsikko", visible: true },
  { key: "start", label: "Alku pvm", visible: true },
  { key: "end", label: "Loppu pvm", visible: true },
  { key: "budget", label: "Budjetti", visible: true },
  { key: "type", label: "Tyyppi", visible: true },
  { key: "status", label: "Tila", visible: true },
  { key: "actions", label: "Toiminnot", visible: true },
  { key: "customer", label: "Asiakas", visible: false },
  { key: "payer", label: "Maksaja", visible: false },
  { key: "copyText", label: "Teksti", visible: false },
  { key: "mediaInfo", label: "Media Info", visible: false },
  { key: "url", label: "URL", visible: false },
  { key: "cta", label: "CTA", visible: false },
  { key: "targetAge", label: "Kohdeikä", visible: false },
  { key: "targetGender", label: "Sukupuoli", visible: false },
  { key: "targetArea", label: "Alue", visible: false },
  { key: "budgetPeriod", label: "Budjetin käyttö", visible: false },
  { key: "createdAt", label: "Luotu", visible: false },
  { key: "updatedAt", label: "Päivitetty", visible: false },
  { key: "createdBy", label: "Luonut", visible: false },
];

const searchCampaigns = (campaigns: CampaignType[], searchQuery: string) => {
  const query = searchQuery.toLowerCase();

  return campaigns.filter((campaign) => {
    return (
      campaign.company.toLowerCase().includes(query) ||
      campaign.name.toLowerCase().includes(query) ||
      campaign.title.toLowerCase().includes(query) ||
      campaign.customer.toLowerCase().includes(query) ||
      campaign.type.toLowerCase().includes(query)
    );
  });
};

const filterCampaigns = (campaigns: CampaignType[], filter: FilterType) => {
  return campaigns.filter((campaign) => {
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
};

const sortCampaigns = (
  campaigns: CampaignType[],
  sortKey: SortKey,
  sortDirection: SortDirection,
) => {
  return [...campaigns].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = a[sortKey];
    const bValue = b[sortKey];

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
};

const getEmptyMessage = (searchQuery: string, filter: FilterType) => {
  if (searchQuery.trim()) {
    return `Ei kampanjoita löytynyt haulla "${searchQuery}"`;
  }

  switch (filter) {
    case "future":
      return "Ei tulevia kampanjoita";
    case "past":
      return "Ei menneitä kampanjoita";
    case "current":
      return "Ei kampanjoita käynnissä";
    default:
      return "Ei kampanjoita";
  }
};

const CampaignFilterButtons = ({
  filter,
  isMobile,
  onFilterChange,
}: {
  filter: FilterType;
  isMobile: boolean;
  onFilterChange: (next: FilterType) => void;
}) => (
  <Group mb="md">
    <Button
      variant={filter === "all" ? "filled" : "outline"}
      onClick={() => onFilterChange("all")}
    >
      Kaikki
    </Button>
    <Button
      variant={filter === "past" ? "filled" : "outline"}
      onClick={() => onFilterChange("past")}
      aria-label="Menneet"
      leftSection={
        !isMobile ? (
          <IconTriangleFilled size={12} style={{ transform: "rotate(-90deg)" }} />
        ) : undefined
      }
    >
      {isMobile ? (
        <IconTriangleFilled size={12} style={{ transform: "rotate(-90deg)" }} />
      ) : (
        "Menneet"
      )}
    </Button>
    <Button
      variant={filter === "current" ? "filled" : "outline"}
      onClick={() => onFilterChange("current")}
      aria-label="Käynnissä"
      leftSection={!isMobile ? <IconCircleFilled size={10} /> : undefined}
    >
      {isMobile ? <IconCircleFilled size={10} /> : "Käynnissä"}
    </Button>
    <Button
      variant={filter === "future" ? "filled" : "outline"}
      onClick={() => onFilterChange("future")}
      aria-label="Tulevat"
      leftSection={
        !isMobile ? (
          <IconTriangleFilled size={12} style={{ transform: "rotate(90deg)" }} />
        ) : undefined
      }
    >
      {isMobile ? (
        <IconTriangleFilled size={12} style={{ transform: "rotate(90deg)" }} />
      ) : (
        "Tulevat"
      )}
    </Button>
  </Group>
);

const CampaignSearchAndColumns = ({
  searchQuery,
  columns,
  onSearchChange,
  onToggleColumn,
}: {
  searchQuery: string;
  columns: ColumnConfig[];
  onSearchChange: (value: string) => void;
  onToggleColumn: (key: ColumnKey) => void;
}) => (
  <Group mb="md">
    <TextInput
      placeholder="Hae kampanjaa..."
      leftSection={<IconSearch />}
      value={searchQuery}
      onChange={(e) => onSearchChange(e.currentTarget.value)}
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
        {columns.map((col) => (
          <Menu.Item key={col.key} onClick={() => onToggleColumn(col.key)}>
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
);

export const CampaignList = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [view, setView] = useState<ViewType>("list");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);

  const fetchCampaigns = () => {
    setLoading(true);

    // Hae käyttäjän id tallennuksesta
    const userId = getUserId();

    axios
      .get(`${API_BASE_URL}/campaigns`, {
        headers: userId ? { [USER_ID_HEADER]: userId } : {},
      })
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

  const searchedCampaigns = useMemo(
    () => searchCampaigns(campaigns, searchQuery),
    [campaigns, searchQuery],
  );

  const filteredCampaigns = useMemo(
    () => filterCampaigns(searchedCampaigns, filter),
    [searchedCampaigns, filter],
  );

  const handleStatusUpdate = async (
    e: React.MouseEvent,
    campaignToUpdate: CampaignType,
  ) => {
    e.stopPropagation();
    const newStatus = !campaignToUpdate.status;
    const userId = getUserId();

    try {
      await axios.patch(
        `${API_BASE_URL}/campaigns/${campaignToUpdate.id}`,
        { status: newStatus },
        { headers: userId ? { [USER_ID_HEADER]: userId } : {} },
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

  const handleCopy = (e: React.MouseEvent, campaign: CampaignType) => {
    e.stopPropagation();
    const copiedCampaign = {
      ...campaign,
      id: "",
      name: `${campaign.name} (Kopio)`,
    };
    navigate("/new", { state: { campaign: copiedCampaign } });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Haluatko varmasti poistaa tämän kampanjan?")) {
      const userId = getUserId();

      try {
        await axios.delete(`${API_BASE_URL}/campaigns/${id}`, {
          headers: userId ? { [USER_ID_HEADER]: userId } : {},
        });
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

  const sortedCampaigns = useMemo(
    () => sortCampaigns(filteredCampaigns, sortKey, sortDirection),
    [filteredCampaigns, sortKey, sortDirection],
  );

  const toggleColumnVisibility = (columnKey: ColumnKey) => {
    setColumns((prev) =>
      prev.map((column) =>
        column.key === columnKey
          ? { ...column, visible: !column.visible }
          : column,
      ),
    );
  };

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

  return (
    <div style={{ width: "100%" }}>
      <h1>Kampanjat</h1>
      <SegmentedControl
        mb="md"
        value={view}
        onChange={(val) => setView(val as ViewType)}
        radius="xl"
        size="md"
        data={[
          { value: "list", label: "Lista" },
          { value: "clock", label: "Vuosikello" },
        ]}
      />

      {view === "clock" ? (
        <YearClock campaigns={campaigns} onUpdate={fetchCampaigns} />
      ) : (
        <>
          <CampaignFilterButtons
            filter={filter}
            isMobile={isMobile}
            onFilterChange={setFilter}
          />
          <CampaignSearchAndColumns
            searchQuery={searchQuery}
            columns={columns}
            onSearchChange={setSearchQuery}
            onToggleColumn={toggleColumnVisibility}
          />
          {filteredCampaigns.length === 0 ? (
            <Text>{getEmptyMessage(searchQuery, filter)}</Text>
          ) : (
            <CampaignTable
              campaigns={sortedCampaigns}
              columns={columns}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              onSelectCampaign={(campaign) => {
                setSelectedCampaign(campaign);
                setModalOpened(true);
              }}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onStatusToggle={handleStatusUpdate}
            />
          )}
        </>
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
