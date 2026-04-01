import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    PixelRatio,
    Text,
    TouchableHighlight,
    FlatList
} from 'react-native'
import Utils from '../util/Util';
import Theme from '../res/styles/Theme';
import I18nUtil from '../util/I18nUtil';
import CustomText from './CustomText';

export default class Calendar extends Component {
    constructor(props) {
        super(props);
        //开始时间
        let  startTime = this.props.startTime || new Date();
         // 假期
        let  holiday = this.props.holiday || {};

        var check = this.props.check || {};

        var headerStyle = this.props.headerStyle || {};

        var from = this.props.from;

        var showDays = this.props.showDays
        //显示月份的个数
        let num = this.props.num || 12;
        this.state = {
            startTime: startTime,
            num: num,
            holiday: holiday,
            check: check,
            headerStyle: headerStyle,
            items: [],
            from: from,
            showDays: showDays,
        }
    }
    componentDidMount = () => {
        const { num } = this.state;
        for (let i = 0; i < num; i++) {
            this.state.items.push(i);
        }

        this.setState({
            dataSource: this.state.items
        })

    }
    _renderRow = ({ index: n }) => {
        let date = this.state.startTime;
        const { num, holiday, check, headerStyle, from, showDays } = this.state;
        var dateNow = new Date();
        var rows = [];
        var newDate = new Date(date.getFullYear(), date.getMonth() + 1 + n, 0); //天数
        var week = new Date(date.getFullYear(), date.getMonth() + n, 2).getDay(); //月份开始的星期

        let trainEndDate = new Date(+dateNow + showDays * 3600 * 1000 * 24);//火车票 可选择日期
        if (week === 0) {
            week = 7;
        }
        var counts = newDate.getDate();
        var rowCounts = Math.ceil((counts + week - 1) / 7); //本月行数
        for (var i = 0; i < rowCounts; i++) {
            var days = [];
            for (var j = (i * 7) + 1; j < ((i + 1) * 7) + 1; j++) {
                //根据每个月开始的［星期］往后推
                var dayNum = j - week + 1;
                if (dayNum > 0 && j < counts + week) {
                    //如果当前日期小于今天，则变灰
                    var dateObj = new Date(date.getFullYear(), date.getMonth() + n, dayNum);
                    var dateStr = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dayNum;
                    var dateStr2 = (dateObj.getMonth() + 1) + '-' + dayNum;
                    var grayStyle = {};
                    var bk = {};
                    if (dateNow >= new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1) || (from && from === 'train' && dateObj > trainEndDate)) {
                        grayStyle = {
                            color: '#ccc'
                        };
                    }
                    if (this.props.goDate) {
                        if (this.props.goDate >= new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1)) {
                            grayStyle = {
                                color: '#ccc'
                            };
                        }
                    }
                    if (holiday[dateStr2]) {
                        dayNum = holiday[dateStr2];
                    }
                    if (check[dateStr]) {
                        bk = {
                            width: 46,
                            height: 55,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius:3
                        };
                        grayStyle = {
                            color: Theme.theme
                        };
                    }
                    //   this.props.touchEvent?this.props.touchEvent.bind(this, dateObj):null
                    days.push(
                        <TouchableHighlight key={j} 
                                            disabled={
                                                ((  dateNow >= new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1)) || 
                                                    (from && from === 'train' && dateObj > trainEndDate) || 
                                                    (this.props.goDate >= new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1)
                                                )) ? true : false
                                            } 
                                            underlayColor={Theme.theme} style={{ flex: 1,borderRadius:3
                                                // backgroundColor:dateNow >= new Date(date.getFullYear(), date.getMonth() + n, dayNum + 1)?"":'pink'   
                                            }} 
                                            onPress={this.props.touchEvent ? this.props.touchEvent.bind(this, dateObj) : null}>
                            <View key={j} style={[styles.flex_1]} >
                                <View style={[bk]} >
                                    <Text allowFontScaling={false} style={[grayStyle]}  >{dayNum}</Text>
                                </View>
                            </View>
                        </TouchableHighlight>
                    );
                } else {
                    days.push(
                        <View key={j} style={[styles.flex_1]} >
                            <Text></Text>
                        </View>
                    );
                }

            }
            rows.push(
                <View key={rows.length} style={styles.row}>{days}</View>
            );
        }
        return (
            <View style={[styles.cm_bottom]}>
                <View style={styles.month}>
                    <Text allowFontScaling={false} style={styles.month_text}>{Utils.Parse.isChinese() ? (newDate.getFullYear() + '年' + (newDate.getMonth() + 1) + '月') : (I18nUtil.numberToEn(newDate.getMonth() + 1) + ' ' + newDate.getFullYear())}</Text>
                </View>
                {rows}
            </View>
        )
    }
   
    render() {
       
        return (
            <View style={styles.calendar_container}>
                <View style={{height:32,backgroundColor:Theme.greenBg,alignItems:'center',justifyContent: 'center',}}>
                    <CustomText style={{color:Theme.theme,fontSize:12}} text={'所选日期为当地日期'}></CustomText>
                </View>
                <View style={[styles.row, styles.row_header, this.props.headerStyle]}>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={[styles.week_highlight, this.props.headerStyle]}>{I18nUtil.numberToEn('日')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={this.props.headerStyle}>{I18nUtil.numberToEn('一')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={this.props.headerStyle}>{I18nUtil.numberToEn('二')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={this.props.headerStyle}>{I18nUtil.numberToEn('三')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={this.props.headerStyle}>{I18nUtil.numberToEn('四')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={this.props.headerStyle}>{I18nUtil.numberToEn('五')}</Text>
                    </View>
                    <View style={[styles.flex_1]}>
                        <Text allowFontScaling={false} style={[styles.week_highlight, this.props.headerStyle]}>{I18nUtil.numberToEn('六')}</Text>
                    </View>
                </View>
                <FlatList
                    data={this.state.dataSource}
                    showsVerticalScrollIndicator={false}
                    renderItem={this._renderRow}
                    keyExtractor={(item, index) => {
                        return String(index);
                    }}
                    initialNumToRender = {3}
                />
            </View>

        );
    }
};



var styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    flex_1: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendar_container: {
        flex: 1,
        borderTopWidth: 1 / PixelRatio.get(),
        borderBottomWidth: 1 / PixelRatio.get(),
        borderColor: '#ccc',
    },
    row_header: {
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1 / PixelRatio.get(),
        borderBottomColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        height: 55,
        backgroundColor:'#fff'
    },
    month: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 32,
        backgroundColor:Theme.normalBg
    },
    month_text: {
        fontSize: 18,
        fontWeight: '400',
        color:Theme.fontColor
    },
    week_highlight: {
        color: Theme.theme
    },
    cm_bottom: {
        // borderBottomWidth: 1 / PixelRatio.get(),
        // borderBottomColor: '#ccc',
        backgroundColor:'#fff'        
    },
    headerStyle: {
        backgroundColor: 'gray',
    }
});





module.exports = Calendar;