import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import NavigationUtils from '../../navigator/NavigationUtils';

const ApplicationScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Application Screen</Text>
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

export default ApplicationScreen;
