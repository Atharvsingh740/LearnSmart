import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useCurriculumStore } from '@/store/curriculumStore';
import { useUserStore } from '@/store/userStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/theme';

interface Subject {
  id: string;
  name: string;
  chapters: Array<{
    id: string;
    title: string;
    icon: string;
    topics: Array<{
      id: string;
      title: string;
    }>;
  }>;
  subCategories?: Array<{
    id: string;
    name: string;
  }>;
}

export default function LessonsScreen() {
  const { class: userClass } = useUserStore();
  const { getClassSubjects, getAllClasses } = useCurriculumStore();
  const classes = getAllClasses();
  
  const [selectedClassId, setSelectedClassId] = useState(userClass || '6');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const subjects = getClassSubjects(selectedClassId);
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.title}>📚 Lessons</Text>
      <Text style={styles.subtitle}>{selectedClass?.name || 'Select Class'}</Text>

      {/* Class Selector */}
      <View style={styles.classSelectorContainer}>
        <Text style={styles.sectionTitle}>Select Class</Text>
        <FlashList
          data={classes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.classButton,
                item.id === selectedClassId && styles.classButtonActive,
              ]}
              onPress={() => setSelectedClassId(item.id)}
            >
              <Text
                style={[
                  styles.classButtonText,
                  item.id === selectedClassId && styles.classButtonTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={50}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classListContent}
        />
      </View>

      {/* Subjects and Chapters */}
      <View style={styles.subjectsContainer}>
        {subjects.map((subject, subjectIdx) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isExpanded={expandedSubjects[subject.id]}
            onToggle={() => toggleSubject(subject.id)}
            classId={selectedClassId}
          />
        ))}
      </View>

      {subjects.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No subjects found for this class</Text>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

interface SubjectCardProps {
  subject: Subject;
  isExpanded: boolean;
  onToggle: () => void;
  classId: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, isExpanded, onToggle, classId }) => {
  const { getChapters } = useCurriculumStore();
  const chapters = getChapters(subject.id, classId);

  return (
    <View style={styles.subjectCard}>
      <TouchableOpacity
        style={styles.subjectHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.subjectTitle}>{subject.name}</Text>
        <View style={styles.subjectHeaderRight}>
          <Text style={styles.chapterCount}>{chapters.length} Chapters</Text>
          <Text style={[styles.expandIcon, isExpanded && styles.expandedIcon]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.chaptersContainer}>
          {subject.subCategories && subject.subCategories.length > 0 ? (
            // Render subcategories (e.g., Physics, Chemistry, Biology for Class 9+)
            subject.subCategories.map(subCat => {
              const subCatChapters = chapters.filter(c => 
                c.subCategory === subCat.id
              );
              if (subCatChapters.length === 0) return null;
              
              return (
                <View key={subCat.id} style={styles.subCategoryContainer}>
                  <Text style={styles.subCategoryTitle}>{subCat.name}</Text>
                  <View style={styles.chapterGrid}>
                    {subCatChapters.map(chapter => (
                      <ChapterButton 
                        key={chapter.id} 
                        chapter={chapter} 
                        subjectId={subject.id}
                        classId={selectedClassId}
                      />
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            // Regular chapter grid
            <View style={styles.chapterGrid}>
              {chapters.map(chapter => (
                <ChapterButton 
                  key={chapter.id} 
                  chapter={chapter} 
                  subjectId={subject.id}
                  classId={selectedClassId}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

interface ChapterButtonProps {
  chapter: {
    id: string;
    title: string;
    icon: string;
    topics: Array<{
      id: string;
      title: string;
    }>;
  };
  subjectId?: string;
  classId?: string;
}

const ChapterButton: React.FC<ChapterButtonProps> = ({ chapter, subjectId, classId }) => {
  const router = useRouter();

  const handleLessonPress = () => {
    router.push(`/lessons/${chapter.id}`);
  };

  const handleTestPress = () => {
    if (classId && subjectId) {
      router.push(`/test/${classId}/${subjectId}/${chapter.id}`);
    }
  };

  return (
    <View style={styles.chapterButton}>
      <Pressable
        style={styles.chapterContent}
        onPress={handleLessonPress}
      >
        <View style={styles.chapterIconContainer}>
          <Text style={styles.chapterIcon}>{chapter.icon}</Text>
        </View>
        <Text style={styles.chapterTitle} numberOfLines={2}>
          {chapter.title}
        </Text>
        <Text style={styles.topicCount}>
          {chapter.topics.length} {chapter.topics.length === 1 ? 'topic' : 'topics'}
        </Text>
      </Pressable>
      {classId && subjectId && (
        <Pressable style={styles.testButton} onPress={handleTestPress}>
          <Text style={styles.testButtonText}>📝 Test</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SAND_BG,
    paddingTop: SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
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
    paddingHorizontal: SPACING.MD,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginBottom: SPACING.LG,
    paddingHorizontal: SPACING.MD,
  },
  classSelectorContainer: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  classListContent: {
    paddingHorizontal: SPACING.MD,
  },
  classButton: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.BUTTON,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    marginRight: SPACING.SM,
    ...SHADOWS.LIGHT,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  classButtonActive: {
    borderColor: COLORS.SAGE_PRIMARY,
    backgroundColor: COLORS.SAGE_PRIMARY + '15',
  },
  classButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    fontWeight: '600',
  },
  classButtonTextActive: {
    color: COLORS.SAGE_PRIMARY,
  },
  subjectsContainer: {
    paddingHorizontal: SPACING.MD,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.LARGE,
    marginBottom: SPACING.MD,
    overflow: 'hidden',
    ...SHADOWS.LIGHT,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MD,
  },
  subjectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectTitle: {
    ...TYPOGRAPHY.HEADER,
    color: COLORS.SAGE_PRIMARY,
  },
  chapterCount: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    marginRight: SPACING.SM,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  expandedIcon: {
    transform: [{ rotate: '180deg' }],
  },
  chaptersContainer: {
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '20',
  },
  subCategoryContainer: {
    marginTop: SPACING.MD,
  },
  subCategoryTitle: {
    ...TYPOGRAPHY.BODY,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterButton: {
    width: '48%',
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
    ...SHADOWS.LIGHT,
    overflow: 'hidden',
  },
  chapterContent: {
    padding: SPACING.MD,
    alignItems: 'center',
  },
  chapterIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  chapterIcon: {
    fontSize: 28,
  },
  chapterTitle: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: SPACING.XS,
  },
  topicCount: {
    ...TYPOGRAPHY.SMALL,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
    fontSize: 11,
  },
  testButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
  },
  testButtonText: {
    ...TYPOGRAPHY.SMALL,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING.XL,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.6,
  },
  bottomSpacing: {
    height: SPACING.XL,
  },
});
