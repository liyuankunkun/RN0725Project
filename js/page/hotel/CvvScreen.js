import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import HotelService from '../../service/HotelService';
import ViewUtil from '../../util/ViewUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';

export default class CvvScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "CVV验证"
        }
        this.state = {
            cvvCode: "",
            HotelName:null,
            SerialNumber:null,
            UpdateTime:null,
        }
    }

    componentDidMount() {
        this._getMsg();
    }
    _getMsg = () => {

        let model = {
            OrderId: this.params.OrderId,
        }
        this.showLoadingView();
        HotelService.OrderDetail(model).then(orderDetail => {
            this.hideLoadingView();
            if (orderDetail.success) {
                this.setState({
                    HotelName: Util.Parse.isChinese()? orderDetail.data.Hotel?.Name:orderDetail.data.Hotel?.EnName,
                    SerialNumber: orderDetail.data.SerialNumber,
                    UpdateTime: orderDetail.data.UpdateTime.split('T')[0],
                })
            }
        })
    }
    renderBody() {
        const {SerialNumber,HotelName,UpdateTime,MobileMask} = this.state;
        let str = I18nUtil.tranlateInsert2('您提交的酒店订单：[{{noun1}}]，[{{noun2}}] [{{noun3}}]，请按照如下指引完善担保信息，谢谢！',SerialNumber,HotelName,UpdateTime);
        return(
            <View>
                <CustomText text={str} style={{fontSize:13,padding:10, color:Theme.darkColor,marginLeft:5,marginTop:20}}/>
                <View style={styles.ViewStyle}>
                    <CustomText text='请输入信用卡CVV：' />
                    <CustomeTextInput
                        style={styles.meStyle}
                        onChangeText={(text) => {
                            this.setState({
                                cvvCode: text
                            })
                        }}
                    />
                </View>
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
            </View>
        )
    }

    _submit = ()=>{
        if(!this.state.cvvCode){
            this.toastMsg('CVV不能为空');
            return;
        }
        let model = {
            OrderId: this.params.OrderId,
            CVVCode:this.state.cvvCode
        }
        this.showLoadingView();
        HotelService.HotelCreditCVVSubmit(model).then(res=>{
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
}

const styles = StyleSheet.create({
    ViewStyle:{
            // flexDirection: 'row',
            // alignItems: "center",
            paddingHorizontal: 15,
            marginTop: 30
        },
        meStyle:{
            // marginLeft: 10,
            borderRadius: 5,
            borderColor: '#e6e6e6',
            borderWidth: 1,
            // flex:1,
            height:34,
            padding:3,
            marginTop:10
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
            marginTop:10
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