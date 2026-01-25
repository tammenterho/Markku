import { Button, Group, Radio, Select, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const companyData = ["Yritys A", "Yritys B", "Yritys C"];

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
      gender: "",
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Title>Luo Uusi</Title>
      <h2>General</h2>
      <Select
        label="Company"
        placeholder="Valitse yritys"
        data={companyData}
        {...form.getInputProps("company")}
      />
      <TextInput label="Name" {...form.getInputProps("name")} />
      <Group>
        <TextInput label="Payer" {...form.getInputProps("payer")} />
        <TextInput
          label="Budget"
          type="number"
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
          label="Start date"
          {...form.getInputProps("startDate")}
        />
        <DatePickerInput label="End date" {...form.getInputProps("endDate")} />
      </Group>
      <h2>Target</h2>

      <TextInput label="Target area" {...form.getInputProps("targetArea")} />
      <TextInput
        label="Target demographic"
        {...form.getInputProps("targetDemographic")}
      />
      <TextInput label="Gender" {...form.getInputProps("gender")} />
      <h2>Campaign</h2>

      <TextInput label="Ad title" {...form.getInputProps("adTitle")} />
      <TextInput label="Ad text" {...form.getInputProps("adText")} />
      <TextInput label="Media info" {...form.getInputProps("mediaInfo")} />
      <TextInput label="Ad URL" {...form.getInputProps("adUrl")} />
      <TextInput label="CTA" {...form.getInputProps("CTA")} />
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
};

export default CreateCampaign;
