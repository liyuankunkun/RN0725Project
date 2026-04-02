import React from 'react';
import {
    Modal,
    View,
    Animated,
    StyleSheet,
    ScrollView,
    TouchableHighlight
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import {TitleView,TitleView2} from '../../custom/HighLight';

export default class PayInfoView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            moadlHeight: new Animated.Value(0),
            orderAir: null,
            title: "",
            travellerList: null,
        }
    }
    /**
     * 
     * @param 标题 title 
     * @param  数据 data 
     */
    show(title, data) {
        if (title === '列车详情') {
            this.state.orderAir = data;
        } else if (title === '乘客信息') {
            this.state.travellerList = data;
        } 
        this.setState({
            title,
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.moadlHeight, {
                    toValue: screenHeight * 0.65,
                    duration: 200,
                    useNativeDriver: false
                }),
            ]).start();
        })
    }
    _dismiss = () => {
        Animated.timing(this.state.moadlHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            this.setState({
                visible: false,
                orderAir: null,
                title: '',
                travellerList: null,
            })
        });
    }
    /**
     *  航班信息
     */
    _renderOrderAir = () => {
        const { orderAir } = this.state;
        if (!orderAir) return null;
        orderAir.DepartureTime = Util.Date.toDate(orderAir.DepartureTime);
        orderAir.DestinationTime = Util.Date.toDate(orderAir.DestinationTime);
        return (
            <View>
                <View style={{ paddingHorizontal: 15,marginTop:10 }}>
                    {/* <CustomText text={orderAir.FromStationName + '-' + orderAir.ToStationName} /> */}
                    <TitleView2 title={orderAir.FromStationName + '-' + orderAir.ToStationName}></TitleView2>
                    <View style={{ marginLeft: 15 }}>
                        <CustomText text={orderAir.DepartureTime.format('yyyy/MM/dd') + ' ' + orderAir.DepartureTime.getWeek()} style={{ marginTop: 5 }} />
                        <CustomText text={orderAir.Checi + ' ' + orderAir.Zwname} style={{ marginTop: 5 ,color:Theme.commonFontColor}} />
                    </View>
                </View>

            </View>
        )
    }
    /**
     *  c乘客信息
     */
    _passenerInfo = () => {
        const { travellerList } = this.state;
        if (!travellerList) return null;
        return (
            <View>
                {!Array.isArray(travellerList)?
                    <View style={{ padding: 20, paddingVertical: 10,marginHorizontal:10,backgroundColor:Theme.lineColor2,marginTop:10,borderRadius:6  }}>
                        <CustomText text={travellerList.Name + ' ' + travellerList.Mobile} style={{ marginTop: 5 }} />
                        <CustomText text={travellerList.Credentials ? (travellerList.Credentials.TypeDesc + ' ' + Util.Read.simpleReplace(travellerList.Credentials.SerialNumber)) : ''} style={{ marginTop: 5 }} />
                    </View>
                :
                    travellerList.map((item, index) => {
                        let OrderPassenger = item.OrderPassenger;
                        return (
                            <View key={index} style={{  padding: 20, paddingVertical: 10,marginHorizontal:10,backgroundColor:Theme.lineColor2,marginTop:10,borderRadius:6  }}>
                                <CustomText text={OrderPassenger.Name + ' ' + OrderPassenger.Mobile} style={{ marginTop: 5 }} />
                                <CustomText text={OrderPassenger.Credentials ? (OrderPassenger.Credentials.TypeDesc + ' ' + Util.Read.simpleReplace(OrderPassenger.Credentials.SerialNumber)) : ''} style={{ marginTop: 5,color:Theme.assistFontColor  }} />
                            </View>
                        )
                    })
                }
            </View>
        )
    }
  
    render() {
        const { visible, moadlHeight, title } = this.state;

        return (
            <Modal transparent visible={visible}>
                <Animated.View style={[styles.view]}>
                    <Animated.View style={[styles.AnimatedView, { height: moadlHeight }]}>
                        <View style={styles.headerView}>
                            <CustomText />
                            <CustomText text={title} style={{ fontSize: 16 }} />
                            <TouchableHighlight underlayColor='transparent' onPress={this._dismiss}>
                                <Ionicons name={'ios-close-circle-outline'} size={24} color={Theme.darkColor} />
                            </TouchableHighlight>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            {this._renderOrderAir()}
                            {this._passenerInfo()}
                        </ScrollView>

                    </Animated.View>
                </Animated.View>

            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    AnimatedView: {
        backgroundColor: 'white'
    },
    headerView: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomWidth:1,
        borderColor:Theme.lineColor,
        paddingHorizontal:20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
})
