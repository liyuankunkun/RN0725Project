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
export default class PayInfoView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            moadlHeight: new Animated.Value(0),
            priceInfo: null
        }
    }
    /**
     * 
     * @param 标题 title 
     * @param  数据 data 
     */
    show(data) {
        this.setState({
            priceInfo: data,
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.moadlHeight, {
                    toValue: screenHeight * 0.65,
                    duration: 200
                }),
            ]).start();
        })
    }
    _dismiss = () => {
        Animated.timing(this.state.moadlHeight, {
            toValue: 0,
            duration: 200
        }).start(() => {
            this.setState({
                visible: false,
                priceInfo: null
            })
        });
    }


    /**
     *  价格信息
     */
    _priceInfo = () => {
        const { customerInfo } = this.props;
        const { priceInfo } = this.state;
        if (!priceInfo) return null;

        return (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10,marginHorizontal:10,marginTop:10,backgroundColor:Theme.lineColor2,borderRadius:6 }}>
                <View style={styles.row}>
                    <CustomText text='公司支付' style={{ marginTop: 5 }} />
                    <CustomText text={'¥' + priceInfo.Addition.CompanyAmount} style={{ marginTop: 5, color: Theme.theme }} />
                </View>

                <View style={styles.row}>
                    <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <CustomText text='个人支付' />
                    </View>
                    <CustomText text={'¥' + priceInfo.Addition.PersonalAmount} style={{ marginTop: 5, color: Theme.theme }} />
                </View>
                {
                    priceInfo.Addition.ServiceCharge && priceInfo.IsShowServiceFee ?
                        <View style={styles.row}>
                            <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                                <CustomText text='服务费' />
                            </View>
                            <CustomText text={'¥' + priceInfo.Addition.ServiceCharge} style={{ marginTop: 5, color: Theme.theme }} />
                        </View>
                    :null
                }
                <CustomText text='超标现付' style={{ color: Theme.theme,fontSize:11 }} />

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
                            <CustomText text={'费用信息'} style={{ fontSize: 16 }} />
                            <TouchableHighlight underlayColor='transparent' onPress={this._dismiss}>
                                <Ionicons name={'ios-close-circle-outline'} size={24} color={Theme.darkColor} />
                            </TouchableHighlight>
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            {this._priceInfo()}
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