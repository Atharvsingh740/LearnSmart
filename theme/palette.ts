// Color Gradients
export const COLORS = {
  // Primary Gradients
  SAGE_PRIMARY: '#87A96B',
  FOREST_ACCENT: '#4F6642',
  SAND_BG: '#F5F5DC',
  CREAM_BG: '#FFFDD0',
  CHARCOAL_TEXT: '#333333',
  GOLD_STREAK: '#FFD700',
  AMBER_GOLD: '#FFA500',
  CORAL_ERROR: '#FF6B6B',
  RED_ERROR: '#DC143C',
};

export const GRADIENTS = {
  PRIMARY: [COLORS.SAGE_PRIMARY, COLORS.FOREST_ACCENT],
  BACKGROUND: [COLORS.SAND_BG, COLORS.CREAM_BG],
  ACHIEVEMENT: [COLORS.GOLD_STREAK, COLORS.AMBER_GOLD],
  ERROR: [COLORS.CORAL_ERROR, COLORS.RED_ERROR],
  PROGRESS: [COLORS.SAGE_PRIMARY, COLORS.GOLD_STREAK],
  TEXT_HEADER: [COLORS.CHARCOAL_TEXT, COLORS.FOREST_ACCENT],
};

export const TYPOGRAPHY = {
  TITLE: { fontFamily: 'Poppins', fontSize: 32, fontWeight: '700' as const },
  HEADER: { fontFamily: 'Poppins', fontSize: 24, fontWeight: '600' as const },
  BODY: { fontFamily: 'Inter', fontSize: 16, fontWeight: '400' as const },
  SMALL: { fontFamily: 'Inter', fontSize: 13, fontWeight: '400' as const },
  KEY_TAKEAWAY: { fontFamily: 'Poppins', fontSize: 16, fontWeight: '500' as const },
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
};

export const RADIUS = {
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 24, // Superellipse for premium feel
  BUTTON: 24,
  CARD: 24,
  INPUT: 16,
};

export const SHADOWS = {
  LIGHT: {
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  MEDIUM: {
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
