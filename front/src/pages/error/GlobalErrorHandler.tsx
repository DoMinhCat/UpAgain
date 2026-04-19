import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { NotFoundPage } from "./404";
import { UnauthorizedPage } from "./403";
import { InternalServerErrorPage } from "./500";

const GlobalErrorHandler = () => {
  const error = useRouteError();

  // Handle specific HTTP-like errors (404, 403, 500)
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }

    if (error.status === 403) {
      return <UnauthorizedPage />;
    }
    if (error.status === 500) {
      return <InternalServerErrorPage />;
    }
  }

  // Handle unexpected code crashes (Syntax errors, undefined variables, etc.)
  return <InternalServerErrorPage />;
};

export default GlobalErrorHandler;
