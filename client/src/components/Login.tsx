import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Center,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLogin } from "@tabler/icons-react";
import axios from "axios";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (!value ? "Username is required" : null),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3000/auth/signin", {
        username: values.username,
        password: values.password,
      });

      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);

        // Hae käyttäjän tiedot ja tallenna companies localStorageen
        try {
          const userResponse = await axios.get(
            `http://localhost:3000/users/${values.username}`,
          );
          if (userResponse.data.companies) {
            localStorage.setItem(
              "userCompanies",
              JSON.stringify(userResponse.data.companies),
            );
          }
          if (userResponse.data.id) {
            localStorage.setItem("userId", userResponse.data.id);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }

        window.location.href = "/";
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Login failed. Please try again.",
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Stack gap="md" align="center" mb="xl">
          <IconLogin size={48} />
          <Title order={2}>Welcome back</Title>
          <Text c="dimmed" size="sm">
            Sign in to your account
          </Text>
        </Stack>
      </Center>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Your username"
              required
              {...form.getInputProps("username")}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps("password")}
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
