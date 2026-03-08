import { Grid } from "@mantine/core";
import { LoginForm } from "../../components/guest/LoginForm";
import classes from "../../styles/GlobalStyles.module.css";
import { isTokenExpired } from "../../api/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function Login() {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isInitializing && user && !isTokenExpired()) {
      const origin = location.state?.from?.pathname;

      if (origin) {
        navigate(origin, { replace: true });
      } else {
        if (user.role === "admin") {
          navigate(PATHS.ADMIN.HOME, { replace: true });
        } else {
          navigate(PATHS.HOME, { replace: true });
        }
      }
    }
  }, [user, isInitializing, location, navigate]);

  if (isInitializing) return null;

  return (
    <div className={classes.main}>
      <Grid justify="center" align="center" style={{ width: "100%" }}>
        <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
          <LoginForm />
        </Grid.Col>
      </Grid>
    </div>
  );
}
