import React from 'react';
import {
    View,
    Animated,
    Platform,
    Dimensions,
    StyleSheet,
    Easing,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import PropTypes from 'prop-types';
import DeviceUtil from '../../util/DeviceUtil';
import Util from '../../util/Util';
export default class PriceDetailView extends React.Component {

    static propTypes = {
        customerInfo: PropTypes.object.isRequired,
        employees: PropTypes.array.isRequired,
        // travellers: PropTypes.array.isRequired,
        goFlightData: PropTypes.object.isRequired,
        backFlightData: PropTypes.object,
        callBack: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            height: new Animated.Value(0),
        }
    }
    getVisible() {
        return this.state.visible;
    }
    show() {
        this.setState({
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.height, {
                    toValue: 300,
                    duration: 200,
                    easing: Easing.linear,
                    useNativeDriver: false
                })
            ]).start();
        })
    }
    hide() {
        Animated.parallel([

            Animated.timing(this.state.height, {
                toValue: 0,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: false
            })
        ]).start(() => {
            this.setState({
                visible: false
            })
        });

    }

    _detailInsurance = () => {
        const { employees, travellers, backFlightData } = this.props;
        let insuceran = [];
        employees.forEach(item => {
            if (item.cusInsurances) {
                item.cusInsurances.forEach(obj => {
                    if (obj.show) {
                        let insuce = insuceran.find(is => (is.data && is.data.detail && is.data.detail[0] && obj.detail && obj.detail[0] && (is.data.detail[0]["Id"] === obj.detail[0]['Id'])));
                        if (insuce) {
                            // insuce.count++;
                        } else {
                            insuceran.push({ data: obj, count: obj.Count });
                        }
                    }
                })
            }
        })
        travellers.forEach(item => {
            if (item.cusInsurances) {
                item.cusInsurances.forEach(obj => {
                    if (obj.show) {
                        let insuce = insuceran.find(is => (obj.show && is.data && is.data.detail && is.data.detail[0] && obj.detail && obj.detail[0] && (is.data.detail[0]["Id"] === obj.detail[0]['Id'])));
                        if (insuce) {
                            // insuce.count++;
                        } else {
                            insuceran.push({ data: obj, count: obj.Count });
                        }
                    }
                })
            }
        })
        let pub = 0;
        employees.forEach(item => {
            pub++;
        })
        travellers.forEach(item => {
            pub++;
        })

        if (backFlightData) {
            insuceran.forEach(item => {
                item.count *= 2;
            })
        }

        return (
            <View>
                {
                    insuceran.map((item, index) => {
                        return (
                            <View style={styles.row} key={index}>
                                <View style={{width:240}}>
                                <CustomText text={item.data && item.data.detail && item.data.detail[0] && (Util.Parse.isChinese()? item.data.detail[0]['ProductName']:item.data.detail[0]['ProductEnName']?item.data.detail[0]['ProductEnName']:item.data.detail[0]['ProductName'])} />
                                </View>
                                <View>
                                    <CustomText text={'¥' + (item.data && item.data.detail[0].SalePrice) + ' X ' + (item.count) + ' X ' + (pub)} style={{ color: Theme.theme }} />
                                </View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }

    _seriveprice = () => {
        const { employees, travellers, backFlightData, ServiceFeesData, goFlightData, feeType,merchantPrice } = this.props;
        let vip = 0;
        let pub = 0;
        // let baseAmount = (goFlightData.Price + goFlightData.Tax);
        let baseAmount = (goFlightData?.Price ?? 0)+(goFlightData?.Tax ?? 0);
        if (backFlightData) {
            // baseAmount += (backFlightData.Price + backFlightData.Tax)
            baseAmount += (backFlightData?.Price ?? 0)+(backFlightData?.Tax ?? 0)
        }
        employees.forEach(item => {
            if (item.IsVip) {
                vip++;
            } else {
                pub++;
            }
        })
        travellers.forEach(item => {
            if (item.IsVip) {
                vip++;
            } else {
                pub++;
            }
        })
        var serviceFee = 0;
        var VipServiceFee = 0;
        ServiceFeesData &&  ServiceFeesData.ServiceFees && ServiceFeesData.ServiceFees.map((item, index) => {
            if (item.FeeValueType == 1) {
                if (ServiceFeesData && ServiceFeesData.TollType == 3 && backFlightData) {
                    serviceFee += Number(item.Price * item.CountOfShowDetail);
                }else{
                    serviceFee += Number(item.Price);
                }
            }
            else if (item.FeeValueType == 2) {
                let baseAmount1 = baseAmount
                item.Price = Number((item.FeeValue * baseAmount1).toFixed(2));
                serviceFee += item.Price
            }
        })

        ServiceFeesData && ServiceFeesData.ServiceFees && ServiceFeesData.VipServiceFees.map((item, index) => {
            if (item.FeeValueType == 1) {
                if (ServiceFeesData && ServiceFeesData.TollType == 3 && backFlightData) {
                    VipServiceFee += Number(item.Price * item.CountOfShowDetail);
                }else{
                    VipServiceFee += Number(item.Price);
                }
            }
            else if (item.FeeValueType == 2) {
                let baseAmount2 = baseAmount
                item.Price = Number((item.FeeValue * baseAmount2).toFixed(2));
                VipServiceFee += item.Price;
            }
        })
        let servicePrice = merchantPrice+serviceFee
        return (
            ServiceFeesData && ServiceFeesData.IsShowServiceFee || feeType === 2 ? <View>
                {
                    pub > 0 ?
                        <View>
                           {
                            !servicePrice?null: <View style={styles.row}>
                                <CustomText text='服务费' />
                                <View>
                                    <CustomText text={'¥' + (servicePrice.toFixed(2)) + ' X ' + pub} style={{ color: Theme.theme }} />
                                </View>
                            </View>
                            }
                            {
                                ServiceFeesData && ServiceFeesData.ServiceFees && ServiceFeesData.ServiceFees.map((obj, index) => {
                                    let amout;
                                    if (obj.FeeValueType == 1) {
                                        if (ServiceFeesData && ServiceFeesData.TollType == 3 && backFlightData) {
                                            amout = obj.Price * obj.CountOfShowDetail;
                                        }else{
                                            amout = obj.Price
                                        }
                                        
                                    } else if (obj.FeeValueType == 2) {
                                        let baseAmount1 = baseAmount
                                        // if (backFlightData) {
                                        //     baseAmount1 = baseAmount + (backFlightData.Price + backFlightData.Tax)
                                        // }
                                        amout = Number((obj.FeeValue * baseAmount1).toFixed(2));


                                    }
                                    if (amout) {
                                        amout = amout.toFixed(2);
                                    }


                                    return (
                                        <View style={{flexDirection:'row',justifyContent: "space-between",paddingLeft: 3,paddingRight: 10,alignItems: 'center',paddingVertical:3}}>
                                            <CustomText text={'  ' + (Util.Parse.isChinese() ? obj.Name : obj.EnName)} style={{color:Theme.aidFontColor}} />
                                            <View>
                                                <CustomText text={'¥' + amout + ' X ' + pub} style={{color:Theme.aidFontColor}}/>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        : null
                }
                {
                    vip > 0 ?
                        <View>
                            <View style={styles.row}>
                                <CustomText text='Vip服务费' />
                                <View>
                                    <CustomText text={'¥' + VipServiceFee.toFixed(2) + ' X ' + vip} style={{ color: Theme.theme }} />
                                </View>
                            </View>
                            {
                                ServiceFeesData && ServiceFeesData.VipServiceFees && ServiceFeesData.VipServiceFees.map((obj, index) => {
                                    let amout;
                                    if (obj.FeeValueType == 1) {
                                        if (ServiceFeesData && ServiceFeesData.TollType == 3 && backFlightData) {
                                            amout = obj.Price * obj.CountOfShowDetail;
                                        }else{
                                            amout = obj.Price
                                        }
                                        
                                    } else if (obj.FeeValueType == 2) {
                                        let baseAmount1 = baseAmount
                                        // if (backFlightData) {
                                        //     baseAmount1 = baseAmount + (backFlightData.Price + backFlightData.Tax)
                                        // }
                                        amout = Number((obj.FeeValue * baseAmount1).toFixed(2));


                                    }
                                    if (amout) {
                                        amout = amout.toFixed(2);
                                    }


                                    return (
                                        <View style={styles.row}>
                                            <CustomText text={'  ' + (Util.Parse.isChinese() ? obj.Name : obj.EnName)} />
                                            <View>
                                                <CustomText text={'¥' + amout + ' X ' + vip} />
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        : null
                }
                {!merchantPrice ? null :
                                <View style={[styles.row,{marginLeft:10}]}>
                                    <CustomText text='刷卡手续费' />
                                    <View>
                                        <CustomText text={'¥' + merchantPrice } style={{ color: Theme.theme }} />
                                    </View>
                                </View>
                }
            </View> : null
        )
    }
    _chBindPruduct = () => {
        const { goFlightData, backFlightData, employees, travellers } = this.props;
        let arr = [];
        if (goFlightData && goFlightData.SupplierType === 3 && goFlightData.CHBindProduct) {
            goFlightData.CHBindProduct.forEach((obj, index) => {
                <View style={styles.row} key={index}>
                    <CustomText text={obj.subProdName} />
                    <View>
                        {/* <CustomText text={'¥' + obj.subProdPrice + 'X' + (employees.length + travellers.length)} style={{ color: Theme.theme }} /> */}
                        <CustomText text={'¥' + obj.subProdPrice + ' X ' + (employees.length)} style={{ color: Theme.theme }} />
                    </View>
                </View>
            })
        }
        if (backFlightData && backFlightData.SupplierType === 3 && backFlightData.CHBindProduct) {
            backFlightData.CHBindProduct.forEach((obj, index) => {
                <View style={styles.row} key={index}>
                    <CustomText text={obj.subProdName} />
                    <View>
                        {/* <CustomText text={'¥' + obj.subProdPrice + 'X' + (employees.length + travellers.length)} style={{ color: Theme.theme }} /> */}
                        <CustomText text={'¥' + obj.subProdPrice + ' X ' + (employees.length)} style={{ color: Theme.theme }} />
                    </View>
                </View>
            })
        }
        return (
            <View>
                {arr}
            </View>
        )
    }
    render() {
        const { visible } = this.state;
        if (!visible) return null;
        const { employees, travellers, goFlightData, backFlightData, mailSendInfo, customerInfo,ServiceFeesData } = this.props;
        let WH = Dimensions.get('window').height;
        return (
            <View style={[styles.view, { width: screenWidth, 
                height: DeviceUtil.is_iphonex() ? (WH - 84):(Platform.OS === 'ios' ? WH-64:WH-30+50)
                }]}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                    this.props.callBack && this.props.callBack();
                    // this.hide()
                   
                }}></TouchableOpacity>
              
                <Animated.View style={{ height: this.state.height, backgroundColor: '#fff' }}>
                <ScrollView style={{marginBottom:10}} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
                    <View style={[styles.row,{marginTop:10}]}>
                        <CustomText text='机票价'/>
                        <View>
                            {/* <CustomText text={'¥' + goFlightData.Price + 'X' + (employees.length + travellers.length)} style={{ color: Theme.theme }} /> */}
                            <CustomText text={'¥' + goFlightData.Price + ' X ' + employees.length} style={{ color: Theme.theme }} />
                            {
                                backFlightData ?
                                    <CustomText text={'¥' + backFlightData.Price + ' X ' + employees.length } style={{ color: Theme.theme }} />
                                    : null
                            }
                        </View>
                    </View>
                    <View style={styles.row}>
                        <CustomText text='民航基金+燃油' />
                        <View>
                            <CustomText text={'¥' + goFlightData.Tax + ' X ' + employees.length } style={{ color: Theme.theme }} />
                            {
                                backFlightData ?
                                    <CustomText text={'¥' + backFlightData.Tax + ' X ' + employees.length } style={{ color: Theme.theme }} />
                                    : null
                            }
                        </View>
                    </View>
                   
                    {
                        this._detailInsurance()
                    }
                    {
                        this._seriveprice()
                    }
                    {
                        this._chBindPruduct()
                    }
                    {
                        mailSendInfo.sendType && mailSendInfo.sendType.MailingMethod !== 1 ?
                            <View style={styles.row}>
                                <CustomText text='邮寄费' />
                                <View>
                                    <CustomText text={'¥' + (customerInfo && customerInfo.Setting ? customerInfo.Setting.ExpressPrice : 0)} style={{ color: Theme.theme }} />
                                </View>
                            </View>
                            : null
                    }
                   </ScrollView>
                </Animated.View>
                
            </View>
        )

    }
}



const styles = StyleSheet.create({
    view: {
        position: 'absolute',
        top: DeviceUtil.is_iphonex() ? -88 : (Platform.OS === 'ios' ? -64 : -70),
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        padding: 10
    }
})
