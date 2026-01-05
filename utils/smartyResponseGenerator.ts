import type { SmartySetting } from '@/store/smartyPersonalityStore';
import { categorizeUserQuery, generateContextAwareResponse } from './responseMatching';
import { useCurriculumStore } from '@/store/curriculumStore';

export const generateSmartyResponse = (
  userInput: string,
  personality: SmartySetting,
  contextConcepts: string[]
): { response: string; emoji: string } => {
  const category = categorizeUserQuery(userInput);
  
  // Get concept data
  const curriculumStore = useCurriculumStore.getState();
  const concepts = contextConcepts
    .map(id => curriculumStore.getConcept(id))
    .filter(Boolean) as Array<{
      id: string;
      title: string;
      content: string;
      bullets?: string[];
      keyTakeaway?: string;
    }>;
  
  // Generate base response
  let response = generateContextAwareResponse(userInput, category, personality, concepts);
  
  // Apply personality
  response = applyPersonalityToResponse(response, personality);
  
  // Get emoji
  const emoji = getPersonalityEmoji(personality);
  
  return { response, emoji };
};

const applyPersonalityToResponse = (text: string, personality: SmartySetting): string => {
  let result = text;
  
  // Add emojis based on usage level
  if (personality.emojiUsage === 'high') {
    result = addHighEmojis(result);
  } else if (personality.emojiUsage === 'medium') {
    result = addMediumEmojis(result);
  } else if (personality.emojiUsage === 'low') {
    result = addLowEmojis(result);
  }
  
  // Adjust formality
  if (personality.formality === 'very-casual') {
    result = casualizeText(result);
  } else if (personality.formality === 'very-formal') {
    result = formalizeText(result);
  }
  
  return result;
};

const addHighEmojis = (text: string): string => {
  // Add emojis to emphasize key points
  return text
    .replace(/Key points:/i, 'Key points: 📌')
    .replace(/Key takeaway:/i, 'Key takeaway: ⭐')
    .replace(/Let's/gi, "Let's 🚀")
    .replace(/Great/gi, 'Great ✨');
};

const addMediumEmojis = (text: string): string => {
  return text.replace(/Key takeaway:/i, 'Key takeaway: ⭐');
};

const addLowEmojis = (text: string): string => {
  return text;
};

const casualizeText = (text: string): string => {
  return text
    .replace(/Let us/gi, "Let's")
    .replace(/I will/gi, "I'll")
    .replace(/You are/gi, "You're")
    .replace(/cannot/gi, "can't");
};

const formalizeText = (text: string): string => {
  return text
    .replace(/let's/gi, 'let us')
    .replace(/can't/gi, 'cannot')
    .replace(/don't/gi, 'do not')
    .replace(/won't/gi, 'will not');
};

const getPersonalityEmoji = (personality: SmartySetting): string => {
  const emojiSets: Record<string, string[]> = {
    warm: ['😊', '✨', '🌟', '💡', '🎯'],
    formal: ['📚', '✓', '•'],
    casual: ['😎', '🔥', '💪', '🚀', '⭐'],
    motivational: ['🎯', '🏆', '💪', '⭐', '🚀'],
  };
  
  const emojis = emojiSets[personality.tone] || emojiSets.warm;
  return emojis[Math.floor(Math.random() * emojis.length)];
};
