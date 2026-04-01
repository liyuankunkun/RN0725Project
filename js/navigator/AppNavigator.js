import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LogConfig from '../page/login/LoginConfig';
import HomeScreen from '../page/home/HomeScreen';

// 引入新创建的 Config 文件
import PersonalConfig from '../page/personal/PersonalConfig';
import CommonConfig from '../page/common/CommonConfig';
import FlightConfig from '../page/flight/FlightConfig';
import InvoiceConfig from '../page/invoice/InvoiceConfig';
import ApplicationConfig from '../page/application/ApplicationConfig';
import ApprovalConfig from '../page/approval/ApprovalConfig';
import TrainConfig from '../page/train/TrainConfig';
import IntlFlightConfig from '../page/intlFlight/IntlFlightConfig';
import HotelConfig from '../page/hotel/HotelConfig';
import IntlHotelConfig from '../page/inflHotel/IntlHotelConfig';
import MiceConfig from '../page/mice/MiceConfig';
import CarConfig from '../page/car/CarConfig';
import ReportConfig from '../page/report/ReportConfig';
import AccountsConfig from '../page/accounts/AccountsConfig';
import ReimbursementConfig from '../page/reimbursement/ReimbursementConfig';
import ComprehensiveConfig from '../page/ComprehensiveOrder/ComprehensiveConfig';

const Stack = createStackNavigator();
require('../common/GlobalConfig');

// 合并所有配置
const AllConfigs = {
  ...LogConfig,
  ...PersonalConfig,
  ...CommonConfig,
  ...FlightConfig,
  ...InvoiceConfig,
  ...ApplicationConfig,
  ...ApprovalConfig,
  ...TrainConfig,
  ...IntlFlightConfig,
  ...HotelConfig,
  ...IntlHotelConfig,
  ...MiceConfig,
  ...CarConfig,
  ...ReportConfig,
  ...AccountsConfig,
  ...ReimbursementConfig,
  ...ComprehensiveConfig,
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        {Object.entries(AllConfigs).map(([name, { screen }]) => (
          <Stack.Screen 
            key={name} 
            name={name} 
            component={screen} 
            options={{ headerShown: false }} 
          />
        ))}
        <Stack.Screen 
          name="Main" 
          component={HomeScreen} 
          options={{ title: '首页', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
