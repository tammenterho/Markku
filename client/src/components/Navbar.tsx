import { AppShell, NavLink } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconCirclePlus,
  IconCalendarEvent,
  IconSettings,
} from "@tabler/icons-react";
interface NavbarProps {
  close: () => void;
}
const Navbar = ({ close }: NavbarProps) => {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    close();
  };

  return (
    <AppShell.Navbar>
      <NavLink
        label="Luo Uusi"
        onClick={() => handleNavClick("/new")}
        leftSection={
          <IconCirclePlus
            color="green" // set `stroke` color
          />
        }
      />
      <NavLink
        label="Kampanjat"
        onClick={() => handleNavClick("/campaign")}
        leftSection={<IconCalendarEvent />}
      />
      <NavLink
        label="Asetukset"
        onClick={() => handleNavClick("/settings")}
        leftSection={<IconSettings />}
      />
    </AppShell.Navbar>
  );
};

export default Navbar;
