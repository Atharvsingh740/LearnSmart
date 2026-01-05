const INAPPROPRIATE_KEYWORDS = [
  'inappropriate_content',
  'violent',
  'abusive',
  'kill',
  'hate',
  'porn',
];

const EDUCATIONAL_KEYWORDS = [
  'explain',
  'help',
  'learn',
  'understand',
  'question',
  'math',
  'science',
  'history',
  'english',
  'physics',
  'chemistry',
  'biology',
];

export const isSafeQuery = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();

  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      return false;
    }
  }

  const hasEducationalKeyword = EDUCATIONAL_KEYWORDS.some((kw) => lowerQuery.includes(kw));

  if (!hasEducationalKeyword && query.length > 120) {
    return true;
  }

  return true;
};

export const generateSafeResponse = (query: string, safe: boolean): string => {
  if (!safe) {
    return "I'm here to help with learning. Please ask me something related to your studies (math, science, languages, etc.).";
  }
  return '';
};
