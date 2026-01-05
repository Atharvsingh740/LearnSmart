import { useCurriculumStore } from '@/store/curriculumStore';

export const injectContextIntoChatbot = (
  userQuery: string,
  lessonProgress: Array<{ lessonId: string; lastAccessedAt: string }>
): string[] => {
  const curriculumStore = useCurriculumStore.getState();
  
  // Get last 3 concepts viewed from lesson progress
  const recentLessons = [...lessonProgress]
    .sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )
    .slice(0, 3);
  
  const conceptIds: string[] = [];
  
  // Extract concept IDs from recent lessons
  for (const lesson of recentLessons) {
    const concept = curriculumStore.getConcept(lesson.lessonId);
    if (concept && conceptRelatesTo(concept, userQuery)) {
      conceptIds.push(concept.id);
    }
  }
  
  return conceptIds;
};

export const conceptRelatesTo = (concept: any, query: string): boolean => {
  if (!concept) return false;
  
  const lowerQuery = query.toLowerCase();
  const lowerTitle = concept.title.toLowerCase();
  const lowerContent = concept.content.toLowerCase();
  
  // Check if query contains words from concept title/content
  return lowerTitle.includes(lowerQuery) ||
         lowerContent.includes(lowerQuery) ||
         concept.bullets?.some((b: string) => b.toLowerCase().includes(lowerQuery));
};

export const buildContextPrompt = (
  userQuery: string,
  concepts: string[]
): string => {
  const curriculumStore = useCurriculumStore.getState();
  
  const contextInfo = concepts
    .map(id => {
      const concept = curriculumStore.getConcept(id);
      if (!concept) return '';
      
      return `
**${concept.title}**
${concept.content}

Key points:
${concept.bullets?.map(b => `• ${b}`).join('\n') || ''}

Key Takeaway: ${concept.keyTakeaway || 'N/A'}
      `.trim();
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
  
  if (contextInfo) {
    return `The user has recently been learning about:

${contextInfo}

User's question: ${userQuery}

Please provide a helpful, educational response that connects to the above context when relevant.`;
  }
  
  return userQuery;
};

export const getRecentConceptsFromStore = (): string[] => {
  const curriculumStore = useCurriculumStore.getState();
  const lessonProgress = curriculumStore.lessonProgress || [];
  
  // Get last 3 accessed lessons
  const recentLessons = [...lessonProgress]
    .sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )
    .slice(0, 3)
    .map(l => l.lessonId);
  
  return recentLessons;
};
