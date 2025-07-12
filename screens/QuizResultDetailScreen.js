import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const QuizResultDetailScreen = ({ route }) => {
  const { result } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{result.quizTitle}</Text>
      <Text style={styles.subtitle}>Player: {result.username}</Text>
      <Text style={styles.subtitle}>Score: {result.score} / {result.total}</Text>

      {result.answers?.map((ans, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.question}>{index + 1}. {ans.question}</Text>
          <Text style={styles.label}>
            Selected: <Text style={styles.value}>{ans.selected}</Text>
          </Text>
          <Text style={styles.label}>
            Correct: <Text style={styles.value}>{ans.correct}</Text>
          </Text>
          <Text
            style={[
              styles.resultIndicator,
              { color: ans.isCorrect ? WVU.green : WVU.red },
            ]}
          >
            {ans.isCorrect ? '✔️ Correct' : '❌ Incorrect'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const WVU = {
  navy: '#002855',
  gold: '#EAAA00',
  gray: '#A2AAAD',
  white: '#FFFFFF',
  black: '#000000',
  green: '#22c55e',
  red: '#ef4444',
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: WVU.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: WVU.navy,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: WVU.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  card: {
    marginTop: 15,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderColor: WVU.gray,
    borderWidth: 1,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    color: WVU.navy,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: WVU.black,
    marginBottom: 2,
  },
  value: {
    fontWeight: '600',
  },
  resultIndicator: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizResultDetailScreen;
