import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/theme';
import { PRESETS, useSmartyPersonalityStore, type SmartyPreset, type SmartySetting } from '@/store/smartyPersonalityStore';
import { generateSmartyResponse } from '@/utils/smartyResponseGenerator';

const PRESET_LABELS: Record<Exclude<SmartyPreset, 'custom'>, string> = {
  'warm-mentor': 'Warm Mentor',
  'formal-guide': 'Formal Guide',
  'casual-friend': 'Casual Friend',
  'motivational-coach': 'Motivational Coach',
};

const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

export default function SmartyPersonalityScreen() {
  const router = useRouter();
  const personalityStore = useSmartyPersonalityStore();

  const [draft, setDraft] = useState<SmartySetting>(personalityStore.settings);
  const [selectedPreset, setSelectedPreset] = useState<SmartyPreset>(personalityStore.preset);

  const previewText = useMemo(() => {
    const sampleQuery = 'Explain this concept in a simple way.';
    return generateSmartyResponse(sampleQuery, draft, []).response;
  }, [draft]);

  const selectPreset = (preset: Exclude<SmartyPreset, 'custom'>) => {
    setSelectedPreset(preset);
    personalityStore.loadPreset(preset);
    setDraft(useSmartyPersonalityStore.getState().settings);
  };

  const updateDraft = (updates: Partial<SmartySetting>) => {
    setSelectedPreset('custom');
    setDraft((s) => ({ ...s, ...updates }));
  };

  const handleSave = () => {
    personalityStore.updateSettings(draft);
    setSelectedPreset('custom');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.title}>Smarty Personality</Text>
      <Text style={styles.subtitle}>Pick a preset or build your own custom Smarty.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Presets</Text>
        <View style={styles.presetGrid}>
          {(Object.keys(PRESET_LABELS) as Array<Exclude<SmartyPreset, 'custom'>>).map((preset) => {
            const selected = selectedPreset === preset;
            return (
              <Pressable
                key={preset}
                style={[styles.presetCard, selected && styles.presetCardSelected]}
                onPress={() => selectPreset(preset)}
              >
                <Text style={styles.presetCardTitle}>{PRESET_LABELS[preset]}</Text>
                <Text style={styles.presetCardMeta}>Tone: {PRESETS[preset].tone}</Text>
              </Pressable>
            );
          })}

          <View style={[styles.presetCard, selectedPreset === 'custom' && styles.presetCardSelected]}>
            <Text style={styles.presetCardTitle}>Custom</Text>
            <Text style={styles.presetCardMeta}>Use the builder below</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Builder</Text>

        <Text style={styles.label}>Tone</Text>
        <View style={styles.chipRow}>
          {(['warm', 'formal', 'casual', 'motivational'] as const).map((tone) => (
            <Chip
              key={tone}
              label={tone}
              selected={draft.tone === tone}
              onPress={() => updateDraft({ tone })}
            />
          ))}
        </View>

        <Text style={styles.label}>Emoji Usage</Text>
        <View style={styles.chipRow}>
          {(['high', 'medium', 'low', 'none'] as const).map((emojiUsage) => (
            <Chip
              key={emojiUsage}
              label={emojiUsage}
              selected={draft.emojiUsage === emojiUsage}
              onPress={() => updateDraft({ emojiUsage })}
            />
          ))}
        </View>

        <Text style={styles.label}>Formality</Text>
        <View style={styles.chipRow}>
          {(['very-formal', 'formal', 'casual', 'very-casual'] as const).map((formality) => (
            <Chip
              key={formality}
              label={formality}
              selected={draft.formality === formality}
              onPress={() => updateDraft({ formality })}
            />
          ))}
        </View>

        <Text style={styles.label}>Response Length</Text>
        <View style={styles.chipRow}>
          {(['short', 'medium', 'long'] as const).map((responseLength) => (
            <Chip
              key={responseLength}
              label={responseLength}
              selected={draft.responseLength === responseLength}
              onPress={() => updateDraft({ responseLength })}
            />
          ))}
        </View>

        <Text style={styles.label}>What should Smarty call you?</Text>
        <TextInput
          value={draft.namePreference}
          onChangeText={(namePreference) => updateDraft({ namePreference })}
          placeholder="e.g., friend"
          placeholderTextColor={COLORS.CHARCOAL_TEXT + '80'}
          style={styles.input}
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Smarty might respond like:</Text>
          <Text style={styles.previewText}>{previewText}</Text>
        </View>
      </View>

      <View style={{ height: SPACING.XXL }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  content: {
    paddingHorizontal: SPACING.MD,
    paddingTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.MD,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 50,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    marginBottom: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.MD,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  presetCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.LIGHT,
  },
  presetCardSelected: {
    borderColor: COLORS.SAGE_PRIMARY,
  },
  presetCardTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '800',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 2,
  },
  presetCardMeta: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  label: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '700',
    color: COLORS.CHARCOAL_TEXT,
    marginTop: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  chip: {
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.BUTTON,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  chipText: {
    ...TYPOGRAPHY.SMALL,
    fontWeight: '700',
    color: COLORS.SAGE_PRIMARY,
  },
  chipTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY + '30',
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  saveButton: {
    marginTop: SPACING.MD,
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    ...SHADOWS.LIGHT,
  },
  saveButtonText: {
    ...TYPOGRAPHY.BODY,
    color: '#fff',
    fontWeight: '800',
  },
  previewBox: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    ...SHADOWS.LIGHT,
  },
  previewLabel: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: SPACING.SM,
  },
  previewText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
});
