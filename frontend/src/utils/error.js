export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const validationErrors = error?.response?.data?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((item) => item.message).join(". ");
  }

  return error?.response?.data?.message || error?.message || fallback;
};
