import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Navigate to MainTabs instead of Home
      navigation.navigate('MainTabs');
    } catch (error) {
      // More detailed error handling
      let errorMessage = "An error occurred during sign up.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      setError(errorMessage);
      Alert.alert("Sign Up Error", errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Landing')}
      >
        <Ionicons name="arrow-back" size={24} color="#FF6600" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#808080"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#808080"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#FF6600', // Orange color
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6600',
  },
  input: {
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 15,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#FF6600',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    color: '#FF6600',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignUpScreen;