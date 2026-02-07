import {
  Button,
  Center,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { getUserIdFromToken } from "../utils/auth";
import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

const apiBase = "http://localhost:3000";

const Settings = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const [userCompanies, setUserCompanies] = useState<
    { id: string; name: string }[]
  >([]);

  const fetchUserCompanies = async () => {
    const userId = getUserIdFromToken(localStorage.getItem("accessToken"));
    if (!userId) return;
    try {
      const res = await axios.get(`${apiBase}/users/${userId}/companies`);
      setUserCompanies(
        (res.data || []).map((c: any) => ({ id: c.id, name: c.name })),
      );
    } catch (err) {
      console.error("Error fetching user companies:", err);
    }
  };

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  return (
    <div>
      <Title order={2}>Asetukset</Title>
      <Stack align="flex-start" mt="md">
        <Title order={4}>Ulkoasu</Title>
        <SegmentedControl
          value={computedColorScheme}
          onChange={(val) => setColorScheme(val as "dark" | "light")}
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

      <Stack align="flex-start" mt="lg">
        <Title order={4}>Yritykset</Title>
        <Stack align="flex-start">
          <Title order={5} mb="sm">
            Luo yritys
          </Title>
          <CompanyActionForm mode="create" onSuccess={fetchUserCompanies} />

          <Title order={5} mb="sm">
            Yhdistä yritys
          </Title>
          <CompanyActionForm mode="join" onSuccess={fetchUserCompanies} />
        </Stack>

        <Title order={5} mb="sm">
          Omat yritykset
        </Title>
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

type CompanyActionMode = "create" | "join";

const CompanyActionForm = ({
  mode,
  onSuccess,
}: {
  mode: CompanyActionMode;
  onSuccess?: () => void;
}) => {
  const form = useForm({
    initialValues: {
      input: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const userId = getUserIdFromToken(localStorage.getItem("accessToken"));
    if (!userId) {
      alert("Et ole kirjautunut sisään");
      return;
    }

    try {
      if (mode === "create") {
        const res = await axios.post(`${apiBase}/companies`, {
          name: values.input,
          creatorId: userId,
        });
        alert(`Yritys luotu: ${res.data.name} (${res.data.id})`);
        console.log("Company created:", values.input);
      } else {
        if (!values.input) {
          alert("Syötä yrityksen UUID");
          return;
        }
        const cleanId = values.input.replace(/["\\]/g, "").trim();
        await axios.post(`${apiBase}/users/${userId}/companies`, {
          companyId: cleanId,
        });
        const comp = await axios.get(`${apiBase}/companies/${cleanId}`);
        alert(`Yritys yhdistetty: ${comp.data.name} (${comp.data.id})`);
      }
      form.setValues({ input: "" });
      onSuccess?.();
    } catch (err) {
      console.error("Company action error:", err);
      alert("Toiminto epäonnistui. Katso konsoli.");
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group align="flex-end">
        <TextInput
          w={"20rem"}
          label={mode === "create" ? "Yrityksen nimi" : "Yrityksen UUID"}
          placeholder={
            mode === "create" ? "Anna yrityksen nimi" : "Anna yrityksen UUID"
          }
          {...form.getInputProps("input")}
          required
        />
        <Button type="submit">{mode === "create" ? "Luo" : "Yhdistä"}</Button>
      </Group>
    </form>
  );
};

export default Settings;
