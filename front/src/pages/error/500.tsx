import { Title, Text, Button, Flex, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";
import { useTranslation } from "react-i18next";

export function InternalServerErrorPage() {
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
        <div className={classes.label}>500</div>
        <Title className={classes.title}>{t("500.title")}</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          {t("500.description")}
        </Text>
        <Stack justify="center" gap="lg">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t("500.back_to_previous")}
          </Button>
          <Button variant="primary" onClick={() => navigate(PATHS.HOME)}>
            {t("500.back_to_home")}
          </Button>
        </Stack>
      </Flex>
    </div>
  );
}
