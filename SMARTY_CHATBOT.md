# Smarty AI Chatbot - Phase 4 Implementation

## Overview
Smarty is an intelligent AI mentor chatbot integrated into LearnSmart. It provides context-aware learning assistance, personality-driven responses, and image reading capabilities (planned).

## Features

### 1. **Floating Action Button (FAB)**
- Always accessible from any screen in the app
- Positioned bottom-right (above tab bar)
- Animated on press with spring effect
- Optional unread count badge

### 2. **Chat Interface**
- Full-screen modal with glassmorphism design (BlurView)
- Swipe-down to close gesture
- Inverted FlatList for chat history
- Typing indicator ("Typing…" message)
- Keyboard-aware scrolling
- Message bubbles with avatars (🤖 for Smarty, 👤 for user)
- Timestamp display
- Media attachment support

### 3. **Personality System**
Four preset personalities that affect Smarty's responses:

#### **Warm Mentor** (Default)
- Tone: Warm & friendly
- Emoji usage: High
- Formality: Casual
- Greetings: "Hi there! 👋 How can I help you learn today?"
- Style: Encouraging and approachable

#### **Formal Guide**
- Tone: Professional & academic
- Emoji usage: Low
- Formality: Formal
- Greetings: "Good day. How may I assist you with your studies?"
- Style: Structured and scholarly

#### **Casual Friend**
- Tone: Very casual
- Emoji usage: High
- Formality: Very casual
- Greetings: "Yo! What's good? 🤙"
- Style: Relaxed and conversational

#### **Motivational Coach**
- Tone: Encouraging & energetic
- Emoji usage: Medium
- Formality: Casual
- Greetings: "Let's crush this learning goal together! 💪"
- Style: Inspirational and empowering

### 4. **Context-Aware Responses**
Smarty automatically injects learning context from:
- Last 3 concepts viewed in lessons
- Previous chat messages
- Search results matching the query

Response categories:
- **Concept questions**: Explains concepts with bullets and key takeaways
- **Difficult questions**: Supportive guidance
- **Motivational requests**: Encouraging messages
- **Homework help**: Step-by-step guidance (doesn't give direct answers)
- **General questions**: Educational redirection

### 5. **Daily Image Limit**
- **Limit**: 8 images per day
- **Reset time**: 1 AM daily
- **Tracking**: Total images read counter
- **Enforcement**: Alert shown when limit reached
- **Badge display**: Remaining count shown on attach button

### 6. **Safety Features**
- Content filtering for inappropriate queries
- Educational focus validation
- Response quality checks (length, value, safety)
- Harmful content detection

### 7. **Data Persistence**
- All messages stored via AsyncStorage
- Personality settings saved
- Daily limit state persisted
- Survives app restarts

## Usage

### Opening Smarty
1. Tap the floating 🤖 button on any screen
2. Chat modal opens with a greeting based on personality
3. Start typing your question

### Changing Personality
1. Go to Settings
2. Find "🤖 Smarty AI" section
3. Select a preset: Warm, Formal, Casual, or Coach
4. Personality applies immediately

### Attaching Images
1. Tap the 📎 button in chat input
2. Select "Attach Sample Image" (demo mode)
3. Image appears in chat with user message
4. Smarty responds (OCR implementation pending)
5. Daily limit decremented

### Clearing Chat
1. Go to Settings > 🤖 Smarty AI
2. Tap "Clear Smarty Chat"
3. Confirm deletion
4. All messages deleted

## Technical Architecture

### Stores
- **`smartyStore.ts`**: Message history, daily limits, loading state
- **`smartyPersonalityStore.ts`**: Personality presets, current settings

### Components
- **`SmartFAB.tsx`**: Floating action button
- **`ChatModal.tsx`**: Main chat interface
- **`MessageBubble.tsx`**: Individual message display
- **`ChatInput.tsx`**: Text input with attach button

### Utilities
- **`smartyResponseGenerator.ts`**: Response generation with personality
- **`responseMatching.ts`**: Query categorization
- **`contextAwareness.ts`**: Context injection from curriculum
- **`safetyGuards.ts`**: Content safety checks
- **`dailyLimitChecker.ts`**: Limit validation & reset logic
- **`responseValidator.ts`**: Response quality validation

## Message Flow

```
User types query
    ↓
Safety check (isSafeQuery)
    ↓
Add user message to store
    ↓
Set loading state (show "Typing…")
    ↓
Get context (recent concepts + chat history + search)
    ↓
Categorize query (concept/general/motivational/homework/difficult)
    ↓
Generate response with personality
    ↓
Validate response
    ↓
Add Smarty message to store
    ↓
Clear loading state
```

## Daily Limit Reset

```javascript
// Runs on app launch and every hour
checkAndResetDailyLimit() {
  const now = Date.now();
  const today1AM = getTodayAt1AM();
  
  if (now > today1AM && lastReset < today1AM) {
    resetDailyLimit(); // Set used = 0, update lastReset
  }
}
```

## Known Limitations

1. **Image OCR**: Not implemented yet
   - UI shows sample image attachment
   - Shows "OCR coming soon" message
   - Daily limit still tracked

2. **Response Generation**: Template-based
   - No real AI API integration
   - Responses use predefined templates
   - Context is injected but not dynamically processed

3. **Voice I/O**: Not available
   - Planned for Phase 4B
   - Text-only for now

4. **Offline Mode**: Fully functional
   - No network calls required
   - All processing local

## Future Enhancements

- Real AI API integration (OpenAI GPT-4)
- OCR for handwriting & printed text
- Voice input/output
- PDF text extraction
- Conversation export (PDF)
- Smarty learns user preferences
- Response caching
- Multilingual voice support

## API (for future backend integration)

### Endpoint: `/api/smarty/chat`
**POST** request with:
```json
{
  "message": "User query",
  "personality": "warm",
  "contextConcepts": ["concept-id-1", "concept-id-2"],
  "chatHistory": [...previous messages],
  "userClass": "9",
  "userStream": "science"
}
```

**Response**:
```json
{
  "response": "Smarty's answer",
  "confidence": 0.95,
  "relatedConcepts": ["concept-id-3"]
}
```

## Testing

### Manual Test Cases

1. **Basic chat**
   - Open Smarty
   - See greeting
   - Type "Explain photosynthesis"
   - Get response with concept explanation

2. **Personality change**
   - Go to Settings
   - Change personality to Formal
   - Open Smarty
   - Close and reopen
   - Greeting should be formal

3. **Daily limit**
   - Attach 8 images (use sample button)
   - Try to attach 9th image
   - See "Daily Limit Reached" alert

4. **Context awareness**
   - View a lesson (e.g., Photosynthesis)
   - Open Smarty
   - Ask "Can you explain this more?"
   - Response should reference photosynthesis

5. **Safety check**
   - Type inappropriate query
   - Get redirected to educational focus

6. **Chat persistence**
   - Have a conversation
   - Close app
   - Reopen app
   - Open Smarty
   - Previous messages should be there

7. **Clear chat**
   - Have some messages
   - Go to Settings
   - Clear Smarty Chat
   - Open Smarty
   - Only greeting message should appear

## Troubleshooting

**Issue**: FAB not appearing
- Check `app/(main)/_layout.tsx` includes `<SmartFAB />`
- Verify `zIndex: 999` in styles

**Issue**: Messages not persisting
- Check AsyncStorage permissions
- Verify Zustand persist config

**Issue**: Daily limit not resetting
- Check device time settings
- Verify `checkAndResetDailyLimit()` runs on interval

**Issue**: Personality not changing
- Ensure Settings screen calls `loadPreset()`
- Check SmartySetting interface matches store

**Issue**: Context not working
- Verify `lessonProgress` is being tracked
- Check `getRecentConceptsFromStore()` implementation

## Credits

- **Design**: Zen theme with glassmorphism
- **Animations**: react-native-reanimated
- **State**: Zustand with AsyncStorage
- **Platform**: Expo SDK 54
