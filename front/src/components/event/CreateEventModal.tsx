import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Grid,
  Select,
  Button,
  Group,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useCreateEvent } from "../../hooks/eventHooks";
import { TextEditor } from "../input/TextEditor";
import ImageDropzone from "../input/ImageDropzone";
import {
  validateEventTitle,
  validateEventCapacity,
  validateEventPrice,
  validateEventStreet,
  validateEventCity,
  validateEventDate,
  validateEventCategory,
  validateEventDescription,
} from "../../utils/eventValidation";

interface CreateEventModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateEventModal({ opened, onClose }: CreateEventModalProps) {
  const { t } = useTranslation(["admin", "common"]);
  const [title, setTitle] = useState<string>("");
  const [capacity, setCapacity] = useState<number | undefined>();
  const [price, setPrice] = useState<number>(0);
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [locationDetail, setLocationDetail] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCapacity, setErrorCapacity] = useState<string>("");
  const [errorPrice, setErrorPrice] = useState<string>("");
  const [errorStreet, setErrorStreet] = useState<string>("");
  const [errorCity, setErrorCity] = useState<string>("");
  const [errorDate, setErrorDate] = useState<string>("");
  const [errorEndDate, setErrorEndDate] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);

  const createEventMutation = useCreateEvent();

  const handleClose = () => {
    setTitle("");
    setCapacity(undefined);
    setPrice(0);
    setStreet("");
    setCity("");
    setLocationDetail("");
    setDate(null);
    setEndDate(null);
    setCategory("");
    setDescription("");
    setErrorTitle("");
    setErrorCapacity("");
    setErrorPrice("");
    setErrorStreet("");
    setErrorCity("");
    setErrorDate("");
    setErrorEndDate("");
    setErrorCategory("");
    setErrorDescription("");
    setFiles([]);
    onClose();
  };

  const handleValidateTitle = () => {
    if (!validateEventTitle(title)) {
      setErrorTitle(t("events.create_modal.errors.title"));
      return false;
    }
    setErrorTitle("");
    return true;
  };
  const handleValidateCapacity = () => {
    if (!validateEventCapacity(capacity)) {
      setErrorCapacity(t("events.create_modal.errors.capacity"));
      return false;
    }
    setErrorCapacity("");
    return true;
  };
  const handleValidatePrice = () => {
    if (!validateEventPrice(price)) {
      setErrorPrice(t("events.create_modal.errors.price"));
      return false;
    }
    setErrorPrice("");
    return true;
  };
  const handleValidateStreet = () => {
    if (!validateEventStreet(street)) {
      setErrorStreet(t("events.create_modal.errors.street"));
      return false;
    }
    setErrorStreet("");
    return true;
  };
  const handleValidateCity = () => {
    if (!validateEventCity(city)) {
      setErrorCity(t("events.create_modal.errors.city"));
      return false;
    }
    setErrorCity("");
    return true;
  };
  const handleValidateCategory = () => {
    if (!validateEventCategory(category)) {
      setErrorCategory(t("events.create_modal.errors.category"));
      return false;
    }
    setErrorCategory("");
    return true;
  };
  const handleValidateDescription = () => {
    if (!validateEventDescription(description)) {
      setErrorDescription(t("events.create_modal.errors.description"));
      return false;
    }
    setErrorDescription("");
    return true;
  };
  const handleValidateStartDate = () => {
    if (!validateEventDate(date)) {
      setErrorDate(t("events.create_modal.errors.start_date"));
      return false;
    }
    setErrorDate("");
    return true;
  };
  const handleValidateEndDate = () => {
    if (!validateEventDate(endDate)) {
      setErrorEndDate(t("events.create_modal.errors.end_date"));
      return false;
    }
    setErrorEndDate("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isTitleValid = handleValidateTitle();
    const isCapacityValid = handleValidateCapacity();
    const isPriceValid = handleValidatePrice();
    const isStreetValid = handleValidateStreet();
    const isCityValid = handleValidateCity();
    const isStartDateValid = handleValidateStartDate();
    const isEndDateValid = handleValidateEndDate();
    const isCategoryValid = handleValidateCategory();
    const isDescriptionValid = handleValidateDescription();

    if (
      !isTitleValid ||
      !isCapacityValid ||
      !isPriceValid ||
      !isStreetValid ||
      !isCityValid ||
      !isStartDateValid ||
      !isEndDateValid ||
      !isCategoryValid ||
      !isDescriptionValid
    )
      return;

    const filesToSend = new FormData();
    files.forEach((file) => {
      filesToSend.append("images", file);
    });
    createEventMutation.mutate(
      {
        title,
        capacity: capacity ?? undefined,
        price,
        street,
        city,
        location_detail: locationDetail,
        start_at: date ? dayjs(date).toISOString() : "",
        end_at: endDate ? dayjs(endDate).toISOString() : "",
        category,
        description,
        status: "pending",
        images: filesToSend,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t("events.create_modal.title")}
      size="xl"
    >
      <Stack>
        <TextInput
          data-autofocus
          withAsterisk
          placeholder={t("events.create_modal.title_placeholder")}
          label={t("events.create_modal.title_label")}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onBlur={handleValidateTitle}
          error={errorTitle}
          disabled={createEventMutation.isPending}
          required
        />
        <NumberInput
          label={t("events.create_modal.capacity_label")}
          placeholder={t("events.create_modal.capacity_placeholder")}
          min={0}
          disabled={createEventMutation.isPending}
          value={capacity}
          suffix={t("events.create_modal.capacity_suffix")}
          onChange={(value) => {
            setCapacity(Number(value));
          }}
          onBlur={handleValidateCapacity}
          error={errorCapacity}
        />
        <NumberInput
          withAsterisk
          label={t("events.create_modal.price_label")}
          placeholder={t("events.create_modal.price_placeholder")}
          min={0}
          prefix="€"
          value={price}
          disabled={createEventMutation.isPending}
          onChange={(value) => {
            setPrice(Number(value));
          }}
          onBlur={handleValidatePrice}
          error={errorPrice}
          required
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <TextInput
              withAsterisk
              label={t("events.create_modal.street_label")}
              disabled={createEventMutation.isPending}
              value={street}
              placeholder={t("events.create_modal.street_placeholder")}
              onChange={(e) => {
                setStreet(e.target.value);
              }}
              onBlur={handleValidateStreet}
              error={errorStreet}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              withAsterisk
              placeholder={t("events.create_modal.city_placeholder")}
              label={t("events.create_modal.city_label")}
              value={city}
              disabled={createEventMutation.isPending}
              onChange={(e) => {
                setCity(e.target.value);
              }}
              onBlur={handleValidateCity}
              error={errorCity}
              required
            />
          </Grid.Col>
        </Grid>
        <TextInput
          label={t("events.create_modal.location_detail_label")}
          placeholder={t("events.create_modal.location_detail_placeholder")}
          disabled={createEventMutation.isPending}
          value={locationDetail}
          onChange={(e) => {
            setLocationDetail(e.target.value);
          }}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateTimePicker
              clearable
              withAsterisk
              label={t("events.create_modal.start_date_label")}
              placeholder={t("events.create_modal.start_date_placeholder")}
              value={date ? new Date(date) : null}
              disabled={createEventMutation.isPending}
              onChange={(val) => setDate(val ? dayjs(val).toISOString() : null)}
              required
              onBlur={handleValidateStartDate}
              error={errorDate}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateTimePicker
              withAsterisk
              clearable
              label={t("events.create_modal.end_date_label")}
              placeholder={t("events.create_modal.end_date_placeholder")}
              onBlur={handleValidateEndDate}
              error={errorEndDate}
              value={endDate ? new Date(endDate) : null}
              disabled={createEventMutation.isPending}
              onChange={(val) =>
                setEndDate(val ? dayjs(val).toISOString() : null)
              }
              required
            />
          </Grid.Col>
        </Grid>
        <Select
          withAsterisk
          clearable
          label={t("events.create_modal.category_label")}
          value={category}
          disabled={createEventMutation.isPending}
          placeholder={t("events.create_modal.category_placeholder")}
          error={errorCategory}
          onBlur={handleValidateCategory}
          data={[
            {
              value: "workshop",
              label: t("common:event_categories.workshop"),
            },
            {
              value: "conference",
              label: t("common:event_categories.conference"),
            },
            {
              value: "meetups",
              label: t("common:event_categories.meetups"),
            },
            {
              value: "exposition",
              label: t("common:event_categories.exposition"),
            },
            {
              value: "other",
              label: t("common:event_categories.other"),
            },
          ]}
          onChange={(value) => {
            setCategory(value as string);
          }}
        />
        <TextEditor
          label={t("events.create_modal.description_label")}
          value={description}
          placeholder={t("events.create_modal.description_placeholder")}
          error={errorDescription}
          onChange={(value) => {
            setDescription(value);
          }}
        />
        <ImageDropzone
          loading={createEventMutation.isPending}
          files={files}
          setFiles={setFiles}
        />
      </Stack>
      <Group mt="lg" justify="center">
        <Button onClick={handleClose} variant="grey">
          {t("users.delete_modal.cancel")}
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit(e);
          }}
          variant="primary"
          loading={createEventMutation.isPending}
        >
          {t("common:confirm", { defaultValue: "Confirm" })}
        </Button>
      </Group>
    </Modal>
  );
}
