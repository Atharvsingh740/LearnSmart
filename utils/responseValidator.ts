const containsEducationalValue = (text: string): boolean => {
  const lower = text.toLowerCase();
  const signals = [
    'because',
    'therefore',
    'for example',
    'step',
    'key point',
    'definition',
    'solve',
    'explain',
  ];
  return signals.some((s) => lower.includes(s)) || text.length > 40;
};

const containsHarmfulContent = (text: string): boolean => {
  const lower = text.toLowerCase();
  const harmful = ['kill', 'suicide', 'harm yourself', 'bomb'];
  return harmful.some((h) => lower.includes(h));
};

export const validateSmartyResponse = (response: string): boolean => {
  if (response.length === 0 || response.length > 5000) {
    return false;
  }

  if (!containsEducationalValue(response)) {
    return false;
  }

  if (containsHarmfulContent(response)) {
    return false;
  }

  return true;
};
