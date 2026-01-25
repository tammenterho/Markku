import { AppShell, NavLink } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconCirclePlus,
  IconCalendarEvent,
  IconSettings,
} from "@tabler/icons-react";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <AppShell.Navbar>
      <NavLink
        label="Luo Uusi"
        onClick={() => navigate("/new")}
        leftSection={
          <IconCirclePlus
            color="green" // set `stroke` color
          />
        }
      />
      <NavLink
        label="Kampanjat"
        onClick={() => navigate("/campaign")}
        leftSection={<IconCalendarEvent />}
      />
      <NavLink
        label="Asetukset"
        onClick={() => navigate("/settings")}
        leftSection={<IconSettings />}
      />
    </AppShell.Navbar>
  );
};

export default Navbar;
