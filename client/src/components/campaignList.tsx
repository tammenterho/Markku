import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Container,
  Loader,
  Text,
  TextInput,
  Group,
  Button,
  SegmentedControl,
  Menu,
  Checkbox,
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconCircleMinus,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconTrash,
  IconColumns,
  IconCopy,
  IconTriangleFilled,
  IconCircleFilled,
} from "@tabler/icons-react";
import Campaign, { type Campaign as CampaignType } from "./Campaign";
import {
  type BudgetPeriod,
  type CampaignType as CampaignTypeLabel,
  budgetPeriodLabels,
  typeLabels,
} from "../utils/campaignLabels";
import { formatAgeRange, formatDate } from "../utils/common";
import { YearClock } from "./YearClock";
import classes from "./campaignList.module.css";
import { API_BASE_URL, STORAGE_KEYS, USER_ID_HEADER } from "../utils/constants";

type SortKey = keyof CampaignType | null;
type SortDirection = "asc" | "desc";
type FilterType = "all" | "past" | "current" | "future";
type ViewType = "list" | "clock";

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

  const [columns, setColumns] = useState([
    { key: "company", label: "Yritys", visible: true },
    { key: "name", label: "Nimi", visible: true },
    { key: "title", label: "Otsikko", visible: true },
    { key: "start", label: "Alku pvm", visible: true },
    { key: "end", label: "Loppu pvm", visible: true },
    { key: "budget", label: "Budjetti", visible: true },
    { key: "type", label: "Tyyppi", visible: true },
    { key: "status", label: "Tila", visible: true },
    { key: "actions", label: "Toiminnot", visible: true },
    // Hidden by default
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
  ]);

  const fetchCampaigns = () => {
    setLoading(true);

    // Hae käyttäjän id localStoragesta
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

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
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    console.log("Updating campaign, userId:", userId);
    console.log("Headers:", { [USER_ID_HEADER]: userId });

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
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

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
                <Group gap="xs" style={{ whiteSpace: "nowrap" }}>
                  <IconCopy
                    style={{ cursor: "pointer" }}
                    className={classes.copyIcon}
                    onClick={(e) => handleCopy(e, campaign)}
                  />
                  <IconTrash
                    className={classes.trashIcon}
                    onClick={(e) => handleDelete(e, campaign.id)}
                  />
                </Group>
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
          let content: string | number = campaign[
            col.key as keyof CampaignType
          ] as string | number;
          if (
            col.key === "start" ||
            col.key === "end" ||
            col.key === "createdAt" ||
            col.key === "updatedAt"
          ) {
            content = formatDate(content as unknown as Date);
          } else if (col.key === "budget") {
            content = `${content}€`;
          } else if (col.key === "budgetPeriod") {
            content =
              budgetPeriodLabels[content as BudgetPeriod] ??
              (content as string);
          } else if (col.key === "targetAge") {
            if (typeof content === "string") {
              content = formatAgeRange(content) || content;
            }
          } else if (col.key === "type") {
            content =
              typeLabels[content as CampaignTypeLabel] ?? (content as string);
          }
          return <Table.Td key={col.key}>{content}</Table.Td>;
        })}
    </Table.Tr>
  ));

  const getEmptyMessage = () => {
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
              aria-label="Menneet"
              leftSection={
                !isMobile ? (
                  <IconTriangleFilled
                    size={12}
                    style={{ transform: "rotate(-90deg)" }}
                  />
                ) : undefined
              }
            >
              {isMobile ? (
                <IconTriangleFilled
                  size={12}
                  style={{ transform: "rotate(-90deg)" }}
                />
              ) : (
                "Menneet"
              )}
            </Button>
            <Button
              variant={filter === "current" ? "filled" : "outline"}
              onClick={() => setFilter("current")}
              aria-label="Käynnissä"
              leftSection={
                !isMobile ? <IconCircleFilled size={10} /> : undefined
              }
            >
              {isMobile ? <IconCircleFilled size={10} /> : "Käynnissä"}
            </Button>
            <Button
              variant={filter === "future" ? "filled" : "outline"}
              onClick={() => setFilter("future")}
              aria-label="Tulevat"
              leftSection={
                !isMobile ? (
                  <IconTriangleFilled
                    size={12}
                    style={{ transform: "rotate(90deg)" }}
                  />
                ) : undefined
              }
            >
              {isMobile ? (
                <IconTriangleFilled
                  size={12}
                  style={{ transform: "rotate(90deg)" }}
                />
              ) : (
                "Tulevat"
              )}
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
                <Button
                  variant="default"
                  leftSection={<IconColumns size={16} />}
                >
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
            <Text>{getEmptyMessage()}</Text>
          ) : (
            <ScrollArea type="auto">
              <Table miw={1200} striped withTableBorder withColumnBorders>
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
            </ScrollArea>
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
