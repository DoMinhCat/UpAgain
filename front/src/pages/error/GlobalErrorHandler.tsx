import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { NotFoundPage } from "./404";
import { UnauthorizedPage } from "./403";
import { PATHS } from "../../routes/paths";
import classes from "../../styles/NotFound.module.css";
import global from "../../styles/GlobalStyles.module.css";
import { Button, Flex, Group, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const GlobalErrorHandler = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Handle specific HTTP-like errors (404, 403, 500)
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }

    if (error.status === 403) {
      return <UnauthorizedPage />;
    }
  }

  // Handle unexpected code crashes (Syntax errors, undefined variables, etc.)
  return (
    <div className={global.main}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flexGrow: 1 }}
      >
        <div className={classes.label}>500</div>
        <Title className={classes.title}>Oops! Something went wrong.</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          An unexpected error occurred. Please try refreshing the page.
        </Text>
        <Group justify="center">
          <Button variant="primary" onClick={() => navigate(PATHS.HOME)}>
            Take me back to home page
          </Button>
        </Group>
      </Flex>
    </div>
  );
};

export default GlobalErrorHandler;
