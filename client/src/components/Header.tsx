import { AppShell, Burger, Button, Group, Text } from "@mantine/core";
import { getUsernameFromToken, logout } from "../utils/auth";
import { IconLogout, IconUser } from "@tabler/icons-react";

interface HeaderProps {
  toggle: () => void;
  opened: boolean;
}

const Header = ({ toggle, opened }: HeaderProps) => {
  const username = getUsernameFromToken();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={700}>Marketta</Text>
        </Group>

        <Group gap="sm">
          <Text size="sm" c="dimmed">
            {username ? (
              <>
                <IconUser
                  size={20}
                  style={{ verticalAlign: "middle", marginRight: 4 }}
                />
                {username}
              </>
            ) : (
              "Signed in"
            )}
          </Text>
          <Button
            size="xs"
            variant="light"
            onClick={handleLogout}
            leftSection={<IconLogout />}
          >
            Logout
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default Header;
