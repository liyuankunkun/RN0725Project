import React from 'react';
import {
    DeviceEventEmitter,
    NativeModules
} from 'react-native';
const timeout = 60 * 1000;

// import UserInfoDao from '../service/UserInfoDao';
// 延迟加载UserInfoDao，避免循环依赖
let UserInfoDao;
const getUserInfoDao = () => {
    if (!UserInfoDao) {
        UserInfoDao = require('../service/UserInfoDao').default;
    }
    return UserInfoDao;
};
import Key from '../res/styles/Key';
import CommonEnum from '../enum/CommonEnum';
import RNFetchBlob from 'rn-fetch-blob';
import CryptoJS from "react-native-crypto-js";//加密、解密
export default class FetchHelper extends React.Component {   

    /**
     * 
     * @param 地址 url 
     * @param 参数 params 
     * @param 请求头 headers 
     */
    static get(url, params, headers) {
        return getUserInfoDao().loadToken().then(token => {
            params = params || {};
            headers = headers || {};
            Object.assign(headers, {
                'Content-Type': 'application/json;charset=utf-8',
            });
            if (token) {
                let bytes  = CryptoJS.AES.decrypt(token, Key.TOKEN);
                let decoded_token = bytes.toString(CryptoJS.enc.Utf8);
                params.token = decoded_token;
            }
            params.language = global.appBuildLanguage === CommonEnum.languageType.zh ? 'zh-CN' : (global.appBuildLanguage === CommonEnum.languageType.en ? 'en-US' : '');
            let paramsArray = [];
            Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]));
            if (url.search(/\?/) === -1) {
                url += '?' + paramsArray.join('&')
            } else {
                url += '&' + paramsArray.join('&')
            }
            return new Promise((resolve, reject) => {
                var fetchPromise = fetch(url, {
                    method: 'GET',
                    headers: headers
                });
                const timeoutPromise = new Promise(function (resolve, reject) {
                    setTimeout(() => {
                        reject({ message: '网络超时，请检查您的网络' })
                    }, timeout)
                });
                Promise.race([fetchPromise, timeoutPromise]).then(response => {
                    clearCache()
                    if (response.ok) {
                        return response.text();
                    } else {
                        reject(JSON.stringify(response));
                    }
                }).then(res => {
                    clearCache()
                    resolve(res);
                }).catch(err => {
                    reject(err);
                    clearCache()
                })
            })
        })
    }

    static async post(url, params, headers) {
        clearCache();
        // const token = await UserInfoDao.loadToken();
        const token = await getUserInfoDao().loadToken();
        headers = headers || {};
        Object.assign(headers, {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json',
            'appVersion': appVersion, //加版本号
        });
        if (token) {
            let bytes = CryptoJS.AES.decrypt(token, Key.TOKEN);
            let decoded_token = bytes.toString(CryptoJS.enc.Utf8);
            // console.log('token---',decoded_token);
            if (url.search(/\?/) === -1) {
                url += '?token=' + decoded_token;
            } else {
                url += '&token=' + decoded_token;
            }
            url += global.appBuildLanguage === CommonEnum.languageType.zh ? '&language=zh-cn' : (global.appBuildLanguage === CommonEnum.languageType.en ? '&language=en-us' : '');
        } else {

            if (url.search(/\?/) === -1) {
                url += global.appBuildLanguage === CommonEnum.languageType.zh ? '?language=zh-cn' : (global.appBuildLanguage === CommonEnum.languageType.en ? '?language=en-us' : '');
            } else {
                url += global.appBuildLanguage === CommonEnum.languageType.zh ? '&language=zh-cn' : (global.appBuildLanguage === CommonEnum.languageType.en ? '&language=en-us' : '');
            }
        }
        return await new Promise((resolve, reject) => {
            var fetchPromise = fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(params),
                cache: 'no-store'
            });
            const timeoutPromise = new Promise(function (resolve_1, reject_1) {
                setTimeout(() => {
                    reject_1({ message: '网络超时，请检查您的网络' });
                }, timeout);
            });
            Promise.race([fetchPromise, timeoutPromise]).then((response) => {
                clearCache();
                if (response.ok) {
                    resolve(response.json());
                } else {
                    //判断一下token失效情况,403直接退出道登录页面
                    if (response.status === 403) {
                        // alert(response.status);
                        DeviceEventEmitter.emit(Key.ErrorFailuer, null);
                    } else {
                        reject(response);
                    }
                }

            }).catch((err) => {
                clearCache();
                console.log(err);
                reject(err);
            });

        });
    }
    static upload(url, params, headers) {
        return getUserInfoDao().loadToken().then(token => {
            if (token) {
                let bytes  = CryptoJS.AES.decrypt(token, Key.TOKEN);
                let decoded_token = bytes.toString(CryptoJS.enc.Utf8);
                if (url.search(/\?/) === -1) {
                    url += '?token=' + decoded_token
                } else {
                    url += '&token=' + decoded_token
                }
            }
            headers = headers || {
                'Content-Type': 'multipart/form-data;charset=utf-8', 
                Authorization: "Bearer access-token",
                otherHeader: "foo"
            };
            // headers = JSON.stringify(headers);
            return new Promise((resolve, reject) => {
                var fetchPromise = RNFetchBlob.fetch('POST', url, headers, params);
                var timeoutPromise = new Promise(function (resolve, reject) {
                    setTimeout(() => {
                        resolve({ message: '网络超时，请检查您的网络' })
                    }, timeout)
                });
                Promise.race([fetchPromise, timeoutPromise]).then((response) => {
                    clearCache()
                    if (response) {
                        resolve(response.json());
                    } else {
                        resolve({ message: '发生异常' })
                    }
                }).catch((err) => {
                    clearCache()
                    console.log(err);
                    reject(err);
                })

            });

        }).catch(error => {
            clearCache()
            console.log(err);
            reject(err);
        })
    }
}


function clearCache(){
     if(NativeModules.RctBridage && NativeModules.RctBridage.clearCache){
        NativeModules.RctBridage.clearCache();
     }
}