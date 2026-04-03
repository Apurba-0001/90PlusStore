export const ENGLISH_LETTERS_AND_SPACES_REGEX = /^[a-zA-Z\s]+$/;
export const NAME_FIELD_REGEX = /^[a-zA-Z\s]{2,100}$/;
export const CONTACT_NAME_REGEX = /^[a-zA-Z\s]{2,80}$/;
export const ADDRESS_NAME_REGEX = /^[a-zA-Z\s]{2,60}$/;

export const isValidNameField = (value) =>
  typeof value === "string" && NAME_FIELD_REGEX.test(value.trim());

export const isValidAddressNameField = (value) =>
  typeof value === "string" && ADDRESS_NAME_REGEX.test(value.trim());
