import I18n from 'react-native-i18n';

// 导入语言包
import zh from '../res/js/zh';
import eng from '../res/js/eng';

// 导入其他英语资源模块
import Country_En from '../res/js/Country_En';
import airport_En from '../res/js/airport_En';
import flightCity_En from '../res/js/flightCity_En';
import trainCity_En from '../res/js/trainCity_En';
import english from '../res/js/english';

// 合并所有英文资源到 eng 对象中
const en = {
    ...eng,
    ...airport_En,
    ...flightCity_En,
    ...trainCity_En,
    ...english,
    ...Country_En
};

/**
 * I18n 配置
 */

// 设置默认语言
I18n.defaultLocale = 'zh';

// 允许回退：如果当前语言没有对应的翻译，则回退到默认语言
I18n.fallbacks = true;

// 配置翻译内容
I18n.translations = {
    zh,
    en,
};

// 获取当前语言环境，默认使用系统语言，如果系统语言未匹配则使用 zh
// 注意：I18n.locale 会自动获取系统语言，通常不需要手动硬编码为 'zh'，
// 除非您想强制默认显示中文。如果想跟随系统，可以注释掉下面这行。
// I18n.locale = 'zh'; 

/**
 * 封装翻译方法，增加容错处理
 * @param {string} key 翻译键
 * @param {object} options 翻译选项
 * @returns {string} 翻译结果
 */
const translate = (key, options) => {
    if (!key) return '';
    return I18n.t(key, options);
};

// 挂载到 I18n 对象上，保持兼容性
I18n.translate = translate;

export default I18n;
