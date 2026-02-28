import { Breadcrumbs, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/AdminBreadcrumbs.module.css";
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
  const breadcrumbsItems = breadcrumbs.map((breadcrumb) => {
    return (
      <Title
        order={2}
        onClick={() => {
          navigate(breadcrumb.href);
        }}
        className={classes.breadcrumbTitle}
      >
        {breadcrumb.title}
      </Title>
    );
  });
  return (
    <Breadcrumbs
      mt="lg"
      mb="xl"
      separator={<IconChevronRight size={16} />}
      styles={{
        separator: {
          color: "var(--mantine-color-text)", // Change color
          fontWeight: 700, // Make it bold
        },
      }}
    >
      {breadcrumbsItems}
    </Breadcrumbs>
  );
}
