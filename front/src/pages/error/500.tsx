import { Title, Text, Button, Flex, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";

export function InternalServerErrorPage() {
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
        <Title className={classes.title}>Ack! You found a bug?</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          We ran into an unexpected problem. Please contact us or try again
          later.
        </Text>
        <Stack justify="center" gap="lg">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Take me back to the previous page
          </Button>
          <Button variant="primary" onClick={() => navigate(PATHS.HOME)}>
            Take me back to home page
          </Button>
        </Stack>
      </Flex>
    </div>
  );
}
