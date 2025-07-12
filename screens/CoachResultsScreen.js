import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';

const CoachResultsScreen = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizTitles, setQuizTitles] = useState([]);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchTeamAndResults();
  }, []);

  const fetchTeamAndResults = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) throw new Error("User doc not found");

      const teamName = userDoc.data().teamName;

      const q = query(
        collection(db, 'quizResults'),
        where('team', '==', teamName),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const titles = [...new Set(data.map((item) => item.quizTitle || ''))];

      setResults(data);
      setQuizTitles(titles);
      setFilteredResults(data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      Alert.alert('Error', 'Failed to fetch results. Make sure team is set and Firestore index is created.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFilter = (title) => {
    setSelectedQuizTitle(title);
    if (title === '') {
      setFilteredResults(results);
    } else {
      const filtered = results.filter((r) => r.quizTitle === title);
      setFilteredResults(filtered);
    }
  };

  const exportToCSV = async () => {
    if (filteredResults.length === 0) {
      Alert.alert('No results to export.');
      return;
    }

    const header = ['Quiz Title', 'Username', 'Score', 'Total', 'Date'];
    const rows = filteredResults.map((item) => [
      item.quizTitle,
      item.username,
      item.score,
      item.total,
      item.submittedAt?.toDate?.().toLocaleString() || 'Unknown',
    ]);

    const csvString = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const fileUri = FileSystem.documentDirectory + 'quiz_results.csv';
    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    Sharing.shareAsync(fileUri).catch((err) =>
      Alert.alert('Error sharing file', err.message)
    );
  };

  const renderItem = ({ item }) => {
    const date =
      item.submittedAt && typeof item.submittedAt.toDate === 'function'
        ? item.submittedAt.toDate().toLocaleString()
        : 'Unknown';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('QuizResultDetail', { result: item })}
      >
        <Text style={styles.title}>{item.quizTitle}</Text>
        <Text>Player: {item.username}</Text>
        <Text>Score: {item.score} / {item.total}</Text>
        <Text>Date: {date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quiz Results</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.filterLabel}>Filter by Quiz Title:</Text>
          <Picker
            selectedValue={selectedQuizTitle}
            onValueChange={(value) => handleQuizFilter(value)}
            style={styles.dropdown}
          >
            <Picker.Item label="All Quizzes" value="" key="all" />
            {quizTitles.map((title, index) => (
              <Picker.Item key={title || index} label={title || 'Untitled'} value={title} />
            ))}
          </Picker>

          <Button title="Export CSV" onPress={exportToCSV} />

          {filteredResults.length === 0 ? (
            <Text>No results found.</Text>
          ) : (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      )}
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
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdown: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});

export default CoachResultsScreen;
