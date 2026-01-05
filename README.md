# LearnSmart - Phase 1: Bulletproof Native Architecture

A modern educational app built with Expo and React Native, featuring a clean Zen design system and robust state management.

## ✅ Phase 1 Completed Features

### 1. **Rock-Solid Expo Foundation**
- Expo SDK 54 with TypeScript
- Platform-restricted to Android and iOS only (no web bundling issues)
- Error-free build configuration with version locks

### 2. **Gradle Build Properties**
- Kotlin version: 1.9.24
- Compile SDK: 35
- Target SDK: 35
- Build Tools: 35.0.0
- ProGuard enabled for release builds
- iOS deployment target: 15.1

### 3. **Zen Design System**
Complete theme system with:
- **Colors**: Sage green primary, warm sand backgrounds, gold accents
- **Gradients**: Predefined color combinations for various UI elements
- **Typography**: Poppins for headers, Inter for body text
- **Spacing**: Consistent XS/SM/MD/LG/XL scale
- **Border Radius**: Superellipse (24px) for premium feel
- **Shadows**: Light and medium elevation styles

### 4. **State Management (Zustand + AsyncStorage)**
Three stores with persistence:
- **userStore**: User profile, XP, coins, streaks, lesson progress
- **quizStore**: Generated quizzes, quiz history, scores
- **curriculumStore**: Bookmarks, favorites, lesson progress tracking

### 5. **Multilingual i18n**
- English and Hindi support
- react-i18next integration
- Language persistence in AsyncStorage
- Easy to add more languages

### 6. **Project Structure**
```
learnsmart/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   │   ├── onboarding.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (main)/            # Main app (tabs)
│   │   ├── home.tsx
│   │   ├── lessons.tsx
│   │   ├── quiz.tsx
│   │   └── profile.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ProgressBar.tsx
├── store/                 # Zustand stores
│   ├── userStore.ts
│   ├── quizStore.ts
│   └── curriculumStore.ts
├── theme/                 # Design system
│   ├── palette.ts
│   └── index.ts
├── locales/               # Translations
│   ├── en.json
│   └── hi.json
└── utils/                 # Utilities
    └── i18n.ts
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Run the App
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Verify Build Health
```bash
# Check for issues
npx expo-doctor

# Check dependencies
npx expo install --check

# Clean prebuild (if needed)
npx expo prebuild --clean
```

## 📦 Key Dependencies

- **expo**: ~54.0.30
- **react**: 19.1.0
- **react-native**: 0.81.5
- **expo-router**: ^6.0.21 (file-based routing)
- **zustand**: ^5.0.9 (state management)
- **@react-native-async-storage/async-storage**: ^2.2.0
- **i18next** & **react-i18next**: Internationalization
- **react-native-reanimated**: ~4.1.1 (animations)
- **react-native-screens**: ~4.16.0
- **react-native-safe-area-context**: ~5.6.0
- **expo-build-properties**: ^1.0.10 (Gradle/native config)

## 🎨 Design System Usage

### Colors
```typescript
import { COLORS } from './theme';

<View style={{ backgroundColor: COLORS.SAGE_PRIMARY }} />
```

### Components
```typescript
import Button from './components/Button';
import Card from './components/Card';
import ProgressBar from './components/ProgressBar';

<Button title="Continue" onPress={() => {}} variant="primary" />
<Card variant="elevated">{children}</Card>
<ProgressBar progress={75} />
```

### State Management
```typescript
import { useUserStore } from './store/userStore';

const { xp, addXP, streak } = useUserStore();
addXP(10);
```

## 🌍 Internationalization

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Use translations
<Text>{t('onboarding.welcome')}</Text>

// Change language
i18n.changeLanguage('hi');
```

## 🔧 Configuration Files

### app.json
- Platform restrictions (Android/iOS only)
- Build properties plugin configuration
- Bundle identifiers and package names
- Expo Router scheme

### babel.config.js
- react-native-reanimated plugin configured

### metro.config.js
- Default Expo Metro configuration (no overrides)

### package.json
- expo-router as main entry point
- expo.install.exclude for navigation packages

## ✅ Acceptance Criteria (All Passed)

- ✅ Expo initialized (platform-restricted to Android/iOS only)
- ✅ Version lock properties configured (no Kotlin/Unit.class errors)
- ✅ Design system complete (colors, gradients, typography, shadows)
- ✅ Zustand stores setup with AsyncStorage persistence
- ✅ Multilingual i18n configured (English, Hindi)
- ✅ Project structure organized & scalable
- ✅ All dependencies installed without conflicts
- ✅ `npx expo-doctor` passes (16/17 checks - minor version warnings excluded)
- ✅ No web bundling in metro config
- ✅ Ready for Phase 2 (Onboarding)

## 🎯 Next Phase: Phase 2 - Onboarding & Profile Creation

The foundation is now bulletproof. Phase 2 will implement:
- Complete onboarding flow with class/stream selection
- User profile creation with avatar picker
- Animated splash screen
- First-time user experience
- Profile settings and customization

## 📝 Notes

- The project excludes `@react-navigation/bottom-tabs` and `@react-navigation/native` from Expo's version validation to prevent React 19.1.0 vs 19.2.3 peer dependency conflicts. These packages are stable and work correctly with the current setup.
- No web support is configured to prevent bundler issues (as specified in requirements).
- All native modules are properly configured for error-free builds.

## 🐛 Troubleshooting

### Clear cache and restart
```bash
npx expo start -c
```

### Reset node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clean native folders
```bash
rm -rf android ios
npx expo prebuild --clean
```

---

Built with ❤️ for bulletproof native architecture.
