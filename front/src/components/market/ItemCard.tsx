import { Card, Image, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import type { Item } from "../../api/interfaces/item";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ cursor: "pointer" }}
      //   onClick={() => navigate(PATHS.MARKETPLACE.VIEW.replace(":id", item.id))}
    >
      <Card.Section>
        <Image src={item.images?.[0]} height={160} alt={item.title} />
      </Card.Section>
      <Text size="lg" fw={700} mt="md">
        {item.title}
      </Text>
      <Text size="sm" c="dimmed" mt="xs">
        {item.description}
      </Text>
    </Card>
  );
}
