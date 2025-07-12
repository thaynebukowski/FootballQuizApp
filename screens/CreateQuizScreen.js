import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
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

const CreateQuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId, quizData } = route.params || {};

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (quizData) {
      setTitle(quizData.title || '');
      setPosition(quizData.position || '');
      setQuestions(quizData.questions || []);
    }

    const fetchTeam = async () => {
      try {
        const currentUserId = auth.currentUser?.uid;
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

  const handleAddOrUpdateQuestion = () => {
    if (!currentQuestion.trim() || options.some((o) => !o.trim()) || !correctAnswer.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const questionObject = {
      question: currentQuestion.trim(),
      options: options.map((o) => o.trim()),
      correctAnswer: correctAnswer.trim(),
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
  };

  const handleEdit = (index) => {
    const q = questions[index];
    setCurrentQuestion(q.question);
    setOptions(q.options);
    setCorrectAnswer(q.correctAnswer);
    setEditingIndex(index);
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
      Alert.alert('Error', 'Team not found. Please ensure the user is signed in properly.');
      return;
    }

    try {
      const currentUserId = auth.currentUser?.uid;

      if (quizId) {
        await updateDoc(doc(db, 'quizzes', quizId), {
          title,
          position,
          questions,
          team: teamName,
          updatedAt: new Date(),
        });
        Alert.alert('Success', 'Quiz updated!');
      } else {
        await addDoc(collection(db, 'quizzes'), {
          title,
          position,
          createdBy: currentUserId,
          team: teamName,
          questions,
          createdAt: new Date(),
        });
        Alert.alert('Success', 'Quiz saved!');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Error saving quiz:', err);
      Alert.alert('Error saving quiz', err.message);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={styles.title}>{quizId ? 'Edit Quiz' : 'Create New Quiz'}</Text>

      <TextInput
        placeholder="Quiz Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Position (optional)"
        value={position}
        onChangeText={setPosition}
        style={styles.input}
      />

      <TextInput
        placeholder="Question"
        value={currentQuestion}
        onChangeText={setCurrentQuestion}
        style={styles.input}
      />

      {options.map((opt, i) => (
        <TextInput
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChangeText={(text) => {
            const updated = [...options];
            updated[i] = text;
            setOptions(updated);
          }}
          style={styles.input}
        />
      ))}

      <TextInput
        placeholder="Correct Answer"
        value={correctAnswer}
        onChangeText={setCorrectAnswer}
        style={styles.input}
      />

      <Button
        title={editingIndex !== null ? 'Update Question' : 'Add Question'}
        onPress={handleAddOrUpdateQuestion}
      />

      <View style={{ marginTop: 20 }}>
        <Text style={styles.subheading}>Preview Questions</Text>
        {questions.length === 0 ? (
          <Text>No questions added yet.</Text>
        ) : (
          questions.map((q, index) => (
            <View key={index} style={styles.previewCard}>
              <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
              {q.options.map((opt, i) => (
                <Text key={i}>• {opt}</Text>
              ))}
              <Text style={{ fontWeight: 'bold' }}>✅ {q.correctAnswer}</Text>
              <View style={styles.previewButtons}>
                <Button title="Edit" onPress={() => handleEdit(index)} />
                <Button title="Delete" color="red" onPress={() => handleDelete(index)} />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ marginVertical: 20 }}>
        <Button title={quizId ? 'Update Quiz' : 'Save Quiz'} onPress={saveQuiz} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  previewCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default CreateQuizScreen;
