import { Grid } from "@mantine/core";
import { isTokenExpired } from "../../api/auth";
import { Navigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";
import classes from "../../styles/GlobalStyles.module.css";
import RegisterForm from "../../components/guest/RegisterForm";

export default function Register() {
    const { user } = useAuth();

    if (user && !isTokenExpired()) {
        if (user.role == "admin") return <Navigate to={PATHS.ADMIN.HOME} replace />;
        else return <Navigate to={PATHS.HOME} replace />;
    }
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
