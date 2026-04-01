import {
    Dimensions,
    NativeModules
} from 'react-native';
require('../util/DateUtil');
import * as WeChat from 'react-native-wechat-lib';
/**
 *  注册微信
 */
global.wechat = WeChat;
WeChat.registerApp('wx6232a1398943cae5', 'https://uat.app.fcmonline.com.cn:4438/').catch(() => {});
/** 
 *  原生调用
 */
global.RctBridage = NativeModules.RctBridage;

/**
 *  友盟调用
 */
global.UMNative = NativeModules.UMNative || {};

/**
 * 屏幕的高度
 */
global.screenHeight = Dimensions.get('screen').height;
/**
 * 屏幕的宽度
 */
global.screenWidth = Dimensions.get('screen').width;

/**
 * 版本记录
 */
global.appVersion = '2.4.3';
/**
 * 发版记录升级提示
 */
global.appBuildVersion = 243;

/**
 *  当前语言(默认是zh)
 */
global.appBuildLanguage = 'zh';


/**
 *  ios 下载地址
 */

global.itunceConnectUrl = 'https://itunes.apple.com/cn/app/id1568256803?mt=8';

/**
 *  android 下载地址
 */
global.tencentUrl = 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.com.fcmonline.app'

/**
 * BaseUrl
 */

// global.baseUrl = 'https://uat.app.fcmonline.com.cn:8808/';//FCM测试
// global.baseUrl = 'https://uat.app.fcmonline.com.cn:4438';//FCM测试uat
// global.baseH5Url = 'https://uat.app.fcmonline.com.cn:4436';

global.baseUrl = 'https://app.fcmonline.com.cn';//正式
global.baseH5Url = 'https://m.app.fcmonline.com.cn:443';//正式
