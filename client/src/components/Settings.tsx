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
import { getUsernameFromToken } from "../utils/auth";
import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

const Settings = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });
  const [userCompanies, setUserCompanies] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const fetchUserCompanies = async () => {
      const username = getUsernameFromToken(
        localStorage.getItem("accessToken"),
      );
      if (!username) return;
      try {
        const userRes = await axios.get(
          `http://localhost:3000/users/${username}`,
        );
        const ids: string[] = userRes.data?.companies || [];
        if (ids.length === 0) {
          setUserCompanies([]);
          return;
        }
        const comps = await Promise.all(
          ids.map((id) =>
            axios
              .get(`http://localhost:3000/companies/${id}`)
              .then((r) => r.data),
          ),
        );
        setUserCompanies(comps.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (err) {
        console.error("Error fetching user companies:", err);
      }
    };
    fetchUserCompanies();
  }, []);

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
      <Stack align="flex-start" mt="md">
        <Title order={5}>Omat yritykset</Title>
        {userCompanies.length === 0 ? (
          <Text c="dimmed">Ei yrityksiä</Text>
        ) : (
          <ul>
            {userCompanies.map((c) => (
              <li key={c.id}>
                {c.name} — {c.id}
              </li>
            ))}
          </ul>
        )}
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
      const username = getUsernameFromToken(
        localStorage.getItem("accessToken"),
      );
      const res = await axios.post("http://localhost:3000/companies", {
        name: values.name,
        creatorUsername: username,
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
