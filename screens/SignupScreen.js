import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('player');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');

  const handleSignup = async () => {
    if (!email || !username || !password || !teamName || !teamPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Validate team
      const teamDocRef = doc(db, 'teams', teamName);
      const teamSnap = await getDoc(teamDocRef);

      if (!teamSnap.exists()) {
        Alert.alert('Team Not Found', 'No team found with that name');
        return;
      }

      const teamData = teamSnap.data();
      if (teamData.password !== teamPassword) {
        Alert.alert('Incorrect Password', 'Team password is incorrect');
        return;
      }

      // Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Save user details in Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email,
        username,
        role,
        teamName,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Account created');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Signup Error:', err.message);
      Alert.alert('Signup Failed', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Role</Text>
      <Picker
        selectedValue={role}
        onValueChange={(value) => setRole(value)}
        style={styles.picker}
      >
        <Picker.Item label="Player" value="player" />
        <Picker.Item label="Coach" value="coach" />
      </Picker>

      <TextInput
        placeholder="Team Name"
        style={styles.input}
        value={teamName}
        onChangeText={setTeamName}
      />

      <TextInput
        placeholder="Team Password"
        style={styles.input}
        value={teamPassword}
        onChangeText={setTeamPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleSignup} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
});

export default SignupScreen;
