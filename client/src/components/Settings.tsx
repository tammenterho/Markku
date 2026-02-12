import {
  ActionIcon,
  Button,
  Center,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { STORAGE_KEYS, API_BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { IconCopy, IconMoon, IconSun } from "@tabler/icons-react";

const apiBase = API_BASE_URL;

const Settings = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const [userCompanies, setUserCompanies] = useState<
    { id: string; name: string }[]
  >([]);

  const fetchUserCompanies = async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) return;
    try {
      const res = await axios.get(`${apiBase}/users/${userId}/companies`);
      setUserCompanies(
        (res.data || []).map((c: any) => ({ id: c.linkId, name: c.name })),
      );
    } catch (err) {
      console.error("Error fetching user companies:", err);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        console.log("ID copied to clipboard:", id);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
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
        <Title order={4}>Yritystiedot</Title>
        <Stack align="flex-start">
          <Title order={5} mb="xs">
            Luo yritys
          </Title>
          <Text size="sm" c="dimmed" mb="sm" fs={"italic"}>
            Luo uusi yritys ja ala hallita sen kampanjoita.
          </Text>
          <CompanyActionForm mode="create" onSuccess={fetchUserCompanies} />

          <Title order={5} mb="xs" mt="md">
            Yhdistä yritys
          </Title>
          <Text size="sm" c="dimmed" mb="sm" fs={"italic"}>
            Syötä tähän olemassa olevan yrityksen Linkitys ID ja paina yhdistä,
            niin näet yrityksen kampanjat.
          </Text>
          <CompanyActionForm mode="join" onSuccess={fetchUserCompanies} />
        </Stack>

        <Title order={5} mb="sm">
          Omat yritykset
        </Title>
        {userCompanies.length === 0 ? (
          <Text c="dimmed">Ei yrityksiä</Text>
        ) : (
          <Table
            w={"40%"}
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="md"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nimi</Table.Th>
                <Table.Th>Linkitys ID</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {userCompanies.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>{c.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text>{c.id}</Text>
                      <Tooltip label="Kopioi">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => handleCopyId(c.id)}
                        >
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
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
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
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
