export const extractNumber = (inputString: string) => {
  const match = inputString.match(/\d+/);

  if (match) {
    return parseInt(match[0], 10);
  }

  return null;
};
