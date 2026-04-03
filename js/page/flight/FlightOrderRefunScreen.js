import React from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Image,
    Text,
    DeviceEventEmitter,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import SuperView from '../../super/SuperView';
import HeaderView from './HeaderView';
import FlightService from '../../service/FlightService';
import Theme from '../../res/styles/Theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomeTextInput from '../../custom/CustomTextInput';
import CustomActioSheet from '../../custom/CustomActionSheet';
import ViewUtil from '../../util/ViewUtil';
import Key from '../../res/styles/Key';
import RuleView from './RuleView';
import RuleView2 from './RuleView2';
import NavigationUtils from '../../navigator/NavigationUtils';
import I18nUtil from '../../util/I18nUtil';
// import MailSelectView from '../common/MailSelectView';
// import StorageUtil from '../../util/StorageUtil';
import UserInfoDao from '../../service/UserInfoDao';
import UserInfoUtil from '../../util/UserInfoUtil';
import Util from '../../util/Util';
import CommonService from '../../service/CommonService';
import  LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import HighLight from '../../custom/HighLight';

export default class FlightOrderRefundScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '退票申请',
            statusBar: {
                backgroundColor: Theme.theme,
            },
            // hide:true,
            style: {
                backgroundColor: Theme.theme,
            },
            titleStyle: {
                color: 'white'
            },
            leftButton2:true,  
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            order: null,
            reasonDesc: null,
            reasonCode: null,
            inputReason: '',
            options: ['因公司原因', '因个人原因', '因航班变动', '其他'],
            MailingInfo: {},// 发票提交信息
            actionSheetOptions: [],
            DeliveryItem: null,
            ApproverInfo: null,
            customerInfo: {}
        }
    }


    componentDidMount() {
        this.showLoadingView();
        UserInfoDao.getCustomerInfo().then(customerInfo => {
            this.state.customerInfo = customerInfo;
            this.state.actionSheetOptions = UserInfoUtil.DeliveryItems(customerInfo);
            FlightService.orderDetail(this.params.Id).then(response => {
                this.hideLoadingView();
                if (response && response.success) {
                    if (customerInfo && customerInfo.Setting && customerInfo.Setting.InvoiceRequestSetting && customerInfo.Setting.InvoiceRequestSetting.DeliveryItems) {
                        customerInfo.Setting.InvoiceRequestSetting.DeliveryItems.forEach(obj => {
                            if (obj.MailingMethod === response.data.MailingMethod) {
                                this.state.DeliveryItem = obj;
                            }
                        })
                    }
                    this.setState({
                        customerInfo: customerInfo,
                        MailingInfo: response.data.MailingInfo,
                        order: response.data,
                    }, () => {
                        this.getApprover(response.data);
                    })
                } else {
                    this.toastMsg(response.message || '获取订单详情失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取订单详情异常');
            })
        })

    }

    getApprover(order) {
        if (order.FeeType === 2) {
            return;
        }
        if (this.state.customerInfo && this.state.customerInfo.Setting && this.state.customerInfo.Setting.IsRefundApproval) {
            let approverInfo = {
                PassengerList: order.Travellers,
                ApproveOrigin: order.ApproveOrigin,
                BusinessType: 3,
                IsWorkflow: true,
                ReferenceEmployeeId:order.ReferenceEmployeeId,
                ReferencePassengerId:order.ReferencePassengerId,
            }
            this.showLoadingView();
            CommonService.ApproveInfo(approverInfo).then(response => {
                this.hideLoadingView();
                if (response && response.success&& response.data) {
                    this.setState({
                        ApproverInfo: response.data[0]? response.data[0] : null
                    })
                } else {
                    this.toastMsg(response.message || '获取审批人信息失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取审批人信息异常');
            })
        }
    }

    /**
     *  选择
     */
    _handlePress = (index) => {
        if (index === 0) {
            this.setState({
                reasonCode: 1,
                reasonDesc: this.state.options[index]
            })
        } else if (index === 1) {
            this.setState({
                reasonCode: 4,
                reasonDesc: this.state.options[index]
            })
        } else if (index === 2) {
            this.setState({
                reasonCode: 2,
                reasonDesc: this.state.options[index]
            })
        } else {
            this.setState({
                reasonCode: 0,
                reasonDesc: this.state.options[index]
            })
        }
    }

    _handlePress2 = (index) => {
        const { customerInfo } = this.state;
        if (customerInfo && customerInfo.Setting && customerInfo.Setting.InvoiceRequestSetting && customerInfo.Setting.InvoiceRequestSetting.DeliveryItems) {
            this.state.DeliveryItem = customerInfo.Setting.InvoiceRequestSetting.DeliveryItems[index];
            this.setState({});
        }
    }

    /**
     *  选择退票原因
     */
    _selectReason = () => {
        this.actionSheet.show();
    }

    /**
     *  取消退票
     */
    _cancelRefund = () => {
        this.pop();
    }

    /**
     *  准备提交退票
     */
    _prepareSubmit = () => {
        const { reasonCode, reasonDesc, inputReason,order, ApproverInfo } = this.state;
        if(!order){ return };
        if (!reasonCode && reasonCode !== 0) {
            this.toastMsg("请选择退票原因");
            return;
        }
        // if (!inputReason) {
        //     this.toastMsg('请填写退票原因');
        //     return;
        // }
        // let lists = order.OrderAir&&order.OrderAir.PolicySummary&&order.OrderAir.PolicySummary.RefundPolicy&&order.OrderAir.PolicySummary.RefundPolicy.Details;
        // let currentDate = new Date();
        // let refundCharge;
        // let refundChargeDesc;
        // if(lists){
        //     try {
        //         lists.forEach(detailFee => {
        //             if(detailFee){
        //                 let rulesData = new Date(detailFee.Timeline);
        //                 if((Date.parse(currentDate) <= Date.parse(rulesData) && detailFee.TimelineType == 1) || (Date.parse(currentDate) >= Date.parse(rulesData) && detailFee.TimelineType == 3)){
        //                     refundCharge = detailFee.Fee
        //                     if(!refundCharge){
        //                         refundChargeDesc = detailFee.FeeDesc;
        //                     }
        //                     throw Error();
        //                 }
        //             }
        //         })
        //     }catch(error){
        //     }
        // }
        // if (reasonCode !== 2 && !refundChargeDesc && refundCharge) {
        //     this._alertTips(refundCharge);
        // } else {
        //     this._alertTips(null,refundChargeDesc);
        // }
        let model={
            OrderId:order.Id
        }
        FlightService.FlightOrderRefundPrice(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data) {
                this._alertTips(response.data.RefundFee);
            } else {
                this.toastMsg(response.message || '获取订单详情失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取订单详情异常');
        })
    }

    _alertTips = (refundCharge,refundChargeDesc) => {
        const { order } = this.state;
        let showtip = '';
        if (this.state.reasonCode === 2) {
            showtip = "航班变动退票需等待航空公司审核，退票提交成功不可恢复，请确认是否继续提交?";
        } 
        // else if(refundChargeDesc){
        //     showtip = refundChargeDesc;
        // } 
        else if(order.SupplierType==2 || order.SupplierType==0){
            showtip = I18nUtil.tranlateInsert('申请已提交，实际费用以最终航司确认为准');
        } else{
            if(!refundCharge || refundCharge==0){
                showtip = I18nUtil.tranlateInsert('申请已提交，实际费用以最终航司确认为准');
            }else{
                showtip = I18nUtil.tranlateInsert('提交退票将产生退票费用¥{{noun}},是否继续提交退票?', refundCharge);
            }  
        }
        this.showAlertView(showtip, () => {
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this._submitRefund(refundCharge);
            })
        })
    }

    /**
     *  提交退票
     */
    _submitRefund = (refundCharge,refundChargeDesc) => {
        const { order, reasonCode, inputReason, DeliveryItem, MailingInfo, ApproverInfo } = this.state;
        let approvalList = [];
        if(ApproverInfo?.WorkflowChooseOneOrAll && order.MassOrderId){
            const steps = ApproverInfo.ApprovalModel?.Steps || [];
            approvalList = steps?.filter(item => item?.approvalPerson)?.map(item => {
                item.approvalPerson.DepartmentName = item.approvalPerson.extendtext
                return item.approvalPerson
            }) || [];
            if (steps.length > approvalList.length) {
                this.toastMsg('请选择审批人');
                return;
            }
        }
        let refundModel = {
            Platform: Platform.OS,
            OrderId: order.Id,
            ApplyId: order.ApplyId,
            RefundInfo: {
                ReasonType: reasonCode,
                Reason: inputReason,
                RefundCharge: refundCharge,
                // RefundChargeDesc: refundChargeDesc
            },
            RelevancePassengers: order.RelevancePassengers,
            MailingMethod: DeliveryItem ? DeliveryItem.MailingMethod : null,
            MailingInfo: MailingInfo,
            approvers:ApproverInfo&&ApproverInfo.WorkflowChooseOneOrAll?approvalList:null,
        };
        this.showLoadingView();
        FlightService.orderRefund(refundModel).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('提交退票成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit(Key.FlightOrderListChange, { Id: order.Id });
                        NavigationUtils.popToTop(this.props.navigation);
                        DeviceEventEmitter.emit('goHome', {});
                    })
                })
            } else {
                this.toastMsg(response.message || '提交退票失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '提交退票异常');
        })
    }

    /**
     *  选择发票抬头
     */
    _toSelectRise = () => {
        const { MailingInfo } = this.state;
        NavigationUtils.push(this.props.navigation, 'InvoiceRiseList', {
            callBack: (obj) => {
                MailingInfo.TaxId = obj.TaxNumber;
                MailingInfo.Email = obj.Email;
                MailingInfo.InvoiceHeader = obj.Title;
                this.setState({});
            }
        })
    }

    /**
     *  选择地址
     */
    _toSelectAddress = () => {
        const { MailingInfo } = this.state;
        NavigationUtils.push(this.props.navigation, 'InvoiceAddressList', {
            callBack: (obj) => {
                MailingInfo.Addressee = obj.Addressee;
                MailingInfo.Mobile = obj.Mobile;
                MailingInfo.ProvinceCode = obj.ProvinceCode;
                MailingInfo.ProvinceName = obj.ProvinceName;
                MailingInfo.CityCode = obj.CityCode;
                MailingInfo.CityName = obj.CityName;
                MailingInfo.DistrictCode = obj.DistrictCode;
                MailingInfo.DistrictName = obj.DistrictName;
                MailingInfo.StreetAddress = obj.StreetAddress;
                this.setState({});
            }
        })

    }

    renderBody() {
        const { order, reasonDesc, options, actionSheetOptions, ApproverInfo } = this.state;
        if (!order) return null;
        const traveller = order.Travellers[0] || {};
        let ApprovePersonNames = []
        if (ApproverInfo && ApproverInfo.ApproveList && ApproverInfo.ApproveList.length > 0) {
            ApproverInfo.ApproveList.forEach(obj => {
                ApprovePersonNames.push(obj.ApprovePersonName);
            })
        }
        return (
            <LinearGradient  start={{x: 1, y: 0}} end={{x: 1, y: 0.5}} style={{flex:1}} colors={[Theme.theme,Theme.normalBg]}>
                {/* <View style={{flexDirection:'row',paddingHorizontal:15,justifyContent:'space-between',height:44,alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>{this.pop()}}>
                        <AntDesign name={'arrowleft'} size={20} color={'#fff'} />
                    </TouchableOpacity>
                    <CustomText text={'退票申请'} style={{fontSize:16, color:'#fff'}} />
                    <CustomText style={{fontSize:16, color:'#fff'}} text={''}></CustomText>
                </View> */}
                <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={{ margin: 10 }}>
                        <HeaderView
                            headerTextTile='原'
                            model={order.OrderAir}
                            otwThis={this}
                        />
                    </View>
                    <View style={{ marginHorizontal: 10,borderRadius:6,backgroundColor: "white", }}>
                        <View style={{  paddingHorizontal: 10, paddingVertical: 15,flexDirection:'row',alignItems: 'center',borderRadius:6 }}>
                            <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                            <CustomText text={`${I18nUtil.translate('乘机人')}：${traveller.Name}`}  style={{fontSize:14,color:Theme.commonFontColor}}/>
                        </View>
                        {
                            this._renderMail()
                        }
                        <View style={{ height: 1, backgroundColor: Theme.lineColor }}></View>
                        <TouchableHighlight underlayColor='transparent' onPress={this._selectReason}>
                            <View style={{  alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 15,borderRadius:6 }}>
                                {/* <CustomText text={reasonDesc ? reasonDesc : '请选择退票原因'} style={{fontSize:14,color:Theme.assistFontColor}} /> */}
                                <HighLight name={reasonDesc ? reasonDesc : '请选择退票原因'}style={{fontSize:14,color:Theme.assistFontColor}}  />
                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <CustomeTextInput style={styles.input} placeholder='请输入退票原因' returnKeyType={'done'} maxLength={125} onChangeText={text => this.setState({ inputReason: text })} />
                    {
                        ApproverInfo?.WorkflowChooseOneOrAll && !order.MassOrderId ?
                            <View style={{backgroundColor:'#fff',marginHorizontal:10,marginBottom:10,padding:10, borderRadius:6}}>
                                <CustomText text='审批信息' style={{ margin: 10 }} />
                                {
                                    Array.isArray(ApproverInfo?.ApproveList) && ApproverInfo.ApproveList.length > 0 ?
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: 'white' }}>
                                            <CustomText text='审批级别' />
                                            <CustomText text={`${ApproverInfo.ApproveList.length}级审批`} />
                                        </View> : null
                                }
                                {
                                    Array.isArray(ApprovePersonNames) && ApprovePersonNames.length > 0 ?
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center', backgroundColor: 'white' }}>
                                            <CustomText text='审批人' />
                                            <CustomText text={ApprovePersonNames.join(',')} />
                                        </View> : null
                                }
                            </View> 
                        :
                        null
                    }
                    {
                       order.MassOrderId && ApproverInfo?.WorkflowChooseOneOrAll && Array.isArray(ApproverInfo.ApprovalModel?.Steps) && ApproverInfo.ApprovalModel.Steps.length>0 ?
                        <View style={{backgroundColor:'#fff',marginHorizontal:10,borderRadius:6,paddingBottom:10}}>
                                <CustomText text='审批信息' style={{ margin: 10 }} />
                                {
                                    ApproverInfo.ApprovalModel?.Steps&&ApproverInfo.ApprovalModel.Steps.map((item,index)=>{
                                        if(this.params.approve){
                                            item.approvalPerson = item.Persons[0]
                                        }
                                        return(
                                            <View style={{ flex: 6,height:40,justifyContent:'center' ,flexDirection:'row',paddingHorizontal:10,borderBottomWidth:1,borderBottomColor:Theme.lineColor}}>
                                                <TouchableOpacity style={{flex: 7,flexDirection:'row'}} disabled={this.params.approve?true:false} 
                                                onPress={this._toSelecApproval.bind(this,item,index)}
                                                >
                                                    <CustomText text={index+1+'级审批人'} style={{ flex: 3, height:40, paddingTop:10}} />
                                                    <CustomText text={item.approvalPerson&&item.approvalPerson.Name} numberOfLines={2} style={{flex: 7, height:40, paddingTop:10,width:10}}/>
                                                </TouchableOpacity>
                                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} style={{height:40,paddingTop:9}} />
                                            </View>
                                        )
                                    })
                                }
                        </View>
                        :null
                    }
                  
                </KeyboardAwareScrollView>
                <CustomActioSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
                <RuleView ref={o => this.ruleView = o} />
                <RuleView2 ref={o => this.ruleView2 = o} />
                <CustomActioSheet ref={o => this.actionSheet2 = o} options={actionSheetOptions} onPress={this._handlePress2} />
                {
                    ViewUtil.getTwoBottomBtn('取消退票',this._cancelRefund,'确定退票',this._prepareSubmit)
                }
            </LinearGradient>
        )
    }

    _toSelecApproval=(item,index)=>{
        let personList = [];
        item.Persons.map((obj)=>{
            personList.push(obj.Id)
        })
        NavigationUtils.push(this.props.navigation, 'ChooseSinglePersonList', {
            title: '选择审批人',
            personList: personList,
            approvalCallBack: (data) => {
                item.approvalPerson = {
                    level:index+1,
                    Id:data.id,
                    Name:data.text,
                    extendtext:data.extendtext
                }
                this.setState({});
            }
        })
    }

    _renderMail = () => {
        let { order, MailingInfo, DeliveryItem } = this.state;
        const { InvoiceRequestType, PaymentType, FeeType } = order;
        if (InvoiceRequestType === 2 && (PaymentType === 2 || FeeType === 2)) {
            return (
                <View style={{ backgroundColor: 'white', marginTop: 10 }}>
                    <View style={{ backgroundColor: "white", alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 15 }}>
                        <CustomText text={'报销凭证'} />
                        <CustomText text='(请仔细核对发票信息)' style={{ color: Theme.theme, fontSize: 15, marginLeft: 10 }} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: "center", paddingHorizontal: 10, paddingVertical: 15 }}>
                        <CustomText text='配送方式' style={{ flex: 3 }} />
                        <TouchableHighlight underlayColor='transparent' style={{ flex: 7 }}>
                            <View style={{ backgroundColor: "white", alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                                <CustomText text={DeliveryItem ? (DeliveryItem.DisplayName + '(' + DeliveryItem.Remark + ')') : '请选择'} />
                                {/* <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} /> */}
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: "center", paddingHorizontal: 10, paddingVertical: 15 }}>
                        <CustomText text='发票信息' style={{ flex: 3 }} />
                        <TouchableHighlight underlayColor='transparent' onPress={this._toSelectRise} style={{ flex: 7 }}>
                            <View style={{ backgroundColor: "white", alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                                <CustomText text={MailingInfo && MailingInfo.InvoiceHeader} />
                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: "center", paddingHorizontal: 10, paddingVertical: 15 }}>
                        <CustomText text='配送信息' style={{ flex: 3 }} />
                        <TouchableHighlight underlayColor='transparent' onPress={this._toSelectAddress} style={{ flex: 7 }}>
                            <View style={{ backgroundColor: "white", alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', }}>
                                <CustomText text={(MailingInfo && MailingInfo.CityName) ? (MailingInfo.CityName + ' ' + MailingInfo.ProvinceName + ' ' + MailingInfo.StreetAddress) : '请选择配送信息'} />
                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                            </View>
                        </TouchableHighlight>
                    </View>
                    {
                        order.RelevancePassengers ?
                            <CustomText style={{ color: Theme.theme, fontSize: 14 }} text={`*修改报销凭证信息会导致此凭证关联乘机人${order.RelevancePassengers}同行程发票邮寄信息被修改`} />
                            : null
                    }
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    input: {
        margin: 10,
        height: 80,
        backgroundColor: 'white',
        padding: 10,
        borderRadius:6
    },
    btn: {
        flex: 1,
        backgroundColor: Theme.themebg,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        height: 40
    }
})
