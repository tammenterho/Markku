import { Input, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

const data = [
  {label: "Yritys A"},
  {label: "Yritys B"},
  {label: "Yritys C"}
]

const CreateCampaign = () => {
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
      <Input component="select">
        {data.map((company) => (
          <option key={company.label} value={company.label}>{company.label}</option>
        ))}
      </Input>
    </form>
  );
};

export default CreateCampaign;
