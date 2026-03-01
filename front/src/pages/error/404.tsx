import { Title, Text, Button, Group, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";

export function NotFoundPage() {
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
        <Title className={classes.title}>You have found a secret place.</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          Unfortunately, this is only a 404 page. You may have mistyped the
          address, or the page has been moved to another URL.
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
