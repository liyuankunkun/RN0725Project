import LoginScreen from './LoginScreen';
import ForgetPwdScreen1 from './ForgetPwdScreen1';
import ForgetPwdScreen2 from './ForgetPwdScreen2';
import RegisterScreen from './RegisterScreen';
import WebViewScreen from '../common/WebViewScreen';
import SSOScreen from './SSOScreen'
import WebHtmlScreen from './WebHtmlScreen';
const LogConfig = {
  login: {
    screen: LoginScreen,
  },
  Init: {
    screen: LoginScreen,
  },
  Forget1: {
    screen: ForgetPwdScreen1,
  },
  Forget2: {
    screen: ForgetPwdScreen2
  },
  Register: {
    screen: RegisterScreen
  },
  WebView: {
    screen: WebViewScreen
  },
  SSOScreen: {
    screen: SSOScreen
  },
  WebHtmlScreen: {
    screen: WebHtmlScreen
}
};

for (const key in LogConfig) {
  if (LogConfig.hasOwnProperty(key)) {
    const element = LogConfig[key];
    element.navigationOptions = {
      header: null
    }
  }
}

export default LogConfig;
