import {
  Center,
  SegmentedControl,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

const Settings = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });
  return (
    <div>
      <h1>Asetukset</h1>
      <Stack align="flex-start">
        <h2>Ulkoasu</h2>
        <SegmentedControl
          value={computedColorScheme}
          onChange={() =>
            setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
          }
          radius="xl"
          size="md"
          data={[
            {
              value: "dark",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconMoon size={16} />
                  <span>Tumma</span>
                </Center>
              ),
            },
            {
              value: "light",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconSun size={16} />
                  <span>Kirkas</span>
                </Center>
              ),
            },
          ]}
        />
      </Stack>
    </div>
  );
};

export default Settings;
