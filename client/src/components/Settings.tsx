import {
  Accordion,
  ActionIcon,
  Button,
  Center,
  Group,
  PasswordInput,
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
import { API_BASE_URL } from "../utils/constants";
import { getAccessToken, getUserId } from "../utils/auth";
import { useEffect, useState } from "react";
import { IconCopy, IconMoon, IconSun } from "@tabler/icons-react";

interface CompanyResponse {
  linkId: string;
  name: string;
}

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
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await axios.get<CompanyResponse[]>(
        `${apiBase}/users/${userId}/companies`,
      );
      setUserCompanies(
        (res.data || []).map((c) => ({ id: c.linkId, name: c.name })),
      );
    } catch (err) {
      console.error("Error fetching user companies:", err);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {})
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

      <Accordion variant="separated" mt="lg" mb="xl">
        <Accordion.Item value="password">
          <Accordion.Control>
            <Title order={4}>Vaihda salasana</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <ChangePasswordForm />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="companies">
          <Accordion.Control>
            <Title order={4}>Yritystiedot</Title>
          </Accordion.Control>
          <Accordion.Panel>
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
                Syötä tähän olemassa olevan yrityksen Linkitys ID ja paina
                yhdistä, niin näet yrityksen kampanjat.
              </Text>
              <CompanyActionForm mode="join" onSuccess={fetchUserCompanies} />

              <Title order={5} mb="sm" mt="md">
                Omat yritykset
              </Title>
              {userCompanies.length === 0 ? (
                <Text c="dimmed">Ei yrityksiä</Text>
              ) : (
                <Table
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
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
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
    const userId = getUserId();
    if (!userId) {
      alert("Et ole kirjautunut sisään");
      return;
    }

    try {
      if (mode === "create") {
        await axios.post(`${apiBase}/companies`, {
          name: values.input,
          creatorId: userId,
        });
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

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value) =>
        value.length < 1 ? "Nykyinen salasana vaaditaan" : null,
      newPassword: (value) =>
        value.length < 6 ? "Salasanan tulee olla vähintään 6 merkkiä" : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Salasanat eivät täsmää" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setMessage(null);

    try {
      const token = getAccessToken();
      await axios.patch(
        `${apiBase}/auth/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage({
        type: "success",
        text: "Salasana vaihdettu onnistuneesti!",
      });
      form.reset();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setMessage({ type: "error", text: err.response.data.message });
      } else {
        setMessage({ type: "error", text: "Salasanan vaihto epäonnistui" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="sm" w="20rem">
        <PasswordInput
          label="Nykyinen salasana"
          placeholder="Anna nykyinen salasana"
          {...form.getInputProps("currentPassword")}
        />
        <PasswordInput
          label="Uusi salasana"
          placeholder="Anna uusi salasana"
          {...form.getInputProps("newPassword")}
        />
        <PasswordInput
          label="Vahvista uusi salasana"
          placeholder="Anna uusi salasana uudelleen"
          {...form.getInputProps("confirmPassword")}
        />
        {message && (
          <Text size="sm" c={message.type === "success" ? "green" : "red"}>
            {message.text}
          </Text>
        )}
        <Button type="submit" loading={loading}>
          Vaihda salasana
        </Button>
      </Stack>
    </form>
  );
};

export default Settings;
