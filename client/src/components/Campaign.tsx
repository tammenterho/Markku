import { Modal, Stack, Text, Badge } from "@mantine/core";

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

interface CampaignProps {
  campaign: Campaign | null;
  opened: boolean;
  onClose: () => void;
}

const Campaign = ({ campaign, opened, onClose }: CampaignProps) => {
  return (
    <Modal opened={opened} onClose={onClose} title={campaign?.name} size="lg">
      {campaign && (
        <Stack gap="md">
          <div>
            <Text fw={500}>Yritys</Text>
            <Text>{campaign.company}</Text>
          </div>
          <div>
            <Text fw={500}>Asiakas</Text>
            <Text>{campaign.customer}</Text>
          </div>
          <div>
            <Text fw={500}>Otsikko</Text>
            <Text>{campaign.title}</Text>
          </div>
          <div>
            <Text fw={500}>Kopiointiaa</Text>
            <Text>{campaign.copyText}</Text>
          </div>
          <div>
            <Text fw={500}>Kohderyhmä</Text>
            <Text>{campaign.targetAge}</Text>
          </div>
          <div>
            <Text fw={500}>Kohdealue</Text>
            <Text>{campaign.targetArea}</Text>
          </div>
          <div>
            <Text fw={500}>Budjetti</Text>
            <Text>{campaign.budget}€</Text>
          </div>
          <div>
            <Text fw={500}>Kampanja alkaa</Text>
            <Text>{new Date(campaign.start).toLocaleDateString()}</Text>
          </div>
          <div>
            <Text fw={500}>Kampanja päättyy</Text>
            <Text>{new Date(campaign.end).toLocaleDateString()}</Text>
          </div>
          <div>
            <Text fw={500}>Tyyppi</Text>
            <Badge>{campaign.type}</Badge>
          </div>
          <div>
            <Text fw={500}>Tila</Text>
            {campaign.status === "Y" ? (
              <Badge color="green">Aktiivinen</Badge>
            ) : (
              <Badge color="red">Ei aktiivinen</Badge>
            )}
          </div>
        </Stack>
      )}
    </Modal>
  );
};

export default Campaign;
