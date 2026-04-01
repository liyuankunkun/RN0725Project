/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler'; // 必须在最顶部导入
import React from 'react';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import AppNavigator from './js/navigator/AppNavigator';
import store from './js/redux/store';

// 忽略特定的警告信息
LogBox.ignoreLogs([
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillReceiveProps has been renamed'
]);

const App = () => {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;