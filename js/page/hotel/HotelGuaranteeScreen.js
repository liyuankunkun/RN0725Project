import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomActioSheet from '../../custom/CustomActionSheet';
import HotelService from '../../service/HotelService';
import NavigationUtils from '../../navigator/NavigationUtils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PickerHelper from '../../common/PickerHelper';
import CommonService from '../../service/CommonService';
import ChinaBankList from '../../res/js/ChinaBankList';
import Util from '../../util/Util';
export default class HotelGuranteeScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "信用卡信息"
        }
        this.state = {
            cardName:null,
            IdName: "",
            cvv: '',
            validYear: '',
            validMonth: '',
            Name: '',
            SeriNumber: '',
            Type: "身份证",
            Mobile:'',
            options: ['身份证', '护照', '其它'],
            GuaranteeTypeArr:[],
            yilong:false,
            bankStr:null,
            isUnionPay:false,
            guaranteeOptions:[
                              '维萨卡(Visa)',
                            //   '万事达卡(Master Card)',
                              '日财卡(Japanese Credit Bureau Credit Card)',
                              '美国运通卡(American Express)',
                              '大莱卡(Diners Club)',
                              '发现卡(Discover Card)',
                              '环球航空旅行计划卡(Universal Air Travel Card)',
                              '中国银联卡(China Union Pay Card)',
                            //   '中国银联卡(China Union Pay Card)',
                              '万事达卡(Master Card)'
                             ]
        }
    }

    componentWillUnmount(){
        PickerHelper.hide();
    }

    componentDidMount(){
        let model = {
            OrderId: this.params.OrderId
        }
        let TVPCardTypeList = ['VI','JC','AX','DC','DS','MC']//TVP时默认显示卡
        let BKCardTypeList = ['VI','AX','DC','DS','TP','MC']//BK时默认显示卡
        HotelService.OrderDetail(model).then(orderDetail => {
            if(orderDetail.success && orderDetail.data && orderDetail.data.Guarantee){
                if(orderDetail.data.Guarantee.Desc.includes('CC ACCEPTED')){
                    let cardTypeStr = orderDetail.data.Guarantee.Desc.substring(orderDetail.data.Guarantee.Desc.indexOf("CC ACCEPTED") + 12);
                    let cardTypeArr = cardTypeStr.split(" ");
                    this.setState({
                        GuaranteeTypeArr:cardTypeArr,
                    })
                }else if(orderDetail.data.RatePlan&&orderDetail.data.RatePlan.VendorCode){
                    if(orderDetail.data.RatePlan.VendorCode==='TVP'){
                        this.setState({
                            GuaranteeTypeArr:TVPCardTypeList,
                        })
                    }
                    if(orderDetail.data.RatePlan.VendorCode==='BK'){
                        this.setState({
                            GuaranteeTypeArr:BKCardTypeList,
                        })
                    }
                    if(orderDetail.data.RatePlan.VendorCode==='YLONG'||orderDetail.data.RatePlan.VendorCode==='ELONG'){//艺龙只接收银联卡
                        this.setState({
                            yilong:true,
                        })
                    }
                }
                this.setState({
                    isUnionPay:orderDetail.data.Guarantee.IsUnionPay
                })
            }
        }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '获取订单详情失败');
        })
    }
    /**
     * 选择证件类型
     */
    _selectType = () => {
        this.actionSheet.show();
    }

    _handlePress = (index) => {
        this.setState({
            Type: this.state.options[index]
        })
    }

    _selectCard = ()=>{
        const {yilong} = this.state;
         this.push('HotelSelectCardScreen',{
             cardName:this.state.cardName,
             GuaranteeTypeArr:this.state.GuaranteeTypeArr,
             yilong:yilong,
             callBack:(obj)=>{
                this.setState({
                    cardName:obj
                })
             }
         })
    }

    _submitButton = () => {
        const { IdName, cvv, validMonth, validYear, Name, SeriNumber, Type ,cardName,Mobile,yilong,isUnionPay,guaranteeOptions} = this.state;
        let elongBank = ['中国工商银行','中国银行','交通银行','兴业银行','招商银行','广东发展银行','中国民生银行','中信银行'];
        if (!IdName) {
            this.toastMsg('信用卡卡号不能为空');
            return;
        }
        if(!isUnionPay && !yilong){
             if(!cardName){
                 this.toastMsg('请选择信用卡类型');
                 return;
             }else if(cardName.Name===guaranteeOptions[0]){//Visa以4开头，有16位数字
                var stuCardReg = /^4\d{15}$/
                var stuCardReg2 = /^4\d{11}$/
                if (!stuCardReg.test(IdName) && !stuCardReg2.test(IdName)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }
            // else if(cardName.Name===guaranteeOptions[1] || cardName.Name===guaranteeOptions[8]){//数字51到55或2221到2720开头。全部有16位数字 万事达卡
            //     var stuCardReg = /^5[1-5][0-9]{14}|^(222[1-9]|22[3-9]\\d|2[3-6]\\d{2}|27[0-1]\\d|2720)[0-9]{12}$/
            //     if (!stuCardReg.test(IdName)) {
            //         this.toastMsg('信用卡卡号格式有误，请重新输入');
            //         return;
            //     }
            else if(cardName.Name===guaranteeOptions[7]){//数字51到55或2221到2720开头。全部有16位数字 万事达卡
                var stuCardReg = /^5[1-5][0-9]{14}|^(222[1-9]|22[3-9]\\d|2[3-6]\\d{2}|27[0-1]\\d|2720)[0-9]{12}$/
                if (!stuCardReg.test(IdName)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }else if(cardName.Name===guaranteeOptions[1]){//JCB以35开头，有16位数字 以2131或1800开头的15位
                var stuCardReg = /^35\d{14}$/
                var stuCardReg2 = /^2131\d{11}$/
                var stuCardReg3 = /^1800\d{11}$/
                if (!stuCardReg.test(IdName) && !stuCardReg2.test(IdName) && !stuCardReg3.test(IdName)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }else if(cardName.Name===guaranteeOptions[2]){//美国运通卡号以34或37开头，有15位数字
                var stuCardReg1 = /^34\d{13}$/
                var stuCardReg2 = /^37\d{13}$/
                if (!stuCardReg1.test(IdName) && !stuCardReg2.test(IdName)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }else if(cardName.Name===guaranteeOptions[3]){//卡号从300到305、36或38开头，全部有14个数字。或者以5开头有16位数字 大来卡
                var stuCardReg = /^5\d{15}$/
                var stuCardReg2 = /^30[0-5]\d{11}$/
                var stuCardReg3 = /^36\d{12}$/
                var stuCardReg4 = /^38\d{12}$/
                if (!stuCardReg.test(IdName)&&
                    !stuCardReg2.test(IdName)&&
                    !stuCardReg3.test(IdName)&&
                    !stuCardReg4.test(IdName)
                    ) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }else if(cardName.Name===guaranteeOptions[4]){ //发现卡
                var stuCardReg = /^65\d{14}$/
                var stuCardReg2 = /^6011\d{12}$/
                if (!stuCardReg.test(IdName) && !stuCardReg2.test(IdName)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }
         }
        
        if (!cvv && (isUnionPay||yilong)) {
            this.toastMsg('CVV码不能为空');
            return;
        }
        if (!validYear) {
            this.toastMsg('有效年份不能为空');
            return;
        }
        if (!validMonth) {
            this.toastMsg('有效月份不能为空');
            return;
        }
        if (!Name) {
            this.toastMsg('持卡人姓名不能为空');
            return;
        }
        if (!SeriNumber && (isUnionPay||yilong)) {
            this.toastMsg('证件号不能为空');
            return;
        }
        let idType = '';
        if (Type === '身份证') {
            idType = 'IdentityCard';
        } else if (Type === '护照') {
            idType = 'Passport';
        } else {
            idType = 'Other';
        }
        if((isUnionPay||yilong) && !Mobile){
            this.toastMsg('手机号不能为空');
            return;
        }
        if(Mobile && !Util.RegEx.isMobile(Mobile)) {
            this.toastMsg('手机号格式不正确');
            return;
        } 
        let models = {
            OrderId: this.params.OrderId,
            CreditCard: {
                Number: IdName,
                HolderName: Name,
                IdType: idType,
                IdNo: SeriNumber,
                CVV: cvv,
                ExpirationYear: String(validYear),
                ExpirationMonth: String(validMonth),
                CardType:cardName?.CardType,
                Mobile:Mobile,
            },
            IsUnionPay:isUnionPay
        }
        let validate = {
            CreditCardNo: IdName,
        }
        if(isUnionPay || yilong ||cardName.Name===guaranteeOptions[6]){
            let model = {
                cardNo:IdName,
            }
            CommonService.validateAndCacheCardInfo(model).then(response => {
                this.hideLoadingView();
                if (!response || !response.validated) {
                    this.toastMsg(' 卡号录入错误，请检查');
                    return;
                   
                }else if(response&&response.validated){
                    ChinaBankList.map(item=>{
                        if(item.name==response.bank){
                            if(yilong){
                               if(elongBank.includes(item.value)){
                                this.clickSure(validate,models)
                               }else{
                                  this.toastMsg('只接受发卡行（中信银行，中国银行，中国工商银行，中国民生银行，兴业银行，广发银行，招商银行，交通银行）的银联卡，请更换');
                                  return;
                               } 
                            }else{
                                this.clickSure(validate,models)
                            }
                        }
                    })
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message);
            })
        }else{
            this.clickSure(validate,models)
        }
    }

    clickSure = (validate,model)=>{
        this.showLoadingView();
        HotelService.getCreditCardValidate(validate).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data.IsValid == 0) {
                    this.toastMsg("信用卡号验证失败");
                    return;
                }
                if (response.data.IsNeedVerifyCode != 0) {
                    model.IsNeedVerifyCode = response.data.IsNeedVerifyCode;
                }
                this.showLoadingView();
                HotelService.hotelOrderGuarantee(model).then(result => {
                    this.hideLoadingView();
                    if (result && result.success) {
                        if( result.data && result.data.IsPayConfirm){
                         this.push('HotelGuranteeMessageVertify',{OrderId:this.params.OrderId,CreditCard : model.CreditCard,isIntl:this.params.isIntl});
                        }else{
                            this.showAlertView('订单生成成功,您可去我的订单中查看', () => {
                                return ViewUtil.getAlertButton('取消', () => {
                                    this.dismissAlertView();
                                    DeviceEventEmitter.emit('deleteApply', {}),
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
                        }
                    } else {
                        this.toastMsg(result.message || '信用卡担保失败，请重新查看');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || '信用卡担保失败,请重新查看');
                })
            } else {
                this.toastMsg(response.message || '信用卡卡号验证失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '操作失败');
        })
    }

    pickerYear = ()=>{
        PickerHelper.create(PickerHelper.createYYYYDate(), null, (data) => {
           if(data){
            this.setState({
                validYear:data[0]
            });
           }
        })
    }

    pickerMonth = ()=>{
        PickerHelper.create(PickerHelper.createMMDate(), null, (data) => {
           if(data){
            this.setState({
                validMonth:data[0]
            });
           }
        }) 
    }

    _cardChange = (cardType) => {
       let HotelCardTypeList  =  [
            {Name:'维萨卡(Visa)',Value:11,CardType:'VI'},
            {Name:'万事达卡(Master Card)',Value:9,CardType:'CA'},
            {Name:'万事达卡(Master Card)',Value:9,CardType:'MC'},
            {Name:'日财卡(Japanese Credit Bureau Credit Card)',Value:8,CardType:'JC'},
            {Name:'美国运通卡(American Express)',Value:1,CardType:'AX'},
            {Name:'大莱卡(Diners Club)',Value:5,CardType:'DC'},
            {Name:'发现卡(Discover Card)',Value:6,CardType:'DS'},
            {Name:'环球航空旅行计划卡(Universal Air Travel Card)',Value:10,CardType:'TP'},
            {Name:'中国银联卡(China Union Pay Card)',Value:0,CardType:'UP'},
            {Name:'中国银联卡(China Union Pay Card)',Value:0,CardType:'CU'},
        ];
        HotelCardTypeList.map((item)=>{
            if(item.CardType == cardType){
                this.setState({
                    cardName:item
                })
            }
        })
    }

    _getCardNumber = (CardMessege) => {
        let model = {
            Id:CardMessege.Id
        }
        this.showLoadingView();
        CommonService.GetCreditCardRaw(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data) {
                  this._checkCard(response.data.CardNo,CardMessege);
                } else {
                  this.toastMsg(response.message);
                }
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    _checkCard = (IdName,CardMessege) => {
        const { yilong, isUnionPay} = this.state;
        let elongBank = ['中国工商银行','中国银行','交通银行','兴业银行','招商银行','广东发展银行','中国民生银行','中信银行'];
        if(isUnionPay||yilong){
            let model = {
                cardNo:IdName,
            }
            CommonService.validateAndCacheCardInfo(model).then(response => {
                if(response&&response.bank){
                    ChinaBankList.map(item=>{
                        if(item.name==response.bank){
                            if(yilong){
                                if(elongBank.includes(item.value)){
                                    CardMessege ? this._addData(CardMessege) : null
                                    this.setState({
                                        bankStr:item.value,
                                        IdName:IdName
                                    })
                                }else{
                                    this.toastMsg('只接受发卡行（中信银行，中国银行，中国工商银行，中国民生银行，兴业银行，广发银行，招商银行，交通银行）的银联卡，请更换');
                                    return;
                                } 
                            }else{
                                CardMessege ? this._addData(CardMessege) : null
                                this.setState({
                                    bankStr:item.value,
                                    IdName:IdName
                                })
                            }
                        }
                    })
                }else{
                    this.toastMsg('维护的信用卡类型与酒店担保支持信用卡类型不符');
                    return;
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message);
            })
        }else{
            // this._cardChange(CardMessege.CardType);
            CardMessege ? this._addData(CardMessege) : null
            this.setState({
                IdName:IdName
            })
        }
    }

    _addData=(CardMessege)=>{
        this._cardChange(CardMessege.CardType);
        let ExpireArr = CardMessege.Expire.split('/')
        let validYear = '20'+ExpireArr[1]
        this.setState({
            validYear:validYear,
            validMonth:ExpireArr[0],
        })
    }

    renderBody() {
        const { IdName, cvv, validYear, validMonth, Name, SeriNumber, Type, options ,cardName,Mobile,yilong,bankStr,isUnionPay} = this.state;
        let elongBank = ['中国工商银行','中国银行','交通银行','兴业银行','招商银行','广东发展银行','中国民生银行','中信银行'];
        let reg = /^(.{4})(?:\d+)(.{4})$/
        // let _idName = IdName.replace(reg, "$1 **** **** $2")
        return (
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {
                    isUnionPay && <CustomText style={{ margin: 10, color: Theme.theme }} text='注意：请使用带有银联标记的信用卡' />
                }
                
                <View style={{ margin: 10, backgroundColor: 'white' }}>
                    {
                        <TouchableOpacity style={styles.row} 
                            onPress={()=>{
                                this.push('CreditCardScreen',{
                                    hotel:true,
                                    callBackCard:(CardMessege)=>{
                                        let ExpireArr = CardMessege.Expire.split('/')
                                        let validYear = '20'+ExpireArr[1]
                                        this._getCardNumber(CardMessege);
                                    }
                                })}
                            }
                        >
                           <View style={{
                               flex: 3,
                               flexDirection: 'row',
                               alignItems: 'center',
                           }}>
                               <CustomText text='查找个人信用卡' />
                           </View>
                           <View style={styles.right}>
                               <CustomText text={''} style={{ flex: 1 }} />
                               <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                           </View>
                       </TouchableOpacity>
                    }
                    {isUnionPay?null: <View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='卡类型' />
                            <CustomText text='*' style={{ color: Theme.theme }} />
                        </View>

                        <View style={styles.right}>
                            <CustomText text={cardName && cardName.Name} style={{ flex: 1 }} onPress={this._selectCard} />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </View>
                    </View>
                    }
                    
                    <View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='信用卡卡号' />
                            <CustomText text='*' style={{ color: Theme.theme }} />
                        </View>
                        <CustomeTextInput placeholder='请输入信用卡卡号' style={{ flex: 7 }} 
                                          value={IdName}
                                          onFocus={() =>{                                            
                                          }}                        
                                          onBlur={() =>{this._checkCard(IdName)}} 
                                          onChangeText={text => this.setState({ IdName: text })} 
                        />
                    </View>
                    {!bankStr||(!yilong && !isUnionPay)?null:
                        <View style={styles.row}>
                            <View style={{
                                flex: 3,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <CustomText text={bankStr} />
                            </View>
                        </View>
                    }
                    {(isUnionPay||yilong)&&<View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='CVV码' />
                           {(isUnionPay||yilong) && <CustomText text='*' style={{ color: Theme.theme }} />} 
                        </View>
                        <CustomeTextInput placeholder='签名栏末尾处最后三位' style={{ flex: 7 }} value={cvv} onChangeText={text => this.setState({ cvv: text })} />
                    </View>}
                    <View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='有效年份' />
                            <CustomText text='*' style={{ color: Theme.theme }} />
                        </View>
                        <CustomText text={this.state.validYear?this.state.validYear:'有效年份,如2020'} style={{flex:7,color:validYear?'black':'#999'}} onPress={this.pickerYear}/>
                        {/* <CustomeTextInput placeholder='有效年份,如2020' style={{ flex: 7 }} value={validYear} onChangeText={text => this.setState({ validYear: text })} /> */}
                    </View>
                    <View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='有效月份' />
                            <CustomText text='*' style={{ color: Theme.theme }} />
                        </View>
                        <CustomText text={this.state.validMonth?this.state.validMonth:'有效月份,如06'} style={{flex:7,color:validMonth?'black':'#999'}} onPress={this.pickerMonth}/>
                     
                        {/* <CustomeTextInput placeholder='有效月份,如06' style={{ flex: 7 }} value={validMonth} onChangeText={text => this.setState({ validMonth: text })} /> */}
                    </View>
                    {(isUnionPay||yilong)&&
                    <View style={styles.row}>
                     <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='证件类型' />
                           {(isUnionPay||yilong) &&<CustomText text='*' style={{ color: Theme.theme }} /> } 
                        </View>
                        <View style={styles.right}>
                            <CustomText text={Type} style={{ flex: 1 }} onPress={this._selectType} />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </View>
                    </View>
                    }
                    <View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='持卡人姓名' />
                            <CustomText text='*' style={{ color: Theme.theme }} />
                        </View>
                        <CustomeTextInput placeholder='请输入持卡人姓名' style={{ flex: 7 }} value={Name} onChangeText={text => this.setState({ Name: text })} />
                    </View>
                    {(isUnionPay||yilong) &&<View style={styles.row}>
                        <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                            }}>
                            <CustomText text='持卡人证件号' />
                            {(isUnionPay||yilong) &&<CustomText text='*' style={{ color: Theme.theme }} /> } 
                        </View>
                        {/* <CustomText text='持卡人证件号' style={{ flex: 3 }} /> */}
                        <CustomeTextInput placeholder='请输入证件号码' style={{ flex: 7 }} value={SeriNumber} onChangeText={text => this.setState({ SeriNumber: text })} />
                    </View>
                    }
                    <View style={styles.row}>
                    <View style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <CustomText text='手机号' />
                           {(isUnionPay||yilong) &&<CustomText text='*' style={{ color: Theme.theme }} /> } 
                        </View>
                        {/* <CustomText text='持卡人证件号' style={{ flex: 3 }} /> */}
                        <CustomeTextInput placeholder='请输入手机号' style={{ flex: 7 }} value={Mobile} onChangeText={text => this.setState({ Mobile: text })} />
                    </View>
                </View>
                <CustomText style={{ margin: 10, color: Theme.theme }} text='温馨提示：请确保您提供的信息与发卡行记录的信息一致' />
                {yilong&&<CustomText style={{ margin: 10, color: Theme.theme }} text='供应商只接受如下银行发行的银联卡：中信银行，中国银行，中国工商银行，中国民生银行，兴业银行，广发银行，招商银行，交通银行' />}
                {
                    ViewUtil.getSubmitButton('提交', this._submitButton)
                }
                <CustomActioSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    row: {
        height: 50,
        paddingHorizontal: 10,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    right: {
        flex: 7,
        alignItems: 'center',
        flexDirection: 'row',
    }
})