import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const QuizScreen = ({ route, navigation }) => {
  const { quizId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setQuiz({ id: docSnap.id, ...data });
          setSelectedAnswers(new Array(data.questions.length).fill(null));
        } else {
          alert('Quiz not found');
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        alert('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSelect = (qIndex, option) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[qIndex] = option;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    const calculatedScore = selectedAnswers.reduce((acc, answer, index) => {
      return answer === quiz.questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);

    const answers = quiz.questions.map((q, i) => ({
      question: q.question,
      selected: selectedAnswers[i],
      correct: q.correctAnswer,
      isCorrect: selectedAnswers[i] === q.correctAnswer,
    }));

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        alert('User profile not found.');
        return;
      }

      const userData = userDoc.data();
      const username = userData.username || 'Unknown';
      const teamName = userData.teamName || 'Unknown';

      await addDoc(collection(db, 'quizResults'), {
        quizId: quiz.id,
        quizTitle: quiz.title,
        playerId: userId,
        username,
        team: teamName, // ✅ Ensure team is saved
        score: calculatedScore,
        total: quiz.questions.length,
        answers,
        submittedAt: Timestamp.now(),
      });

      setScore(calculatedScore);
      setShowResults(true);
    } catch (err) {
      console.error('Error saving result:', err);
      alert('Failed to save result.');
    }
  };

  if (loading || !quiz) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Quiz...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{quiz.title}</Text>
      {quiz.questions.map((q, index) => (
        <View key={index} style={styles.questionBlock}>
          <Text style={styles.questionText}>
            {index + 1}. {q.question}
          </Text>
          {q.options.map((option, oIndex) => {
            const isSelected = selectedAnswers[index] === option;
            const isCorrect = showResults && option === q.correctAnswer;
            const isIncorrect =
              showResults && isSelected && option !== q.correctAnswer;

            return (
              <TouchableOpacity
                key={oIndex}
                style={[
                  styles.option,
                  isSelected && styles.selectedOption,
                  isCorrect && styles.correctOption,
                  isIncorrect && styles.incorrectOption,
                ]}
                onPress={() => handleSelect(index, option)}
                disabled={showResults}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!showResults ? (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Quiz</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultText}>
            You scored {score} / {quiz.questions.length}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.returnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionBlock: { marginBottom: 20 },
  questionText: { fontSize: 18, marginBottom: 10 },
  option: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  selectedOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  correctOption: {
    backgroundColor: '#bbf7d0',
    borderColor: '#22c55e',
  },
  incorrectOption: {
    backgroundColor: '#fecaca',
    borderColor: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16 },
  resultsContainer: { alignItems: 'center', marginTop: 20 },
  resultText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  returnText: { color: '#2563eb', fontSize: 16 },
});

export default QuizScreen;
