import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    DeviceEventEmitter
} from 'react-native';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import NavigationUtils from '../../navigator/NavigationUtils';
import Theme from '../../res/styles/Theme';
import HotelService from '../../service/HotelService';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';

export default class HotelGuranteeMessageVertifyScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "信用卡担保短信核验"
        }
        this.state = {
            msgCode: "",// 短信验证码
            isVeri: false,
            msgNum: 90,
            MobileMask:null,
            HotelName:null,
            SerialNumber:null,
            UpdateTime:null,
        }
    }

    componentDidMount() {
        this._getMsg();
    }

    // 获取短信验证码

    _getMsg = () => {

        let model = {
            OrderId: this.params.OrderId,
            // CreditCard:this.params.CreditCard
        }
        this.showLoadingView();
        HotelService.OrderDetail(model).then(orderDetail => {
            this.hideLoadingView();
            if (orderDetail.success) {
                this.setState({
                    MobileMask: orderDetail.data.Guarantee.GuaranteeValidationMobileMask,
                    HotelName: Util.Parse.isChinese()? orderDetail.data.Hotel.Name:orderDetail.data.Hotel.EnName,
                    SerialNumber: orderDetail.data.SerialNumber,
                    UpdateTime: orderDetail.data.UpdateTime.split('T')[0]
                },()=>{
                //    this. _getMsgCode();
                })
            }
        })
    }

    _getMsgCode = () => {
        let model = {
            OrderId: this.params.OrderId,
        }
        this.showLoadingView();
        HotelService.hotelResPaymentCode(model).then(res => {
            this.hideLoadingView();
            if (res.success) {
                // this.toastMsg('短信发送成功');
                this.setState({
                    isVeri: true
                })
                setInterval(() => {
                    let num = this.state.msgNum - 1;

                    if (num >= 0) {
                        this.setState({
                            msgNum: num
                        })
                    } else {
                        this.setState({
                            msgNum: 90,
                            isVeri: false
                        })
                    }
                }, 1000);
            }else{
                this.toastMsg(res.message || '获取数据失败，请重试');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg('获取数据失败，请重试');
        })
    }

    _submit = ()=>{
        if(!this.state.msgCode){
            this.toastMsg('请输入短信验证码');
            return;
        }

        this.showLoadingView();
        HotelService.HotelPaymentConfitm({
            OrderId: this.params.OrderId,
            SMSCode:this.state.msgCode
        }).then(res=>{
            this.hideLoadingView();
             if(res.success){
                this.showAlertView('订单生成成功,您可去我的订单中查看', () => {
                    return ViewUtil.getAlertButton('取消', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit('refreshOrderList');
                        NavigationUtils.popToTop(this.props.navigation);
                    }, '确定', () => {
                        this.dismissAlertView();
                         if(this.params.isIntl){
                            this.push('InterHotelOrderListScreen');
                         }else{
                            this.push("HotelOrderListScreen");
                         }
                       
                    })
                })
             }else{
                 this.toastMsg(res.message || '提交数据失败，请重试')
             }
        }).catch(error=>{
            this.hideLoadingView();
            this.toastMsg('提交数据失败，请重试');
        })
    }

    renderBody() {
        const {MobileMask,SerialNumber,HotelName,UpdateTime} = this.state;
        let mobile = MobileMask&&MobileMask.substr(-4);
        let ReStr = Util.Parse.isChinese()?'获取验证码':'Verify'
        let str = I18nUtil.tranlateInsert2('您提交的酒店订单：[{{noun1}}]，[{{noun2}}] [{{noun3}}]，请按照如下指引完善担保信息，谢谢！已向您的担保银行预留手机号（尾号为{{noun4}}）发送了验证码，验证码有效期5分钟，未提交验证码将会导致酒店预定失败。',SerialNumber,HotelName,UpdateTime,mobile);
        return (
            <View
                style={{
                    flex: 1
                }}
            >
                <View style={styles.ViewStyle}>
                    <CustomText text='短信验证码：' />
                    <CustomeTextInput placeholder='请输入短信验证码'
                        style={styles.meStyle}
                        onChangeText={(text) => {
                            this.setState({
                                msgCode: text
                            })
                        }}
                    />
                </View>
                <CustomText text={str} style={{fontSize:13,padding:10, color:Theme.darkColor,marginLeft:5,marginTop:20}}/>
                <TouchableOpacity
                        onPress={() => {
                            if (this.state.isVeri) return;
                            this._getMsgCode();
                        }}
                    >
                        <View style={styles.regetStyle}>
                            <CustomText text={`${ReStr}${this.state.isVeri ? ('(' + this.state.msgNum + ')') : ''}`} style={{
                                color: '#fff'
                            }} />
                        </View>
                </TouchableOpacity>

                {/* <View style={{ flex:1}} /> */}

                <TouchableOpacity
                    onPress={() => {
                    this._submit()
                    }} 
                >
                    <View style={styles.sbStyle}>
                        <CustomText text='提交' style={{
                            color: '#fff'
                        }} />
                    </View>
                </TouchableOpacity>
                {/* {
                    ViewUtil.getSubmitButton('提交验证码', () => {
                        this._submit();
                    })
                }
                <View style={{ marginBottom: 20}} /> */}

               </View>
        )
    }
}
const styles = StyleSheet.create({
    ViewStyle:{
        flexDirection: 'row',
        alignItems: "center",
        paddingHorizontal: 15,
        marginTop: 30
    },
    meStyle:{
        marginLeft: 10,
        borderRadius: 5,
        borderColor: '#e6e6e6',
        borderWidth: 1,
        flex:1,
        height:34,
        padding:3
    },
    sbStyle:{
        marginHorizontal: 15,
        height: 44,
        backgroundColor: Theme.theme,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        borderRadius:5,
        marginBottom: 20,
    },
    regetStyle:{
        marginTop: 15,
        marginBottom: 20,
        marginHorizontal: 15,
        height: 44,
        backgroundColor: Theme.theme,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        borderRadius:5,
    }

})