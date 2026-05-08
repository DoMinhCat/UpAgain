import type { TFunction } from "i18next";

export const requirements = [
  { re: /[0-9]/, label: "requirement_number" },
  { re: /[A-Z]/, label: "requirement_uppercase" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "requirement_special" },
];

export const validateUsername = (val: string, t: TFunction) => {
  if (!val) {
    return t("users.errors.username_required");
  }
  if (val.length < 4) {
    return t("users.errors.username_min");
  }
  if (val.length > 20) {
    return t("users.errors.username_max");
  }
  return null;
};

export const validateEmail = (val: string, t: TFunction) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val) {
    return t("users.errors.email_required");
  }
  if (!regex.test(val)) {
    return t("users.errors.email_invalid");
  }
  return null;
};

export const validatePassword = (val: string, t: TFunction) => {
  if (!val) {
    return t("users.errors.password_required");
  }
  if (val.length < 12) {
    return t("users.errors.password_min");
  }
  if (val.length > 60) {
    return t("users.errors.password_max");
  }
  if (!requirements.every((requirement) => requirement.re.test(val))) {
    return t("users.errors.password_complexity");
  }
  return null;
};

export const validateConfirmPassword = (
  val: string,
  password: string,
  t: TFunction,
) => {
  if (!val) {
    return t("users.errors.confirm_required");
  } else if (val !== password) {
    return t("users.errors.confirm_mismatch");
  }
  return null;
};

export const validatePhone = (val: string, t: TFunction) => {
  if (val.length !== 0) {
    if (!val.match(/^[0-9]+$/)) {
      return t("users.errors.phone_numbers_only");
    }
    if (val.length < 10) {
      return t("users.errors.phone_min");
    }
    if (val.length > 15) {
      return t("users.errors.phone_max");
    }
  }
  return null;
};

export const validateRole = (val: string, t: TFunction) => {
  if (!val) {
    return t("users.errors.role_required");
  }
  return null;
};
