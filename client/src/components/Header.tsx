import { AppShell, Burger } from "@mantine/core";

interface HeaderProps {
  toggle: () => void;
  opened: boolean;
}

const Header = ({ toggle, opened }: HeaderProps) => {
  return (
    <AppShell.Header>
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

      <div>Markku</div>
    </AppShell.Header>
  );
};

export default Header;
