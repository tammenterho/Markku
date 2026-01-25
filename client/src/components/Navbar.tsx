import { AppShell, NavLink } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <AppShell.Navbar>
      <NavLink
        label="Koti"
        onClick={() => navigate("/")}
      />
      <NavLink
        label="Kampanjat"
        onClick={() => navigate("/campaign")}
      />
    </AppShell.Navbar>
  );
};

export default Navbar;
