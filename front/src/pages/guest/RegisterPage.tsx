import { Grid } from "@mantine/core";
import { isTokenExpired } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import classes from "../../styles/GlobalStyles.module.css";
import RegisterForm from "../../components/guest/RegisterForm";
import { useEffect } from "react";

export default function Register() {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && user && !isTokenExpired()) {
      if (user.role === "admin") {
        navigate(PATHS.ADMIN.HOME, { replace: true });
      } else {
        navigate(PATHS.HOME, { replace: true });
      }
    }
  }, [user, isInitializing]);

  return (
    <div className={classes.main}>
      <Grid justify="center" align="center" style={{ width: "100%" }}>
        <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
          <RegisterForm />
        </Grid.Col>
      </Grid>
    </div>
  );
}
