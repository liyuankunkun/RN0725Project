import React from 'react';
import {
    Modal,
    View,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    Text
} from 'react-native';
import CustomText from '../../custom/CustomText';
import I18nUtil from '../../util/I18nUtil';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { TitleView }  from '../../custom/HighLight';

export default class RuleView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            model: {},
            visible: false,
            modelHeight: new Animated.Value(0)
            // modelHeight: screenHeight * 0.8
        }
    }

    show(model) {
        if (!model) return;
        this.setState({
            model,
            visible: true
        }, () => {
            Animated.timing(this.state.modelHeight, {
                toValue: screenHeight * 0.8,
                duration: 200
            }).start();
        })
    }
    _hide = () => {

        Animated.timing(this.state.modelHeight, {
            toValue: 0,
            duration: 200
        }).start(() => {
            this.setState({
                model: {},
                visible: false
            })
        });
    }

    render() {
        return (
            <Modal visible={this.state.visible} transparent>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <Animated.View style={[styles.view]}>
                        <View style={styles.topView}>
                                <CustomText />
                                <CustomText text='退改规则' style={{  fontSize: 16 }} />
                                <TouchableHighlight underlayColor='transparent' onPress={this._hide}>
                                    <AntDesign name={'close'} size={22} color={Theme.assistFontColor} />
                                </TouchableHighlight>
                        </View>
                        <View style={{backgroundColor:'#fff',paddingHorizontal:10,borderRadius:10}}>
                            <ScrollView showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps='handled'>
                            
                                {this._renderProductInsu()}
                                {this._renderRules()}
                                
                            </ScrollView>
                            <View style={{height:20}}></View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
    // 产品说明
    _renderProductInsu() {
        const { model } = this.state;
        let reduce = '';
        if (model.IsCompanyFarePrice && model.PubPrice > model.Price) {
            reduce = I18nUtil.translate('已减') + (model.PubPrice - model.Price);
        }
        return (
            <View style={{ backgroundColor: 'white', padding: 10 }}>
                {/* <CustomText text='产品说明' style={{ fontSize: 16 }} /> */}
                <TitleView title={'产品说明'} style={{marginLeft:-10}}></TitleView>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CustomText text='机建' />
                    <CustomText text={'¥' + model.CnTax } style={{ color: Theme.theme }} />
                    <CustomText text='燃油' style={{ marginLeft:10 }}/>
                    <CustomText text={'¥' + model.YqTax} style={{ color: Theme.theme }} />
                </View>
                {
                    reduce ?
                        <View style={{ marginTop: 5, flexDirection: 'row', alignItems: "center" }}>
                            <View style={{ backgroundColor: Theme.theme, paddingHorizontal: 4,borderRadius:2 }}>
                                <CustomText text='大客户协议' style={{ color: "white", fontSize: 13 }} />
                            </View>
                            <CustomText text='航司协议价节省：' style={{ marginLeft: 10 }} />
                            <CustomText text={`¥${reduce}`} style={{ color: Theme.theme }} />
                        </View>
                    : null
                }
                {/* {
                    model.ChannelTag || model.IssueTag ?
                        <View style={{ marginTop: 5, flexDirection: 'row', alignItems: "center" }}>
                            <View style={{ backgroundColor: Theme.orangeColor, paddingHorizontal: 4,borderRadius:2 }}>
                                <CustomText text={model.ChannelTag} style={{ color: "white", fontSize: 12 }} />
                            </View>
                            <CustomText text={model.IssueTag} style={{ marginLeft: 10 }} />
                        </View>
                        : null
                } */}
                {/* {
                    model.IssueDesc ?
                        <View style={{ marginTop: 5, flexDirection: 'row', alignItems: "center" }}>

                            <CustomText text={model.IssueDesc} />
                        </View> : null
                } */}
            </View>
        )
    }
    _renderRules() {
        const { PolicySummary } = this.state.model;
        return (
            <View style={{ backgroundColor: "white", paddingHorizontal: 10, }}>
                {/* <CustomText text='退改规则' style={{ fontSize: 14,marginBottom:10 }} /> */}
                <TitleView title={'退改规则'} style={{marginLeft:-10}}></TitleView>
                <View style={{ borderColor: Theme.lineColor, borderWidth: 1 }}>
                <View style={{ borderBottomWidth: 1,borderTopWidth: 1,borderColor: Theme.lineColor }}>
                        <CustomText text='同舱改签费' style={{ padding: 10, fontSize: 14,color:Theme.theme }} />
                    </View>
                    {
                        PolicySummary && PolicySummary.ReissuePolicy && PolicySummary.ReissuePolicy.Details ?
                            <View>
                                {
                                    PolicySummary.ReissuePolicy.Details.map((obj, index) => {
                                        let date = Util.Date.toDate(obj.Timeline);
                                        let isable = true;
                                        if (date < new Date()) {
                                            isable = false;
                                        }
                                        let personFee = Util.Parse.isChinese()?`¥${obj.Fee}/人`:`¥${obj.Fee}/people`
                                        return (
                                            <View key={index} style={{ height: 40, flexDirection: 'row', alignItems: "center", borderBottomColor: Theme.lineColor, borderBottomWidth: 1 }}>
                                                <View style={{ flex: 6, paddingLeft: 10, backgroundColor: isable ? 'white' : '#fff', height: 39, justifyContent: "center", position: 'relative' }}>
                                                   <Text style={{fontSize: 13}}>
                                                        {
                                                           Util.Parse.isChinese()?`${date && date.format('yyyy-MM-dd HH:mm')} ${obj.TimelineType === 1 ? '前' : '后'}`:
                                                                    `${obj.TimelineType === 1 ? 'before' : 'after'} ${date && date.format('yyyy-MM-dd HH:mm')}`
                                                        }
                                                    </Text>
                                                    {
                                                        !isable ?
                                                            <View style={{ height: 1, backgroundColor: Theme.fontColor, position: 'absolute', width: 140, left: 10 }}></View>
                                                            : null
                                                    }
                                                </View>
                                                <View style={{ height: 40, width: 1, backgroundColor: Theme.lineColor }}></View>
                                                <View style={{ flex: 4, paddingLeft: 10, backgroundColor: isable ? 'white' : '#fff', height: 39, justifyContent: 'center', position: 'relative' }}>
                                                    <CustomText text={obj.Fee ? personFee : obj.FeeDesc} />
                                                    {
                                                        !isable ?
                                                            <View style={{ height: 1, backgroundColor: Theme.fontColor, position: 'absolute', width: 60, left: 10 }}></View>
                                                            : null
                                                    }

                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                            : null
                    }
                    {
                        PolicySummary && PolicySummary.ReissuePolicy && !PolicySummary.ReissuePolicy.Details ?
                            <View style={{ paddingVertical:10,paddingHorizontal:12 }}>
                                <CustomText text={PolicySummary.ReissuePolicy.Description} style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}}/>
                            </View>
                            : null
                    }
                     {
                        !PolicySummary || !PolicySummary.ReissuePolicy ?
                            <View style={{ paddingVertical:10,paddingHorizontal:12 }}>
                                <CustomText text={'退改规则以航司为准'} style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}}/>
                            </View>
                            : null
                    }
                    <View style={{ borderBottomWidth: 1, borderBottomColor: Theme.lineColor }}>
                        <CustomText text='退票费' style={{ padding: 10, fontSize: 14,color:Theme.theme }} />
                    </View>
                    {
                        PolicySummary && PolicySummary.RefundPolicy && PolicySummary.RefundPolicy.Details ?
                            <View>
                                {
                                    PolicySummary.RefundPolicy.Details.map((obj, index) => {
                                        let date = Util.Date.toDate(obj.Timeline);
                                        let isable = true;
                                        if (date < new Date()) {
                                            isable = false;
                                        }
                                        let personFee = Util.Parse.isChinese()?`¥${obj.Fee}/人`:`¥${obj.Fee}/people`;
                                        
                                        return (
                                            <View key={index} style={{ height: 40, flexDirection: 'row', alignItems: "center", borderBottomColor: Theme.lineColor, borderBottomWidth: 1 }}>
                                                <View style={{ flex: 6, paddingLeft: 10, backgroundColor: isable ? 'white' : '#fff', height: 39, justifyContent: "center", position: 'relative' }}>
                                                    <Text style={{fontSize: 13}}>
                                                        {
                                                            Util.Parse.isChinese()?`${date && date.format('yyyy-MM-dd HH:mm')} ${obj.TimelineType === 1 ? '前' : '后'}`:
                                                                `${obj.TimelineType === 1 ? 'before' : 'after'} ${date && date.format('yyyy-MM-dd HH:mm')}`
                                                        }
                                                    </Text>

                                                    {
                                                        !isable ?
                                                            <View style={{ height: 1, backgroundColor: Theme.fontColor, position: 'absolute', width: 140, left: 10 }}></View>
                                                            : null
                                                    }
                                                </View>
                                                <View style={{ height: 40, width: 1, backgroundColor: Theme.lineColor }}></View>
                                                <View style={{ flex: 4, paddingLeft: 10, backgroundColor: isable ? 'white' : '#fff', height: 39, justifyContent: 'center', position: 'relative' }}>
                                                    <CustomText text={(obj.Fee ? personFee : obj.FeeDesc)} numberOfLines={2}/>
                                                    {
                                                        !isable ?
                                                            <View style={{ height: 1, backgroundColor: Theme.fontColor, position: 'absolute', width: 60, left: 10 }}></View>
                                                            : null
                                                    }
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                            : null
                    }
                    {
                        PolicySummary && PolicySummary.RefundPolicy && !PolicySummary.RefundPolicy.Details ?
                            <View style={{ paddingVertical:10,paddingHorizontal:12 }}>
                                <CustomText text={PolicySummary.RefundPolicy.Description} style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}}/>
                            </View>
                            : null
                    }
                     {
                        !PolicySummary || !PolicySummary.RefundPolicy ?
                            <View style={{ paddingVertical:10,paddingHorizontal:12 }}>
                                <CustomText text={'退改规则以航司为准'} style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}}/>
                            </View>
                            : null
                    }

                    <View style={{ borderBottomWidth: 1,borderTopWidth: 1,borderColor: Theme.lineColor,flexDirection:'row' }}>
                        <CustomText text='签转条件' style={{ padding: 10, fontSize: 14,color:Theme.theme }} />
                    </View>
                    {
                        <View style={{ paddingVertical:10,paddingHorizontal:12 }}>
                            <CustomText text={'不得签转'} style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}}/>
                        </View>
                    }
                    {/* <View style={{ borderBottomWidth: 1, borderBottomColor: Theme.lineColor }}>
                        <CustomText text='不得签转' style={{ padding: 10, fontSize: 14,color:Theme.theme}} />
                    </View> */}
                </View>
                {/* {this._renderBuddge()} */}
                <CustomText text='*具体费用按航空公司官网规定收取' style={{ fontSize: 13, color: Theme.orangeColor,paddingVertical:20 }} />
            </View>
        )
    }
    // _renderBuddge() {
    //     const { PolicySummary } = this.state.model;
    
    //     return (
    //         <View style={{ marginVertical:10 }}>
    //             {
    //                PolicySummary && PolicySummary.BaggagePolicy ?
    //                <View>
    //                     <CustomText style={{fontSize: 13,color:Theme.specialColor}} text={(PolicySummary.BaggagePolicy.Desc) || '无行李额'} />
    //                </View>
    //                :null
    //             }
    //         </View>
    //     )
    // }

    // render() {
    //     const { model } = this.state;
    //     return (
    //         <View>
    //             {
    //                 model.SupplierType === 1 || model.SupplierType === 2 ?
    //                     this._renderShow1()
    //                     : this._renderShow2()
    //             }
    //         </View>
    //     )
    // }

    _renderShow2() {
        const { model } = this.state;

        let resBook = Util.Parse.isChinese() ? (model.ResBookDesinCodeDesc ? model.ResBookDesinCodeDesc : model.AirPlaceName) : model.EnResBookDesinCodeDesc;

        let reduce = '';
        if (model.IsCompanyFarePrice === 1 && model.PubPrice > model.Price) {
            reduce = I18nUtil.translate('已减') + (model.PubPrice - model.Price);
        }
        let refundRule = '';
        if (model.FlightRefundInfo && model.FlightRefundInfo.length > 0) {
            model.FlightRefundInfo.forEach(item => {
                refundRule += item.rule_description;
            })
        } else if (model.RefundRules && model.RefundRules.length > 0) {
            model.RefundRules.forEach(item => {
                refundRule += item.rule_description;
            })
        }
        let changeRule = '';
        if (model.FlightReIssueInfo && model.FlightReIssueInfo.length > 0) {
            model.FlightReIssueInfo.forEach(item => {
                changeRule += item.rule_description;
            })
        } else if (model.ReissueRules && model.ReissueRules.length > 0) {
            model.ReissueRules.forEach(item => {
                changeRule += item.rule_description;
            })
        }

        if (!refundRule) {
            refundRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }
        if (!changeRule) {
            changeRule = I18nUtil.translate('请联系客服') + I18nUtil.translate('电话') + '021-22111889';
        }

        // let animateHeight = this.state.modelHeight.interpolate({
        //     inputRange: [0, 1],
        //     outputRange: [0, screenHeight * 0.8]
        // })

        return (
            <Modal visible={this.state.visible} transparent>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={[styles.view2, { height: this.state.modelHeight }]}>
                        <ScrollView style={{ paddingHorizontal: 10, paddingVertical: 20 }} keyboardShouldPersistTaps='handled'>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <CustomText text={resBook} style={{ color: "white", fontSize: 16 }} />
                                    <CustomText style={{ color: Theme.theme, fontSize: 16, }} text={' ' + (model.SupplierType === 2 ? I18nUtil.translate('渠道价') : (model.IsCompanyFarePrice === 1 ? (I18nUtil.translate('大客户协议') + reduce) : ''))} />
                                </View>
                                <CustomText style={{ color: Theme.theme, marginRight: 18 }} text={'¥' + model.Price} />
                                <TouchableHighlight underlayColor='transparent' onPress={this._hide}>
                                    <Ionicons name={'ios-close-circle'} size={30} color={Theme.theme} />
                                </TouchableHighlight>
                            </View>
                            {
                                model.SupplierType === 3 && model.ServiceCabin === 'C' ? <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                                    <CustomText text='机上点餐' style={{ color: 'white' }} />
                                    <CustomText text='前排宽敞座位' style={{ color: 'white' }} />

                                </View>
                                    : null
                            }
                            <CustomText text={model.BaggageRule && model.BaggageRule.Desc} style={{ color: 'white', marginHorizontal: 10, marginTop: 10 }} />
                            <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                <CustomText text='机建' style={{ color: 'white' }} />
                                <CustomText text={'¥' + model.CnTax + '/'} style={{ color: Theme.theme}} />
                                <CustomText text='燃油' style={{ color: 'white' }} />
                                <CustomText text={'¥' + model.YqTax} style={{ color: Theme.theme }} />
                            </View>
                            <CustomText style={{ marginTop: 20, color: "white", fontSize: 16 }} text='退改签规则' />
                            <CustomText text='更改条件' style={{ marginTop: 15, color: 'white' }} />
                            <CustomText text={changeRule} style={{ marginTop: 10, color: 'white' }} />
                            <CustomText text='退票条件' style={{ marginTop: 15, color: 'white' }} />
                            <CustomText text={refundRule} style={{ marginTop: 10, color: 'white' }} />
                            <CustomText text='舱位' style={{ marginTop: 15, color: "white", fontSize: 16 }} />
                            <CustomText text={model.ResBookDesigCode ? model.ResBookDesigCode : model.AirPlace} style={{ marginTop: 10, color: 'white' }} />
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal >
        )
    }

}
const styles = StyleSheet.create({
    view: {
        backgroundColor: Theme.normalBg,
        width: '90%',
        height: '55%',
        borderRadius: 10,
        borderTopLeftRadius:10, borderTopRightRadius:10,
        marginTop:-80
    },
    view2: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '90%',
        height: '55%',
        borderRadius: 10,
    },
    topView:{ height: 48,justifyContent: "space-between", 
        paddingHorizontal: 15, alignItems: "center",
        backgroundColor:'#fff', flexDirection: "row",
        borderTopLeftRadius:10, 
        borderTopRightRadius:10,
        borderBottomWidth:1,
        borderColor:Theme.lineColor
    }

})
