const path = require('path');
const fs = require('fs');

const i18nGradlePath = path.resolve(__dirname, '../node_modules/react-native-i18n/android/build.gradle');

if (fs.existsSync(i18nGradlePath)) {
  let content = fs.readFileSync(i18nGradlePath, 'utf8');
  if (content.includes('compile "com.facebook.react:react-native:+"')) {
    content = content.replace('compile "com.facebook.react:react-native:+"', 'implementation "com.facebook.react:react-native:+"');
    fs.writeFileSync(i18nGradlePath, content);
    console.log('Fixed react-native-i18n build.gradle');
  }
}
