import { Breadcrumbs, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";

interface AdminBreadcrumbsProps {
  title: string;
  href: string;
}

export default function AdminBreadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: AdminBreadcrumbsProps[];
}) {
  const navigate = useNavigate();

  const breadcrumbsItems = breadcrumbs.map((breadcrumb, index) => {
    const isLast = index === breadcrumbs.length - 1;

    return (
      <Text
        key={breadcrumb.href}
        // 1. Only apply the class and variant to non-last items
        className={!isLast ? "text" : undefined}
        data-variant={!isLast ? "primary" : undefined}
        size="sm"
        fw={isLast ? 800 : 600}
        onClick={!isLast ? () => navigate(breadcrumb.href) : undefined}
        style={{
          // 2. Explicitly override the color for the links (previous items)
          color: isLast
            ? "var(--mantine-color-text)"
            : "var(--upagain-neutral-green)",

          // 3. Pointer for links, default for current page
          cursor: isLast ? "default" : "pointer",
          lineHeight: 1,
        }}
      >
        {breadcrumb.title}
      </Text>
    );
  });

  return (
    <Breadcrumbs
      mt="lg"
      mb="xl"
      separator={
        <IconChevronRight
          size={14}
          stroke={3}
          style={{ color: "var(--mantine-color-text)", opacity: 0.4 }}
        />
      }
      styles={{
        root: {
          flexWrap: "wrap",
        },
        separator: {
          marginLeft: 8,
          marginRight: 8,
        },
      }}
    >
      {breadcrumbsItems}
    </Breadcrumbs>
  );
}
