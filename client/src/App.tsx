import "./App.css";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import RouterSwitcher from "./components/RouterSwitcher";

function App() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <Header toggle={toggle} opened={opened} />
      <Navbar />
      <AppShell.Main>
        <RouterSwitcher />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
