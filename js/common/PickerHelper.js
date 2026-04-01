import Picker from 'react-native-picker';
import I18nUtil from '../util/I18nUtil';
import Util from '../util/Util';

export default class PickerHelper {

    static hide() {
        Picker.hide();
    }
    static show() {
        Picker.show();
    }

    static create(pickerData, selectedValue, callBack) {

        if (!pickerData) return;
        if (!selectedValue) {
            if (Util.Parse.isChinese()) {
                selectedValue = ['1990年', '01月', '01日'];
            } else {
                selectedValue = ['1990', '01', '01'];
            }
        } else {
            if (selectedValue instanceof Date) {
                // let str = selectedValue.format('yyyy-MM-dd');
                let str = Util.formatDate(selectedValue,'yyyy-MM-dd')
                let seleArr = str.split('-');
                selectedValue = seleArr.map((item, index) => {
                    if (Util.Parse.isChinese()) {
                        if (index === 0) return item + '年';
                        if (index === 1) {
                            if (item >= 10) return item + '月';
                            if (item < 10) return '0' + item + '月';
                        }
                        if (index === 2) {
                            if (item >= 10) return item + '日';
                            if (item < 10) return '0' + item + '日';
                        }
                    }
                    return item;
                })
            }
        }


        Picker.init({
            pickerConfirmBtnText: I18nUtil.translate('确定'),
            pickerCancelBtnText: I18nUtil.translate('取消'),
            pickerTitleText: I18nUtil.translate('请选择日期'),
            pickerData: pickerData,
            pickerToolBarFontSize: 16,
            pickerFontSize: 16,
            selectedValue: selectedValue,
            pickerCancelBtnColor:[20,190,23,1], 
            pickerConfirmBtnColor:[20,190,23,1],
            pickerToolBarBg:[220, 245, 220, 1], 
            pickerBg:[255, 255, 255, 1],         
            onPickerConfirm: (pickedValue, pickedIndex) => {
                if (pickedValue) {
                    let value = pickedValue.map(item => {
                        if (!Util.Parse.isNumber(item)) {
                             let obj = item.replace('年','');
                             obj = obj.replace('月','');
                             obj = obj.replace('日','');
                            return obj;
                        }
                        return item;
                    })
                    callBack(value);
                }

            }
        });
        Picker.show();
    }

    static createYYYYMMDDDate(beginDate) {
        let date = [];
        if (!beginDate || beginDate <= 0) {
            beginDate = 1900;
        }
        for (let i = beginDate; i < 2050; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                let day = [];
                if (j === 2) {
                    for (let d = 1; d < 29; d++) {
                        day.push(d + (Util.Parse.isChinese() ? '日' : ''));
                    }
                    if (i % 4 === 0) {
                        day.push(29 + (Util.Parse.isChinese() ? '日' : ''));
                    }
                } else if ([1, 3, 5, 7, 8, 10, 12].includes(j)) {
                    for (let k = 1; k < 32; k++) {
                        day.push(k + (Util.Parse.isChinese() ? '日' : ''));
                    }
                } else {
                    for (let k = 1; k < 31; k++) {
                        day.push(k + (Util.Parse.isChinese() ? '日' : ''));
                    }
                }
                let _month = {};
                _month[Util.Parse.isChinese() ? j + '月' : j] = day;
                month.push(_month);
            }

            let key = i + (Util.Parse.isChinese() ? '年' : '');
            let _date = {};
            _date[key] = month;
            date.push(_date);
        }
        return date;
    }
    static createYYYYMMDate(beginDate) {
        let date = [];
        if (!beginDate || beginDate <= 0) {
            beginDate = 1900;
        }
        for (let i = beginDate; i < 2050; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                if(j <10){
                    month.push('0' + j);
                }else{
                    month.push(j);
                }
            }
            let key = i + (Util.Parse.isChinese() ? '年' : '');
            let _date = {};
            _date[key] = month;
            date.push(_date);
        }
        return date;
    }
    static createYYYYDate(beginDate) {
        let date = [];
        if (!beginDate || beginDate <= 0) {
            beginDate = new Date().getFullYear();
        }
        for (let i = beginDate; i < 2050; i++) {
            // let month = [];
            // for (let j = 1; j < 13; j++) {
            //     if(j <10){
            //         month.push('0' + j);
            //     }else{
            //         month.push(j);
            //     }
            // }
            // let key = i + (Util.Parse.isChinese() ? '年' : '');
            // let _date = {};
            // _date[key] = month;
            date.push(i);
        }
        return date;
    }

    static createMMDate(){
        let date = [];
       for(let i = 1;i <= 12;i++){
           if(i < 10){
            date.push('0' + i);
           }else{
               date.push(String(i));
           }
          
       }
       return date;
    }
}
