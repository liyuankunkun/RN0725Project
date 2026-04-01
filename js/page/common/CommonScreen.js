import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import NavigationUtils from '../../navigator/NavigationUtils';

const CommonScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Common Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default CommonScreen;
