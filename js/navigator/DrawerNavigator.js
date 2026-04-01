import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../page/home/HomeScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // 使用 HomeScreen 内部的 NavigationBar
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
