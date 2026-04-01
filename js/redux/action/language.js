import StorageUtil from "../../util/StorageUtil"
import Key from "../../res/styles/Key"
import Types from './types';
import I18n from '../../common/I18n';
import CryptoJS from "react-native-crypto-js";//加密、解密
export function languageLoad(languages,callBack) {
    return dispatch => {
        StorageUtil.loadKey(Key.CurrentLanguage).then(response => {
            // Decrypt 解密
            let bytes = CryptoJS.AES.decrypt(response, 'secret key language');
            let decryptedLanguage = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if (response) {
                I18n.locale = decryptedLanguage.value;
                global.appBuildLanguage = decryptedLanguage.value;
                dispatch({ type: Types.LANGUAGE_LOAD, language: decryptedLanguage })
            }else {
                languageChange(languages,callBack);
            }
            callBack();
        }).catch(error => {
            I18n.locale = languages.value;
            global.appBuildLanguage = languages.value;
            dispatch({ type: Types.LANGUAGE_LOAD, language: languages })
            callBack();
        })
    }
}
export function languageChange(language, callBack) {
    // Encrypt 加密
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(language), 'secret key language').toString();
    return dispatch => {
        I18n.locale = language.value;
        global.appBuildLanguage = language.value;
        dispatch({ type: Types.LANGUAGE_CHANGE, language: language })
        StorageUtil.saveKey(Key.CurrentLanguage, ciphertext);
        callBack();
    }
}