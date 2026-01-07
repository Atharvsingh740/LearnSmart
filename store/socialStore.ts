import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: Array<string>;
  following: Array<string>;
  blockedUsers: Array<string>;
  publicProfile: boolean;
  badges: Array<string>;
  stats: {
    lessonsCompleted: number;
    averageScore: number;
    streak: number;
    totalTests: number;
    totalStudyTime: number; // in hours
  };
  privacySettings: {
    showStats: boolean;
    showBadges: boolean;
    showActivity: boolean;
    allowMessages: boolean;
  };
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
  sharedProgress: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'achievement' | 'streak' | 'test' | 'completion' | 'share';
  title: string;
  description: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  content: string;
  createdAt: Date;
  likes: number;
}

interface SocialState {
  userProfiles: Map<string, UserProfile>;
  friendships: Friendship[];
  activities: Activity[];
  comments: Comment[];
  currentUserId: string | null;
  
  // Profile actions
  getPublicProfile: (userId: string) => Promise<UserProfile | null>;
  followUser: (userId: string, targetUserId: string) => Promise<void>;
  unfollowUser: (userId: string, targetUserId: string) => Promise<void>;
  blockUser: (userId: string, targetUserId: string) => Promise<void>;
  unblockUser: (userId: string, targetUserId: string) => Promise<void>;
  shareAchievement: (userId: string, achievementId: string, activityType?: string) => Promise<Activity>;
  
  // Friendship actions
  sendFriendRequest: (userId: string, targetUserId: string) => Promise<Friendship>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  
  // Discovery actions
  getSuggestedUsers: (userId: string) => Promise<UserProfile[]>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  getFriendsList: (userId: string) => Promise<UserProfile[]>;
  getFollowers: (userId: string) => Promise<UserProfile[]>;
  getFollowing: (userId: string) => Promise<UserProfile[]>;
  
  // Activity feed
  getActivityFeed: (userId: string) => Promise<Activity[]>;
  getFriendActivity: (userId: string) => Promise<Activity[]>;
  likeActivity: (activityId: string, userId: string) => Promise<void>;
  commentOnActivity: (activityId: string, userId: string, content: string) => Promise<void>;
  
  // Profile management
  updateProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  updatePrivacySettings: (userId: string, settings: Partial<UserProfile['privacySettings']>) => Promise<void>;
  getBlockedUsers: (userId: string) => Promise<UserProfile[]>;
  
  // Notifications
  getPendingFriendRequests: (userId: string) => Promise<Friendship[]>;
  getFriendCount: (userId: string) => Promise<number>;
}

// Initial mock data
const mockUserProfiles: Map<string, UserProfile> = new Map([
  ['user_001', {
    id: 'user_001',
    username: 'rajesh_kumar',
    displayName: 'Rajesh Kumar',
    avatar: 'https://example.com/avatars/rajesh.jpg',
    bio: 'Math enthusiast | JEE aspirant | Love solving complex problems',
    followers: ['user_002', 'user_003', 'user_004'],
    following: ['user_002', 'user_005'],
    blockedUsers: [],
    publicProfile: true,
    badges: ['badge_quick_learner', 'badge_math_master', 'badge_streak_30'],
    stats: {
      lessonsCompleted: 145,
      averageScore: 87,
      streak: 28,
      totalTests: 23,
      totalStudyTime: 240
    },
    privacySettings: {
      showStats: true,
      showBadges: true,
      showActivity: true,
      allowMessages: false
    }
  }],
  ['user_002', {
    id: 'user_002',
    username: 'priya_sharma',
    displayName: 'Priya Sharma',
    avatar: 'https://example.com/avatars/priya.jpg',
    bio: 'Physics wizard ⚡ | Future engineer | Helping others excel',
    followers: ['user_001', 'user_003', 'user_005', 'user_006'],
    following: ['user_001', 'user_004'],
    blockedUsers: [],
    publicProfile: true,
    badges: ['badge_physics_expert', 'badge_teacher_helper', 'badge_performer'],
    stats: {
      lessonsCompleted: 189,
      averageScore: 92,
      streak: 45,
      totalTests: 31,
      totalStudyTime: 320
    },
    privacySettings: {
      showStats: true,
      showBadges: true,
      showActivity: true,
      allowMessages: true
    }
  }],
  ['user_003', {
    id: 'user_003',
    username: 'amit_verma',
    displayName: 'Amit Verma',
    avatar: 'https://example.com/avatars/amit.jpg',
    bio: 'Chemistry is life | Lab experiments 🔬 | Aspiring scientist',
    followers: ['user_001', 'user_002', 'user_005'],
    following: ['user_002', 'user_003'],
    blockedUsers: [],
    publicProfile: true,
    badges: ['badge_chemistry_lover', 'badge_experimenter', 'badge_perfectionist'],
    stats: {
      lessonsCompleted: 98,
      averageScore: 81,
      streak: 12,
      totalTests: 18,
      totalStudyTime: 180
    },
    privacySettings: {
      showStats: true,
      showBadges: true,
      showActivity: true,
      allowMessages: false
    }
  }],
  ['user_004', {
    id: 'user_004',
    username: 'sneha_reddy',
    displayName: 'Sneha Reddy',
    avatar: 'https://example.com/avatars/sneha.jpg',
    bio: 'Biology is my passion 🧬 | Future doctor | NEET aspirant',
    followers: ['user_001', 'user_005'],
    following: ['user_002', 'user_003', 'user_006'],
    blockedUsers: [],
    publicProfile: false, // Private profile
    badges: ['badge_biology_queen', 'badge_medicine_man', 'badge_consistent'],
    stats: {
      lessonsCompleted: 167,
      averageScore: 88,
      streak: 36,
      totalTests: 26,
      totalStudyTime: 290
    },
    privacySettings: {
      showStats: false,
      showBadges: true,
      showActivity: false,
      allowMessages: false
    }
  }],
]);

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      userProfiles: mockUserProfiles,
      friendships: [],
      activities: [],
      comments: [],
      currentUserId: null,
      
      getPublicProfile: async (userId: string) => {
        const profile = get().userProfiles.get(userId);
        return profile || null;
      },
      
      followUser: async (userId: string, targetUserId: string) => {
        // Update current user's following list
        set(state => {
          const currentProfile = state.userProfiles.get(userId);
          const targetProfile = state.userProfiles.get(targetUserId);
          
          if (currentProfile && targetProfile) {
            return {
              userProfiles: new Map(state.userProfiles).set(userId, {
                ...currentProfile,
                following: [...currentProfile.following, targetUserId]
              }).set(targetUserId, {
                ...targetProfile,
                followers: [...targetProfile.followers, userId]
              })
            };
          }
          
          return state;
        });
      },
      
      unfollowUser: async (userId: string, targetUserId: string) => {
        set(state => {
          const currentProfile = state.userProfiles.get(userId);
          const targetProfile = state.userProfiles.get(targetUserId);
          
          if (currentProfile && targetProfile) {
            return {
              userProfiles: new Map(state.userProfiles).set(userId, {
                ...currentProfile,
                following: currentProfile.following.filter(id => id !== targetUserId)
              }).set(targetUserId, {
                ...targetProfile,
                followers: targetProfile.followers.filter(id => id !== userId)
              })
            };
          }
          
          return state;
        });
      },
      
      blockUser: async (userId: string, targetUserId: string) => {
        set(state => {
          const currentProfile = state.userProfiles.get(userId);
          
          if (currentProfile) {
            const updatedProfile = {
              ...currentProfile,
              following: currentProfile.following.filter(id => id !== targetUserId),
              followers: currentProfile.followers.filter(id => id !== targetUserId),
              blockedUsers: [...currentProfile.blockedUsers, targetUserId]
            };
            
            return {
              userProfiles: new Map(state.userProfiles).set(userId, updatedProfile)
            };
          }
          
          return state;
        });
      },
      
      unblockUser: async (userId: string, targetUserId: string) => {
        set(state => {
          const currentProfile = state.userProfiles.get(userId);
          
          if (currentProfile) {
            return {
              userProfiles: new Map(state.userProfiles).set(userId, {
                ...currentProfile,
                blockedUsers: currentProfile.blockedUsers.filter(id => id !== targetUserId)
              })
            };
          }
          
          return state;
        });
      },
      
      shareAchievement: async (userId: string, achievementId: string, activityType: string = 'achievement') => {
        const activity: Activity = {
          id: `activity_${Date.now()}`,
          userId,
          type: activityType as any,
          title: 'New Achievement Unlocked!',
          description: 'Just unlocked "🎯 Quiz Master" badge on LearnSmart. Consistent excellence rewarded!',
          timestamp: new Date(),
          data: { achievementId, score: 95, totalAttempts: 50 }
        };
        
        set(state => ({
          activities: [...state.activities, activity]
        }));
        
        return activity;
      },
      
      sendFriendRequest: async (userId: string, targetUserId: string) => {
        const friendship: Friendship = {
          id: `fr_${Date.now()}`,
          requesterId: userId,
          addresseeId: targetUserId,
          status: 'pending',
          createdAt: new Date(),
          sharedProgress: true
        };
        
        set(state => ({
          friendships: [...state.friendships, friendship]
        }));
        
        return friendship;
      },
      
      acceptFriendRequest: async (requestId: string) => {
        set(state => ({
          friendships: state.friendships.map(fr => 
            fr.id === requestId 
              ? { ...fr, status: 'accepted', acceptedAt: new Date() }
              : fr
          )
        }));
      },
      
      rejectFriendRequest: async (requestId: string) => {
        set(state => ({
          friendships: state.friendships.filter(fr => fr.id !== requestId)
        }));
      },
      
      cancelFriendRequest: async (requestId: string) => {
        set(state => ({
          friendships: state.friendships.filter(fr => fr.id !== requestId)
        }));
      },
      
      getSuggestedUsers: async (userId: string) => {
        const state = get();
        const currentProfile = state.userProfiles.get(userId);
        
        if (!currentProfile) return [];
        
        // Get users from same subjects, mutual friends
        const suggestedUsers: UserProfile[] = [];
        
        state.userProfiles.forEach((profile, profileId) => {
          if (profileId !== userId && 
              !currentProfile.following.includes(profileId) && 
              profile.publicProfile) {
            suggestedUsers.push(profile);
          }
        });
        
        // Sort by mutual followers count
        return suggestedUsers.sort((a, b) => b.followers.length - a.followers.length).slice(0, 5);
      },
      
      searchUsers: async (query: string) => {
        const state = get();
        const searchTerm = query.toLowerCase();
        
        return Array.from(state.userProfiles.values()).filter(profile => 
          profile.username.toLowerCase().includes(searchTerm) ||
          profile.displayName.toLowerCase().includes(searchTerm) ||
          profile.bio.toLowerCase().includes(searchTerm)
        );
      },
      
      getFriendsList: async (userId: string) => {
        const state = get();
        const friendships = state.friendships.filter(
          fr => (fr.requesterId === userId || fr.addresseeId === userId) && fr.status === 'accepted'
        );
        
        const friendIds = friendships.map(fr => 
          fr.requesterId === userId ? fr.addresseeId : fr.requesterId
        );
        
        return Array.from(state.userProfiles.values()).filter(profile => 
          friendIds.includes(profile.id)
        );
      },
      
      getFollowers: async (userId: string) => {
        const profile = get().userProfiles.get(userId);
        if (!profile) return [];
        
        return Array.from(get().userProfiles.values()).filter(p => 
          p.following.includes(userId)
        );
      },
      
      getFollowing: async (userId: string) => {
        const profile = get().userProfiles.get(userId);
        if (!profile) return [];
        
        return Array.from(get().userProfiles.values()).filter(p => 
          profile.following.includes(p.id)
        );
      },
      
      getActivityFeed: async (userId: string) => {
        const state = get();
        const profile = state.userProfiles.get(userId);
        
        if (!profile) return [];
        
        // Get activities from following users
        const followingActivities = state.activities.filter(activity => 
          profile.following.includes(activity.userId)
        );
        
        // Add own activities
        const ownActivities = state.activities.filter(activity => 
          activity.userId === userId
        );
        
        return [...followingActivities, ...ownActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 20);
      },
      
      getFriendActivity: async (userId: string) => {
        const state = get();
        const friendships = state.friendships.filter(
          fr => (fr.requesterId === userId || fr.addresseeId === userId) && fr.status === 'accepted'
        );
        
        const friendIds = friendships.map(fr => 
          fr.requesterId === userId ? fr.addresseeId : fr.requesterId
        );
        
        return state.activities.filter(activity => 
          friendIds.includes(activity.userId)
        ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },
      
      likeActivity: async (activityId: string, userId: string) => {
        set(state => ({
          activities: state.activities.map(activity => 
            activity.id === activityId 
              ? { ...activity, likes: (activity.likes || 0) + 1 }
              : activity
          )
        }));
      },
      
      commentOnActivity: async (activityId: string, userId: string, content: string) => {
        const comment: Comment = {
          id: `comment_${Date.now()}`,
          activityId,
          userId,
          content,
          createdAt: new Date(),
          likes: 0
        };
        
        set(state => ({
          comments: [...state.comments, comment]
        }));
      },
      
      updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
        set(state => {
          const profile = state.userProfiles.get(userId);
          
          if (profile) {
            return {
              userProfiles: new Map(state.userProfiles).set(userId, {
                ...profile,
                ...updates
              })
            };
          }
          
          return state;
        });
      },
      
      updatePrivacySettings: async (userId: string, settings: Partial<UserProfile['privacySettings']>) => {
        set(state => {
          const profile = state.userProfiles.get(userId);
          
          if (profile) {
            return {
              userProfiles: new Map(state.userProfiles).set(userId, {
                ...profile,
                privacySettings: {
                  ...profile.privacySettings,
                  ...settings
                }
              })
            };
          }
          
          return state;
        });
      },
      
      getBlockedUsers: async (userId: string) => {
        const state = get();
        const profile = state.userProfiles.get(userId);
        
        if (!profile) return [];
        
        return Array.from(state.userProfiles.values()).filter(p => 
          profile.blockedUsers.includes(p.id)
        );
      },
      
      getPendingFriendRequests: async (userId: string) => {
        const state = get();
        return state.friendships.filter(
          fr => fr.addresseeId === userId && fr.status === 'pending'
        );
      },
      
      getFriendCount: async (userId: string) => {
        const state = get();
        const friendships = state.friendships.filter(
          fr => (fr.requesterId === userId || fr.addresseeId === userId) && fr.status === 'accepted'
        );
        
        return friendships.length;
      },
      
    }),
    {
      name: 'learnsmart-social',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        friendships: state.friendships,
        activities: state.activities,
        comments: state.comments,
      }),
    }
  )
);

// Helper to check if users are friends
export const useIsFriend = (userId: string, targetUserId: string) => {
  const { friendships } = useSocialStore();
  
  return friendships.some(
    fr => 
      fr.status === 'accepted' &&
      ((fr.requesterId === userId && fr.addresseeId === targetUserId) ||
       (fr.requesterId === targetUserId && fr.addresseeId === userId))
  );
};

// Helper to get pending friend requests count
export const usePendingFriendRequestsCount = (userId: string) => {
  const { friendships } = useSocialStore();
  
  return friendships.filter(
    fr => fr.addresseeId === userId && fr.status === 'pending'
  ).length;
};

// Helper to get mutual followers count
export const useMutualFollowersCount = (userId: string, targetUserId: string) => {
  const { friendships } = useSocialStore();
  
  const userFollowing = friendships
    .filter(fr => fr.requesterId === userId && fr.status === 'accepted')
    .map(fr => fr.addresseeId);
  
  const targetFollowing = friendships
    .filter(fr => fr.requesterId === targetUserId && fr.status === 'accepted')
    .map(fr => fr.addresseeId);
  
  return userFollowing.filter(id => targetFollowing.includes(id)).length;
};

export { useSocialStore };