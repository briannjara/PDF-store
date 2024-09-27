import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      {user.displayName && <Text style={styles.info}>Name: {user.displayName}</Text>}
      {user.photoURL && <Image source={{ uri: user.photoURL }} style={styles.profileImage} />}
      <Text style={styles.info}>User ID: {user.uid}</Text>
      <Text style={styles.info}>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});

export default ProfileScreen;