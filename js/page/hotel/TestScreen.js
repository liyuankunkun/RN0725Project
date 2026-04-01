import React, { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import { Calendar } from 'react-native-calendario';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
class TestScreen extends React.Component {
    constructor(props) {
        super(props);
        // this.params = props.navigation.state.params || {};
        this.state = {
            date: new Date(),
            endDate: this.props.endDate,
            startDate: this.props.startDate,
        }
    }
    handleDatePress = (day) => {
        const { startDate, endDate } = this.state;
        const { touchEvent } = this.props;
        if (startDate) {
            if (endDate) {
                this.setState({
                    startDate: day,
                    endDate: null,
                });
            } else if (day <= startDate) {
                this.setState({
                    startDate: day,
                });
            } else {
                this.setState({
                    endDate: day,
                },()=>{
                    touchEvent([startDate, day]);
                });
            }
        } else {
            this.setState({
                startDate: day,
            });
        }
    };
   
    render() {
        const { startDate, endDate } = this.state;
        const today = new Date();
        const disabledDates = {};
        for (let d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); d >= new Date(today.getFullYear(), today.getMonth(), 1); d.setDate(d.getDate() - 1)) {
            disabledDates[d.toISOString().split('T')[0]] = true;
        }
       return (
        <View style={styles.row}>
            <Calendar
                onPress={(day) => {
                    this.handleDatePress(day);
                }}
                minDate={today}
                startDate={startDate}
                endDate={endDate}
                monthHeight={400}
                theme={{
                    activeDayColor: {},
                    monthTitleTextStyle: {
                    color: '#333',
                    fontSize: 16,
                    },
                    emptyMonthContainerStyle: {},
                    emptyMonthTextStyle: {
                    fontWeight: '200',
                    },
                    weekColumnsContainerStyle: {},
                    weekColumnStyle: {
                    paddingTop: 10,
                    },
                    weekColumnTextStyle: {
                    color: Theme.theme,
                    fontSize: 13,
                    },
                    nonTouchableDayContainerStyle: {},
                    nonTouchableDayTextStyle: { color: '#ccc' }, // 置灰样式
                    startDateContainerStyle: {
                        backgroundColor:Theme.theme, // 设置选中第一个日期的背景颜色为绿色
                        borderBottomLeftRadius: 4, // 设置底部左圆角
                        borderBottomRightRadius: 4, // 设置底部右圆角
                        borderTopLeftRadius: 4, // 设置顶部左圆角
                        borderTopRightRadius: 4, // 设置顶部右圆角
                    },
                    startDateTextStyle: {
                        color: '#fff',
                    },
                    endDateContainerStyle: {
                        backgroundColor: Theme.theme,
                        borderBottomLeftRadius: 4, // 设置底部左圆角
                        borderBottomRightRadius: 4, // 设置底部右圆角
                        borderTopLeftRadius: 4, // 设置顶部左圆角
                        borderTopRightRadius: 4, // 设置顶部右圆角
                    },
                    dayContainerStyle: {
                        marginLeft:-0.1,marginRight:-0.1,height:50,
                    },
                    dayTextStyle: {
                        color: '#2d4150',
                        fontWeight: '200',
                        fontSize: 15,
                    },
                    dayOutOfRangeContainerStyle: { },
                    dayOutOfRangeTextStyle: {},
                    todayContainerStyle: {height:50,backgroundColor:Theme.greenBg,borderRadius:4},
                    todayTextStyle: {
                       color: Theme.theme,
                    },
                    activeDayContainerStyle: {
                       backgroundColor:Theme.greenBg
                    },
                    activeDayTextStyle: {
                       color: 'black',
                    },
                    nonTouchableLastMonthDayTextStyle: {},
                }}
                locale= {Util.Parse.isChinese() ? 'zh' : 'en'} 
                disableOffsetDays={true}
                disabledDates={disabledDates}
                renderDayContent={(day) => {
                    let formattedDate = day.date.toLocaleDateString('zh-CN');
                    const date = new Date(day.date).getDate(); // 只取日期部分
                    //判断开始日期
                    if (startDate && formattedDate === startDate.toLocaleDateString('zh-CN')) {
                        return (
                            <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color:'#fff' }}>{date}</Text>
                                <CustomText style={{ fontSize:10,color:'#fff' }} text={'入住'}></CustomText>
                            </View>
                        );
                    }
                    //判断结束日
                    if (endDate && formattedDate === endDate.toLocaleDateString('zh-CN')) {
                        return (
                            <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color:'#fff' }}>{date}</Text>
                                <CustomText style={{ fontSize:10,color:'#fff' }} text={'离店'}></CustomText>
                            </View>
                        );
                    }
                    // 非今天日期的样式
                    return (
                        <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{  }}>{date}</Text>
                        </View>
                    );
                }}
            />
        </View>
       )
    }
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        // padding: 10
    }
})
export default TestScreen;