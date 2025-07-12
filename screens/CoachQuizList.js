import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';

const CoachQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [teamName, setTeamName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTeamAndQuizzes = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const team = userDoc.exists() ? userDoc.data().teamName : null;
        setTeamName(team);

        if (!team) {
          Alert.alert('Error', 'Team not found for this user');
          return;
        }

        const snapshot = await getDocs(collection(db, 'quizzes'));
        const allQuizzes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const teamQuizzes = allQuizzes.filter((quiz) => quiz.team === team);
        setQuizzes(teamQuizzes);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch quizzes');
        console.error(err);
      }
    };

    fetchTeamAndQuizzes();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this quiz?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'quizzes', id));
            setQuizzes(prev => prev.filter(q => q.id !== id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete quiz');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.quizItem}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('CreateQuiz', {
            quizId: item.id,
            quizData: item,
          })
        }
      >
        <Text style={styles.quizTitle}>{item.title}</Text>
        {item.position ? <Text>Position: {item.position}</Text> : null}
        <Text>Questions: {item.questions?.length || 0}</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 10 }}>
        <Button
          title="Delete"
          color="red"
          onPress={() => handleDelete(item.id)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Quizzes</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No quizzes found for your team.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quizItem: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoachQuizList;
