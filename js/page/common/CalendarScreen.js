'use strict';//严格模式
import React from 'react'
import {
    View,
} from 'react-native'
import SuperView from '../../super/SuperView';
import Calendar from '../../custom/Calendar';
import I18nUtil from '../../util/I18nUtil';

export default class CalendarScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '日期选择'
        }
        this.state = {
            check: {},
            holiday: {}
        }
    }
    renderBody() {
        const params = this.params;
        var date = new Date();
        var nowDateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        this.state.check[nowDateStr] = 'checked';
        //节假日的
        nowDateStr = (date.getMonth() + 1) + '-' + date.getDate();
        this.state.holiday[nowDateStr] = I18nUtil.translate('今天');
        //每次显示5个月
        let num = params.from === 'train' ? 2 : 12;
        return (
            <View style={{ flex: 1 }}>
                <Calendar
                    check={this.state.check}
                    num={num}
                    from={params.from}
                    showDays={params.showDays}
                    holiday={this.state.holiday}
                    goDate={(params.num == 2||params.num == 3) ? params.date : null}
                    touchEvent={(dateSt) => {
                        params.backDate && params.backDate(dateSt);
                        this.pop();
                    }}
                />
            </View>
        );
    }
}
