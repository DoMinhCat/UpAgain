import { Title, Text, Button, Group, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className={global.main}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flexGrow: 1 }}
      >
        <div className={classes.label}>403</div>
        <Title className={classes.title}>You have found a vault!</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          Unfortunately, this is only a 403 error page. You don't have the right
          key to access the vault you just found.
        </Text>
        <Group justify="center">
          <Button variant="primary" onClick={() => navigate(PATHS.HOME)}>
            Take me back to home page
          </Button>
        </Group>
      </Flex>
    </div>
  );
}
