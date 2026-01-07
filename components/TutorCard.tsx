import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';
import { TYPOGRAPHY } from '../theme/typography';
import { Tutor } from '../store/tutoringStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TutorCardProps {
  tutor: Tutor;
  onPress?: () => void;
  variant?: 'compact' | 'detailed';
  showAvailability?: boolean;
  isRecommended?: boolean;
  recommendationReason?: string;
}

export default function TutorCard({
  tutor,
  onPress,
  variant = 'compact',
  showAvailability = false,
  isRecommended = false,
  recommendationReason,
}: TutorCardProps) {
  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('✨');
    }
    
    return stars.join('');
  };

  const renderCompactCard = () => (
    <TouchableOpacity
      style={styles.compactContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Profile Image */}
      {tutor.profilePic ? (
        <Image
          source={{ uri: tutor.profilePic }}
          style={styles.profileImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.profileImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{tutor.name.charAt(0)}</Text>
        </View>
      )}

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{tutor.name}</Text>
          {tutor.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        <Text style={styles.qualification} numberOfLines={1}>{tutor.qualifications}</Text>
        <Text style={styles.subjects} numberOfLines={1}>{tutor.subjects.join(', ')}</Text>

        <View style={styles.statsRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{getRatingStars(tutor.rating)}</Text>
            <Text style={styles.ratingNumber}>({tutor.rating.toFixed(1)})</Text>
          </View>

          <Text style={styles.rateText}>₹{tutor.hourlyRate}/hr</Text>
        </View>

        {showAvailability && tutor.availability.length > 0 && (
          <Text style={styles.availabilityText}>
            {tutor.availability.filter(slot => slot.available).length} slots available
          </Text>
        )}

        {isRecommended && recommendationReason && (
          <View style={styles.recommendationBadge}>
            <Text style={styles.recommendationText}>🎯 {recommendationReason}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailedCard = () => (
    <View style={[styles.detailedContainer, onPress && { cursor: 'pointer' }]}>
      {/* Header Section */}
      <View style={styles.detailedHeader}>
        {tutor.profilePic ? (
          <Image
            source={{ uri: tutor.profilePic }}
            style={styles.detailedProfileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.detailedProfileImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{tutor.name.charAt(0)}</Text>
          </View>
        )}

        <View style={styles.detailedHeaderInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.detailedName}>{tutor.name}</Text>
            {tutor.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.detailedQualification}>{tutor.qualifications}</Text>
          
          <View style={styles.experienceRow}>
            <Text style={styles.experienceText}>{tutor.experience} years exp</Text>
            <Text style={styles.responseTime}>• {tutor.responseTime} min response</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <Text style={styles.bio}>{tutor.bio}</Text>

      {/* Subjects */}
      <View style={styles.subjectsSection}>
        <Text style={styles.sectionTitle}>Subjects Expertise</Text>
        <View style={styles.subjectsList}>
          {tutor.subjects.map((subject) => (
            <View key={subject} style={styles.subjectChip}>
              <Text style={styles.subjectText}>{subject}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Specialized Topics */}
      <View style={styles.subjectsSection}>
        <Text style={styles.sectionTitle}>Specialized Topics</Text>
        <View style={styles.topicsList}>
          {tutor.specializedTopics.map((topic) => (
            <Text key={topic} style={styles.topicText}>• {topic}</Text>
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.detailedStatsRow}>
        <View style={styles.statColumn}>
          <Text style={styles.statNumber}>{tutor.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>

        <View style={styles.statColumn}>
          <Text style={styles.statNumber}>{tutor.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>★ Rating</Text>
        </View>

        <View style={styles.statColumn}>
          <Text style={styles.statNumber}>{tutor.languages.length}</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
      </View>

      {/* Rate & Availability */}
      <View style={styles.rateSection}>
        <View style={styles.rateRow}>
          <Text style={styles.rateValue}>₹{tutor.hourlyRate}</Text>
          <Text style={styles.rateUnit}>/hour</Text>
        </View>

        {showAvailability && tutor.availability.length > 0 && (
          <Text style={styles.totalSlots}>
            {tutor.availability.filter(slot => slot.available).length} available slots
          </Text>
        )}
      </View>

      {/* Languages */}
      {tutor.languages.length > 0 && (
        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.languagesText}>{tutor.languages.join(', ')}</Text>
        </View>
      )}

      {/* Action Button */}
      {onPress && (
        <TouchableOpacity style={styles.bookButton} onPress={onPress}>
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return variant === 'compact' ? renderCompactCard() : renderDetailedCard();
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginHorizontal: SPACING.SM,
    marginVertical: SPACING.XS,
    ...SHADOWS.MEDIUM,
  },
  detailedContainer: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: RADIUS.LARGE,
    padding: SPACING.LG,
    margin: SPACING.SM,
    ...SHADOWS.MEDIUM,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.MD,
  },
  placeholderImage: {
    backgroundColor: COLORS.FOREST_ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: COLORS.SAND_BG,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  name: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 16,
    marginRight: SPACING.XS,
  },
  detailedName: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 20,
    marginRight: SPACING.SM,
  },
  verifiedBadge: {
    backgroundColor: COLORS.GOLD_STREAK,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: RADIUS.SMALL,
  },
  verifiedText: {
    color: COLORS.CREAM_BG,
    fontSize: 12,
    fontWeight: 'bold',
  },
  qualification: {
    ...TYPOGRAPHY.METADATA,
    marginBottom: SPACING.XS,
    opacity: 0.8,
  },
  detailedQualification: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    marginBottom: SPACING.XS,
  },
  subjects: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.FOREST_ACCENT,
    marginBottom: SPACING.SM,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginRight: SPACING.XS,
  },
  ratingNumber: {
    ...TYPOGRAPHY.METADATA,
    opacity: 0.7,
  },
  rateText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAGE_PRIMARY,
    fontWeight: '600',
  },
  availabilityText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
    marginTop: SPACING.XS,
  },
  recommendationBadge: {
    backgroundColor: COLORS.GOLD_STREAK,
    padding: SPACING.XS,
    borderRadius: RADIUS.SMALL,
    marginTop: SPACING.XS,
    alignSelf: 'flex-start',
  },
  recommendationText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.CREAM_BG,
    fontWeight: '500',
  },
  detailedHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
  },
  detailedProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.MD,
  },
  detailedHeaderInfo: {
    flex: 1,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  responseTime: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginLeft: SPACING.XS,
  },
  bio: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    marginBottom: SPACING.MD,
    lineHeight: 22,
  },
  sectionTitle: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    fontSize: 14,
    marginBottom: SPACING.XS,
  },
  subjectsSection: {
    marginBottom: SPACING.MD,
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  subjectChip: {
    backgroundColor: COLORS.FOREST_ACCENT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: RADIUS.SMALL,
  },
  subjectText: {
    color: COLORS.SAND_BG,
    fontSize: 12,
    fontWeight: '500',
  },
  topicsList: {
    marginTop: SPACING.XS,
  },
  topicText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    marginBottom: SPACING.XS / 2,
  },
  detailedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.MD,
    paddingVertical: SPACING.MD,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(135, 169, 107, 0.3)',
    borderBottomColor: 'rgba(135, 169, 107, 0.3)',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 18,
  },
  statLabel: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
  },
  rateSection: {
    marginBottom: SPACING.MD,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.XS,
  },
  rateValue: {
    ...TYPOGRAPHY.CONCEPT_TITLE,
    color: COLORS.SAGE_PRIMARY,
    fontSize: 24,
  },
  rateUnit: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.CHARCOAL_TEXT,
    marginLeft: SPACING.XS / 2,
  },
  totalSlots: {
    ...TYPOGRAPHY.METADATA,
    color: COLORS.FOREST_ACCENT,
  },
  languagesSection: {
    marginBottom: SPACING.MD,
  },
  languagesText: {
    ...TYPOGRAPHY.CONCEPT_BODY,
    color: COLORS.CHARCOAL_TEXT,
  },
  bookButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    padding: SPACING.MD,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  bookButtonText: {
    ...TYPOGRAPHY.BULLET_TEXT,
    color: COLORS.SAND_BG,
    fontWeight: '600',
  },
});

export default TutorCard;