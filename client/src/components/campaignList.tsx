import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Container, Loader, Text, TextInput } from "@mantine/core";
import { IconCircleCheck, IconCircleMinus, IconSearch } from "@tabler/icons-react";

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

  const rows = filteredCampaigns.map((campaign) => (
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
              <Table.Th>Yritys</Table.Th>
              <Table.Th>Nimi</Table.Th>
              <Table.Th>Otsikko</Table.Th>
              <Table.Th>Alku pvm</Table.Th>
              <Table.Th>Loppu pvm</Table.Th>
              <Table.Th>Budjetti</Table.Th>
              <Table.Th>Tyyppi</Table.Th>
              <Table.Th>Tila</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </div>
  );
};
