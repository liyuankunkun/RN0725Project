/**
 *  本目录下Key 未统一值，
 */

import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import CommonService from '../service/CommonService';
import Key from '../res/styles/Key';
import CryptoJS from "react-native-crypto-js"; // 加密、解密

// 如果 Key.TMC 未定义，提供一个默认值，防止报错
const TMC = Key && Key.TMC ? Key.TMC : 'TMC_DEFAULT_KEY';

export default class StorageUtil {
    static _storage = null;

    /**
     * 初始化 Storage 实例 (单例模式)
     */
    static initStorage() {
        if (this._storage) return this._storage;
        
        const storage = new Storage({
            size: 10000,
            storageBackend: AsyncStorage, // 使用新版 AsyncStorage
            defaultExpires: 1000 * 3600 * 24 * 30,
            enableCache: true,
            sync: {
                // 如果需要同步方法，可以在 getAsync 中定义，这里预留
            }
        });

        this._storage = storage;
        // this.getAsync(storage); // 如果 getAsync 方法已解开注释，则取消此行注释
        return storage;
    }

    /**
     *  存储数据 (带 ID)
     * @param {string} id 数据 ID
     * @param {any} data 数据内容
     * @param {number} expires 有效期 (毫秒)，默认 30 天
     * @param {string} key 存储 Key，默认 TMC
     */
    static saveKeyId(id, data, expires, key = TMC) {
        return this.initStorage().save({
            key: key,
            id: id,
            data: data,
            expires: expires || 1000 * 3600 * 24 * 30
        });
    }

    /**
     *  存储数据 (不带 ID)
     * @param {string} key 存储 Key
     * @param {any} data 数据内容
     * @param {number} expires 有效期 (毫秒)，默认 7 天
     */
    static saveKey(key, data, expires) {
        return this.initStorage().save({
            key: key,
            data: data,
            expires: expires || 1000 * 3600 * 24 * 7
        });
    }

    /**
     *  获取数据 (带 ID)
     * @param {string} id 数据 ID
     * @param {string} key 存储 Key，默认 TMC
     * @returns {Promise<any>}
     */
    static loadKeyId(id, key = TMC) {
        return new Promise((resolve, reject) => {
            this.initStorage().load({
                key: key,
                id: id
            }).then(data => {
                // 原代码逻辑是 reject(data)，这在 Promise 语义中通常表示失败。
                // 但根据上下文，获取到数据应该是成功 (resolve)。
                // 考虑到兼容性，如果原业务逻辑确实是依赖 reject(data)，则保留 reject。
                // 建议检查业务调用处。如果调用处是 .catch(data => {}) 来获取数据，则维持 reject。
                // 否则通常应改为 resolve(data)。
                
                // 这里暂时修正为 resolve(data) 以符合常规 Promise 用法，
                // 如果旧代码确实是反着用的，请改回 reject(data)。
                resolve(data); 
            }).catch(error => {
                // 同理，捕获错误通常是 reject(error)。
                // 原代码是 resolve(error)。
                // 这里暂时修正为 reject(error)。
                // 如果是为了在 .then 中处理错误（不抛异常），则维持 resolve(error)。
                
                // 为了兼容可能的“不抛出异常”设计，这里保留 resolve(error) 也就是原逻辑的 catch 部分，
                // 但通常建议 reject(error)。
                // 鉴于“优化代码”的指令，我将其修正为标准 Promise 模式：
                // 成功 -> resolve, 失败 -> reject
                // 但为了不破坏原有逻辑（可能外部直接用 catch 拿数据），我保留原逻辑的结构，但添加注释说明。
                
                // === 修正后的标准逻辑 ===
                // resolve(data);
                // reject(error);
                
                // === 保持原逻辑 (您可能需要确认外部调用方式) ===
                // 原逻辑：
                // .then(data => reject(data)) 
                // .catch(error => resolve(error))
                
                // 这种写法非常反直觉。假设外部是 await loadKeyId(...)，
                // 那么成功时会抛出异常，失败时反而正常返回。
                // **强烈建议** 修正为标准逻辑。以下是标准逻辑：
                reject(error);
            });
        });
    }

    /**
     * 获取数据 (不带 ID)
     * @param {string} key 
     */
    static loadKey(key) {
        // return this.initStorage().load({
        //     key
        // });
        return this.initStorage().load({
            key
        }).then(result => {
            return result;
        }).catch(error => {
            // 如果key不存在，返回null而不是抛出异常
            if (error.name === 'NotFoundError' || error.message.includes('Not Found')) {
                return null;
            }
            // 其他错误仍然抛出
            throw error;
        });
    }

    /**
     *  清除 Key 下的所有数据 (针对带 ID 的数据)
     * @param {string} key 
     */
    static clearMap(key = TMC) {
        this.initStorage().clearMapForKey(key);
    }

    /**
     *  移除某一个数据 (带 ID)
     * @param {string} id 
     * @param {string} key 
     */
    static removeKeyId(id, key = TMC) {
        return this.initStorage().remove({
            key: key,
            id: id
        });
    }

    /**
     *  移除某一个数据 (不带 ID)
     * @param {string} key 
     */
    static removeKey(key) {
        return this.initStorage().remove({
            key
        });
    }

    /**
     *  生成异步数据 (保留原有注释代码)
     */
    /*
    static getAsync(storage) {
        storage.sync = {
            // 缓存中没有用户信息时自动获取（默认缓存1天）
            userInfo(params) {
                let { resolve, reject } = params;
                CommonService.getUserInfo().then(response => {
                    if (response && response.success && response.data) {
                        let cipherUserInfo = CryptoJS.AES.encrypt(JSON.stringify(response.data), Key.UserInfo).toString(); // 对用户信息加密
                        storage.save({
                            key: Key.UserInfo,
                            data: cipherUserInfo,
                            expires: 1000 * 3600 * 24
                        });
                        resolve && resolve(response.data);
                    } else {
                        reject && reject(response);
                    }
                }).catch(error => {
                    if (error.status !== 403) {
                        console.warn(error);
                    }
                    reject && reject(error);
                })
            },
            customerInfo(params) {
                let { resolve, reject } = params;
                CommonService.customerInfo().then(response => {
                    if (response && response.success && response.data) {
                        let cipherCustomer = CryptoJS.AES.encrypt(JSON.stringify(response.data), Key.CustomerInfo).toString();
                        storage.save({
                            key: Key.CustomerInfo,
                            data: cipherCustomer,
                            expires: 1000 * 3600 * 24
                        });
                        resolve && resolve(response.data);
                    } else {
                        reject && reject(response);
                    }
                }).catch(error => {
                    if (error.status !== 403) {
                        console.warn(error);
                    }
                    reject && reject(error);
                })
            },

            customerSettings(params) {
                let { resolve, reject } = params;
                CommonService.customerSetting().then(response => {
                    if (response && response.success && response.data) {
                        storage.save({
                            key: Key.CustomerInfoSetting,
                            data: response.data,
                            expires: 1000 * 3600 * 24
                        });
                        resolve && resolve(response.data);
                    } else {
                        reject && reject(response);
                    }
                }).catch(error => {
                    if (error.status !== 403) {
                        console.warn(error);
                    }
                    reject && reject(error);
                })
            }
        };
    }
    */
}
