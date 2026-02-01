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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  IconAd,
  IconBuildingSkyscraper,
  IconTargetArrow,
} from "@tabler/icons-react";

const companyData = ["Yritys A", "Yritys B", "Yritys C"];
const genders = ["All", "Female", "Male"];

const CreateCampaign = () => {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
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
      CTA: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const campaignData = {
      clientId: "659e7d23473b8d69cb77c2fb",
      companyId: "659e7d23473b8d69cb77c2fb",
      type: "AD",
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
        <h2>
          <Flex align="center" gap="xs">
            General
            <IconBuildingSkyscraper color="#854d97" />
          </Flex>
        </h2>
        <Select
          w={"38rem"}
          label="Company"
          placeholder="Valitse yritys"
          data={companyData}
          {...form.getInputProps("company")}
        />
        <TextInput w={"38rem"} label="Name" {...form.getInputProps("name")} />
        <Group>
          <TextInput
            miw="200px"
            label="Payer"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("payer")}
          />
          <TextInput
            miw="200px"
            label="Budget"
            type="number"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("budget")}
          />
          <Radio.Group
            name="budgetPeriod"
            label="Use budget"
            {...form.getInputProps("budgetPeriod")}
          >
            <Group mt="xs">
              <Radio value="Day" label="Day" />
              <Radio value="Duration" label="Whole duration" />
            </Group>
          </Radio.Group>
        </Group>
        <Group>
          <DatePickerInput
            miw="200px"
            label="Start date"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("startDate")}
          />
          <DatePickerInput
            miw="200px"
            label="End date"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("endDate")}
          />
        </Group>
        <h2>
          <Flex align="center" gap="xs">
            Target
            <IconTargetArrow color="#854d97" />
          </Flex>
        </h2>
        <Group>
          <TextInput
            label="Target area"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("targetArea")}
          />
          <TextInput
            label="Target demographic"
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("targetDemographic")}
          />
          <Select
            label="Gender"
            data={genders}
            labelProps={{ style: { whiteSpace: "nowrap" } }}
            {...form.getInputProps("gender")}
          />
        </Group>
        <h2>
          <Flex align="center" gap="xs">
            Campaign
            <IconAd color="#854d97" />
          </Flex>
        </h2>

        <Textarea
          w={"38rem"}
          label="Ad title"
          {...form.getInputProps("adTitle")}
        />
        <Textarea
          w={"38rem"}
          label="Ad text"
          {...form.getInputProps("adText")}
        />
        <TextInput
          w={"38rem"}
          label="Media info"
          {...form.getInputProps("mediaInfo")}
        />
        <TextInput
          w={"38rem"}
          label="Ad URL"
          {...form.getInputProps("adUrl")}
        />
        <TextInput w={"38rem"} label="CTA" {...form.getInputProps("CTA")} />
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Center>
  );
};

export default CreateCampaign;
