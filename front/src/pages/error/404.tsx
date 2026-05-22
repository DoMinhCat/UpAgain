import { Title, Text, Button, Group, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation("errors");
  const navigate = useNavigate();
  return (
    <div className={global.main}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flexGrow: 1 }}
      >
        <div className={classes.label}>404</div>
        <Title className={classes.title}>{t("404.title")}</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          {t("404.description")}
        </Text>
        <Group justify="center">
          <Button variant="primary" onClick={() => navigate(PATHS.HOME)}>
            {t("404.back_to_home")}
          </Button>
        </Group>
      </Flex>
    </div>
  );
}
