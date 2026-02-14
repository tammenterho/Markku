import { AppShell, Center, Loader } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import RouterSwitcher from "./components/RouterSwitcher";
import {
  getAccessToken,
  isAuthenticated,
  isIdle,
  isTokenExpired,
  logout,
  markActivity,
  refreshAccessToken,
} from "./utils/auth";

function App() {
  const [opened, { toggle, close }] = useDisclosure();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const token = getAccessToken();
      if (token && !isTokenExpired(token)) {
        if (mounted) {
          setAuthReady(true);
        }
        return;
      }

      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        await logout(false);
      }
      if (mounted) {
        setAuthReady(true);
      }
    };

    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated()) {
      return undefined;
    }

    const handleActivity = () => markActivity();
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, handleActivity));
    handleActivity();

    const interval = window.setInterval(async () => {
      if (!isAuthenticated()) {
        return;
      }

      if (isIdle()) {
        await logout();
        return;
      }

      const token = getAccessToken();
      if (token && isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          await logout();
        }
      }
    }, 60_000);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      window.clearInterval(interval);
    };
  }, [authReady]);

  if (!authReady) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated()) {
    return <RouterSwitcher />;
  }

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <Header toggle={toggle} opened={opened} />
      <Navbar close={close} />
      <AppShell.Main>
        <RouterSwitcher />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
