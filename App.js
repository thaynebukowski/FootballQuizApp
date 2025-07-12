import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CoachHome from './screens/CoachHome';
import PlayerHome from './screens/PlayerHome';
import PositionQuizList from './screens/PositionQuizList';
import QuizScreen from './screens/QuizScreen';
import CreateQuizScreen from './screens/CreateQuizScreen';
import CoachQuizList from './screens/CoachQuizList';
import CoachResultsScreen from './screens/CoachResultsScreen';
import QuizResultDetailScreen from './screens/QuizResultDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="CoachHome" component={CoachHome} />
        <Stack.Screen name="PlayerHome" component={PlayerHome} />
        <Stack.Screen name="PositionQuizList" component={PositionQuizList} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
        <Stack.Screen name="CoachQuizList" component={CoachQuizList} />
        <Stack.Screen name="CoachResults" component={CoachResultsScreen} />
        <Stack.Screen name="QuizResultDetail" component={QuizResultDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
