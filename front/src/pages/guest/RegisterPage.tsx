import { Grid } from "@mantine/core";
import { isTokenExpired } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import classes from "../../styles/GlobalStyles.module.css";
import RegisterForm from "../../components/guest/RegisterForm";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RegisterFormPro from "../../components/guest/RegisterFormPro";
import { useHandleVerifyStripePremiumRegistration } from "../../hooks/stripeHooks";
import FullScreenSkeleton from "../../components/common/FullScreenSkeleton";

export default function Register() {
  const location = useLocation();
  const registerRole = location.state?.role;
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();

  const { isVerifying } = useHandleVerifyStripePremiumRegistration();
  const pendingPayload = sessionStorage.getItem("pending_register_payload");
  const isPro = registerRole === "pro" || !!pendingPayload;

  useEffect(() => {
    if (!isInitializing && user && !isTokenExpired()) {
      if (user.role === "admin") {
        navigate(PATHS.ADMIN.HOME, { replace: true });
      } else {
        navigate(PATHS.HOME, { replace: true });
      }
    }
  }, [user, isInitializing]);

  if (isVerifying) {
    return <FullScreenSkeleton />;
  }

  return (
    <div className={classes.main}>
      <Grid justify="center" align="center" style={{ width: "100%" }}>
        <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
          {isPro ? <RegisterFormPro /> : <RegisterForm />}
        </Grid.Col>
      </Grid>
    </div>
  );
}
