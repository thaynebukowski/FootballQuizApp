import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { auth, db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('Error', 'No user found with that username');
        return;
      }

      const userData = snapshot.docs[0].data();
      const email = userData.email;

      await signInWithEmailAndPassword(auth, email, password);

      if (userData.role === 'coach') {
        navigation.replace('CoachHome');
      } else {
        navigation.replace('PlayerHome');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football IQ</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: WVU_COLORS.gold,
    marginBottom: 40,
    fontFamily: 'serif',
  },
  input: {
    width: '100%',
    backgroundColor: WVU_COLORS.white,
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: WVU_COLORS.black,
  },
  button: {
    backgroundColor: WVU_COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: WVU_COLORS.navy,
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: WVU_COLORS.gray,
    marginTop: 20,
    fontSize: 14,
  },
});

export default LoginScreen;
