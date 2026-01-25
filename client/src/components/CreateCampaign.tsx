import { Radio, Select, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { DatePicker, DatePickerInput } from "@mantine/dates";

const data = [
  { label: "Yritys A" },
  { label: "Yritys B" },
  { label: "Yritys C" },
];

const CreateCampaign = () => {
  const [checked, setChecked] = useState(false);

  const form = useForm({
    initialValues: {
      company: "",
      name: "",
      payer: "",
      budget: "",
      budgetPeriod: "",
      startDate: "",
      endDate: "",
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

  return (
    <form onSubmit={form.onSubmit(() => {})}>
      <Title>Luo Uusi</Title>
      <Select component="select" label="Company" name="company">
        {data.map((company) => (
          <option key={company.label} value={company.label}>
            {company.label}
          </option>
        ))}
      </Select>
      <TextInput label="Name" name="name" />
      <TextInput label="Payer" name="payer" />
      <TextInput label="Budget" name="budget" />
      <p>Use budget</p>
      <Radio
        label="Day"
        value="monthly"
        name="budgetPeriod"
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      <Radio
        label="Whole duration"
        value="monthly"
        name="budgetPeriod"
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      <DatePickerInput label="Start date" name="startDate" />
      <DatePickerInput label="End date" name="endDate" />
      <TextInput label="Target area" name="targetArea" />
      <TextInput label="Target demographic" name="targetDemographic" />
      <TextInput label="Gender" name="gender" />
    </form>
  );
};

export default CreateCampaign;
