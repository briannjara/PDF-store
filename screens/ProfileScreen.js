import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Landing');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
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
          <Text style={styles.userName}>{getUserDisplayName()}</Text>
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
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#000000" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 102, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
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
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  signOutIcon: {
    marginRight: 10,
  },
  signOutText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;