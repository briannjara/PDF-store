import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, Alert, ActivityIndicator, Linking } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, storage, db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  // State variables for managing PDFs, loading states, and errors
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [cancelUpload, setCancelUpload] = useState(false);
  const uploadTaskRef = useRef(null);

  useEffect(() => {
    // Check authentication status and fetch PDFs when component mounts
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPDFs();
      } else {
        navigation.replace('Login');
      }
    });

    // Cleanup function to unsubscribe from the auth listener
    return () => unsubscribe();
  }, [navigation]);

  // Function to fetch PDFs from Firestore
  const fetchPDFs = async () => {
    if (!auth.currentUser) {
      console.log("No authenticated user");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching PDFs...");
      const q = query(collection(db, "pdfs"), where("userId", "==", auth.currentUser.uid));
      console.log("Query created");
      const querySnapshot = await getDocs(q);
      console.log("Query executed");
      const pdfList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("PDFs fetched:", pdfList);
      setPdfs(pdfList);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      setError("Failed to fetch PDFs. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to check for duplicate PDFs
  const checkDuplicatePDF = async (pdfName) => {
    const q = query(
      collection(db, "pdfs"),
      where("userId", "==", auth.currentUser.uid),
      where("name", "==", pdfName)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Function to handle PDF upload
  const handleUpload = async () => {
    if (!auth.currentUser) {
      console.log("No authenticated user");
      Alert.alert("Error", "You must be logged in to upload PDFs");
      return;
    }

    try {
      console.log("Starting document picker...");
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      console.log("Document picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri, name, size } = result.assets[0];
        
        // Check if file size exceeds 20MB (20 * 1024 * 1024 bytes)
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (size > maxSize) {
          Alert.alert("Error", "File size exceeds 20MB limit. Please choose a smaller file.");
          return;
        }

        // Check for duplicate PDF
        const isDuplicate = await checkDuplicatePDF(name);
        if (isDuplicate) {
          Alert.alert("Duplicate PDF", "A PDF with this name already exists. Please choose a different file or rename it before uploading.");
          return;
        }

        setUploading(true);
        setUploadProgress(0);
        console.log(`Selected PDF - Name: ${name}, URI: ${uri}, Size: ${size} bytes`);

        console.log("Fetching PDF content...");
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log(`PDF blob created, size: ${blob.size} bytes`);

        const storageRef = ref(storage, `pdfs/${auth.currentUser.uid}/${name}`);
        console.log(`Storage reference created: ${storageRef.fullPath}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTaskRef.current = uploadTask;
        setCancelUpload(false);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            
            if (cancelUpload) {
              uploadTaskRef.current.cancel();
              setUploading(false);
              setUploadProgress(0);
              Alert.alert("Upload Cancelled", "The upload has been cancelled.");
            }
          },
          (error) => {
            if (error.code === 'storage/canceled') {
              console.log('Upload was canceled');
            } else {
              console.error('Error uploading PDF:', error);
              Alert.alert("Error", "Failed to upload PDF");
            }
            setUploading(false);
            setUploadProgress(0);
          },
          async () => {
            console.log("Upload completed successfully");
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`Download URL obtained: ${downloadURL}`);

            const docData = {
              name,
              url: downloadURL,
              userId: auth.currentUser.uid,
              createdAt: new Date().toISOString(),
            };
            console.log("Preparing to add document to Firestore:", docData);

            const docRef = await addDoc(collection(db, 'pdfs'), docData);
            console.log("Document added to Firestore with ID:", docRef.id);

            Alert.alert("Success", "PDF uploaded successfully");
            fetchPDFs();
            setUploading(false);
            setUploadProgress(0);
          }
        );
      } else {
        console.log("Document picker cancelled or failed");
      }
    } catch (error) {
      console.error('Error in handleUpload:', error);
      Alert.alert("Error", "Failed to upload PDF");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      setUploading(false);
      setUploadProgress(0);
      Alert.alert("Upload Cancelled", "The upload has been cancelled.");
    }
  };

  // Function to handle PDF deletion
  const handleDelete = async (pdfId, pdfName) => {
    // Show confirmation dialog before deleting
    Alert.alert(
      "Delete PDF",
      `Are you sure you want to delete ${pdfName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => confirmDelete(pdfId, pdfName) }
      ]
    );
  };

  // Function to confirm and execute PDF deletion
  const confirmDelete = async (pdfId, pdfName) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "pdfs", pdfId));

      // Delete from Storage
      const storageRef = ref(storage, `pdfs/${auth.currentUser.uid}/${pdfName}`);
      await deleteObject(storageRef);

      // Update local state
      setPdfs(currentPdfs => currentPdfs.filter(pdf => pdf.id !== pdfId));

      Alert.alert("Success", "PDF deleted successfully");
    } catch (error) {
      console.error("Error deleting PDF:", error);
      Alert.alert("Error", "Failed to delete PDF. Please try again.");
    }
  };

  // Function to open PDF for viewing
  const handleView = async (pdfUrl) => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert("Error", "Unable to open this PDF. Please make sure you have a PDF viewer installed.");
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      Alert.alert("Error", "An error occurred while trying to open the PDF.");
    }
  };

  const renderPDFItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleView(item.url)} style={styles.pdfItem}>
      <View style={styles.pdfInfo}>
        <Ionicons name="document-text" size={24} color="#FF6600" />
        <View style={styles.pdfTextContainer}>
          <Text style={styles.pdfName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.pdfDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    return (
      <>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF6600" />
            <Text style={styles.loadingText}>Loading PDFs...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPDFs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : pdfs.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="document-text-outline" size={64} color="#FF6600" />
            <Text style={styles.noPDFsText}>No PDFs uploaded yet</Text>
          </View>
        ) : (
          <FlatList
            data={pdfs}
            renderItem={renderPDFItem}
            keyExtractor={item => item.id}
            style={styles.pdfList}
            contentContainerStyle={styles.pdfListContent}
          />
        )}
        
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.uploadingButton]} 
          onPress={uploading ? handleCancelUpload : handleUpload}
          disabled={uploading && cancelUpload}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.uploadProgressText}>{`${Math.round(uploadProgress)}%`}</Text>
              <Text style={styles.cancelText}>Tap to Cancel</Text>
            </View>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#000000" />
              <Text style={styles.uploadButtonText}>Upload PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My PDFs</Text>
      </View>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
  },
  pdfList: {
    flex: 1,
  },
  pdfListContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  pdfName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  pdfDate: {
    color: '#808080',
    fontSize: 14,
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6600',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    minHeight: 50,
  },
  uploadingButton: {
    backgroundColor: '#FF8C00',
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    color: '#FF6600',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#FF6600',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPDFsText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadProgressText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cancelText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default HomeScreen;