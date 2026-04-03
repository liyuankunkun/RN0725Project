
import StorageUtil from '../util/StorageUtil';
import Key from '../res/styles/Key';
import CommonService from './CommonService';
import CryptoJS from "react-native-crypto-js";//加密、解密

export default class UserInfoDao {
    /**
     *  获取token
     */
    static getToken() {
        return StorageUtil.loadKeyId(Key.TOKEN);
    }
    /**
     *  
     */
    static loadToken() {
        return StorageUtil.loadKeyId(Key.TOKEN).then(result => {
            if (!result) {
                this.loadToken();
            } else {
                return result;
            }
        }).catch(error => {
            console.log(error);
        });
    }
    /** 
     *  获取登录用户信息
     */
    // static getUserInfoByStorage() {
    //     return StorageUtil.loadKeyId(Key.TOKEN).then(() => {
    //         return StorageUtil.loadKey(Key.UserInfo);
    //     }).catch(error => {
    //         return Promise.reject(error);
    //     })
    // }
    /** 
     *  获取用户信息
     */
    static getUserInfo() {
        return new Promise((resolve, reject) => {
            StorageUtil.loadKey(Key.UserInfo).then(result => {
                if (!result) {
                    CommonService.getUserInfo().then(response => {
                        if (response && response.success && response.data) {
                            resolve(response.data);
                        } else {
                            reject({ message: response.message || '获取用户信息失败' });
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    console.log('StorageUtil.loadKey 结果:', result);
                    let bytes = CryptoJS.AES.decrypt(result, Key.UserInfo);
                    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    resolve(decryptedData);
                }
            }).catch(error => {
                console.log('StorageUtil.loadKey 失败:', error);
                reject(error);
            })
        });
    }

    // /** 
    //  *  获取客户 设置信息
    //  */
    static getCustomerSetting() {
        return StorageUtil.loadKey(Key.CustomerInfoSetting);
    }

    

    // /** 
    //  *  获取客户信息
    //  */
    static getCustomerInfo(model) {
        return new Promise((resolve, reject) => {
            StorageUtil.loadKey(Key.CustomerInfo).then(result => {
                if (!result) {
                    CommonService.customerInfo(model).then(response => {
                        if (response && response.success && response.data) {
                           resolve(response.data);
                        } else {
                            reject({ message: response.message || '获取客户信息失败' });
                        }
                    }).catch(error => {
                        reject(error);
                    })
                } else {
                    // Decrypt 解密
                    let bytes = CryptoJS.AES.decrypt(result, Key.CustomerInfo);
                    let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    resolve(decryptedData);
                }
            }).catch(error => {
                reject(error);
            })
        })
    }

    /**
     *  移除客户信息(暂时这样)
     */
    // static removeAllInfo() {
    //     return new Promise(function (resolve, reject) {
    //         StorageUtil.removeKeyId(Key.TOKEN).then(() => {
    //             StorageUtil.removeKey(Key.UserInfo).then(() => {
    //                 StorageUtil.removeKey(Key.CustomerInfo).then(() => {
    //                     StorageUtil.removeKey(Key.CustomerInfoSetting).then(() => {
    //                         StorageUtil.clearMap();
    //                         resolve();
                            
    //                     }).catch(errorSetting => {
    //                         reject(errorSetting);
    //                     })
    //                 }).catch(errorCustomer => {
    //                     reject(errorCustomer);
    //                 })
    //             }).catch(errorUserInfo => {
    //                 reject(errorUserInfo);
    //             })
    //         }).catch(errorToken => {
    //             reject(errorToken);
    //         })
    //     })

    // }

    static removeAllInfo() {
        const tasks = [
            StorageUtil.removeKeyId(Key.TOKEN).catch(() => null),
            StorageUtil.removeKey(Key.UserInfo).catch(() => null),
            StorageUtil.removeKey(Key.CustomerInfo).catch(() => null),
            StorageUtil.removeKey(Key.CustomerInfoSetting).catch(() => null),
            StorageUtil.removeKey(Key.UserLogo).catch(() => null),
            StorageUtil.removeKey(Key.Publickeyid).catch(() => null),
        ];
        return Promise.all(tasks).then(() => {
            StorageUtil.clearMap();
        });
    }
}
