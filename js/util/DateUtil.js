import I18nUtil from "./I18nUtil";
import CommonEnum from '../enum/CommonEnum';
Date.prototype.addDays = function (number) {
    if (isNaN(Number(number))) {
        return undefined;
    }
    return new Date(this.getFullYear(), this.getMonth(), this.getDate() + number);
}

Date.prototype.getWeek = function (type) {
    const en = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const simple = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const normal = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    let curDay = this.getDay();
    if (global.appBuildLanguage === CommonEnum.languageType.en) {
        return en[curDay];
    }
    if (type === 'normal') {
        return normal[curDay];
    } else if (type === 'english') {
        return en[curDay];
    } else {
        return simple[curDay];
    }
}
/**
 * 日期格式化
 * 使用示例：yyyy-MM-dd HH:mm:ss S
 * 
 * close 关于提交时的日期格式只显示中文 等于true无论在什么情况都显示中文
 */
Date.prototype.format = function (fmt, close) {
    if (!fmt) {
        fmt = 'yyyy-MM-dd HH:mm:ss';
    }
    let hours = this.getHours();
    var o = {
        'M+': this.getMonth() + 1, //月份 
        'd+': this.getDate(), //日 
        'H+': hours,//24小时
        'h+': hours > 12 ? hours - 12 : hours, //12小时 
        'm+': this.getMinutes(), //分 
        's+': this.getSeconds(), //秒 
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度 
        'S': this.getMilliseconds() //毫秒 
    };
    if (!close) {
        if (global.appBuildLanguage === CommonEnum.languageType.en) {
            let enFmt = '';
            if (/(M+)/.test(fmt)) {
                enFmt = enFmt + I18nUtil.numberToEn(o['M+']);
            }
            if (/(d+)/.test(fmt)) {
                enFmt = enFmt && (enFmt + ' ') + o['d+'];
            }
            if (/(y+)/.test(fmt)) {
                enFmt = enFmt && (enFmt + ' ,') + this.getFullYear();
            }
            if (/(H+)/.test(fmt)) {
                enFmt = (enFmt && enFmt + ' ') + (o['H+'] > 9 ? o['H+'] : '0' + o['H+']);
            }
            if (/(h+)/.test(fmt)) {
                enFmt = (enFmt && enFmt + ' ') + (o['h+'] > 9 ? o['h+'] : '0' + o['h+']);
            }
            if (/(m+)/.test(fmt)) {
                enFmt = (enFmt && enFmt + ':') + (o['m+'] > 9 ? o['m+'] : '0' + o['m+']);
            }
            if (/(s+)/.test(fmt)) {
                enFmt = (enFmt && enFmt + ':') + (o['s+'] > 9 ? o['s+'] : '0' + o['s+']);
            }
            return enFmt;
        }
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}
