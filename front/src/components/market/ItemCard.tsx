import { Card, Image, Text, Group, Badge, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import type { Item } from "../../api/interfaces/item";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { resolveUrl } from "../../utils/imageUtils";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "marketplace"]);

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="item-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
      onClick={() =>
        navigate(PATHS.MARKETPLACE.HOME + "/" + item.id.toString(), {
          state: { from: "marketplace" },
        })
      }
    >
      <Card.Section>
        <Image
          src={resolveUrl(item.images?.[0] || "/placeholder-item.png")}
          height={180}
          alt={item.title}
          fallbackSrc="https://placehold.co/600x400?text=No+Image"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={700} size="lg" lineClamp={1} style={{ flex: 1 }}>
            {item.title}
          </Text>
          <Badge color="var(--upagain-neutral-green)" variant="light" size="lg">
            {item.price}€
          </Badge>
        </Group>

        <Group gap={6}>
          <Badge
            variant={
              item.material === "wood"
                ? "blue"
                : item.material === "metal"
                  ? "green"
                  : item.material === "textile"
                    ? "yellow"
                    : item.material === "glass"
                      ? "red"
                      : item.material === "plastic"
                        ? "violet"
                        : item.material === "other"
                          ? "gray"
                          : "cyan"
            }
            size="sm"
          >
            {t(`common:materials.${item.material}`, {
              defaultValue: item.material,
            })}
          </Badge>
          <Badge color="var(--upagain-neutral-green)" variant="light" size="sm">
            {item.state}
          </Badge>
        </Group>

        <Text
          size="sm"
          c="dimmed"
          lineClamp={2}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(item.description),
          }}
        />
      </Stack>
    </Card>
  );
}
