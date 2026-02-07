import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  NumberInput,
  Text,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { useEffect } from "react";
import { Title } from "@mantine/core";
import axios from "axios";

export type CampaignType = "AD" | "POST";
export type BudgetPeriod = "DAY" | "DURATION";

export interface Campaign {
  id: string;
  clientId: string;
  companyId: string;
  company: string;
  customer: string;
  name: string;
  payer: string;
  title: string;
  copyText: string;
  mediaInfo: string;
  url: string;
  cta: string;
  targetAge: string;
  targetGender: string;
  targetArea: string;
  budget: number;
  budgetPeriod: BudgetPeriod;
  start: Date;
  end: Date;
  status: boolean;
  type: CampaignType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface CampaignProps {
  campaign: Campaign | null;
  opened: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${day}.${month}.${year} klo. ${hours}:${minutes}`;
};

const typeLabels: Record<CampaignType, string> = {
  AD: "Mainos",
  POST: "Postaus",
};

const budgetPeriodLabels: Record<BudgetPeriod, string> = {
  DAY: "Päiväbudjetti",
  DURATION: "Koko mainoksen kesto",
};

const Campaign = ({ campaign, opened, onClose, onUpdate }: CampaignProps) => {
  const form = useForm({
    initialValues: {
      company: "",
      customer: "",
      name: "",
      payer: "",
      title: "",
      copyText: "",
      targetAge: "",
      targetGender: "",
      targetArea: "",
      budget: 0,
      mediaInfo: "",
      url: "",
      cta: "",
      budgetPeriod: "",
      start: null as Date | null,
      end: null as Date | null,
    },
  });

  useEffect(() => {
    if (campaign) {
      const parseRangeToDisplay = (r: string) => {
        const nums = r.match(/\d+/g);
        return nums && nums.length >= 2 ? `${nums[0]}-${nums[1]}` : r;
      };

      form.setValues({
        company: campaign.company,
        customer: campaign.customer,
        name: campaign.name,
        payer: campaign.payer,
        title: campaign.title,
        copyText: campaign.copyText,
        mediaInfo: campaign.mediaInfo,
        url: campaign.url,
        cta: campaign.cta,
        targetAge:
          typeof campaign.targetAge === "string"
            ? parseRangeToDisplay(campaign.targetAge)
            : campaign.targetAge,
        targetGender: campaign.targetGender,
        targetArea: campaign.targetArea,
        budget: campaign.budget,
        budgetPeriod: campaign.budgetPeriod,
        start: campaign.start ? new Date(campaign.start) : null,
        end: campaign.end ? new Date(campaign.end) : null,
      });
    }
  }, [campaign, opened]);

  const handleUpdate = async (values: typeof form.values) => {
    if (!campaign) return;

    try {
      const payload = { ...values } as any;
      if (typeof values.targetAge === "string") {
        const m = values.targetAge.match(/^(\d+)-(\d+)$/);
        if (m) {
          const lower = Number(m[1]);
          const upper = Number(m[2]);
          // convert to int4range string, using exclusive upper bound like '[lower,upper)'
          payload.targetAge = `[${lower},${upper})`;
        }
      }

      await axios.patch(
        `http://localhost:3000/campaigns/${campaign.id}`,
        payload,
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
          <Text size="sm" fs={"italic"}>
            Luonut: {campaign.createdBy} {formatDate(campaign.createdAt)}
          </Text>
          <Text size="sm" fs={"italic"}>
            Tyyppi: {typeLabels[campaign.type]}
          </Text>
          <Stack gap="md" mt={"lg"}>
            <Title order={5}>Yleiset</Title>
            <TextInput label="Nimi" {...form.getInputProps("name")} />
            <TextInput label="Yritys" {...form.getInputProps("company")} />
            <TextInput label="Asiakas" {...form.getInputProps("customer")} />
            <TextInput label="Maksaja" {...form.getInputProps("payer")} />
            <NumberInput
              label="Budjetti (€)"
              {...form.getInputProps("budget")}
            />
            <Select
              label="Budjetin käyttö"
              data={[
                { value: "DAY", label: budgetPeriodLabels.DAY },
                { value: "DURATION", label: budgetPeriodLabels.DURATION },
              ]}
              {...form.getInputProps("budgetPeriod")}
            />
            <DatePickerInput
              label="Kampanja alkaa"
              {...form.getInputProps("start")}
            />
            <DatePickerInput
              label="Kampanja päättyy"
              {...form.getInputProps("end")}
            />
            <Title order={5}>Mainonnan kohde</Title>
            <TextInput label="Ikä" {...form.getInputProps("targetAge")} />
            <TextInput
              label="Sukupuoli"
              {...form.getInputProps("targetGender")}
            />
            <TextInput label="Alue" {...form.getInputProps("targetArea")} />
            <Title order={5}>Mainostiedot</Title>
            <TextInput label="Otsikko" {...form.getInputProps("title")} />
            <Textarea
              label={campaign.type === "AD" ? "Mainosteksti" : "Caption"}
              {...form.getInputProps("copyText")}
            />
            <TextInput
              label="Mediatiedot"
              {...form.getInputProps("mediaInfo")}
            />
            <TextInput label="url" {...form.getInputProps("url")} />
            <TextInput label="cta" {...form.getInputProps("cta")} />
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
