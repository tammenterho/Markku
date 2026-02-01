import { AppShell, Burger, Button, Group, Text } from "@mantine/core";
import { getUsernameFromToken } from "../utils/auth";
import { IconLogout } from "@tabler/icons-react";

interface HeaderProps {
  toggle: () => void;
  opened: boolean;
}

const Header = ({ toggle, opened }: HeaderProps) => {
  const username = getUsernameFromToken(localStorage.getItem("accessToken"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700}>Markku</Text>
        </Group>

        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {username ? `Signed in as ${username}` : "Signed in"}
          </Text>
          <Button size="xs" variant="light" onClick={handleLogout} leftSection={<IconLogout />}>
            Logout
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default Header;
