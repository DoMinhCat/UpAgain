import { Modal, Text, Group, Button, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetAvailableContainers } from "../../hooks/containerHooks";

interface TransferContainerModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (newContainerId: number) => void;
  isLoading: boolean;
  currentContainerId?: number | string;
}

export function TransferContainerModal({
  opened,
  onClose,
  onConfirm,
  isLoading,
  currentContainerId,
}: TransferContainerModalProps) {
  const { t } = useTranslation(["admin", "common", "marketplace"]);
  const {
    data: availableContainersData,
    isLoading: isLoadingAvailableContainers,
  } = useGetAvailableContainers();
  const availableContainers = availableContainersData || [];

  const [transferContainer, setTransferContainer] = useState<string>(
    currentContainerId?.toString() || "",
  );

  useEffect(() => {
    if (opened && currentContainerId) {
      setTransferContainer(currentContainerId.toString());
    }
  }, [opened, currentContainerId]);

  const handleConfirm = () => {
    if (transferContainer) {
      onConfirm(parseInt(transferContainer));
    }
  };

  const handleClose = () => {
    setTransferContainer(currentContainerId?.toString() || "");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("marketplace:detail.transfer_modal.title", {
        defaultValue: "Transfer to another container",
      })}
      size="lg"
      centered
    >
      <Text mb="sm">
        {t("marketplace:detail.transfer_modal.choose", {
          defaultValue: "Choose a new container for this deposit",
        })}
      </Text>
      <Select
        withAsterisk
        value={transferContainer}
        disabled={isLoading || isLoadingAvailableContainers}
        data={availableContainers.map((container) => ({
          value: container.id.toString(),
          label: `${t("common:container", { defaultValue: "Container" })} #${container.id} - ${container.street}, ${container.city_name} ${container.postal_code}`,
        }))}
        onChange={(value) => {
          setTransferContainer(value as string);
        }}
        mb="lg"
      />
      <Group mt="lg" justify="center">
        <Button onClick={handleClose} variant="grey">
          {t("common:actions.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="primary"
          loading={isLoading}
          disabled={
            !transferContainer ||
            transferContainer === currentContainerId?.toString()
          }
        >
          {t("common:actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
