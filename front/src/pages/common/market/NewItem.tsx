import { Container } from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotFoundPage } from "../../error/404";

export default function NewItemPage() {
  const { user } = useAuth();
  const role: string = user?.role || "";
  const navigate = useNavigate();

  if (role !== "pro") {
    return <NotFoundPage />;
  }

  return (
    <Container>
      <p>NewItemPage</p>
    </Container>
  );
}
