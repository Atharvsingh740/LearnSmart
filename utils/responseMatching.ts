import type { SmartySetting } from '@/store/smartyPersonalityStore';

export type QueryCategory = 'concept_question' | 'general' | 'motivational' | 'homework' | 'difficult';

export const categorizeUserQuery = (query: string): QueryCategory => {
  const lower = query.toLowerCase();

  if (lower.includes('help') || lower.includes('stuck') || lower.includes("can't")) {
    return 'difficult';
  }

  if (lower.includes('inspire') || lower.includes('motivate') || lower.includes('encourage')) {
    return 'motivational';
  }

  if (lower.includes('solve') || lower.includes('answer') || lower.includes('homework')) {
    return 'homework';
  }

  if (
    query.includes('?') &&
    (lower.includes('why') || lower.includes('how') || lower.includes('what') || lower.includes('explain'))
  ) {
    return 'concept_question';
  }

  return 'general';
};

const trimToLength = (text: string, personality: SmartySetting): string => {
  const max = personality.responseLength === 'short' ? 300 : personality.responseLength === 'medium' ? 800 : 1400;
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trim()}...`;
};

export const generateContextAwareResponse = (
  query: string,
  category: QueryCategory,
  personality: SmartySetting,
  concepts: Array<{ id: string; title: string; content: string; bullets?: string[]; keyTakeaway?: string }>
): string => {
  switch (category) {
    case 'concept_question':
      return trimToLength(buildConceptResponse(query, concepts), personality);
    case 'difficult':
      return trimToLength(buildSupportiveResponse(query), personality);
    case 'motivational':
      return trimToLength(getMotivationalMessage(), personality);
    case 'homework':
      return trimToLength(buildGuidanceResponse(query), personality);
    default:
      return trimToLength(buildGeneralResponse(query), personality);
  }
};

const buildConceptResponse = (
  query: string,
  concepts: Array<{ id: string; title: string; content: string; bullets?: string[]; keyTakeaway?: string }>
): string => {
  if (concepts.length === 0) {
    return `Let's work through that together. Tell me what chapter/topic you're studying and what part is confusing.`;
  }

  const top = concepts[0];
  const points = (top.bullets || []).slice(0, 3).map((b) => `• ${b}`).join('\n');

  return `This connects nicely to **${top.title}**.\n\n${top.content}\n\nKey points:\n${points}${top.keyTakeaway ? `\n\nKey takeaway: ${top.keyTakeaway}` : ''}\n\nNow, about your question: “${query}” — which part do you want to focus on first?`;
};

const buildSupportiveResponse = (query: string): string => {
  return `No worries — getting stuck is part of learning.\n\n1) Tell me what you're trying to do\n2) Share what you already tried\n3) Tell me exactly where it breaks\n\nYour message: “${query}”`;
};

const getMotivationalMessage = (): string => {
  return `You're making progress every time you ask a question. One small step now can turn into a big breakthrough later — keep going.`;
};

const buildGuidanceResponse = (query: string): string => {
  return `I can help you learn it step-by-step. Instead of giving a final answer immediately, I'll guide you.\n\nWhat information is given in the problem, and what are you asked to find?\n\nPaste the question here: “${query}”`;
};

const buildGeneralResponse = (query: string): string => {
  return `Got it. Tell me a bit more so I can help: what subject is this from, and what level/class are you studying?\n\nYour question: “${query}”`;
};
