import {
  Button,
  Flex,
  Group,
  Radio,
  Select,
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
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  IconAd,
  IconBuildingSkyscraper,
  IconPhoto,
  IconTargetArrow,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

const companyData = ["Yritys A", "Yritys B", "Yritys C"];
const genders = ["All", "Nainen", "Mies"];
const ctas = [
  "Pyydä tarjous",
  "Hae nyt",
  "Varaa nyt",
  "Ota meihin yhteyttä",
  "Lataa",
  "Tartu tarjoukseen",
  "Hanki markkinointeja",
  "Hae esitysajat",
  "Lue lisää",
  "Kuuntele nyt",
  "Tilaa nyt",
  "Hanki käyttöoikeus",
  "Varaa aika",
  "Näytä ruokalista",
  "Tilaa päivitykset",
  "Osta nyt",
  "Rekisteröidy",
  "Tilaa",
  "Katso lisää",
];

const CreateCampaign = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<any[]>([]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const previews = files.map((file, index) => {
    const imageUrl = file.preview;
    return (
      <div key={index} style={{ position: "relative" }}>
        <Image
          src={imageUrl}
          onLoad={() => URL.revokeObjectURL(imageUrl)}
          radius="md"
        />
        <ActionIcon
          variant="filled"
          color="red"
          size="sm"
          radius="xl"
          style={{ position: "absolute", top: 5, right: 5 }}
          onClick={() => removeFile(index)}
        >
          <IconX size="70%" />
        </ActionIcon>
      </div>
    );
  });

  const form = useForm({
    initialValues: {
      type: "AD",
      company: "",
      name: "",
      payer: "",
      budget: "",
      budgetPeriod: "Duration",
      startDate: null as Date | null,
      endDate: null as Date | null,
      targetArea: "",
      targetDemographic: "",
      gender: "All",
      adTitle: "",
      adText: "",
      mediaInfo: "",
      adUrl: "",
      CTA: "Lue lisää",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.company) errors.company = "Pakollinen kenttä";
      if (!values.name) errors.name = "Pakollinen kenttä";
      if (!values.startDate) errors.startDate = "Pakollinen kenttä";
      if (!values.adText) errors.adText = "Pakollinen kenttä";

      if (values.type === "AD") {
        if (!values.payer) errors.payer = "Pakollinen kenttä";
        if (!values.budget) errors.budget = "Pakollinen kenttä";
        if (!values.endDate) errors.endDate = "Pakollinen kenttä";
        if (!values.targetArea) errors.targetArea = "Pakollinen kenttä";
        if (!values.adTitle) errors.adTitle = "Pakollinen kenttä";
        if (!values.adUrl) errors.adUrl = "Pakollinen kenttä";
      }
      return errors;
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const campaignData = {
      clientId: "659e7d23473b8d69cb77c2fb",
      companyId: "659e7d23473b8d69cb77c2fb",
      type: values.type,
      company: values.company,
      name: values.name,
      customer: values.payer,
      budget: Number(values.budget) || 0,
      start: values.startDate,
      end: values.endDate,
      targetArea: values.targetArea,
      targetAge: values.targetDemographic,
      title: values.adTitle,
      copyText: values.adText,
    };

    try {
      await axios.post("http://localhost:3000/campaigns", campaignData);
      navigate("/campaign");
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <Center>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title>Luo Uusi</Title>
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
          w={"38rem"}
          label="Yritys"
          placeholder="Valitse yritys"
          data={companyData}
          {...form.getInputProps("company")}
        />
        <TextInput w={"38rem"} label="Nimi" {...form.getInputProps("name")} />
        {form.values.type === "AD" && (
          <Group>
            <TextInput
              miw="200px"
              label="Maksaja"
              labelProps={{ style: { whiteSpace: "nowrap" } }}
              {...form.getInputProps("payer")}
            />
            <TextInput
              miw="200px"
              label="Budjetti"
              type="number"
              labelProps={{ style: { whiteSpace: "nowrap" } }}
              {...form.getInputProps("budget")}
            />
            <Radio.Group
              name="budgetPeriod"
              label="Budjetin käyttö"
              {...form.getInputProps("budgetPeriod")}
            >
              <Group mt="xs">
                <Radio value="Day" label="Päivä" />
                <Radio value="Duration" label="Koko pituus" />
              </Group>
            </Radio.Group>
          </Group>
        )}
        <Group>
          <DatePickerInput
            miw="200px"
            label="Aloitus pvm"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("startDate")}
          />
          {form.values.type === "AD" && (
            <DatePickerInput
              miw="200px"
              label="Lopetus pvm"
              labelProps={{ style: { whiteSpace: "nowrap" } }}
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
            <Group>
              <TextInput
                label="Alue"
                labelProps={{ style: { whiteSpace: "nowrap" } }}
                {...form.getInputProps("targetArea")}
              />
              <Select
                label="Sukupuoli"
                data={genders}
                labelProps={{ style: { whiteSpace: "nowrap" } }}
                {...form.getInputProps("gender")}
              />
              <Input.Wrapper
                label="Ikä"
                labelProps={{ style: { whiteSpace: "nowrap" } }}
                miw="200px"
              >
                <RangeSlider
                  color="blue"
                  min={18}
                  max={65}
                  defaultValue={[18, 65]}
                  marks={[
                    { value: 18, label: "18" },
                    { value: 30, label: "30" },
                    { value: 45, label: "45" },
                    { value: 65, label: "65+" },
                  ]}
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
            w={"38rem"}
            label="Otsikko"
            {...form.getInputProps("adTitle")}
          />
        )}
        <Textarea
          w={"38rem"}
          label={form.values.type === "AD" ? "Mainosteksti" : "Caption"}
          {...form.getInputProps("adText")}
        />
        <TextInput
          w={"38rem"}
          label="Media info"
          {...form.getInputProps("mediaInfo")}
        />
        <div>
          <Dropzone
            w={"38rem"}
            mt={"md"}
            onDrop={(acceptedFiles) => {
              setFiles((prev) => [
                ...prev,
                ...acceptedFiles.map((file) =>
                  Object.assign(file, {
                    preview: URL.createObjectURL(file),
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
        <SimpleGrid cols={4} mt="md" w={"38rem"}>
          {previews}
        </SimpleGrid>
        {form.values.type === "AD" && (
          <>
            <TextInput
              w={"38rem"}
              label="URL"
              {...form.getInputProps("adUrl")}
            />
            <Select
              w={"38rem"}
              label="Toimintakutsu"
              data={ctas}
              {...form.getInputProps("CTA")}
            />
          </>
        )}
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Center>
  );
};

export default CreateCampaign;
