import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CoachHome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Dashboard</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateQuiz')}
      >
        <Text style={styles.buttonText}>Create New Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CoachQuizList')}
      >
        <Text style={styles.buttonText}>View / Edit Quizzes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CoachResults')}
      >
        <Text style={styles.buttonText}>View Results</Text>
      </TouchableOpacity>
    </View>
  );
};

const WVU_COLORS = {
  navy: '#002855',
  gold: '#EAAA00',
  gray: '#A2AAAD',
  white: '#FFFFFF',
  black: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WVU_COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    color: WVU_COLORS.gold,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: WVU_COLORS.gold,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: WVU_COLORS.navy,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoachHome;
