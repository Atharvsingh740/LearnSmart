import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Swipeable } from 'react-native';
import { COLORS } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { Notification } from '@/store/notificationsStore';
import { useTheme } from '@/theme/useTheme';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
  onMarkAsRead,
}) => {
  const { colors } = useTheme();
  const isRead = notification.isRead;

  // Format the timestamp
  const formattedTime = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
  });

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'streak':
        return '🔥';
      case 'achievement':
        return '🏆';
      case 'reminder':
        return '🔔';
      case 'update':
        return '📢';
      case 'message':
        return '💬';
      default:
        return '📱';
    }
  };

  // Get notification background color based on type
  const getNotificationBackgroundColor = () => {
    switch (notification.type) {
      case 'streak':
        return colors.warning + '20';
      case 'achievement':
        return colors.success + '20';
      case 'reminder':
        return colors.info + '20';
      case 'update':
        return colors.primary + '20';
      case 'message':
        return colors.accent + '20';
      default:
        return colors.background + '20';
    }
  };

  // Right swipe action (delete)
  const renderRightActions = () => (
    <TouchableOpacity
      style={[
        styles.deleteAction,
        { backgroundColor: colors.error },
      ]}
      onPress={onDelete}
    >
      <Text style={[styles.actionText, { color: colors.white }]}>
        Delete
      </Text>
    </TouchableOpacity>
  );

  // Left swipe action (mark as read/unread)
  const renderLeftActions = () => (
    <TouchableOpacity
      style={[
        styles.readAction,
        { backgroundColor: isRead ? colors.secondary : colors.primary },
      ]}
      onPress={onMarkAsRead}
    >
      <Text style={[styles.actionText, { color: colors.white }]}>
        {isRead ? 'Mark Unread' : 'Mark Read'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
          !isRead && styles.unreadContainer,
          { backgroundColor: !isRead ? colors.background : colors.card },
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getNotificationBackgroundColor() },
          ]}
        >
          <Text style={styles.icon}>{getNotificationIcon()}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Timestamp */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: isRead ? colors.secondaryText : colors.text },
                !isRead && styles.unreadTitle,
              ]}
            >
              {notification.title}
            </Text>
            <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
              {formattedTime}
            </Text>
          </View>

          {/* Body */}
          <Text
            style={[
              styles.body,
              { color: isRead ? colors.tertiaryText : colors.secondaryText },
            ]}
            numberOfLines={2}
          >
            {notification.body}
          </Text>

          {/* Action */}
          {notification.action && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { borderColor: colors.primary },
              ]}
              onPress={() => notification.action?.callback?.()}
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                {notification.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread Indicator */}
        {!isRead && (
          <View style={[
            styles.unreadIndicator,
            { backgroundColor: colors.primary },
          ]} />
        )}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  unreadContainer: {
    backgroundColor: COLORS.FOREST_ACCENT + '10',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 16,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  timestamp: {
    ...typography.caption,
    fontSize: 12,
    marginLeft: 8,
  },
  body: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  actionButtonText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  deleteAction: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readAction: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationItem;