import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const dummyPDFs = [
  { id: '1', name: 'Project Proposal.pdf', size: '2.3 MB' },
  { id: '2', name: 'Financial Report Q2.pdf', size: '1.8 MB' },
  { id: '3', name: 'User Manual v1.2.pdf', size: '4.5 MB' },
  { id: '4', name: 'Meeting Minutes 05-15.pdf', size: '0.5 MB' },
  { id: '5', name: 'Product Roadmap 2023.pdf', size: '3.1 MB' },
];

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderPDFItem = ({ item }) => (
    <TouchableOpacity style={styles.pdfItem}>
      <Ionicons name="document-text" size={24} color="#FF6600" />
      <View style={styles.pdfInfo}>
        <Text style={styles.pdfName}>{item.name}</Text>
        <Text style={styles.pdfSize}>{item.size}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My PDFs</Text>
       
      </View>
      <FlatList
        data={dummyPDFs}
        renderItem={renderPDFItem}
        keyExtractor={item => item.id}
        style={styles.pdfList}
      />
      <TouchableOpacity style={styles.uploadButton}>
        <Ionicons name="cloud-upload" size={24} color="#000000" />
        <Text style={styles.uploadButtonText}>Upload PDF</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6600',
  },

  pdfList: {
    flex: 1,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  pdfInfo: {
    marginLeft: 15,
    flex: 1,
  },
  pdfName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  pdfSize: {
    color: '#808080',
    fontSize: 14,
    marginTop: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6600',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;