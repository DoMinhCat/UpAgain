import {
  Avatar,
  Container,
  Flex,
  Stack,
  Text,
  Title,
  Center,
  Loader,
} from "@mantine/core";
import { PATHS } from "../../routes/paths";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import { ScoreRing } from "../../components/ScoreRing";
import { useEffect } from "react";
import { getAccountDetails, type Account } from "../../api/admin/userModule";
import { Navigate, useParams } from "react-router-dom";
import { showErrorNotification } from "../../components/NotificationToast";
import { useQuery } from "@tanstack/react-query";
import FullScreenLoader from "../../components/FullScreenLoader";

export default function AdminUserDetails() {
  const params = useParams();
  const accountId: number = params.id ? parseInt(params.id) : 0;
  const isValidId = !isNaN(accountId) && accountId > 0;
  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    error,
  } = useQuery<Account>({
    queryKey: ["accountDetails", accountId],
    queryFn: () => getAccountDetails(accountId),
    enabled: isValidId, // only run query if isValidId
  });

  useEffect(() => {
    if (error) {
      showErrorNotification("Error", "Error while fetching account details");
    }
  }, [error]);

  if (isAccountDetailsLoading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return <Navigate to={PATHS.ADMIN.USERS} replace />;
  }
  return (
    <Container px="md" size="xl">
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "User Management", href: PATHS.ADMIN.USERS },
          { title: "Users Details", href: "#" },
        ]}
      />
      <Container px="md" size="sm" mt="xl">
        <Flex align="flex-start" justify="flex-end">
          <ScoreRing score={69} size={90} />
        </Flex>
        <Stack justify="center" align="center">
          <Avatar src={null} name="User's name" color="initials" size="100" />
          <Title order={3}>{accountDetails?.username}</Title>
        </Stack>
        <Title order={3} ta="left" mt="lg">
          {accountDetails?.username}
        </Title>

        <Text>Email</Text>
        <Text>Role</Text>
        <Text>Phone</Text>
      </Container>
    </Container>
  );
}
