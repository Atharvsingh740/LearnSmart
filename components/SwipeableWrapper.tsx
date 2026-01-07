import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';

interface SwipeableProps {
  children: React.ReactNode;
  renderRightActions?: () => React.ReactNode;
  renderLeftActions?: () => React.ReactNode;
  rightThreshold?: number;
  leftThreshold?: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  renderRightActions,
  renderLeftActions,
  rightThreshold = 40,
  leftThreshold = 40,
  onSwipe,
}) => {
  const panX = React.useRef(new Animated.Value(0)).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        panX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dx = gestureState.dx;
        
        if (dx < -rightThreshold && renderRightActions) {
          // Swiped left - show right actions
          Animated.timing(panX, {
            toValue: -120,
            duration: 200,
            useNativeDriver: true,
          }).start();
          onSwipe?.('left');
        } else if (dx > leftThreshold && renderLeftActions) {
          // Swiped right - show left actions
          Animated.timing(panX, {
            toValue: 120,
            duration: 200,
            useNativeDriver: true,
          }).start();
          onSwipe?.('right');
        } else {
          // Return to center
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Calculate opacity for actions based on swipe progress
  const rightOpacity = panX.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const leftOpacity = panX.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {renderLeftActions && (
        <Animated.View 
          style={[
            styles.leftActions,
            { opacity: leftOpacity },
          ]}
        >
          {renderLeftActions()}
        </Animated.View>
      )}

      {/* Right Actions */}
      {renderRightActions && (
        <Animated.View 
          style={[
            styles.rightActions,
            { opacity: rightOpacity },
          ]}
        >
          {renderRightActions()}
        </Animated.View>
      )}

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateX: panX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    zIndex: 2,
    backgroundColor: 'white',
  },
  leftActions: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 1,
  },
});

export default Swipeable;