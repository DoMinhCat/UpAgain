import { Container, Tabs, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { fetchPendingValidations } from "../../api/admin/validationModule";
import AdminBreadcrumbs from "../../components/admin/AdminBreadcrumbs";
import FullScreenLoader from "../../components/FullScreenLoader";
import PendingDepositsTable from "../../components/admin/PendingDepositsTable";
import { PATHS } from "../../routes/paths";

export default function ValidationHub() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pendingValidations"],
    queryFn: fetchPendingValidations,
  });

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <Container mt="xl"><Text c="red" ta="center">Erreur lors du chargement des données. Veuillez réessayer.</Text></Container>;

  return (
    <Container size="xl" mt="md">
      <AdminBreadcrumbs
        breadcrumbs={[
          { title: "Dashboard", href: PATHS.ADMIN.HOME },
          { title: "Validations", href: PATHS.ADMIN.VALIDATIONS },
        ]}
      />

      <Tabs defaultValue="deposits">
        <Tabs.List>
          <Tabs.Tab value="deposits">
            Dépôts ({data?.deposits?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="listings">
            Annonces ({data?.listings?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="events">
            Événements ({data?.events?.length || 0})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="deposits" pt="xl">
          <PendingDepositsTable data={data?.deposits || []} loading={isLoading} onSuccess={refetch} />
        </Tabs.Panel>

        <Tabs.Panel value="listings" pt="xl">
           <Text c="dimmed" ta="center" mt="xl">Le tableau des annonces arrive bientôt...</Text>
           {/* TODO: <PendingListingsTable data={data?.listings || []} loading={isLoading} onSuccess={refetch} /> */}
        </Tabs.Panel>

        <Tabs.Panel value="events" pt="xl">
           <Text c="dimmed" ta="center" mt="xl">Le tableau des événements arrive bientôt...</Text>
           {/* TODO: <PendingEventsTable data={data?.events || []} loading={isLoading} onSuccess={refetch} /> */}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}