import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { db, auth } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const CreateQuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId, quizData } = route.params || {};

  // --- Existing State ---
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [teamName, setTeamName] = useState('');

  // --- NEW State for Media Upload ---
  const [mediaUri, setMediaUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (quizData) {
      setTitle(quizData.title || '');
      setPosition(quizData.position || '');
      setQuestions(Array.isArray(quizData.questions) ? quizData.questions : []);
    }

    const fetchTeam = async () => {
      try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
            Alert.alert('Error', 'You must be logged in to create a quiz.');
            navigation.goBack();
            return;
        }
        const userDocRef = doc(db, 'users', currentUserId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setTeamName(userSnap.data().teamName || '');
        } else {
          Alert.alert('Error', 'User team not found');
        }
      } catch (error) {
        console.error('Error fetching user team:', error);
      }
    };

    fetchTeam();
  }, [quizData]);

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // FIXED: Updated to use the new syntax for media types
      mediaTypes: [ImagePicker.MediaType.Images, ImagePicker.MediaType.Videos],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const uploadMedia = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `quiz-media/${Date.now()}-${auth.currentUser.uid}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    } catch (error) {
        // ADDED: More detailed error logging
        console.error("Upload Error Details:", JSON.stringify(error, null, 2));
        Alert.alert("Upload Error", `Failed to upload media. Please ensure Storage is enabled in your Firebase project. Details: ${error.message}`);
        throw error; // Re-throw the error to stop the process
    }
  };

  const handleAddOrUpdateQuestion = async () => {
    if (!currentQuestion.trim() || options.some((o) => !o.trim()) || !correctAnswer.trim()) {
      Alert.alert('Error', 'Please fill in all question fields');
      return;
    }
    
    setIsUploading(true);

    try {
        let mediaUrl = null;
        if (editingIndex !== null && questions[editingIndex].mediaUrl) {
            mediaUrl = questions[editingIndex].mediaUrl;
        }
        if (mediaUri && !mediaUri.startsWith('http')) {
             mediaUrl = await uploadMedia(mediaUri);
        }

        const questionObject = {
            question: currentQuestion.trim(),
            options: options.map((o) => o.trim()),
            correctAnswer: correctAnswer.trim(),
            mediaUrl: mediaUrl,
        };

        if (editingIndex !== null) {
            const updated = [...questions];
            updated[editingIndex] = questionObject;
            setQuestions(updated);
            setEditingIndex(null);
        } else {
            setQuestions([...questions, questionObject]);
        }

        setCurrentQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
        setMediaUri(null);

    } catch (error) {
        console.error("Error adding question:", error);
        // The detailed alert is now in the uploadMedia function
    } finally {
        setIsUploading(false);
    }
  };

  const handleEdit = (index) => {
    const q = questions[index];
    setCurrentQuestion(q.question);
    setOptions(q.options);
    setCorrectAnswer(q.correctAnswer);
    setEditingIndex(index);
    setMediaUri(q.mediaUrl || null);
  };

  const handleDelete = (index) => {
    Alert.alert('Delete Question', 'Are you sure you want to delete this question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = [...questions];
          updated.splice(index, 1);
          setQuestions(updated);
        },
      },
    ]);
  };

  const saveQuiz = async () => {
    if (!title.trim() || questions.length === 0) {
      Alert.alert('Error', 'Add a title and at least one question');
      return;
    }
    if (!teamName) {
      Alert.alert('Error', 'Team not found. Please ensure you are signed in properly.');
      return;
    }
    
    setIsUploading(true);

    try {
      const currentUserId = auth.currentUser?.uid;
      const quizPayload = {
        title,
        position,
        team: teamName,
        questions,
        updatedAt: new Date(),
      };

      if (quizId) {
        await updateDoc(doc(db, 'quizzes', quizId), quizPayload);
        Alert.alert('Success', 'Quiz updated!');
      } else {
        await addDoc(collection(db, 'quizzes'), {
          ...quizPayload,
          createdBy: currentUserId,
          createdAt: new Date(),
        });
        Alert.alert('Success', 'Quiz saved!');
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving quiz:', err);
      Alert.alert('Error saving quiz', err.message);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>{quizId ? 'Edit Quiz' : 'Create New Quiz'}</Text>

      <TextInput placeholder="Quiz Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Position (optional)" value={position} onChangeText={setPosition} style={styles.input} />

      <View style={styles.questionForm}>
          <Text style={styles.subheading}>{editingIndex !== null ? 'Edit Question' : 'Add a New Question'}</Text>
          <TextInput placeholder="Question" value={currentQuestion} onChangeText={setCurrentQuestion} style={styles.input} />
          {options.map((opt, i) => (
            <TextInput key={i} placeholder={`Option ${i + 1}`} value={opt} onChangeText={(text) => {
                const updated = [...options];
                updated[i] = text;
                setOptions(updated);
            }} style={styles.input} />
          ))}
          <TextInput placeholder="Correct Answer" value={correctAnswer} onChangeText={setCorrectAnswer} style={styles.input} />
          
          <Button title="Pick Photo/Video" onPress={handlePickMedia} />
          {mediaUri && (
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
          )}

          <View style={{marginTop: 10}}>
            <Button
                title={editingIndex !== null ? 'Update Question' : 'Add Question'}
                onPress={handleAddOrUpdateQuestion}
                disabled={isUploading}
            />
          </View>
      </View>
      
      {isUploading && <ActivityIndicator size="large" color="#0000ff" />}

      <View style={{ marginTop: 20 }}>
        <Text style={styles.subheading}>Preview Questions</Text>
        {questions.length === 0 ? (
          <Text>No questions added yet.</Text>
        ) : (
          questions.map((q, index) => (
            <View key={index} style={styles.previewCard}>
              <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
              {q.mediaUrl && (
                  <Image source={{ uri: q.mediaUrl }} style={styles.mediaPreview} />
              )}
              {q.options.map((opt, i) => (
                <Text key={i}>• {opt}</Text>
              ))}
              <Text style={{ fontWeight: 'bold' }}>✅ {q.correctAnswer}</Text>
              <View style={styles.previewButtons}>
                <Button title="Edit" onPress={() => handleEdit(index)} disabled={isUploading} />
                <Button title="Delete" color="red" onPress={() => handleDelete(index)} disabled={isUploading} />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ marginVertical: 20 }}>
        <Button title={quizId ? 'Update Quiz' : 'Save Quiz'} onPress={saveQuiz} disabled={isUploading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  questionForm: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  previewCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  mediaPreview: {
      width: '100%',
      height: 200,
      borderRadius: 6,
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: '#eee',
  }
});

export default CreateQuizScreen;
