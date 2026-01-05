import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useUserStore } from '@/store/userStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';
import ConceptCard from '@/components/ConceptCard';
import ProgressBar from '@/components/ProgressBar';

export default function LessonScreen() {
  const { chapterId } = useLocalSearchParams();
  const router = useRouter();
  const { class: userClass } = useUserStore();
  const { getTopics, bookmarkLesson, unbookmarkLesson, isBookmarked, completeTopic, getChapter } = useCurriculumStore();
  
  const topics = getTopics(chapterId as string);
  const chapter = getChapter(chapterId as string);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [isBookmarkedState, setIsBookmarkedState] = useState(isBookmarked(chapterId as string));

  const selectedTopic = topics[selectedTopicIndex];

  const handleBookmark = useCallback(() => {
    if (isBookmarkedState) {
      unbookmarkLesson(chapterId as string);
      setIsBookmarkedState(false);
    } else {
      bookmarkLesson(chapterId as string);
      setIsBookmarkedState(true);
    }
  }, [chapterId, isBookmarkedState]);

  const handleNextTopic = useCallback(() => {
    if (selectedTopicIndex < topics.length - 1) {
      setSelectedTopicIndex(prev => prev + 1);
    } else {
      router.back();
    }
  }, [selectedTopicIndex, topics.length]);

  const handlePrevTopic = useCallback(() => {
    if (selectedTopicIndex > 0) {
      setSelectedTopicIndex(prev => prev - 1);
    }
  }, [selectedTopicIndex]);

  const progress = topics.length > 0 
    ? Math.round(((selectedTopicIndex + 1) / topics.length) * 100) 
    : 0;

  const breadcrumbText = chapter 
    ? `${userClass || 'Class'} > ${chapter.subCategory ? `${chapter.subCategory.replace(/-9$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} > ` : ''}${chapter.title}`
    : `${userClass || 'Class'} > Chapter`;

  if (!selectedTopic) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No topics found for this chapter</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Breadcrumb Navigation */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbText} numberOfLines={1}>{breadcrumbText}</Text>
        <TouchableOpacity 
          style={styles.bookmarkButton}
          onPress={handleBookmark}
        >
          <Text style={styles.bookmarkIcon}>
            {isBookmarkedState ? '🔖' : '📑'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          animated={true}
          showPercentage={true}
          showMilestones={true}
          shimmer={true}
        />
      </View>

      {/* Topic Selector (FlashList) */}
      <View style={styles.topicListContainer}>
        <Text style={styles.topicListTitle}>Topics</Text>
        <FlashList
          data={topics}
          renderItem={({ item, index }) => (
            <TopicButton
              topic={item}
              isActive={item.id === selectedTopic.id}
              onPress={() => setSelectedTopicIndex(index)}
              index={index}
              total={topics.length}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={72}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicListContent}
        />
      </View>

      {/* Lesson Content */}
      <ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Topic Header */}
        <View style={styles.header}>
          <Text style={styles.topicIcon}>{selectedTopic.icon}</Text>
          <Text style={styles.topicTitle}>{selectedTopic.title}</Text>
        </View>

        {/* Concepts */}
        <FlashList
          data={selectedTopic.concepts}
          renderItem={({ item }) => (
            <ConceptCard
              concept={item}
              animated={true}
              onRelatedConceptPress={(conceptId) => {
                console.log('Navigate to concept:', conceptId);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          scrollEnabled={false}
        />

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <Pressable
            style={[
              styles.navButton,
              styles.prevButton,
              selectedTopicIndex === 0 && styles.disabledButton,
            ]}
            onPress={handlePrevTopic}
            disabled={selectedTopicIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </Pressable>
          <Pressable
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNextTopic}
          >
            <Text style={styles.navButtonText}>
              {selectedTopicIndex < topics.length - 1 ? 'Next →' : 'Finish'}
            </Text>
          </Pressable>
        </View>

        {/* Quick Test Button */}
        {selectedTopicIndex === topics.length - 1 && (
          <Pressable
            style={styles.quickTestButton}
            onPress={() => router.push(`/lessons/${chapterId}/quick-test`)}
          >
            <Text style={styles.quickTestIcon}>📝</Text>
            <View style={styles.quickTestTextContainer}>
              <Text style={styles.quickTestTitle}>Quick Test</Text>
              <Text style={styles.quickTestSubtitle}>
                Test your knowledge with {Math.min(5, selectedTopic.concepts.length)} questions
              </Text>
            </View>
            <Text style={styles.quickTestArrow}>→</Text>
          </Pressable>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

interface TopicButtonProps {
  topic: {
    id: string;
    title: string;
    icon: string;
  };
  isActive: boolean;
  onPress: () => void;
  index: number;
  total: number;
}

const TopicButton: React.FC<TopicButtonProps> = ({ topic, isActive, onPress, index }) => (
  <Pressable
    style={[
      styles.topicButton,
      isActive && styles.topicButtonActive,
    ]}
    onPress={onPress}
  >
    <View style={styles.topicButtonHeader}>
      <Text style={styles.topicButtonIndex}>{index + 1}</Text>
      <Text style={styles.topicButtonIcon}>{topic.icon}</Text>
    </View>
    <Text
      style={[
        styles.topicButtonText,
        isActive && styles.topicButtonTextActive,
      ]}
      numberOfLines={2}
    >
      {topic.title}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    marginTop: SPACING.XXL,
  },
  breadcrumb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  backButton: {
    padding: SPACING.SM,
    marginRight: SPACING.SM,
  },
  backButtonText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  breadcrumbText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.FOREST_ACCENT,
    flex: 1,
  },
  bookmarkButton: {
    padding: SPACING.SM,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  progressContainer: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  topicListContainer: {
    paddingVertical: SPACING.MD,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SAGE_PRIMARY + '20',
  },
  topicListContent: {
    paddingHorizontal: SPACING.MD,
  },
  topicListTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
    marginBottom: SPACING.SM,
    color: COLORS.CHARCOAL_TEXT,
    paddingHorizontal: SPACING.MD,
  },
  topicButton: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.LARGE,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    marginRight: SPACING.MD,
    alignItems: 'center',
    minWidth: 100,
    maxWidth: 120,
    ...SHADOWS.LIGHT,
  },
  topicButtonActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  topicButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.XS,
  },
  topicButtonIndex: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '700',
    marginRight: SPACING.XS,
  },
  topicButtonActive: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  topicButtonIcon: {
    fontSize: 20,
  },
  topicButtonText: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
  topicButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: SPACING.MD,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.LG,
  },
  topicIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  topicTitle: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.LG,
  },
  navButton: {
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    ...SHADOWS.LIGHT,
    minWidth: 120,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: COLORS.FOREST_ACCENT,
  },
  nextButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#fff',
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: SPACING.XL,
  },
  quickTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    padding: SPACING.MD,
    marginBottom: SPACING.LG,
    borderWidth: 2,
    borderColor: COLORS.SAGE_PRIMARY,
    ...SHADOWS.MEDIUM,
  },
  quickTestIcon: {
    fontSize: 32,
    marginRight: SPACING.MD,
  },
  quickTestTextContainer: {
    flex: 1,
  },
  quickTestTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    marginBottom: SPACING.XS,
  },
  quickTestSubtitle: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
  },
  quickTestArrow: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 24,
  },
});
