import {
  Modal,
  Stack,
  Text,
  Badge,
  TextInput,
  Textarea,
  Button,
  Group,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { useEffect } from "react";
import axios from "axios";

export interface Campaign {
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
  onUpdate: () => void;
}

const Campaign = ({ campaign, opened, onClose, onUpdate }: CampaignProps) => {
  const form = useForm({
    initialValues: {
      company: "",
      customer: "",
      name: "",
      title: "",
      copyText: "",
      targetAge: "",
      targetArea: "",
      budget: 0,
      start: null as Date | null,
      end: null as Date | null,
    },
  });

  useEffect(() => {
    if (campaign) {
      form.setValues({
        company: campaign.company,
        customer: campaign.customer,
        name: campaign.name,
        title: campaign.title,
        copyText: campaign.copyText,
        targetAge: campaign.targetAge,
        targetArea: campaign.targetArea,
        budget: campaign.budget,
        start: campaign.start ? new Date(campaign.start) : null,
        end: campaign.end ? new Date(campaign.end) : null,
      });
    }
  }, [campaign, opened]);

  const handleUpdate = async (values: typeof form.values) => {
    if (!campaign) return;

    try {
      await axios.patch(
        `http://localhost:3000/campaigns/${campaign.id}`,
        values,
      );
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Muokkaa: ${campaign?.name}`}
      size="lg"
    >
      {campaign && (
        <form onSubmit={form.onSubmit(handleUpdate)}>
          <Stack gap="md">
            <TextInput label="Yritys" {...form.getInputProps("company")} />
            <TextInput label="Asiakas" {...form.getInputProps("customer")} />
            <TextInput label="Otsikko" {...form.getInputProps("title")} />
            <Textarea label="Kopio" {...form.getInputProps("copyText")} />
            <TextInput
              label="Kohderyhmä"
              {...form.getInputProps("targetAge")}
            />
            <TextInput
              label="Kohdealue"
              {...form.getInputProps("targetArea")}
            />
            <NumberInput
              label="Budjetti (€)"
              {...form.getInputProps("budget")}
            />
            <DatePickerInput
              label="Kampanja alkaa"
              {...form.getInputProps("start")}
            />
            <DatePickerInput
              label="Kampanja päättyy"
              {...form.getInputProps("end")}
            />
            <Group justify="flex-end" mt="md">
              <Button onClick={onClose} variant="default">
                Peruuta
              </Button>
              <Button type="submit">Tallenna muutokset</Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};

export default Campaign;
