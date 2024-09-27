import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { getStorage, ref, listAll, getMetadata } from 'firebase/storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPDFs, setTotalPDFs] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);

  const MAX_STORAGE_MB = 100;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchStorageUsage(currentUser.uid);
        fetchTotalPDFs(currentUser.uid);
        setLastLogin(new Date(currentUser.metadata.lastSignInTime));
      } else {
        navigation.replace('Login');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const fetchStorageUsage = async (userId) => {
    const storage = getStorage();
    const listRef = ref(storage, `pdfs/${userId}`);
    
    try {
      const res = await listAll(listRef);
      let totalSize = 0;
      
      for (const itemRef of res.items) {
        const metadata = await getMetadata(itemRef);
        totalSize += metadata.size;
      }
      
      const usedMB = totalSize / (1024 * 1024);
      setStorageUsed(usedMB);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalPDFs = async (userId) => {
    try {
      const q = query(collection(db, "pdfs"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      setTotalPDFs(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching total PDFs:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Landing');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(previousState => !previousState);
    // Here you would typically update this preference in your backend or local storage
  };

  const handleEditProfile = () => {
    // Navigate to a new screen for editing profile or show a modal
    console.log("Edit profile");
  };

  const handleChangePassword = () => {
    // Implement password change logic
    console.log("Change password");
  };

  const handleHelpSupport = () => {
    // Navigate to help & support screen or open web link
    console.log("Help & Support");
  };

  const getUserDisplayName = () => {
    if (user.displayName) {
      return user.displayName;
    } else if (user.email) {
      // If no display name, use the part of the email before the @
      return user.email.split('@')[0];
    } else {
      return 'User';
    }
  };

  if (!user) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <Text style={styles.loadingText}>Loading user information...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={60} color="#FF6600" />
            </View>
          )}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out" size={16} color="#FFFFFF" style={styles.signOutIcon} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="finger-print" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>User ID: {user.uid.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.storageItem}>
            <Ionicons name="cloud" size={24} color="#FF6600" style={styles.infoIcon} />
            <View style={styles.storageInfo}>
              <Text style={styles.infoText}>Storage Used</Text>
              {isLoading ? (
                <Text style={styles.storageText}>Loading...</Text>
              ) : (
                <>
                  <Text style={styles.storageText}>
                    {storageUsed.toFixed(2)} MB / {MAX_STORAGE_MB} MB
                  </Text>
                  <Progress.Bar
                    progress={storageUsed / MAX_STORAGE_MB}
                    width={null}
                    height={10}
                    color="#FF6600"
                    unfilledColor="rgba(255, 255, 255, 0.2)"
                    borderWidth={0}
                    style={styles.progressBar}
                  />
                </>
              )}
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>Account Created: {new Date(user.metadata.creationTime).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>Last Login: {lastLogin ? lastLogin.toLocaleString() : 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="document" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>Total PDFs: {totalPDFs}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="notifications" size={24} color="#FF6600" style={styles.infoIcon} />
            <Text style={styles.infoText}>Notifications</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#FF6600" }}
              thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleHelpSupport}>
            <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>

       
        </View>

        <Text style={styles.versionText}>App Version: 1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoSection: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: 20,
    marginBottom: 100,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 102, 0, 0.8)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  signOutIcon: {
    marginRight: 5,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  storageInfo: {
    flex: 1,
  },
  storageText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    marginTop: 5,
  },
  actionsSection: {
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
  },
  versionText: {
    color: '#808080',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ProfileScreen;