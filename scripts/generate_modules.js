const fs = require('fs');
const path = require('path');

const modules = [
  'Personal',
  'Common',
  'Flight',
  'Invoice',
  'Application',
  'Approval',
  'Train',
  'IntlFlight',
  'Hotel',
  'IntlHotel',
  'Mice',
  'Car',
  'Report',
  'Accounts',
  'Reimbursement',
  'Comprehensive'
];

const pageDir = path.join(__dirname, '../js/page');

if (!fs.existsSync(pageDir)) {
  console.error('js/page directory not found');
  process.exit(1);
}

const screenTemplate = (name) => `import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import NavigationUtils from '../../navigator/NavigationUtils';

const ${name}Screen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>${name} Screen</Text>
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

export default ${name}Screen;
`;

const configTemplate = (name) => `import ${name}Screen from './${name}Screen';

const ${name}Config = {
  ${name}: {
    screen: ${name}Screen,
    navigationOptions: {
      header: null, // Customize header if needed
      title: '${name}'
    }
  }
};

export default ${name}Config;
`;

modules.forEach(moduleName => {
  const dirName = moduleName.toLowerCase();
  const dirPath = path.join(pageDir, dirName);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log(`Created directory: ${dirPath}`);
  }

  const screenFile = path.join(dirPath, `${moduleName}Screen.js`);
  if (!fs.existsSync(screenFile)) {
    fs.writeFileSync(screenFile, screenTemplate(moduleName));
    console.log(`Created screen: ${screenFile}`);
  }

  const configFile = path.join(dirPath, `${moduleName}Config.js`);
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, configTemplate(moduleName));
    console.log(`Created config: ${configFile}`);
  }
});
