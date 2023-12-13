export const extractNumber = (inputString: string) => {
  // Use a regular expression to extract the number
  const match = inputString.match(/\d+/);

  // Check if a match was found
  if (match) {
    return parseInt(match[0], 10);
  }

  return null;
};
