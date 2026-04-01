import CommonEnum from "../enum/CommonEnum";
import PlanType1 from '../res/js/craftType.json';
import airlines from '../res/js/airline';
import I18nUtil from '../util/I18nUtil';
import StorageUtil from '../util/StorageUtil';
import Key from '../res/styles/Key';

const Util = {
    RegEx: {
        isEmail: (email) => {
            let emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
            return emailReg.test(email);
        },
        isMobile: (mobile) => {
            let mobileReg = /^\d{11}$/;
            return mobileReg.test(mobile);
        },
        isRealHotelName: (hotelName) => {
            // let hotelNameReg = /^(?:[\u4e00-\u9fa5]+)(?:●[\u4e00-\u9fa5]+)*$|^[a-zA-Z0-9]+?\/[/()a-zA-Z]*[a-zA-Z\.]+$/;
            let hotelNameReg = /^([\u4e00-\u9fa5]{2,}|[a-zA-Z/\s]{4,})$/;
            return hotelNameReg.test(hotelName);
        }
    },
    Parse: {
        isChinese: (zh) => {
            if (global.appBuildLanguage === CommonEnum.languageType.zh) {
                return true;
            }
            return false;
        },
        isNumber: (o) => {
            return (!isNaN(Number(o)));
        },
    },
    Date: {
        /**
         * 转换为日期格式
         */
        toDate: (obj) => {
            let curType = typeof obj;
            if (curType === 'object') {
                if (obj instanceof Date) {
                    return obj;
                } else {
                    return null;
                }
            } else if (curType === 'string') {
                if (obj.includes('0001-01-01T00:00:00')) {
                    return null;
                }
                
                // 处理毫秒/微秒小数部分 (例如: 2026-03-25T15:16:14.725043)
                let dianIndex = obj.indexOf('.');
                if (dianIndex > -1) {
                    obj = obj.substr(0, dianIndex);
                }
                
                // 兼容 T 格式
                if (obj.includes('T')) {
                    obj = obj.replace('T', ' ');
                }

                // 重要：iOS 端的 JSCore 不支持 2026/03/25 这种格式，它原生支持 ISO 格式 2026-03-25T15:16:14
                // 或者标准的 2026-03-25 格式。之前的 replace(/-/g, '/') 反而可能在某些环境下导致 Invalid Date。
                // 我们直接尝试 new Date，如果失败再做特殊处理。
                let date = new Date(obj);
                if (isNaN(date.getTime()) && obj.includes('-')) {
                    // 如果解析失败且包含 -，尝试替换为 / (针对极少数老旧环境兜底)
                    date = new Date(obj.replace(/-/g, '/'));
                }
                return date;
            } else if (curType === 'number') {
                return new Date(obj);
            } else {
                return null;
            }
        },
        /**
         * 日期加0
         */
        formatDate0: (str) => {
            // 根据 - 符号拆分
            return str
                .split("-")
                .map((item) => {
                    // +item 将item字符串转换为数字
                    // 小于10的时候就补全一个前缀0
                    if (+item < 10) {
                        return "0" + +item;
                    }

                    // 大于10的时候不用补0
                    return item;
                })
                .join("-"); // 最后重组回来
        },
        /**
         *  获取日期差
         */
        getDiffDay: (date1, date2) => {
            if (date1 && date2) {
                if (date1 instanceof Date && date2 instanceof Date) {
                    let time = Util.Date.toDate(date2.format('yyyy-MM-dd')).getTime() - Util.Date.toDate(date1.format('yyyy-MM-dd')).getTime();
                    return parseInt(time / (3600 * 24 * 1000));
                }
            }
            return 0;
        },
        /**
         * 获取星期描述
         */
        getWeekDesc: (date) => {
            if (date) {
                let goWeekDesc = '';
                if (date.format('yyyy-MM-dd') === new Date().format('yyyy-MM-dd')) {
                    goWeekDesc = '今天';
                } else if (date.format('yyyy-MM-dd') === new Date().addDays(1).format('yyyy-MM-dd')) {
                    goWeekDesc = '明天';
                } else if (date.format('yyyy-MM-dd') === new Date().addDays(2).format('yyyy-MM-dd')) {
                    goWeekDesc = '后天';
                } else {
                    goWeekDesc = date.getWeek();
                }
                return goWeekDesc;
            }
        },
        /*
        * 获取时间差
        */
        getDiffTime: (date1, date2) => {
            if (date1 && date2) {
                var cha = Util.Date.toDate(date2).valueOf() - Util.Date.toDate(date1).valueOf()
                var chadays = cha % (24 * 3600 * 1000)//相差天数 date1
                var hours = Math.floor(chadays / (3600 * 1000));
                var leave2 = chadays % (3600 * 1000);        //计算小时数后剩余的毫秒数
                var minutes = Math.floor(leave2 / (60 * 1000));
                var hour; var minute;
                if (hours > 0) { hour = hours + 'h' } else { hour = '' }
                if (minutes > 0) { minute = minutes + 'm' } else { minute = '' }
                var time = hour + minute
                return time
            }
        },
        
        addMonths: (date, months) => {
            let newDate = new Date(date);
            let newMonth = newDate.getMonth() + months;
            newDate.setFullYear(newDate.getFullYear() + Math.floor(newMonth / 12));
            newDate.setMonth(newMonth % 12);
            return newDate;
        },


    },
    Read: {
        
        planType: (code,craftTypeList) => {
            let PlanType =craftTypeList&&craftTypeList.length>0 ? craftTypeList: PlanType1;
            for (let i = 0; i < PlanType.length; i++) {
                let obj = PlanType[i];
                if (obj instanceof Array) {
                    continue;
                }
                let otherCode = (code.endsWith('?') && code.replace(/\D/g,'').slice(0,2) === String(obj.Code).slice(0,2)) //code包含?号且前两位相同
                if (obj.Code === code || otherCode) {
                    let _name = (global.appBuildLanguage === CommonEnum.languageType.zh) ? (obj.Name?obj.Name:obj.Code) : (obj.EnName?obj.EnName:obj.Code)
                    let _size = ''
                    if (obj.Size == 'S') {
                        _size = I18nUtil.translate('小型')
                    }
                    if (obj.Size == 'M') {
                        _size = I18nUtil.translate('中型')
                    }
                    if (obj.Size == 'L') {
                        _size = I18nUtil.translate('大型')
                    }
                    return _name + ' ' + _size
                }
            }
            return '';
        },

        planType2: (code,craftTypeList) => {
            let PlanType =craftTypeList&&craftTypeList.length>0 ? craftTypeList: PlanType1;
            for (let i = 0; i < PlanType.length; i++) {
                let obj = PlanType[i];
                if (obj instanceof Array) {
                    continue;
                }
                let otherCode = (code.endsWith('?') && code.replace(/\D/g,'').slice(0,2) === String(obj.Code).slice(0,2)) //code包含?号且前两位相同
                if (obj.Code === code || otherCode) {
                    let _name = (global.appBuildLanguage === CommonEnum.languageType.zh) ? obj.Name : obj.EnName
                    let _size = ''
                    let _sizeCode = ''
                    if (obj.Size == 'S') {
                        // _size = I18nUtil.translate('小型')
                        _size = '小型'
                    }
                    if (obj.Size == 'M') {
                        _size = '中型'
                    }
                    if (obj.Size == 'L') {
                        _size = '大型'
                    }
                    return _size
                }
            }
            return '';
        },
        domesticAirlines: function (code) {
            if (!code) {
                return code;
            }
            if (airlines && Array.isArray(airlines)) {
                let index = airlines.findIndex(airline => (airline.Code === code));
                if (index === -1) {
                    return null;
                }
                return airlines[index].EnFullName || airlines[index].CnShortName;
            }
        },
        simpleReplace: function (str, encryptionSymbol) {
            if (!encryptionSymbol) {
                encryptionSymbol = '*';
            }
            if (str && str.length > 4) {
                var remainLength = str.length - 4;
                var result = '';
                for (var i = 0; i < remainLength; i++) {
                    result += encryptionSymbol;
                }
                result += str.substring(remainLength);
                return result;
            } else {
                return str || '';
            }
        },
        simpleReplaceAll: function (str, encryptionSymbol) {
            if (!encryptionSymbol) {
                encryptionSymbol = '*';
            }
            if (str && str.length > 0) {
                var remainLength = str.length - 0;
                var result = '';
                for (var i = 0; i < remainLength; i++) {
                    result += encryptionSymbol;
                }
                result += str.substring(remainLength);
                return result;
            } else {
                return str || '';
            }
        },
        simpleReplaceBirth: function (str, encryptionSymbol) {
            if (!encryptionSymbol) {
                encryptionSymbol = '*';
            }
            if (str && str.length > 0) {
                var remainLength = str.length - 0;
                var result = '';
                for (var i = 0; i < remainLength; i++) {
                    if(i==4 || i==7){
                        result += '-'
                    }else{
                        result += encryptionSymbol;
                    }
                }
                result += str.substring(remainLength);
                return result;
            } else {
                return str || '';
            }
        },
        /**
      * 根据证件类型描述返回证件数字
      */
        // certificateType: (str) => {
        //     if (str == '身份证' || str == 'ID Card') {
        //         return 1;
        //     } else if (str == '护照' || str == 'Passport') {
        //         return 2;
        //     } else if (str == '军人证' || str == 'Military ID Card') {
        //         return 32;
        //     } else if (str == '学生证' || str == 'Student ID Card') {
        //         return 64;
        //     } else if (str == '港澳台居民居住证' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents') {
        //         return 512;
        //     } else if (str == '外国人永久居留身份证' || str == "Foreigner's Permanent Residence ID Card") {
        //         return 1024;
        //     } else if (str == '台湾居民来往大陆通行证' || str == 'Mainland Travel Permit for Taiwan Residents') {
        //         return 4;
        //     } else if (str == '港澳居民来往内地通行证' || str == 'Mainland Travel Permit for Hong Kong and Macao Residents') {
        //         return 128;
        //     } else if (str == '港澳通行证') {
        //         return 2048;
        //     } else if (str == '大陆居民往来台湾通行证') {
        //         return 4096;
        //     } else if (str == '外交部签发的驻华外交人员证') {
        //         return 8192;
        //     } else if (str == '民航局规定的其他有效乘机身份证件') {
        //         return 16384;
        //     } else {
        //         return 1;
        //     }
        // },
        certificateType: (str) => {
            if (str == '身份证' || str == 'Chinese ID Card') {
                return 1;
            } else if (str == '护照' || str == 'Passport') {
                return 2;
            } else if (str == '台湾通行证' || str == 'Taiwan Travel Permit for Mainland Residents') {
                return 8;
            } else if (str == '军官证' || str == 'Military ID') {
                return 32;
            } else if (str == '学生证（十六周岁以下）' || str == "Student's ID Card (Uner 16 yrs old)") {
                return 64;
            } else if (str == '港澳台居民居住证' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents' || str == 'Residence Permit for Hong Kong, Macau and Taiwan Residents') {
                return 512;
            } else if (str == '外国人永久居留身份证' || str == "Foreigner's Permanent Residence ID Card") {
                return 1024;
            } else if (str == '台湾居民来往大陆通行证' || str == 'Mainland Travel Permit for Taiwan Residents') {
                return 4;
            } else if (str == '港澳居民来往内地通行证' || str == 'Mainland Travel Permit for Hong Kong and Macao Residents'|| str == 'Mainland Travel Permit for Hong Kong and Macao Residents ') {
                return 128;
            } else if (str == '港澳通行证（含电子港澳通行证）' || str == "Exit-Entry Permit for travelling to and from Hong Kong and Macao") {
                return 2048;
            } else if (str == '大陆居民往来台湾通行证') {
                return 4096;
            } else if (str == '外交部签发的驻华外交人员证') {
                return 8192;
            } else if (str == '海员证' || str == "Seaman's Book") {
                return 32768;
            } else if (str == '外国人出入境证' || str == "Foreigner's Exit-Entry Permit") {
                return 65536;
            } else {
                return 1;
            }
        },
        /**
        * 根据证件类型描述返回证件数字  国内机票
        */
        certificateType2: (str) => {
            if (str == '身份证' || str == 'Chinese ID Card') {
                return 1;
            } else if (str == '护照' || str == 'Passport') {
                return 2;
            } else if (str == '台湾通行证' || str == 'Taiwan Travel Permit for Mainland Residents') {
                return 8;
            } else if (str == '军官证' || str == 'Military ID') {
                return 32;
            } else if (str == '学生证（十六周岁以下）' || str == "Student's ID Card (Uner 16 yrs old)") {
                return 64;
            } else if (str == '港澳台居民居住证' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents') {
                return 512;
            } else if (str == '外国人永久居留身份证' || str == "Foreigner's Permanent Residence ID Card") {
                return 1024;
            } else if (str == '台湾居民来往大陆通行证' || str == 'Mainland Travel Permit for Taiwan Residents') {
                return 4;
            } else if (str == '港澳居民来往内地通行证' || str == 'Mainland Travel Permit for Hong Kong and Macao Residents' || str == 'Mainland Travel Permit for Hong Kong and Macao Residents ') {
                return 128;
            } else if (str == '港澳通行证（含电子港澳通行证）' || str == "Exit-Entry Permit for travelling to and from Hong Kong and Macao") {
                return 2048;
            } else if (str == '大陆居民往来台湾通行证' || str == 'Mainland Resident Travel Permit to Taiwan') {
                return 4096;
            } 
            // else if (str == '外交部签发的驻华外交人员证') {
            //     return 8192;
            // } 
            else if (str == '海员证' || str == "Seaman's Book") {
                return 32768;
            } 
            // else if (str == '外国人出入境证' || str == "Foreigner's Exit-Entry Permit") {
            //     return 65536;
            // } 
            else {
                return 1;
            }
        },
        certificateTransfer: (str) => {
            if (str == '身份证' || str == 'Chinese ID Card') {
                return Util.Parse.isChinese() ? '身份证' : 'Chinese ID Card';
            } else if (str == '护照' || str == 'Passport') {
                return Util.Parse.isChinese() ? '护照' : 'Passport';
            } else if (str == '台湾通行证' || str == 'Taiwan Travel Permit for Mainland Residents') {
                return Util.Parse.isChinese() ? '台湾通行证' : 'Taiwan Travel Permit for Mainland Residents';
            } else if (str == '军官证' || str == 'Military ID') {
                return Util.Parse.isChinese() ? '军官证' : 'Military ID';
            } else if (str == '学生证（十六周岁以下）' || str == "Student's ID Card (Uner 16 yrs old)") {
                return Util.Parse.isChinese() ? '学生证（十六周岁以下）' : "Student's ID Card (Uner 16 yrs old)";
            } else if (str == '港澳台居民居住证' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents' || str == 'Residence Permit for Hong Kong,Macau and Taiwan Residents') {
                return Util.Parse.isChinese() ? '港澳台居民居住证' : 'Residence Permit for Hong Kong,Macau and Taiwan Residents';
            } else if (str == '外国人永久居留身份证' || str == "Foreigner's Permanent Residence ID Card") {
                return Util.Parse.isChinese() ? '外国人永久居留身份证' : "Foreigner's Permanent Residence ID Card";
            } else if (str == '台湾居民来往大陆通行证' || str == 'Mainland Travel Permit for Taiwan Residents') {
                return Util.Parse.isChinese() ? '台湾居民来往大陆通行证' : 'Mainland Travel Permit for Taiwan Residents';
            } else if ((str === '港澳居民来往内地通行证') || (str === 'Mainland Travel Permit for Hong Kong and Macao Residents '|| str === 'Mainland Travel Permit for Hong Kong and Macao Residents')) {
                return Util.Parse.isChinese() ? '港澳居民来往内地通行证' : 'Mainland Travel Permit for Hong Kong and Macao Residents';
            } else if (str == '港澳通行证（含电子港澳通行证）' || str == "Exit-Entry Permit for travelling to and from Hong Kong and Macao") {
                return Util.Parse.isChinese() ? '港澳通行证（含电子港澳通行证）' : "Exit-Entry Permit for travelling to and from Hong Kong and Macao";
            } else if (str == '大陆居民往来台湾通行证' || str == 'Mainland Resident Travel Permit to Taiwan') {
                return Util.Parse.isChinese() ? '大陆居民往来台湾通行证' : 'Mainland Resident Travel Permit to Taiwan';
            } 
            else if (str == '海员证' || str == "Seaman's Book") {
                return Util.Parse.isChinese() ? '海员证' : "Seaman's Book";
            } 
        },
        
        typeTocertificate: (str) => {
            if (str == 1) {
                return '身份证';
            } else if (str == 2) {
                return '护照';
            } else if (str == 8) {
                return '台湾通行证';
            } else if (str == 16) {
                return '港澳通行证';
            } else if (str == 32) {
                return '军人证';
            } else if (str == 64) {
                return '学生证';
            } else if (str == 512) {
                return '港澳台居民居住证';
            } else if (str == 1024) {
                return '外国人永久居留身份证';
            } else if (str == 4) {
                return '台湾居民来往大陆通行证';
            } else if (str == 128) {
                return '港澳居民来往内地通行证';
            } else if (str == 2048) {
                return '港澳通行证';
            } else if (str == 4096) {
                return '大陆居民往来台湾通行证';
            } else if (str == 8192) {
                return '外交部签发的驻华外交人员证'
            } else if (str == 16384) {
                return '民航局规定的其他有效乘机身份证件'
            } else {
                return '身份证';
            }
        },
        typeTocertificate2: (str) => {
            if (str == 1) {
                return Util.Parse.isChinese() ? '身份证' : 'Chinese ID Card';
            } else if (str == 2) {
                return Util.Parse.isChinese() ? '护照' : 'Passport';
            } else if (str == 8) {
                return Util.Parse.isChinese() ? '台湾通行证' : 'Taiwan Travel Permit for Mainland Residents';
            } else if (str == 16) {
                return Util.Parse.isChinese() ? '港澳通行证' : 'Exit-Entry Permit for travelling to and from Hong Kong and Macao';
            } else if (str == 32) {
                return Util.Parse.isChinese() ? '军官证' : 'Military ID';
            } else if (str == 64) {
                return Util.Parse.isChinese() ? '学生证（十六周岁以下）' : "Student's ID Card (Uner 16 yrs old)";
            } else if (str == 512) {
                return Util.Parse.isChinese() ? '港澳台居民居住证' : 'Residence Permit for Hong Kong,Macau and Taiwan Residents';
            } else if (str == 1024) {
                return Util.Parse.isChinese() ? '外国人永久居留身份证' : "Foreigner's Permanent Residence ID Card";
            } else if (str == 4) {
                return Util.Parse.isChinese() ? '台湾居民来往大陆通行证' : 'Mainland Travel Permit for Taiwan Residents';
            } else if (str == 128) {
                return Util.Parse.isChinese() ? '港澳居民来往内地通行证' : 'Mainland Travel Permit for Hong Kong and Macao Residents';
            } else if (str == 2048) {
                return Util.Parse.isChinese() ? '港澳通行证（含电子港澳通行证）' : "Exit-Entry Permit for travelling to and from Hong Kong and Macao";
            } else if (str == 4096) {
                return Util.Parse.isChinese() ? '大陆居民往来台湾通行证' : 'Mainland Resident Travel Permit to Taiwan';
            } 
            // else if (str == 8192) {
            //     return Util.Parse.isChinese() ? '外交部签发的驻华外交人员证' : 'Foreign Official Exchange Permit for Mainland Residents';
            // } 
            else if (str == 32768) {
                return Util.Parse.isChinese() ? '海员证' : "Seaman's Book";
            } 
            // else if (str == 65536) {
            //     return Util.Parse.isChinese() ? '外国人出入境证' : "Foreigner's Exit-Entry Permit";
            // } 
            else {
                return Util.Parse.isChinese() ? '身份证' : 'Chinese ID Card';
            }
        },
        /**火车证件选择优先级 */
        TrainTypeCertifLevel: (str) => {
            if (str == 1) {
                return 1;
            } else if (str == 2) {
                return 6;
            } else if (str == 512) {
                return 2;
            } else if (str == 1024) {
                return 3;
            } else if (str == 4) {
                return 5;
            } else if (str == 128) {
                return 4;
            } else {
                return 100;
            }
        },
        /**国内飞机证件选择优先级 */
        FlightTypeCertifLevel: (str) => {
            if (str == 1) {
                return 1;
            } else if (str == 2) {
                return 6;
            } else if (str == 512) {
                return 3;
            } else if (str == 1024) {
                return 2;
            } else if (str == 4) {
                return 5;
            } else if (str == 128) {
                return 4;
            } else {
                return 100;
            }
        },
        /**国内飞机台湾证件选择优先级 */
        FlightTypeCertifLevel2: (str) => {
            if (str == 2) {//护照
                return 4;
            } else if (str == 512) {//港澳台居民居住证
                return 2;
            } else if (str == 1024) {//外国人永久居留身份证
                return 3;
            } else if (str == 4) {//台湾居民来往大陆通行证
                return 1;
            } else {
                return 100;
            }
        },
        /**国内飞机港澳证件选择优先级 */
        FlightTypeCertifLevel3: (str) => {
            if (str == 2) {//护照
                return 4;
            } else if (str == 512) {//港澳台居民居住证
                return 2;
            } else if (str == 1024) {//外国人永久居留身份证
                return 3;
            } else if (str == 128) {//港澳居民来往内地通行证
                return 1;
            } else {
                return 100;
            }
        },
        /**国际大陆往来港澳证件选择优先级 */
        GangAoTypeCertifLevel: (str) => {
            if (str == 2) {
                return 4;
            }
            else if (str == 4) {
                return 3;
            }
            else if (str == 2048) {
                return 2;
            } 
            else if (str == 128) {
                return 1;
            } else {
                return 100;
            }
        },
        GangAoTypeCertifLevelCN: (str) => {
            if (str == 16) {
                return 1;
            }
            else if (str == 2) {
                return 2;
            }
            else {
                return 100;
            }
        },
        /**国际大陆往来台湾证件选择优先级 */
        TWTypeCertifLevel: (str) => {
            if (str == 2) {
                return 4;
            }else if (str == 128) {
                return 3;
            }
            if (str == 4) {
                return 1;
            } else if (str == 4096) {
                return 2;
            } else {
                return 100;
            }
        },
        TWTypeCertifLevelCN: (str) => {
            if (str == 4096) {
                return 1;
            }
            else if (str == 2) {
                return 2;
            }
            else {
                return 100;
            }

        },
        /**港澳台之间来往证件选择优先级 */
        GangAoTaTypeCertifLevel: (str) => {
            if (str == 2) {
                return 5;
            }
            else if (str == 4) {
                return 4;
            }
            else if (str == 2048) {
                return 1;
            } 
            else if (str == 128) {
                return 3;
            }else if (str == 4096) {
                return 2;
            }
             else {
                return 100;
            }
            
        },
        GangAoTaTypeCertifLevelCN: (str) => {
            if (str == 4096) {
                return 2;
            }
            else if (str == 2048) {
                return 3;
            }
            else if (str == 2) {
                return 1;
            }
            else {
                return 100;
            }
        },
        /**国际机票其他 */
        ElTypeCertifLevel: (str) => {
            if (str == 2) {
                return 1;
            } else {
                return 100;
            }
        }
    },
    Encryption: {
        clone: function clone(obj) {
            if (obj && typeof obj === 'object') {
                if (obj instanceof Date) {
                    var copy = new Date();
                    copy.setTime(obj.getTime());
                    return copy;
                } else if (obj instanceof Array) {
                    var copy = [];
                    for (var i = 0; i < obj.length; i++) {
                        copy[i] = clone(obj[i]);
                    }
                    return copy;
                } else if (obj instanceof Object) {
                    var copy = {};
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) {
                            copy[attr] = clone(obj[attr]);
                        }
                    }
                    return copy;
                } else {
                    return null;
                }
            } else {
                return obj;
            }
        },
    },
    /**
 * 转换时间格式
 * @param {接收时间类型参数} date 
 * @param {返回时间类型参数} format 
 */
    formatDate(date, format) {
        let time = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S+': date.getMilliseconds()
        };

        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (let k in time) {
            if (new RegExp('(' + k + ')').test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? time[k] : ('00' + time[k]).substr(('' + time[k]).length))
            }
        }
        return format;
    },

    multipleOrderStatusDesc(state) {
        switch (state) {
            case 0://计划中
            case 2://审批中
            case 3://待定妥
            case 6://待付款
            case 8://变更中
                return '(未完成)'
            default:
                return '';
        }
    },
    getFlightInfo(equipment) {
        if (!equipment) {
            return;
        }
        if (airlines && Array.isArray(airlines)) {
            let index = airlines.findIndex(airline => (airline.Code === code));
            if (index === -1) {
                return null;
            }
            return airlines[index].EnFullName || airlines[index].CnShortName;
        }
    },

    getFlightInfo1(equipment) {

    },

    stringSlice(text, maxLength){
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    }

}
export default Util;