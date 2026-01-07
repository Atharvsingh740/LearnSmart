export const TYPOGRAPHY = {
  // Page level
  PAGE_TITLE: {
    fontFamily: 'Poppins',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },

  // Section headers (Chapter, Topic)
  SECTION_HEADER: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },

  // Concept title (bold, prominent)
  CONCEPT_TITLE: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  // Body text (readable, default)
  CONCEPT_BODY: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  // Bullet points
  BULLET_TEXT: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },

  // Key takeaway (emphasized)
  KEY_TAKEAWAY: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // Diagram labels
  DIAGRAM_LABEL: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },

  // Metadata (timestamps, subtitles)
  METADATA: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    opacity: 0.7,
  },

  // Premium styles
  FORMULA_TITLE: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  FORMULA_BODY: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  HOMEWORK_HEADING: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  DERIVATION_STEP: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },

  // Legacy support for existing code
  TITLE: { fontFamily: 'Poppins', fontSize: 32, fontWeight: '700' as const },
  HEADER: { fontFamily: 'Poppins', fontSize: 24, fontWeight: '600' as const },
  BODY: { fontFamily: 'Inter', fontSize: 16, fontWeight: '400' as const },
  SMALL: { fontFamily: 'Inter', fontSize: 13, fontWeight: '400' as const },
};
