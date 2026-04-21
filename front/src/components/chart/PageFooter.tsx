import {
  Box,
  Container,
  Divider,
  Grid,
  Group,
  Stack,
  Anchor,
  Text,
  Title,
  ActionIcon,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";
import { useComputedColorScheme } from "@mantine/core";

export default function PageFooter() {
  const scheme = useComputedColorScheme("light");
  return (
    <Box
      component="footer"
      pt={80}
      pb={40}
      bg={
        scheme === "dark"
          ? "var(--upagain-dark-green)"
          : "var(--upagain-neutral-green)"
      }
      style={{
        borderTop: `1px solid ${scheme === "dark" ? "var(--mantine-color-dark-7)" : "var(--mantine-color-gray-2)"}`,
      }}
    >
      <Container size="xl">
        <Grid gutter={50}>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Title order={3} size="h3" fw={900}>
                UpAgain
              </Title>
              <Text
                size="sm"
                lh={1.6}
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
              >
                Giving materials a second life through community-driven reuse
                and smart logistics.
              </Text>
              <Group gap="xs">
                <ActionIcon
                  size="lg"
                  radius="xl"
                  color={
                    scheme === "dark"
                      ? "var(--upagain-neutral-green)"
                      : "var(--upagain-dark-green)"
                  }
                >
                  <IconBrandInstagram size={18} />
                </ActionIcon>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  color={
                    scheme === "dark"
                      ? "var(--upagain-neutral-green)"
                      : "var(--upagain-dark-green)"
                  }
                >
                  <IconBrandLinkedin size={18} />
                </ActionIcon>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  color={
                    scheme === "dark"
                      ? "var(--upagain-neutral-green)"
                      : "var(--upagain-dark-green)"
                  }
                >
                  <IconBrandFacebook size={18} />
                </ActionIcon>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Text fw={700} mb="lg" size="sm" tt="uppercase">
              Explore
            </Text>
            <Stack gap="xs">
              <Anchor
                href="#"
                size="sm"
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
                underline="hover"
              >
                Browse Objects
              </Anchor>
              <Anchor
                href="#"
                size="sm"
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
                underline="hover"
              >
                Smart Deposits
              </Anchor>
              <Anchor
                href="#"
                size="sm"
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
                underline="hover"
              >
                Community Articles
              </Anchor>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Text fw={700} mb="lg" size="sm" tt="uppercase">
              Contact
            </Text>
            <Stack gap="sm">
              <Group gap="xs" wrap="nowrap">
                <IconMail size={16} />
                <Anchor
                  href="mailto:support@upagain.com"
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                >
                  support@upagain.com
                </Anchor>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <IconMapPin size={16} />
                <Text
                  size="sm"
                  c={
                    scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"
                  }
                >
                  21 Erard street, 75012 Paris
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
            <Text fw={700} mb="lg" size="sm" tt="uppercase">
              Legal
            </Text>
            <Stack gap="xs">
              <Anchor
                href="#"
                size="sm"
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
                underline="hover"
              >
                Terms & Conditions
              </Anchor>
              <Anchor
                href="#"
                size="sm"
                c={scheme === "dark" ? "#c7c7c7" : "var(--mantine-color-text)"}
                underline="hover"
              >
                Privacy Policy
              </Anchor>
            </Stack>
          </Grid.Col>
        </Grid>
        <Divider
          my="xl"
          label={`© ${new Date().getFullYear()} UpAgain. All rights reserved.`}
          labelPosition="center"
        />
      </Container>
    </Box>
  );
}
