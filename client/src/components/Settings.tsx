import {
  Center,
  SegmentedControl,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
  TextInput,
  Button,
  Title,
  Group,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { IconMoon, IconSun } from "@tabler/icons-react";

const Settings = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });
  return (
    <div>
      <h1>Asetukset</h1>
      <Stack align="flex-start">
        <h2>Ulkoasu</h2>
        <SegmentedControl
          value={computedColorScheme}
          onChange={() =>
            setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
          }
          radius="xl"
          size="md"
          data={[
            {
              value: "dark",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconMoon size={16} />
                  <span>Tumma</span>
                </Center>
              ),
            },
            {
              value: "light",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconSun size={16} />
                  <span>Kirkas</span>
                </Center>
              ),
            },
          ]}
        />
      </Stack>

      <Stack align="flex-start" mt="md">
        <Title order={4}>Luo yritystieto</Title>
        <CompanyForm />
      </Stack>
    </div>
  );
};

const CompanyForm = () => {
  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const res = await axios.post("http://localhost:3000/companies", {
        name: values.name,
      });
      // show created id or name
      alert(`Yritys luotu: ${res.data.name} (${res.data.id})`);
      form.setValues({ name: "" });
    } catch (err) {
      console.error("Error creating company:", err);
      alert("Yrityksen luominen epäonnistui. Katso konsoli.");
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group>
        <TextInput
          label="Yrityksen nimi"
          {...form.getInputProps("name")}
          required
        />
        <Button type="submit">Luo yritys</Button>
      </Group>
    </form>
  );
};

export default Settings;
