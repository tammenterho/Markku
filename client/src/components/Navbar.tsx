import { AppShell, NavLink } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconCirclePlusFilled } from "@tabler/icons-react";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <AppShell.Navbar>
      <NavLink
        label="Luo Uusi"
        onClick={() => navigate("/new")}
        leftSection={
          <IconCirclePlusFilled
            size={36} // set custom `width` and `height`
            color="green" // set `stroke` color
            stroke={3} // set `stroke-width`
            strokeLinejoin="miter" // override other SVG props
          />
        }
      />
      <NavLink label="Koti" onClick={() => navigate("/")} />
      <NavLink label="Kampanjat" onClick={() => navigate("/campaign")} />
    </AppShell.Navbar>
  );
};

export default Navbar;
