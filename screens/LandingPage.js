import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PDFIcon = () => (
  <View style={styles.pdfIconContainer}>
    <LinearGradient
      colors={['#FF7E33', '#FF6600']}
      style={styles.pdfIcon}
    >
      <View style={styles.pdfIconCorner} />
      <View style={styles.pdfIconInnerShadow} />
      <Text style={styles.pdfIconText}>PDF</Text>
    </LinearGradient>
    <View style={styles.pdfIconShadow} />
  </View>
);

const LandingPage = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Welcome to PDF Manager</Text>
      <Text style={styles.subtitle}>Manage your PDF files with ease</Text>
      <View style={styles.iconContainer}>
        <PDFIcon />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.signUpButton]}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </LinearGradient>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6600', // Orange color
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#808080',
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6600',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6600',
  },
  buttonText: {
    color: '#FF6600',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginVertical: 30,
  },
  pdfIconContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  pdfIcon: {
    width: 120,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF8533',
    overflow: 'hidden',
  },
  pdfIconCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 40,
    borderTopWidth: 40,
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.3)',
    transform: [{ rotate: '90deg' }],
  },
  pdfIconInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pdfIconText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  pdfIconShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 120,
    height: 150,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
});

export default LandingPage;