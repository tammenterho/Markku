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
  SimpleGrid,
  Image,
  ActionIcon,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "dayjs/locale/fi";
import { useEffect, useRef, useState } from "react";
import { Title } from "@mantine/core";
import axios from "axios";
import { USER_ID_HEADER, API_BASE_URL } from "../utils/constants";
import { getUserId } from "../utils/auth";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import {
  type BudgetPeriod,
  type CampaignType,
  budgetPeriodLabels,
  typeLabels,
  genderOptions,
  ctaOptions,
} from "../utils/campaignLabels";

export interface Campaign {
  id: string;
  companyId: string;
  company: string;
  customer: string;
  name: string;
  payer: string;
  title: string;
  copyText: string;
  mediaInfo: string;
  imageUrls?: string[];
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

const apiBase = API_BASE_URL;

type PreviewFile = File & { preview: string; id: string };

const toPickerDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toAbsoluteUrl = (value: string): string => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("//")) {
    return `https:${normalizedValue}`;
  }

  if (apiBase.startsWith("/") && normalizedValue.startsWith(`${apiBase}/`)) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("/api/")) {
    return normalizedValue;
  }

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  ) {
    return normalizedValue;
  }
  if (normalizedValue.startsWith("/")) {
    return `${apiBase}${normalizedValue}`;
  }
  return `${apiBase}/${normalizedValue}`;
};

const getImageUrls = (mediaInfo: string): string[] => {
  if (!mediaInfo) return [];

  return mediaInfo
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter(
      (line) =>
        line.startsWith("http://") ||
        line.startsWith("https://") ||
        line.startsWith("/uploads/") ||
        /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(line),
    )
    .map(toAbsoluteUrl);
};

const Campaign = ({ campaign, opened, onClose, onUpdate }: CampaignProps) => {
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const filesRef = useRef<PreviewFile[]>([]);
  const lastInitializedCampaignKey = useRef<string>("");

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
    if (campaign && opened) {
      const initializeKey = `${campaign.id}-${campaign.updatedAt}-${opened}`;
      if (lastInitializedCampaignKey.current === initializeKey) {
        return;
      }

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
        start: toPickerDate(campaign.start),
        end: toPickerDate(campaign.end),
      });

      const initialImageUrls = (
        Array.isArray(campaign.imageUrls) && campaign.imageUrls.length > 0
          ? campaign.imageUrls
          : getImageUrls(campaign.mediaInfo)
      ).map(toAbsoluteUrl);
      setExistingImageUrls(initialImageUrls);

      filesRef.current.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
      filesRef.current = [];
      setFiles([]);

      lastInitializedCampaignKey.current = initializeKey;
    }
  }, [campaign, opened, form]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((imageUrl) => imageUrl !== url));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((file) => file.id !== id);
    });
  };

  const handleUpdate = async (values: typeof form.values) => {
    if (!campaign) return;

    try {
      let uploadedImageUrls: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await axios.post(
          `${apiBase}/photos/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (Array.isArray(uploadResponse.data?.files)) {
          uploadedImageUrls = uploadResponse.data.files
            .map((file: { url?: string; path?: string }) =>
              file.path
                ? file.path.startsWith(`${apiBase}/`) ||
                  file.path.startsWith("/api/")
                  ? file.path
                  : `${apiBase}${file.path}`
                : file.url || "",
            )
            .filter(Boolean);
        } else if (typeof uploadResponse.data?.path === "string") {
          uploadedImageUrls = [
            uploadResponse.data.path.startsWith(`${apiBase}/`) ||
            uploadResponse.data.path.startsWith("/api/")
              ? uploadResponse.data.path
              : `${apiBase}${uploadResponse.data.path}`,
          ];
        } else if (typeof uploadResponse.data?.filename === "string") {
          uploadedImageUrls = [
            `${apiBase}/uploads/${uploadResponse.data.filename}`,
          ];
        }

        if (files.length > 0 && uploadedImageUrls.length === 0) {
          throw new Error("Upload response did not contain file URLs");
        }
      }

      const imageUrls = [...existingImageUrls, ...uploadedImageUrls].filter(
        (value, index, arr) => arr.indexOf(value) === index,
      );

      const userId = getUserId();
      const payload = {
        ...values,
        imageUrls,
        start: values.start,
        end: values.end,
      };
      if (typeof values.targetAge === "string") {
        const m = values.targetAge.match(/^(\d+)-(\d+)$/);
        if (m) {
          const lower = Number(m[1]);
          const upper = Number(m[2]);
          payload.targetAge = `[${lower},${upper})`;
        }
      }

      await axios.patch(`${apiBase}/campaigns/${campaign.id}`, payload, {
        headers: userId ? { [USER_ID_HEADER]: userId } : {},
      });
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
            Luonut: {campaign.createdBy} {String(campaign.createdAt)}
          </Text>
          <Text size="sm" fs={"italic"}>
            Tyyppi: {typeLabels[campaign.type]}
          </Text>
          <Stack gap="md" mt={"lg"}>
            <Title order={5}>Yleiset</Title>
            <TextInput label="Kampanjanimi" {...form.getInputProps("name")} />
            <TextInput
              label="Yritys"
              {...form.getInputProps("company")}
              disabled
            />
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
            <DateTimePicker
              label="Kampanja alkaa"
              valueFormat="DD.MM.YYYY HH:mm"
              locale="fi"
              {...form.getInputProps("start")}
            />
            <DateTimePicker
              label="Kampanja päättyy"
              valueFormat="DD.MM.YYYY HH:mm"
              locale="fi"
              {...form.getInputProps("end")}
            />
            <Title order={5}>Mainonnan kohde</Title>
            <TextInput label="Ikä" {...form.getInputProps("targetAge")} />
            <Select
              label="Sukupuoli"
              data={genderOptions}
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
            <Dropzone
              onDrop={(acceptedFiles) => {
                setFiles((prev) => [
                  ...prev,
                  ...acceptedFiles.map((file) =>
                    Object.assign(file, {
                      preview: URL.createObjectURL(file),
                      id:
                        typeof crypto !== "undefined" &&
                        typeof crypto.randomUUID === "function"
                          ? crypto.randomUUID()
                          : `${file.name}-${file.lastModified}-${Math.random()}`,
                    }),
                  ),
                ]);
              }}
              onReject={(rejectedFiles) =>
                console.log("rejected files", rejectedFiles)
              }
              maxSize={5 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
            >
              <Group
                justify="center"
                gap="xl"
                mih={100}
                style={{ pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    size={52}
                    color="var(--mantine-color-blue-6)"
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={52}
                    color="var(--mantine-color-red-6)"
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto
                    size={52}
                    color="var(--mantine-color-dimmed)"
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Pudota tänne kuvia tai klikkaa ja valitse tiedosto
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Lisää niin monta kuvaa kuin haluat. Max. koko 5mb
                  </Text>
                </div>
              </Group>
            </Dropzone>
            {(existingImageUrls.length > 0 || files.length > 0) && (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {existingImageUrls.map((imageUrl) => (
                  <div key={imageUrl} style={{ position: "relative" }}>
                    <Image src={imageUrl} radius="md" />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      radius="xl"
                      style={{ position: "absolute", top: 5, right: 5 }}
                      onClick={() => removeExistingImage(imageUrl)}
                      aria-label="Poista olemassa oleva kuva"
                    >
                      <IconX size="70%" />
                    </ActionIcon>
                  </div>
                ))}
                {files.map((file) => (
                  <div key={file.id} style={{ position: "relative" }}>
                    <Image src={file.preview} radius="md" />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      radius="xl"
                      style={{ position: "absolute", top: 5, right: 5 }}
                      onClick={() => removeFile(file.id)}
                      aria-label="Poista lisatty kuva"
                    >
                      <IconX size="70%" />
                    </ActionIcon>
                  </div>
                ))}
              </SimpleGrid>
            )}
            <TextInput label="url" {...form.getInputProps("url")} />
            <Select
              label="Toimintakutsu"
              data={ctaOptions}
              {...form.getInputProps("cta")}
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
