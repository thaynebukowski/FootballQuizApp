import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const positions = ["QB", "RB", "WR", "TE", "OL", "CB", "SAF", "LB", "Ni/S", "DL", "SPEC"];

const PlayerHome = () => {
  const navigation = useNavigation();

  const handleSelectPosition = (position) => {
    navigation.navigate('PositionQuizList', { position });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={WVU.navy} />
      <Text style={styles.header}>Choose a Position</Text>
      <FlatList
        data={positions}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.positionCard}
            onPress={() => handleSelectPosition(item)}
          >
            <Text style={styles.positionText}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const WVU = {
  navy: '#002855',
  gold: '#EAAA00',
  gray: '#A2AAAD',
  white: '#FFFFFF',
  black: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WVU.white,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: WVU.navy,
    marginBottom: 20,
    textAlign: 'center',
  },
  positionCard: {
    backgroundColor: WVU.gold,
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: WVU.navy,
  },
  positionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WVU.navy,
  },
});

export default PlayerHome;
