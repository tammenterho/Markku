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
import { API_BASE_URL, IS_DEMO_APP } from "../utils/constants";
import {
  hashCredentialForAuth,
  markActivity,
  setAccessToken,
  setUserCompanies,
  setUserId,
} from "../utils/auth";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debugLog = (label: string, details?: Record<string, unknown>) => {
    console.log(`[auth-debug] ${label}`, details ?? {});
  };

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
    const username = IS_DEMO_APP ? "demo" : values.username;
    const password = IS_DEMO_APP ? "demo" : values.password;

    debugLog("submit", {
      isDemoApp: IS_DEMO_APP,
      usernameLength: username.length,
      passwordLength: password.length,
    });

    setLoading(true);
    setError(null);

    try {
      const [usernameHash, passwordHash] = await Promise.all([
        hashCredentialForAuth(username),
        hashCredentialForAuth(password),
      ]);

      debugLog("hash-created", {
        usernameHashPrefix: usernameHash.slice(0, 12),
        passwordHashPrefix: passwordHash.slice(0, 12),
      });

      let response;

      try {
        debugLog("signin-attempt", { mode: "hashed" });
        response = await axios.post(
          `${API_BASE_URL}/auth/signin`,
          {
            username: usernameHash,
            password: passwordHash,
          },
          { withCredentials: true },
        );
        debugLog("signin-success", {
          mode: "hashed",
          status: response.status,
          hasAccessToken: Boolean(response.data?.accessToken),
          hasUser: Boolean(response.data?.user),
        });
      } catch (firstErr: unknown) {
        if (axios.isAxiosError(firstErr)) {
          debugLog("signin-failed", {
            mode: "hashed",
            status: firstErr.response?.status,
            message: firstErr.response?.data?.message ?? firstErr.message,
          });

          // Compatibility path for legacy bcrypt(raw password) rows.
          debugLog("signin-attempt", { mode: "legacy-plaintext" });
          response = await axios.post(
            `${API_BASE_URL}/auth/signin`,
            {
              username,
              password,
            },
            { withCredentials: true },
          );
          debugLog("signin-success", {
            mode: "legacy-plaintext",
            status: response.status,
            hasAccessToken: Boolean(response.data?.accessToken),
            hasUser: Boolean(response.data?.user),
          });
        } else {
          debugLog("signin-failed", {
            mode: "hashed",
            errorType: typeof firstErr,
          });
          throw firstErr;
        }
      }

      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        markActivity();

        if (Array.isArray(response.data?.user?.companies)) {
          setUserCompanies(response.data.user.companies);
        }
        if (response.data?.user?.id) {
          setUserId(response.data.user.id);
        }

        window.location.href = "/";
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        debugLog("login-final-error", {
          status: err.response?.status,
          message: err.response?.data?.message ?? err.message,
          data: err.response?.data,
        });
      } else {
        debugLog("login-final-error", { error: String(err) });
      }

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
