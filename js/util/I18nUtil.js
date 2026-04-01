import I18n from '../common/I18n';

/**
 * 检测是否为中文环境
 * @returns {boolean} 是否为中文
 */
const isChinese = () => {
    const locale = (I18n && I18n.locale) || 'zh-CN';
    return locale.startsWith('zh');
};
// 星期映射
const WeekMap = {
    '一': 'Mon', '二': 'Tue', '三': 'Wed', '四': 'Thu', '五': 'Fri', '六': 'Sat', '日': 'Sun'
};

// 月份映射
const MonthMap = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
    7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
};

export default class I18nUtil {
    static _interpolate(text, options) {
        if (!options) return text;
        return String(text).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const value = options[key];
            if (value === undefined || value === null) return match;
            return String(value);
        });
    }

    /**
     * 通用翻译方法
     * @param {string} key 翻译键
     * @param {object} options 翻译选项
     * @returns {string} 翻译结果
     */
    static t(key, options) {
        if (key === null || key === undefined || key === '') {
            return '';
        }
        // 如果是数字，直接返回
        if (typeof key === 'number' || (!isNaN(Number(key)) && typeof key !== 'string')) {
             // 注意：原逻辑 !isNaN(text) 会把 "123" 也当做数字处理并返回原值。
             // 这里稍微严谨一点，如果是纯数字类型则返回。
             // 但为了兼容原逻辑（字符串数字不翻译），还是保持原样比较安全
             return key;
        }
        // 原逻辑：if (!isNaN(text)) return text;
        // 这意味着 "123" 会返回 "123"，不进行翻译。
        if (!isNaN(key)) {
            return key;
        }

        // 如果是中文环境，且 key 本身可能是中文内容（非 key），则直接返回
        // 注意：这里保留原逻辑，假设 isChinese() 为 true 时不需要翻译
        if (isChinese()) {
             return this._interpolate(key, options);
        }

        return I18n.t(key, { defaultValue: key, ...options });
    }

    /**
     * 基础翻译
     * @param {string} text 
     */
    static translate(text) {
        return this.t(text);
    }

    /**
     * 带参数的翻译 (单个参数 noun)
     * @param {string} text 
     * @param {*} noun 
     */
    static translateInsert(text, noun) {
        return this.t(text, { noun });
    }
    
    // 兼容旧拼写
    static tranlateInsert(text, noun) {
        return this.translateInsert(text, noun);
    }

    /**
     * 带多个参数的翻译
     * @param {string} text 
     * @param {*} noun1 
     * @param {*} noun2 
     * @param {*} noun3 
     * @param {*} noun4 
     */
    static translateInsert2(text, noun1, noun2, noun3, noun4) {
        return this.t(text, { noun1, noun2, noun3, noun4 });
    }

    // 兼容旧拼写
    static tranlateInsert2(text, noun1, noun2, noun3, noun4) {
        return this.translateInsert2(text, noun1, noun2, noun3, noun4);
    }

    /**
     * 翻译数字/中文日期到英文
     * @param {string|number} num 
     */
    static numberToEn(num) {
        // 如果是中文环境，直接返回原值
        if (isChinese()) {
            return num;
        }

        // 尝试映射星期
        if (WeekMap[num]) {
            return WeekMap[num];
        }

        // 尝试映射月份
        if (MonthMap[num]) {
            return MonthMap[num];
        }

        return num;
    }
}
