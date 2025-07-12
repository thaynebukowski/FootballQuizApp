import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation, useRoute } from '@react-navigation/native';

const PositionQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { position } = route.params;

  useEffect(() => {
    const fetchTeamAndQuizzes = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const teamName = userDoc.exists() ? userDoc.data().teamName : null;

        if (!teamName) {
          console.warn('Team not found for this player');
          return;
        }

        const q = query(
          collection(db, 'quizzes'),
          where('position', '==', position),
          where('team', '==', teamName)
        );

        const snapshot = await getDocs(q);
        const quizList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuizzes(quizList);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndQuizzes();
  }, [position]);

  const handleSelectQuiz = (quizId) => {
    navigation.navigate('QuizScreen', { quizId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{position} Quizzes</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.quizCard} 
              onPress={() => handleSelectQuiz(item.id)}
            >
              <Text style={styles.quizTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No quizzes available for {position} on your team.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  quizCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  quizTitle: { fontSize: 18 },
});

export default PositionQuizList;
