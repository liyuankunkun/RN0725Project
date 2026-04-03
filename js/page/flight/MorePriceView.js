import React from 'react';

import {
    View,
    Image,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import FlightEnum from '../../enum/FlightEnum';
import FlightService from '../../service/FlightService';
export default class MorePriceView extends React.PureComponent {

    _ruleBtnClick = () => {
        const { moreThis, priceObj } = this.props;
        moreThis.ruleView.show(priceObj && priceObj.item);
    }
    _showCanbinDes = (obj) => {
        const { moreThis } = this.props;
        moreThis.toastMsg(Util.Parse.isChinese()? data.CabinTagDesc:data.CabinEnTagDesc);
    }
    _baddgeDesc = (data) => {
        const { moreThis } = this.props;
        if (data.CHTravellerRules) {
            moreThis.showAlertView(data.CHTravellerRules.BagDesc);
        } else {
            moreThis.showLoadingView();
            let model = {
                segId: data.ProductId,
                seatType: data.ServiceCabin,
                cabin: data.ResBookDesigCode
            }
            FlightService.GetChTravellerRules(model).then(respose => {
                moreThis.hideLoadingView();
                if (respose && respose.success) {
                    data.CHTravellerRules = respose.data;
                    moreThis.showAlertView(data.CHTravellerRules.BagDesc);
                } else {
                    this.toastMsg(respose.message || '获取春秋退改规则失败');
                }
            }).catch(error => {
                moreThis.toastMsg(error.message || '获取春秋退改规则失败');
                moreThis.hideLoadingView();
            })
        }
    }
    render() {
        const { priceObj, isChange, feeType, orderBtnClick, oldModel } = this.props;
        if (!priceObj) return;
        const { item: data } = priceObj;
        if (!data) return null;
        let oldPrice = isChange && oldModel ? oldModel.Price : 0;
        let flightstate = data.SupplierType === 2 ? data.SupplierType : (data.IsCompanyFarePrice ? data.IsCompanyFarePrice : 0);
        let isChunQiuSer = (data.SupplierType === FlightEnum.SupplierType.chunqiuAir) && (data.ServiceCabin === 'C');

        let FlightCabinCategoryDesc = data.FlightCabinCategoryDesc;
        let DiscountRateDesc = data.DiscountRateDesc;
        if (!Util.Parse.isChinese()) {
            FlightCabinCategoryDesc = '';
            if (Util.Parse.isNumber(data.ResBookDesigCode) && data.ResBookDesigCode > 0 && data.ResBookDesigCode <= 9) {
                FlightCabinCategoryDesc = 'left ' + data.ResBookDesigCode + ' ticket(s)';
            }
            if (Util.Parse.isNumber(data.DiscountRate) && data.DiscountRate < 1 && data.DiscountRate > 0) {
                DiscountRateDesc = (parseInt((1 - data.DiscountRate) * 100)) + '% off';
            }
        }
        return (
            <View style={styles.view}>
                <View style={{ height: 80 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <CustomText style={styles.resBook}
                            text={Util.Parse.isChinese() ? (isChunQiuSer ? ('商务' + data.ResBookDesinCodeDesc) : data.ResBookDesinCodeDesc) : data.EnResBookDesinCodeDesc}
                        />
                        <CustomText style={styles.resBook}
                            text={data.ResBookDesinCode}
                        />
                        <CustomText style={styles.discount} text={DiscountRateDesc} />
                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                            {data.MorePriceTag ? <View style={{ backgroundColor: 'red', marginRight: 10, marginTop: 10 }}>
                                <CustomText style={{ color: 'white', fontSize: 12 }} text={data.MorePriceTag} />
                            </View> : null}
                            <View style={data.MorePriceTag ? styles.priceView2 : styles.priceView}>
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5 }} text='¥' />
                                <CustomText style={{ color: Theme.theme, fontSize: 17 }} text={data.Price} />
                            </View>
                            <TouchableHighlight underlayColor='transparent' onPress={orderBtnClick} disabled={isChange ? (oldPrice > data.Price ? true : false) : (data.EnableBook ? false : ( feeType == 2 ? false : true))} >
                                <View style={[styles.orderbtn, { backgroundColor: isChange ? (oldPrice > data.Price ? 'gray' : Theme.theme) : (data.EnableBook ? Theme.theme : (feeType == 2 ? Theme.theme : 'gray')) }]}>
                                    <CustomText style={{ color: 'white' }}
                                        text={isChange ? '改签' : '预订'}
                                    />
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: -20, marginRight: 70, alignItems: 'center' }}>
                        <CustomText style={styles.refund} onPress={this._ruleBtnClick} text='行李及退改规则' />
                        {
                            flightstate == 2 ?
                                <View style={{ flexDirection: "row", marginLeft: 10, marginTop: 5 }}>
                                    <View style={{ borderWidth: 7.5, borderColor: 'transparent', borderRightColor: 'rgb(251,96,0)' }}></View>
                                    <View style={{ width: 60, height: 15, alignItems: 'center', backgroundColor: 'rgb(251,96,0)', justifyContent: "center" }}>
                                        <CustomText style={{ color: "white", fontSize: 10 }} text='渠道价' />
                                    </View>
                                </View> :
                                flightstate == 1 ?
                                    <View style={{marginLeft:10,marginTop:5,height:15,backgroundColor:Theme.specialColor2,paddingHorizontal:5,alignItems:'center',justifyContent:"center"}}>
                                    <CustomText text='大客户协议' style={{color:"white",fontSize:12}}/>
                                </View>:
                                    null
                        }
                       
                        {
                            data.CabinTag ?
                                <CustomText text={data.CabinTag} onPress={this._showCanbinDes.bind(this, data)} style={{ fontSize: 12, color: 'red', marginLeft: 5, marginTop: 5 }} />
                                : null
                        }
                        {/* {
                            data.SupplierType === 3 ? //春秋航空
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5, marginLeft: 10 }} onPress={this._baddgeDesc.bind(this, data)} text={data.ServiceCabin == 0 ? '' : '舱位专享'} />
                                : null
                        } */}
                        {/* {
                            data.SupplierType === FlightEnum.SupplierType.flightSteWard ? //春秋航空
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5, marginLeft: 10 }} text={'航司旗舰店'} />
                                : null
                        
                        }
                         {
                            data.SupplierType === FlightEnum.SupplierType.gw51Book ? //春秋航空
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5, marginLeft: 10 }} text={'渠道价'} />
                                : null
                        }
                        {
                            data.SupplierType === FlightEnum.SupplierType.chunqiuAir ? //春秋航空
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5, marginLeft: 10 }} text={'航司官网'} />
                                : null
                        }
                        {
                            data.SupplierType === FlightEnum.SupplierType.ibePlus ? //春秋航空
                                <CustomText style={{ color: Theme.theme, fontSize: 12, marginTop: 5, marginLeft: 10 }} text={'商旅优选'} />
                                : null
                        } */}
                        <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <CustomText style={{ marginLeft: 10, marginRight: 10, fontSize: 14, color: Theme.theme }} text={FlightCabinCategoryDesc} />
                        </View>
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    view: {
        flexDirection: 'column',
        backgroundColor: 'white',
        marginHorizontal:10,
        marginVertical:5,
        borderRadius:5,
    },
    
    resBook: {
        marginLeft: 30,
        marginTop: 15,
        height: 20
    },
    discount: {
        marginTop: 15,
        height: 20,
        color: 'gray',
        marginLeft: 10,
        fontSize: 15
    },
    priceView: {
        flexDirection: 'row',
        marginTop: 15,
        marginRight: 80,
        height: 20
    },
    priceView2: {
        flexDirection: 'row',
        marginTop: 5,
        marginRight: 80,
        height: 20
    },
    refund: {
        color: '#6DC17F',
        marginTop: 5,
        marginLeft: 40,
        fontSize: 12
    },
    orderbtn: {
        marginRight: 10,
        height: 30,
        backgroundColor: Theme.theme,
        width: 50,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    }
})