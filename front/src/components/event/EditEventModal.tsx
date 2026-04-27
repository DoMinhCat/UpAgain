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
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useUpdateEvent } from "../../hooks/eventHooks";
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

interface EditEventModalProps {
  opened: boolean;
  onClose: () => void;
  id_event: number;
  eventDetails: any; // Ideally we use a proper type here from api/interfaces/event
}

export function EditEventModal({
  opened,
  onClose,
  id_event,
  eventDetails,
}: EditEventModalProps) {
  const [titleEdit, setTitleEdit] = useState<string>("");
  const [capacityEdit, setCapacityEdit] = useState<number | null>(null);
  const [priceEdit, setPriceEdit] = useState<number>(0);
  const [streetEdit, setStreetEdit] = useState<string>("");
  const [cityEdit, setCityEdit] = useState<string>("");
  const [locationDetailEdit, setLocationDetailEdit] = useState<string>("");
  const [dateEdit, setDateEdit] = useState<string>("");
  const [endDateEdit, setEndDateEdit] = useState<string>("");
  const [categoryEdit, setCategoryEdit] = useState<string>("");
  const [descriptionEdit, setDescriptionEdit] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorCapacity, setErrorCapacity] = useState<string | null>(null);
  const [errorPrice, setErrorPrice] = useState<string | null>(null);
  const [errorStreet, setErrorStreet] = useState<string | null>(null);
  const [errorCity, setErrorCity] = useState<string | null>(null);
  const [errorDate, setErrorDate] = useState<string | null>(null);
  const [errorEndDate, setErrorEndDate] = useState<string | null>(null);
  const [errorCategory, setErrorCategory] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [fileEdit, setFileEdit] = useState<any[]>([]);

  const updateEvent = useUpdateEvent(id_event);

  useEffect(() => {
    if (opened && eventDetails) {
      setTitleEdit(eventDetails.title || "");
      setCapacityEdit(eventDetails.capacity || 0);
      setPriceEdit(eventDetails.price || 0);
      setStreetEdit(eventDetails.street || "");
      setCityEdit(eventDetails.city || "");
      setLocationDetailEdit(eventDetails.location_detail || "");
      setDateEdit(eventDetails.start_at || "");
      setEndDateEdit(eventDetails.end_at || "");
      setCategoryEdit(eventDetails.category || "");
      setDescriptionEdit(eventDetails.description || "");
      const files = eventDetails.images?.map((path: string) => {
        return {
          path: path,
        };
      });
      setFileEdit(files || []);
    }
  }, [opened, eventDetails]);

  // validations
  const handleValidateTitle = () => {
    if (!validateEventTitle(titleEdit)) {
      setErrorTitle("Title is required");
      return false;
    }
    setErrorTitle("");
    return true;
  };
  const handleValidateCapacity = () => {
    if (!validateEventCapacity(capacityEdit)) {
      setErrorCapacity("Capacity must be greater than 0");
      return false;
    }
    setErrorCapacity("");
    return true;
  };
  const handleValidatePrice = () => {
    if (!validateEventPrice(priceEdit)) {
      setErrorPrice("Price must be greater than or equal to 0");
      return false;
    }
    setErrorPrice("");
    return true;
  };
  const handleValidateStreet = () => {
    if (!validateEventStreet(streetEdit)) {
      setErrorStreet("Street is required");
      return false;
    }
    setErrorStreet("");
    return true;
  };
  const handleValidateCity = () => {
    if (!validateEventCity(cityEdit)) {
      setErrorCity("City is required");
      return false;
    }
    setErrorCity("");
    return true;
  };
  const handleValidateDate = () => {
    if (!validateEventDate(dateEdit)) {
      setErrorDate("Start date is required");
      return false;
    }
    setErrorDate("");
    return true;
  };
  const handleValidateCategory = () => {
    if (!validateEventCategory(categoryEdit)) {
      setErrorCategory("Category is required");
      return false;
    }
    setErrorCategory("");
    return true;
  };
  const handleValidateDescription = () => {
    if (!validateEventDescription(descriptionEdit)) {
      setErrorDescription("A description is required");
      return false;
    }
    setErrorDescription("");
    return true;
  };
  const handleValidateStartDate = (date: string | null) => {
    if (!validateEventDate(date)) {
      setErrorDate("Start date is required");
      return false;
    }
    setErrorDate("");
    return true;
  };
  const handleValidateEndDate = (date: string | null) => {
    if (!validateEventDate(date)) {
      setErrorEndDate("End date is required");
      return false;
    }
    setErrorEndDate("");
    return true;
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !handleValidateTitle() ||
      !handleValidateCapacity() ||
      !handleValidatePrice() ||
      !handleValidateStreet() ||
      !handleValidateCity() ||
      !handleValidateDate() ||
      !handleValidateCategory() ||
      !handleValidateDescription() ||
      !handleValidateStartDate(dateEdit) ||
      !handleValidateEndDate(endDateEdit)
    )
      return;
    const imagesData = new FormData();
    fileEdit.forEach((obj) => {
      if (obj instanceof File) {
        imagesData.append("new_images", obj);
      } else if (obj.path) {
        imagesData.append("existing_images", obj.path);
      }
    });

    updateEvent.mutate(
      {
        title: titleEdit,
        capacity: capacityEdit || undefined,
        price: priceEdit,
        street: streetEdit,
        city: cityEdit,
        location_detail: locationDetailEdit,
        start_at: dateEdit,
        end_at: endDateEdit,
        category: categoryEdit,
        description: descriptionEdit,
        images: imagesData,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setErrorTitle("");
    setErrorCapacity("");
    setErrorPrice("");
    setErrorStreet("");
    setErrorCity("");
    setErrorDate("");
    setErrorEndDate("");
    setErrorCategory("");
    setErrorDescription("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Edit event"
      centered
      size="xl"
    >
      <Stack>
        <TextInput
          data-autofocus
          withAsterisk
          placeholder="Give the event a catchy title"
          label="Title"
          value={titleEdit}
          onChange={(e) => {
            setTitleEdit(e.target.value);
          }}
          onBlur={handleValidateTitle}
          error={errorTitle}
          disabled={updateEvent.isPending}
          required
        />
        <NumberInput
          label="Capacity"
          placeholder="Maximum number of attendees"
          min={0}
          disabled={updateEvent.isPending}
          value={capacityEdit ?? 0}
          suffix=" people"
          onChange={(value) => {
            setCapacityEdit(Number(value));
          }}
          onBlur={handleValidateCapacity}
          error={errorCapacity}
        />
        <NumberInput
          withAsterisk
          label="Price"
          placeholder="Entry fee - (0 if free)"
          min={0}
          prefix="€"
          value={priceEdit}
          disabled={updateEvent.isPending}
          onChange={(value) => {
            setPriceEdit(Number(value));
          }}
          onBlur={handleValidatePrice}
          error={errorPrice}
          required
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <TextInput
              withAsterisk
              label="Street"
              disabled={updateEvent.isPending}
              value={streetEdit}
              placeholder="21 Erard street"
              onChange={(e) => {
                setStreetEdit(e.target.value);
              }}
              onBlur={handleValidateStreet}
              error={errorStreet}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              withAsterisk
              placeholder="Paris"
              label="City"
              value={cityEdit}
              disabled={updateEvent.isPending}
              onChange={(e) => {
                setCityEdit(e.target.value);
              }}
              onBlur={handleValidateCity}
              error={errorCity}
              required
            />
          </Grid.Col>
        </Grid>
        <TextInput
          label="Additional location details"
          placeholder="Room 12, 2nd floor"
          disabled={updateEvent.isPending}
          value={locationDetailEdit}
          onChange={(e) => {
            setLocationDetailEdit(e.target.value);
          }}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateTimePicker
              clearable
              withAsterisk
              label="Start date"
              placeholder="When does it start?"
              value={dateEdit ? new Date(dateEdit) : null}
              disabled={updateEvent.isPending}
              onChange={(val) =>
                setDateEdit(val ? dayjs(val).toISOString() : "")
              }
              required
              onBlur={handleValidateDate}
              error={errorDate}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateTimePicker
              withAsterisk
              clearable
              label="End date"
              placeholder="When does it end?"
              onBlur={() => handleValidateEndDate(endDateEdit)}
              error={errorEndDate}
              value={endDateEdit ? new Date(endDateEdit) : null}
              disabled={updateEvent.isPending}
              onChange={(val) =>
                setEndDateEdit(val ? dayjs(val).toISOString() : "")
              }
              required
            />
          </Grid.Col>
        </Grid>
        <Select
          withAsterisk
          clearable
          label="Category"
          value={categoryEdit}
          disabled={updateEvent.isPending}
          placeholder="Select a category"
          error={errorCategory}
          onBlur={handleValidateCategory}
          data={[
            { value: "workshop", label: "Workshop" },
            { value: "conference", label: "Conference" },
            { value: "meetups", label: "Meetups" },
            { value: "exposition", label: "Exposition" },
            { value: "other", label: "Other" },
          ]}
          onChange={(value) => {
            setCategoryEdit(value as string);
          }}
        />
        <TextEditor
          label="Event's description"
          value={descriptionEdit}
          placeholder="Write your event's description here..."
          error={errorDescription ?? ""}
          onChange={(value) => {
            setDescriptionEdit(value);
          }}
        />
        <ImageDropzone
          loading={updateEvent.isPending}
          files={fileEdit}
          setFiles={setFileEdit}
        />
      </Stack>
      <Group mt="lg" justify="center">
        <Button onClick={handleClose} variant="grey">
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            handleEdit(e);
          }}
          variant="primary"
          loading={updateEvent.isPending}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
}
