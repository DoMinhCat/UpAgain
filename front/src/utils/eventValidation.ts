export const validateEventTitle = (title: string | undefined | null): boolean => {
  return !!title && title.trim() !== "";
};

export const validateEventCapacity = (capacity: number | undefined | null): boolean => {
  return capacity === undefined || capacity === null || capacity > 0;
};

export const validateEventPrice = (price: number | undefined | null): boolean => {
  return price !== undefined && price !== null && price >= 0;
};

export const validateEventStreet = (street: string | undefined | null): boolean => {
  return !!street && street.trim() !== "";
};

export const validateEventCity = (city: string | undefined | null): boolean => {
  return !!city && city.trim() !== "";
};

export const validateEventDate = (date: string | undefined | null): boolean => {
  return !!date && date.trim() !== "";
};

export const validateEventCategory = (category: string | undefined | null): boolean => {
  return !!category && category.trim() !== "";
};

export const validateEventDescription = (description: string | undefined | null): boolean => {
  if (!description) return false;
  const stripped = description.replace(/<[^>]*>/g, "").trim();
  return stripped !== "";
};
