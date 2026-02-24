import {
  Button,
  Flex,
  Group,
  Modal,
  Radio,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
  Center,
  RangeSlider,
  Input,
  Text,
  SimpleGrid,
  Image,
  ActionIcon,
  Container,
  Box,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dropzone/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/fi";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL, IS_DEMO_APP } from "../utils/constants";
import { getUserId, getUsernameFromToken } from "../utils/auth";
import { parseLocalDate } from "../utils/common";
import { genderOptions, ctaOptions } from "../utils/campaignLabels";
import {
  IconAd,
  IconBuildingSkyscraper,
  IconPhoto,
  IconTargetArrow,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

const apiBase = API_BASE_URL;

type PreviewFile = File & { preview: string; id: string };

const CreateCampaign = () => {
  const navigate = useNavigate();
  const userId = getUserId();
  const username = getUsernameFromToken();
  const location = useLocation();
  const copiedCampaign = location.state?.campaign;
  const copiedImageUrls = Array.isArray(copiedCampaign?.imageUrls)
    ? copiedCampaign.imageUrls.filter(
        (value: unknown): value is string => typeof value === "string",
      )
    : [];

  const [files, setFiles] = useState<PreviewFile[]>([]);
  const filesRef = useRef<PreviewFile[]>([]);
  const [userCompanies, setUserCompanies] = useState<
    { id: string; name: string }[]
  >([]);
  const [createCompanyModalOpened, setCreateCompanyModalOpened] =
    useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [companyCreated, setCompanyCreated] = useState(false);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((file) => file.id !== id);
    });
  };

  const previews = files.map((file) => {
    const imageUrl = file.preview;
    return (
      <div key={file.id} style={{ position: "relative" }}>
        <Image src={imageUrl} radius="md" />
        <ActionIcon
          variant="filled"
          color="red"
          size="sm"
          radius="xl"
          style={{ position: "absolute", top: 5, right: 5 }}
          onClick={() => removeFile(file.id)}
        >
          <IconX size="70%" />
        </ActionIcon>
      </div>
    );
  });

  const form = useForm({
    initialValues: {
      type: copiedCampaign?.type || "AD",
      company: copiedCampaign?.companyId || copiedCampaign?.company || "",
      name: copiedCampaign?.name || "",
      payer: copiedCampaign?.customer || "",
      budget: copiedCampaign?.budget ? String(copiedCampaign.budget) : "",
      budgetPeriod: copiedCampaign?.budgetPeriod || "DURATION",
      startDate: parseLocalDate(copiedCampaign?.start),
      endDate: parseLocalDate(copiedCampaign?.end),
      targetArea: copiedCampaign?.targetArea || "",
      targetAge:
        copiedCampaign?.targetAge &&
        typeof copiedCampaign.targetAge === "string"
          ? copiedCampaign.targetAge.match(/\d+/g)?.map(Number)
          : [18, 65],
      targetGender: copiedCampaign?.targetGender || "All",
      adTitle: copiedCampaign?.title || "",
      adText: copiedCampaign?.copyText || "",
      mediaInfo: copiedCampaign?.mediaInfo || "",
      adUrl: copiedCampaign?.url || "",
      CTA: copiedCampaign?.cta || "Lue lisää",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      const requiredFields = ["company", "name", "startDate", "adText"];
      const adRequiredFields = [
        "payer",
        "budget",
        "endDate",
        "targetArea",
        "adTitle",
        "adUrl",
      ];

      requiredFields.forEach((field) => {
        if (!values[field as keyof typeof values]) {
          errors[field] = "Pakollinen kenttä";
        }
      });

      if (values.type === "AD") {
        adRequiredFields.forEach((field) => {
          if (!values[field as keyof typeof values]) {
            errors[field] = "Pakollinen kenttä";
          }
        });
      }
      return errors;
    },
  });

  const fetchUserCompanies = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${apiBase}/users/${userId}/companies`);
      const companies = (res.data || []).map(
        (c: { linkId: string; name: string }) => ({
          id: c.linkId,
          name: c.name,
        }),
      );
      setUserCompanies(companies);

      // Avaa modaali jos ei ole yhtään yritystä
      if (companies.length === 0) {
        setCreateCompanyModalOpened(true);
      }
    } catch (err) {
      console.error("Error fetching user companies:", err);
    }
  };

  const handleCreateCompany = async () => {
    if (!userId || !newCompanyName.trim()) return;

    try {
      await axios.post(`${apiBase}/companies`, {
        name: newCompanyName,
        creatorId: userId,
      });
      // Lataa sivu uudelleen jotta yritykset ja lomake päivittyvät
      window.location.reload();
    } catch (err) {
      console.error("Error creating company:", err);
    }
  };

  useEffect(() => {
    fetchUserCompanies();
  }, []);

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

  const handleSubmit = async (values: typeof form.values) => {
    let uploadedImageUrls: string[] = [];

    if (IS_DEMO_APP && files.length > 0) {
      alert("Kuvien lisääminen ei ole käytössä demoversiossa.");
      return;
    }

    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
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
      } catch (error) {
        console.error("Error uploading images:", error);
        return;
      }
    }

    const imageUrls = [...copiedImageUrls, ...uploadedImageUrls].filter(
      (value, index, arr) => arr.indexOf(value) === index,
    );

    const campaignData = {
      type: values.type,
      companyId: values.company, // nyt linkId
      company:
        userCompanies.find((o) => o.id === values.company)?.name ||
        values.company,
      payer: values.payer,
      name: values.name,
      customer: values.payer,
      budget: Number(values.budget) || 0,
      budgetPeriod: values.budgetPeriod,
      mediaInfo: values.mediaInfo,
      imageUrls,
      start: values.startDate,
      end: values.endDate,
      targetArea: values.targetArea,
      targetAge: Array.isArray(values.targetAge)
        ? `[${values.targetAge[0]},${values.targetAge[1]}]`
        : values.targetAge,
      targetGender: values.targetGender,
      title: values.adTitle,
      copyText: values.adText,
      url: values.adUrl,
      cta: values.CTA,
      createdBy: username || "",
    };

    try {
      await axios.post(`${apiBase}/campaigns`, campaignData);
      navigate("/campaign");
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <>
      <Modal
        opened={createCompanyModalOpened}
        onClose={() => {
          // Salli sulkeminen vain jos yritys on luotu tai jos yrityksiä on jo olemassa
          if (userCompanies.length === 0 && !companyCreated) return;
          setCreateCompanyModalOpened(false);
          setNewCompanyName("");
          setCompanyCreated(false);
        }}
        title="Luo yritys"
        centered
        withCloseButton={userCompanies.length > 0 || companyCreated}
        closeOnEscape={userCompanies.length > 0 || companyCreated}
      >
        <Stack>
          {companyCreated ? (
            <Text size="sm" c="green">
              ✓ Yritys luotu! Voit nyt sulkea tämän ikkunan.
            </Text>
          ) : (
            <Text size="sm">
              {userCompanies.length === 0
                ? "Sinulla ei ole vielä yritystä. Luo ensin yritys voidaksesi luoda kampanjan."
                : "Luo uusi yritys"}
            </Text>
          )}
          <TextInput
            label="Yrityksen nimi"
            placeholder="Anna yrityksen nimi"
            data-testid="new-company-name-input"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateCompany();
              }
            }}
          />
          <Group justify="flex-end">
            {userCompanies.length > 0 && !companyCreated && (
              <Button
                variant="default"
                onClick={() => {
                  setCreateCompanyModalOpened(false);
                  setNewCompanyName("");
                }}
              >
                Peruuta
              </Button>
            )}
            {!companyCreated && (
              <Button
                onClick={handleCreateCompany}
                disabled={!newCompanyName.trim()}
                data-testid="create-company-submit-button"
              >
                Luo yritys
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>

      <Center>
        <Container size="md" w="100%" px="md">
          <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={2}>Luo Uusi</Title>
              <Radio.Group mb="md" {...form.getInputProps("type")}>
                <Group mt={"md"}>
                  <Radio value="AD" label="Mainos" />
                  <Radio value="POST" label="Postaus" />
                </Group>
              </Radio.Group>
              <h2>
                <Flex align="center" gap="xs">
                  Yleiset
                  <IconBuildingSkyscraper color="#854d97" />
                </Flex>
              </h2>
              <Select
                w="100%"
                label="Yritys"
                placeholder="Valitse yritys"
                data-testid="company-select"
                data={[
                  ...userCompanies.map((c) => ({ value: c.id, label: c.name })),
                  { value: "__create_new__", label: "+ Luo uusi yritys" },
                ]}
                {...form.getInputProps("company")}
                onChange={(value) => {
                  if (value === "__create_new__") {
                    setCreateCompanyModalOpened(true);
                  } else {
                    form.setFieldValue("company", value || "");
                  }
                }}
              />
              <TextInput
                w="100%"
                label="Kampanjanimi"
                data-testid="campaign-name-input"
                {...form.getInputProps("name")}
              />
              {form.values.type === "AD" && (
                <Group grow align="flex-start">
                  <TextInput
                    miw={{ base: "100%", sm: "200px" }}
                    label="Maksaja"
                    data-testid="payer-input"
                    labelProps={{ style: { whiteSpace: "nowrap" } }}
                    {...form.getInputProps("payer")}
                  />
                  <TextInput
                    miw={{ base: "100%", sm: "200px" }}
                    label="Budjetti"
                    type="number"
                    data-testid="budget-input"
                    labelProps={{ style: { whiteSpace: "nowrap" } }}
                    {...form.getInputProps("budget")}
                  />
                  <Radio.Group
                    name="budgetPeriod"
                    label="Budjetin käyttö"
                    {...form.getInputProps("budgetPeriod")}
                  >
                    <Group mt="xs">
                      <Radio value="DAY" label="Päivä" />
                      <Radio value="DURATION" label="Koko pituus" />
                    </Group>
                  </Radio.Group>
                </Group>
              )}
              <Group grow>
                <DateTimePicker
                  miw={{ base: "100%", sm: "200px" }}
                  label="Aloitus pvm"
                  data-testid="start-date-picker"
                  labelProps={{ style: { whiteSpace: "nowrap" } }}
                  valueFormat="DD.MM.YYYY HH:mm"
                  locale="fi"
                  {...form.getInputProps("startDate")}
                />
                {form.values.type === "AD" && (
                  <DateTimePicker
                    miw={{ base: "100%", sm: "200px" }}
                    label="Lopetus pvm"
                    data-testid="end-date-picker"
                    labelProps={{ style: { whiteSpace: "nowrap" } }}
                    valueFormat="DD.MM.YYYY HH:mm"
                    locale="fi"
                    {...form.getInputProps("endDate")}
                  />
                )}
              </Group>
              {form.values.type === "AD" && (
                <>
                  <h2>
                    <Flex align="center" gap="xs">
                      Mainonnan kohde
                      <IconTargetArrow color="#854d97" />
                    </Flex>
                  </h2>
                  <Group grow align="flex-start">
                    <TextInput
                      label="Alue"
                      data-testid="target-area-input"
                      labelProps={{ style: { whiteSpace: "nowrap" } }}
                      {...form.getInputProps("targetArea")}
                    />
                    <Select
                      label="Sukupuoli"
                      data={genderOptions}
                      data-testid="target-gender-select"
                      labelProps={{ style: { whiteSpace: "nowrap" } }}
                      {...form.getInputProps("targetGender")}
                    />
                    <Input.Wrapper
                      label="Ikä"
                      labelProps={{ style: { whiteSpace: "nowrap" } }}
                      miw={{ base: "100%", sm: "200px" }}
                    >
                      <RangeSlider
                        color="blue"
                        min={18}
                        max={65}
                        minRange={5}
                        marks={[
                          { value: 18, label: "18" },
                          { value: 30, label: "30" },
                          { value: 45, label: "45" },
                          { value: 65, label: "65+" },
                        ]}
                        {...form.getInputProps("targetAge")}
                      />
                    </Input.Wrapper>
                  </Group>
                </>
              )}
              <h2>
                <Flex align="center" gap="xs">
                  Mainostiedot
                  <IconAd color="#854d97" />
                </Flex>
              </h2>

              {form.values.type === "AD" && (
                <Textarea
                  w="100%"
                  label="Otsikko"
                  data-testid="ad-title-textarea"
                  {...form.getInputProps("adTitle")}
                />
              )}
              <Textarea
                w="100%"
                label={form.values.type === "AD" ? "Mainosteksti" : "Caption"}
                data-testid="ad-text-textarea"
                {...form.getInputProps("adText")}
              />
              <TextInput
                w="100%"
                label="Media info"
                data-testid="media-info-input"
                {...form.getInputProps("mediaInfo")}
              />
              <div>
                <Dropzone
                  w="100%"
                  mt={"md"}
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
                  onReject={(files) => console.log("rejected files", files)}
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
              </div>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} mt="md" w="100%">
                {previews}
              </SimpleGrid>
              {form.values.type === "AD" && (
                <>
                  <TextInput
                    w="100%"
                    label="URL"
                    data-testid="ad-url-input"
                    {...form.getInputProps("adUrl")}
                  />
                  <Select
                    w="100%"
                    label="Toimintakutsu"
                    data={ctaOptions}
                    data-testid="cta-select"
                    {...form.getInputProps("CTA")}
                  />
                </>
              )}
              <Group mt="md">
                <Button
                  type="submit"
                  data-testid="create-campaign-submit-button"
                >
                  Luo
                </Button>
              </Group>
            </Stack>
          </Box>
        </Container>
      </Center>
    </>
  );
};

export default CreateCampaign;
