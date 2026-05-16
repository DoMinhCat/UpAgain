import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Select,
  SimpleGrid,
  Group,
  Button,
  Text,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { TextEditor } from "../input/TextEditor";
import ImageDropzone from "../input/ImageDropzone";
import type { Item } from "../../api/interfaces/item";
import { useUpdateListing } from "../../hooks/listingHooks";
import { useUpdateDeposit } from "../../hooks/depositHooks";
import { IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface EditItemModalProps {
  opened: boolean;
  onClose: () => void;
  item: Item;
  listingDetails?: {
    street?: string;
    city?: string;
    postal_code?: string;
  };
}

export function EditItemModal({
  opened,
  onClose,
  item,
  listingDetails,
}: EditItemModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["admin", "create_item", "common"]);

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [material, setMaterial] = useState(item.material);
  const [state, setState] = useState(item.state);
  const [weight, setWeight] = useState(item.weight);
  const [price, setPrice] = useState(item.price);

  const [city, setCity] = useState(listingDetails?.city || "");
  const [street, setStreet] = useState(listingDetails?.street || "");
  const [postalCode, setPostalCode] = useState(
    listingDetails?.postal_code || "",
  );
  const [files, setFiles] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isListing = item.category === "listing";

  const updateListingMutation = useUpdateListing(item.id);
  const updateDepositMutation = useUpdateDeposit(item.id);

  const isPending =
    updateListingMutation.isPending || updateDepositMutation.isPending;

  useEffect(() => {
    if (opened) {
      setTitle(item.title);
      setDescription(item.description);
      setMaterial(item.material);
      setState(item.state);
      setWeight(item.weight);
      setPrice(item.price);
      setFiles(item.images?.map((img) => ({ path: img })) || []);

      if (isListing) {
        setCity(listingDetails?.city || "");
        setStreet(listingDetails?.street || "");
        setPostalCode(listingDetails?.postal_code || "");
      }
      setErrors({});
    }
  }, [opened, item, listingDetails, isListing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title) newErrors.title = t("create_item:validation.required");

    const stripped = description.replace(/<[^>]*>/g, "").trim();
    if (!description || stripped === "")
      newErrors.description = t("create_item:validation.required");

    if (!material) newErrors.material = t("create_item:validation.required");
    if (!state) newErrors.state = t("create_item:validation.required");
    if (weight === undefined || weight === null)
      newErrors.weight = t("create_item:validation.required");
    if (price === undefined || price === null)
      newErrors.price = t("create_item:validation.required");

    if (isListing) {
      if (!city) newErrors.city = t("create_item:validation.required");
      if (!street) newErrors.street = t("create_item:validation.required");
      if (!postalCode) {
        newErrors.postalCode = t("create_item:validation.required");
      } else if (!/^\d{5,9}$/.test(postalCode)) {
        newErrors.postalCode = t("create_item:validation.invalid_postal_code");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("material", material);
    formData.append("state", state);
    formData.append("weight", weight.toString());
    formData.append("price", price.toString());

    if (isListing) {
      formData.append("street", street);
      formData.append("city", city);
      formData.append("postal_code", postalCode);
    }

    files.forEach((obj) => {
      if (obj instanceof File) {
        formData.append("new_images", obj);
      } else if (obj.path) {
        formData.append("existing_images", obj.path);
      }
    });

    if (isListing) {
      updateListingMutation.mutate(formData, {
        onSuccess: () => {
          onClose();
          navigate(-1);
        },
      });
    } else {
      updateDepositMutation.mutate(formData, {
        onSuccess: () => {
          onClose();
          navigate(-1);
        },
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("listings.details.edit_modal.title")}
      centered
      size="xl"
    >
      <Stack>
        <TextInput
          data-autofocus
          withAsterisk
          label={t("validations.table.title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isPending}
          required
        />
        <NumberInput
          min={0}
          withAsterisk
          label={t("validations.table.price")}
          value={price}
          onChange={(val) => setPrice(Number(val))}
          error={errors.price}
          disabled={isPending}
          required
        />
        <NumberInput
          min={0}
          withAsterisk
          label={t("listings.filters.weight")}
          value={weight}
          onChange={(val) => setWeight(Number(val))}
          error={errors.weight}
          disabled={isPending}
          required
        />
        <Select
          withAsterisk
          label={t("listings.filters.material")}
          value={material}
          error={errors.material}
          disabled={isPending}
          data={[
            { value: "wood", label: t("common:materials.wood") },
            { value: "glass", label: t("common:materials.glass") },
            { value: "plastic", label: t("common:materials.plastic") },
            { value: "metal", label: t("common:materials.metal") },
            { value: "textile", label: t("common:materials.textile") },
            { value: "mixed", label: t("common:materials.mixed") },
            { value: "other", label: t("common:materials.other") },
          ]}
          onChange={(val) => setMaterial(val as string)}
        />
        <Select
          withAsterisk
          label={t("listings.filters.state")}
          value={state}
          error={errors.state}
          disabled={isPending}
          data={[
            { value: "new", label: t("common:states.new") },
            { value: "very_good", label: t("common:states.very_good") },
            { value: "good", label: t("common:states.good") },
            { value: "need_repair", label: t("common:states.need_repair") },
          ]}
          onChange={(val) => setState(val as string)}
        />
        {isListing && (
          <>
            <TextInput
              withAsterisk
              label={t("containers.create_modal.street")}
              value={street}
              error={errors.street}
              onChange={(e) => setStreet(e.target.value)}
              disabled={isPending}
              required
            />
            <SimpleGrid cols={2}>
              <TextInput
                withAsterisk
                label={t("containers.create_modal.city")}
                value={city}
                error={errors.city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isPending}
                required
              />
              <TextInput
                withAsterisk
                label={t("containers.create_modal.postal_code")}
                value={postalCode}
                error={errors.postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={isPending}
                required
              />
            </SimpleGrid>
          </>
        )}

        <TextEditor
          label={t("listings.details.edit_modal.description_label")}
          value={description}
          error={errors.description}
          onChange={setDescription}
        />
        <ImageDropzone loading={isPending} files={files} setFiles={setFiles} />
        <Group justify="center" mt="sm" gap="xs">
          <IconInfoCircle size={16} color="var(--upagain-yellow)" />
          <Text size="xs" c="var(--upagain-yellow)" ta="center">
            {t("create_item:validation_notice")}
          </Text>
        </Group>
      </Stack>
      <Group mt="lg" justify="center">
        <Button onClick={onClose} variant="grey">
          {t("common:actions.cancel")}
        </Button>
        <Button onClick={handleConfirm} loading={isPending} variant="primary">
          {t("common:actions.confirm")}
        </Button>
      </Group>
    </Modal>
  );
}
