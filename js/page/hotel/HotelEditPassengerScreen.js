import React from 'react';
import {
    View, TouchableHighlight, StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PickerHelper from '../../common/PickerHelper';
import HighLight from '../../custom/HighLight';
import CustomActioSheet from '../../custom/CustomActionSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import I18nUtil from '../../util/I18nUtil';
import CommonService from '../../service/CommonService';
import BackPress from '../../common/BackPress';
import { connect } from 'react-redux';
import GlobalStyles from '../../res/styles/GlobalStyles';
import { Bt_inputView, InfoDicView, SelectView,No_inputView }  from '../../custom/HighLight';


import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// let textInput = React.createRef();
// export default class HotelEditPassengerScreen extends SuperView {
class HotelEditPassengerScreen extends SuperView {
    constructor(props) {
        super(props);
        this._enNameToastTs = 0;
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.passenger = Util.Encryption.clone(this.params.passenger || { SexDesc: '男', Sex: 1 ,CertificateType:'身份证'});
        this._navigationHeaderView = {
            title:this.params.title? this.params.title:'编辑乘客',
            // rightButton: ViewUtil.getRightButton('保存', this._finishBtnClick)
        }
        let additionArr = this.passenger && this.passenger.Addition?this.passenger.Addition: 
                          this.passenger&&this.passenger.AdditionInfo?this.passenger.AdditionInfo:null
        let showName =  (this.passenger.NationalCode == 'CN' || this.passenger.NationalCode == 'HK' || this.passenger.NationalCode == 'MO' || this.passenger.NationalCode == 'TW')
        let select = showName?true:false
        this.state = {
            // papersOptions: ['中国居民身份证', '护照', '港澳台居民居住证', '外国人永久居留身份证', '台湾居民来往大陆通行证', '港澳居民来往内地通行证'],
            papersOptions: ['身份证'],
            sexOptions: ['男', '女'],
            isEditSerinumber: false,
            isEditMobile:false,
            SerialNumber:'',
            // 数据字典
            AdditionIfo: 
            // this.params.from&&this.params.from =='comp_hotel'?
            (
                additionArr ? {
                ...additionArr,
                DictItemList: additionArr.DictItemList ? additionArr.DictItemList : []
            } : {
                DictItemList: []
            }),
            // :
            // (this.passenger && this.passenger.AdditionInfo && this.passenger.AdditionInfo ? {
            //     ...this.passenger.AdditionInfo,
            //     DictItemList: this.passenger.AdditionInfo.DictItemList ? this.passenger.AdditionInfo.DictItemList : []
            // } : {
            //         DictItemList: []
            // }),
            CardTravel:this.passenger.CardTravel,
            hotelCardList:[],
            hotelTravelList:[],
            isStop: false,
            select:this.passenger.selectCn ? this.passenger.selectCn : select,
        }
        this.backPress = new BackPress({ backPress: () => this._stopBackEvent() })
    }

    // // 重置手势滑动
    static navigationOptions = ({ navigation }) => {
        return {
            gesturesEnabled: false
        }
    }

    _stopBackEvent = () => {
        if (!this.state.isStop) {
            this.pop();
        }
        return true;
        
        // this.pop();
    }

    _finishBtnClick = () => {
        const { passenger } = this;
        const { SerialNumber,CardTravel,select } = this.state;
        const {IsNeedIDCard,customerInfo,noComp,VendorCodeTVP} = this.params;
        passenger.AdditionInfo = this.state.AdditionIfo;
        passenger.Addition = this.state.AdditionIfo;
        passenger.CardTravel = CardTravel;
        let isShowName =  (passenger.NationalCode == 'CN' || passenger.NationalCode == 'HK' || passenger.NationalCode == 'MO' || passenger.NationalCode == 'TW')
        if (!passenger.Name && ((isShowName && select)||(!isShowName && select))) {
            this.toastMsg('姓名不能为空');
            return;
        }
        if(passenger.Name && !Util.RegEx.isRealHotelName(passenger.Name)){
          this.toastMsg('请按照姓名提示要求填写');
          return;
        }
        if(IsNeedIDCard){
            if (!SerialNumber) {
                this.toastMsg('证件号不能为空');
                return;
            }
        }
        if ((VendorCodeTVP||(isShowName && !select) || (!isShowName && !select)) && !passenger.LastName && !passenger.Surname  ) {
            this.toastMsg('英文姓不能为空');
            return;
        }
        if(passenger.Surname || passenger.LastName){
            let EnglishName = passenger.LastName || passenger.Surname
            if(Util.RegEx.isEnName(EnglishName)){
                this.toastMsg('英文姓只能包含字母');
                return;
            }
        }
        if ((VendorCodeTVP ||(isShowName && !select) || (!isShowName && !select)) && !passenger.FirstName && !passenger.GivenName ) {
            this.toastMsg('英文名不能为空');
            return;
        }
        if(passenger.GivenName || passenger.FirstName){
            let EnglishName = passenger.FirstName || passenger.GivenName
            if(Util.RegEx.isEnName(EnglishName)){
                this.toastMsg('英文名只能包含字母');
                return;
            }
        }
        if((isShowName && !select) || (!isShowName && !select)){
            if(passenger.FirstName && passenger.LastName){
                passenger.Name = passenger.FirstName + '/' + passenger.LastName
            }else if(passenger.GivenName && passenger.Surname){
                passenger.Name = passenger.GivenName + '/' + passenger.Surname
            }
            passenger.selectCn = false
        }else{
            passenger.selectCn = true
        }
        
        if(!passenger.Mobile){
            this.toastMsg('手机号不能为空');
            return;
        }else if (!Util.RegEx.isMobile(passenger.Mobile)) {
            this.toastMsg('手机号格式不正确');
            return;
        } 
        if(!passenger.Email && customerInfo?.EmailRequired){
            this.toastMsg('邮箱不能为空');
            return;
            }
            if (passenger.Email && !Util.RegEx.isEmail(passenger.Email)) {
            this.toastMsg('请输入正确的邮箱格式');
            return;
            }
        if (customerInfo.EmployeeDictList) {
            for (let i = 0; i < customerInfo.EmployeeDictList.length; i++) {
                const obj = customerInfo.EmployeeDictList[i];
                let dicItem = passenger.AdditionInfo&&passenger.AdditionInfo.DictItemList.find(dic => dic.DictCode === obj.Code);
                if (obj.IsRequire && obj.ShowInOrder) {
                    if (!dicItem) {
                        this.toastMsg(I18nUtil.tranlateInsert('{{noun}}不能为空', I18nUtil.translate(obj.Name)));
                        return;
                    } else {
                        if (obj.NeedInput && !dicItem.ItemName) {
                            this.toastMsg(I18nUtil.tranlateInsert('{{noun}}不能为空', I18nUtil.translate(obj.Name)));
                            return;
                        } else if(obj.NeedInput && dicItem.ItemName && obj.FormatRegexp){
                                let regex=new RegExp(obj.FormatRegexp)
                                if(!regex.test(dicItem.ItemName)){
                                    this.toastMsg(obj.Remark);
                                    return;
                                }
                        }
                        else if (!obj.NeedInput && !dicItem.ItemId) {
                            this.toastMsg(I18nUtil.tranlateInsert('{{noun}}不能为空', I18nUtil.translate(obj.Name)));
                            return;
                        }
                    }
                }
                else if(obj.NeedInput && (dicItem&&dicItem.ItemName) && obj.FormatRegexp){
                    let regex=new RegExp(obj.FormatRegexp)
                    if(!regex.test(dicItem.ItemName)){
                        this.toastMsg(I18nUtil.tranlateInsert('{{noun}}格式不符合规则', I18nUtil.translate(Util.Parse.isChinese()?dicItem.DictName:dicItem.DictEnName)));
                        return;
                    }
                }

            }
        }
        

        let item;
        let CertificateList;
        if(passenger.CertificateList && passenger.CertificateList.length>0){
            CertificateList = passenger.CertificateList
            item = passenger.CertificateList.find(item => item.Type === 1);
        }else if (passenger.Certificate && typeof(passenger.Certificate) === 'string') {
            try{
            CertificateList = JSON.parse(passenger.Certificate) || [];
            item = CertificateList.find(item => item.TypeDesc === '身份证');
            }catch(e){
                console.error('Certificate parse error:', e);
            }
        }
        if(item){
            item.SerialNumber = SerialNumber;
            passenger.Certificate = JSON.stringify(CertificateList);
            this.params.callBack(passenger,SerialNumber);
            this.pop();
        }else{
            this.params.callBack(passenger,SerialNumber,1);
            this.pop();
        }
        
    }
    componentDidMount() {
        
        const { passenger } = this;
        if(!passenger){
            return
        }
        if(passenger&&passenger.CertificateId&&passenger.CertificateId==1){
            this.setState({
                SerialNumber:passenger.CertificateNumber
            })
        }else{
            let item;
            if(passenger.CertificateList && Array.isArray(passenger.CertificateList) && passenger.CertificateList.length>0){
                item = passenger.CertificateList.find(item => item.Type === 1);
            }else if (passenger.Certificate && typeof(passenger.Certificate) === 'string') {
                try{
                    let CertificateList = JSON.parse(passenger.Certificate) || [];
                    if(Array.isArray(CertificateList)){
                        item = CertificateList.find(item => item.Type === 1);
                    }
                }catch(e){
                    console.error('Certificate parse error:', e);
                }
            }
            this.setState({
                SerialNumber:item&&item.SerialNumber
            })
        }
        this._loadList();
        this.backPress.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.backPress.componentWillUnmount();
        if (PickerHelper && typeof PickerHelper.hide === 'function') {
            PickerHelper.hide();
        }
    }

    _loadList = () => {
        this.showLoadingView();
        let model = {
            key:''
        }
        CommonService.HotelGroupList(model).then(response => {
            this.hideLoadingView();
            if (response && response.data) {
                let hotelTravelList=[]
                const commenArr = 
                response.data.items&&response.data.items.map((item)=>({
                    SerialNumber:null,
                    HotelGroupId:item.id,
                    HotelGroupName:item.text
                }))
                commenArr&&commenArr.map((item)=>{
                    this.passenger.HotelCardTravellerList&&this.passenger.HotelCardTravellerList.map((item2)=>{
                         if(item.HotelGroupId == item2.HotelGroupId){
                            item.SerialNumber = item2.SerialNumber
                         }
                    })
                    hotelTravelList.push(item.HotelGroupName);
                })
                this.setState({
                    hotelCardList: commenArr,
                    hotelTravelList:hotelTravelList
                })
            } else {
                this.toastMsg('获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }

    /**
     *  index 1是出生日期 2是有效期
     */
    _pickerShow = (index) => {
        PickerHelper.create(PickerHelper.createYYYYMMDDDate(), null, (data) => {
            if (index === 1) {
                this.passenger.Birthday = data.join('-');
            } else {
                this.passenger.Expire = data.join('-');
            }

            this.setState({});
        })
    }
    _handlePress = (index) => {
        const { papersOptions } = this.state;
        if (this.passenger.CertificateType !== papersOptions[index]) {
            this.passenger.CertificateType = papersOptions[index];
            this.passenger.CertificateNumber = '';
            this.passenger.Expire = '';
            this.passenger.IssueNationName = '';
            this.passenger.IssueNationCode = '';
            if (this.passenger.Certificate && typeof(this.passenger.Certificate) === 'string') {
                let CertificateList = JSON.parse(this.passenger.Certificate) || [];
                let Type = Util.Read.certificateType2(this.passenger.CertificateType)
                let obj = CertificateList.find(item => item.Type == Type );
                if (obj) {
                    this.passenger.CertificateNumber = obj.SerialNumber;
                    this.passenger.Expire = obj.Expire;
                    this.passenger.IssueNationName = obj.IssueNationName;
                    this.passenger.IssueNationCode = obj.IssueNationCode;
                }
            }
        }
        // textInput.current._root.focus();

        this.setState({});
    }
    _HotelCardHandlePress = (_index) => {
        const {hotelCardList} = this.state;
        let arr = [];
        if(_index!= 'cancel'){
            hotelCardList.map((item,index)=>{
                if(index==_index){
                    arr.push(item)
                this.setState({
                    CardTravel:arr
                })
                }
            })
        }else{
            this.setState({
                CardTravel:null
            })
        }
    }
    /**
     *  选择性别
     */
    _selectSex = () => {
        if(this.passenger.fromComp===1){
            if (this.passenger.Gender === 1) {
                this.passenger.Gender = 2;
            } else {
                this.passenger.Gender = 1;
            }
        }else{
            if (this.passenger.SexDesc === '男') {
                this.passenger.SexDesc = '女';
                this.passenger.Sex = 2;
            } else {
                this.passenger.SexDesc = '男';
                this.passenger.Sex = 1;
            }
        }
        this.setState({});
    }
    _alertTip = () => {
        this.showAlertView(Util.Parse.isChinese() ? trainNameNotice : trainNameEnNotice);
    }
    /**
     *  选择国家
     */
    _toSelectCounty = () => {
        this.push('NationalCity', {
            refresh: (item) => {
                this.passenger.NationalCode = item.Code;
                this.passenger.NationalName = item.Name;
                this.setState({
                });
            }
        });
    }   
    renderBody() {
        const { index,IsNeedIDCard, customerInfo ,noComp,IsRewardPointTVP,VendorCodeTVP} = this.params;//IsNeedIDCard判断酒店是否需要证件信息
        const { passenger } = this;
        if(!passenger){
           return null
        }
        const { isEditSerinumber ,isEditMobile,SerialNumber,AdditionIfo,CardTravel,select} = this.state;
        let showName =  (passenger.NationalCode == 'CN' || passenger.NationalCode == 'HK' || passenger.NationalCode == 'MO' || passenger.NationalCode == 'TW')
        if(passenger.Surname && Util.RegEx.isEnName(passenger.Surname)){
            passenger.Surname = '';
        }
        if(passenger.LastName && Util.RegEx.isEnName(passenger.LastName)){
            passenger.LastName = '';
        }
        if(passenger.FirstName && Util.RegEx.isEnName(passenger.FirstName)){
            passenger.FirstName = '';
        }
        if(passenger.GivenName && Util.RegEx.isEnName(passenger.GivenName)){
            passenger.GivenName = '';
        }
        return (
            <View style={{ flex:1}}>
            {
                ViewUtil.getNameTips()
            }
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" style={GlobalStyles.keyViewSy} showsVerticalScrollIndicator={false}>
                {
                    index === 1 ?
                      ViewUtil.getNameTips2()
                    : null
                }
                {/* {
                    showName?
                    <Bt_inputView dicKey={'姓名'} 
                                  required={true}
                                  bt_text={passenger.Name} 
                                  _placeholder={'证件上的真实姓名'} 
                                  _haveInfoAler={true}
                                  _clickOnpress={()=>{
                                        this._alertTip()
                                  }}
                                  _callBack={(text)=>{
                                        passenger.Name = text; 
                                        this.setState({travName:passenger.Name})
                                  }}
                                //   no_editable={(IsNeedIDCard || this.params.title) ? false : true}
                                no_editable={false}
                    />:null
                } */}
                {
                    VendorCodeTVP?
                    <Bt_inputView dicKey={'英文姓'}
                                  required={true} 
                                  bt_text={
                                    passenger.LastName|| passenger.Surname
                                  } 
                                  _placeholder={'姓氏'} 
                                  warm_text={'需与证件一致'} 
                                  _callBack={(text)=>{
                                        passenger.LastName = text;
                                        passenger.Surname = text;
                                        this.setState({});
                                }}
                                isEnName={true}
                    />:null
                }
                {
                    VendorCodeTVP?
                    <Bt_inputView dicKey={'英文名'}
                                required={true} 
                                bt_text={
                                    passenger.FirstName || passenger.GivenName                                
                                } 
                                _placeholder={'名'} 
                                warm_text={'需与证件一致'} 
                                _callBack={(text)=>{
                                        passenger.FirstName = text;
                                        passenger.GivenName = text;
                                        this.setState({});
                                }}
                                isEnName={true}
                    />:null
                }
                {
                    !VendorCodeTVP && ((showName && !select) || (!showName && !select))?
                        <View>
                            <View style={[styles.row,{paddingHorizontal:1,height:50}]}>
                                <View style={{flexDirection:'column' ,flex:3}}>
                                    <HighLight name='姓（拼音）' style={{fontSize:14,color:Theme.commonFontColor}}/>
                                    <CustomText text='Surname' />
                                </View>
                                <CustomeTextInput style={styles.input} placeholder={'须与登机证件姓一致'} 
                                value={
                                    /[^a-zA-Z'\s]/.test(passenger.LastName || passenger.Surname || '') ? '' : (passenger.LastName || passenger.Surname || '')
                                } 
                                onChangeText={text => {
                                    if (!text || !Util.RegEx.isEnName(text)) {
                                        passenger.LastName = text;
                                        passenger.Surname = text;
                                        this.setState({});
                                        return;
                                    }
                                    const now = Date.now();
                                    if (now - this._enNameToastTs > 800) {
                                        this._enNameToastTs = now;
                                        this.toastMsg('英文姓只能输入字母');
                                    }
                                }} />
                                    {
                                        ((showName && !select) || (!showName && !select))?
                                            <TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({select:!select})}}>
                                                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                                    <View style={{ backgroundColor: select ? Theme.theme : Theme.normalBg, height: 22, width: 36, alignItems: "center", justifyContent: 'center', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}>
                                                        <CustomText text='中' style={{ color: select ? '#fff' : Theme.commonFontColor}} />
                                                    </View>
                                                    <View style={{ backgroundColor: !select ? Theme.theme : Theme.normalBg, height: 22, width: 36, alignItems: "center", justifyContent: 'center', borderTopRightRadius: 3, borderBottomRightRadius: 3 }}>
                                                        <CustomText text='EN' style={{ color: !select ? '#fff' : Theme.commonFontColor }} />
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                        :null
                                    }
                            </View>
                            <View style={[styles.row,{paddingHorizontal:1,height:50}]}>
                                <View style={{flexDirection:'column' ,flex:3}}>
                                    <HighLight name='名（拼音）' style={{fontSize:14,color:Theme.commonFontColor}} />
                                    <CustomText text='Given name' />
                                </View>
                               <CustomeTextInput style={[styles.input,{flex:7}]} 
                                    value={
                                        /[^a-zA-Z'\s]/.test(passenger.FirstName || passenger.GivenName || '') ? '' : (passenger.FirstName || passenger.GivenName || '')
                                    } 
                                    placeholder={'须与登机证件名一致'} onChangeText={text => {
                                    if (!text || !Util.RegEx.isEnName(text)) {
                                        passenger.FirstName = text;
                                        passenger.GivenName = text;
                                        this.setState({});
                                        return;
                                    }
                                    const now = Date.now();
                                    if (now - this._enNameToastTs > 800) {
                                        this._enNameToastTs = now;
                                        this.toastMsg('英文名只能输入字母');
                                    }
                                }} />
                            </View>
                        </View>
                    :null
                }

                {!VendorCodeTVP && ((showName && select)||(!showName && select))?
                    <View style={[styles.row,{borderBottomColor:passenger.Name? Theme.lineColor:Theme.redColor,paddingHorizontal:1}]}>
                        <HighLight  name={'姓名'} value={passenger.Name} style={{color:Theme.commonFontColor, fontSize:14}}/>
                        <CustomeTextInput style={{ flex: 5,marginLeft:15 }} value={passenger.Name} onChangeText={text => { passenger.Name = text; this.setState({}) }} placeholder='须与登机证件姓名一致' />
                        {
                            VendorCodeTVP?null:
                            <TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({select:!select})}}>
                                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                    <View style={{ backgroundColor: select ? Theme.theme : Theme.normalBg, height: 22, width: 36, alignItems: "center", justifyContent: 'center', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}>
                                        <CustomText text='中' style={{ color: select ? '#fff' : Theme.commonFontColor}} />
                                    </View>
                                    <View style={{ backgroundColor: !select ? Theme.theme : Theme.normalBg, height: 22, width: 36, alignItems: "center", justifyContent: 'center', borderTopRightRadius: 3, borderBottomRightRadius: 3 }}>
                                        <CustomText text='EN' style={{ color: !select ? '#fff' : Theme.commonFontColor}} />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        }
                    </View>
                    :null
                }
                
                {IsNeedIDCard?
                  <View>
                    <View style={styles.row}>
                        <CustomText text='证件类型' style={{ flex: 3 }} />
                        <View style={styles.right}>
                            <CustomText style={{ flex: 1 }} onPress={() => {
                                // PickerHelper.hide();
                                // this.ActionSheet.show();
                            }} 
                            text={'身份证'} />
                            <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <CustomText text='证件号码' style={{ flex: 3 }} />
                        {
                                <CustomeTextInput style={{ flex: 7 }} placeholder='证件号码(必填)'
                                value={ isEditSerinumber ?
                                            SerialNumber : 
                                            Util.Read.simpleReplace(SerialNumber)    
                                        }
                                onFocus={() =>{
                                    // SerialNumber = '';
                                    this.setState({ isEditSerinumber: true,SerialNumber: ''})
                                }}                        
                                onBlur={() => this.setState({ isEditSerinumber: false })}
                                onChangeText={(text) => {
                                    if (this.state.isEditSerinumber) {
                                        // SerialNumber = text;
                                        this.setState({
                                            SerialNumber:text
                                        });
                                    }
                                }}
                                // ref={textInput}
                                />
                        }
                    </View>
                  </View>:null
                }
                <SelectView titleName={'国籍/地区'}
                            required={false}
                            _selectName={passenger.NationalCode&&passenger.NationalName ? passenger.NationalName:''}
                            _placeholder={'请选择国籍/地区'} 
                            _callBack={()=>{
                                this.push('NationalCity', {
                                    refresh: (item) => {
                                        this.passenger.NationalCode = item.Code;
                                        this.passenger.NationalName = item.Name;
                                        this.passenger.Nationality = item.Name;
                                        this.setState({
                                        });
                                    },
                                });
                            }}
                />
                <Bt_inputView dicKey={'E-mail'} 
                                bt_text={passenger.Email} 
                                _placeholder={customerInfo.EmailRequired?'邮箱(必填)':'邮箱(选填)'} 
                                _callBack={(text)=>{
                                        passenger.Email = text; 
                                        this.setState({}) 
                                }}
                                required={customerInfo.EmailRequired}
                />
                <Bt_inputView dicKey={'手机号'}
                                  required={true} 
                                  bt_text={isEditMobile?passenger.Mobile:passenger.Mobile&&passenger.Mobile.replace(/(\d{3})(\d{4})(\d{4})/,"$1****$3")} 
                                  _placeholder={'手机号'} 
                                  _onFocus={()=>{
                                        passenger.Mobile = '';
                                        this.setState({ isEditMobile: true })
                                  }}
                                  _onBlur={()=>{
                                        this.setState({ isEditMobile: false })
                                  }}
                                  keyboardType='numeric' 
                                  _callBack={(text)=>{
                                        passenger.Mobile = text;
                                        this.setState({});
                                  }}
                />
                {
                    IsRewardPointTVP?
                        <SelectView titleName={'酒店会员卡'}
                                    required={false}
                                    _selectName={CardTravel&&CardTravel[0]&&CardTravel[0].HotelGroupName}
                                    _placeholder={''} 
                                    _callBack={()=>{
                                        this.CardTravellerActionSheet.show();
                                    }}
                        />
                    :null
                }
                {
                    IsRewardPointTVP?
                    <Bt_inputView dicKey={'酒店会员卡号'} 
                                    bt_text={CardTravel&&CardTravel[0]&&CardTravel[0].SerialNumber} 
                                    _placeholder={'请输入酒店会员卡号'} 
                                    _callBack={(text)=>{
                                        if(CardTravel&&CardTravel[0]&&CardTravel[0]){
                                            CardTravel[0].SerialNumber = text; 
                                            this.setState({})
                                        }
                                    }}
                                    required={false}
                    />
                    :null
                }
                <CustomActioSheet ref={o => this.ActionSheet = o} options={this.state.papersOptions} onPress={this._handlePress} />
                <CustomActioSheet ref={o => this.CardTravellerActionSheet = o} options={this.state.hotelTravelList} onPress={this._HotelCardHandlePress} />   
                {
                     customerInfo&&customerInfo.EmployeeDictList && customerInfo.EmployeeDictList.length > 0 ?
                     customerInfo.EmployeeDictList.map((obj, index) => {
                         let itemIndex;
                        //  if(this.params.from&&this.params.from =='comp_hotel'?obj.BusinessCategory&128:obj.BusinessCategory&4){
                            itemIndex = AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(
                                item => item.DictCode === obj.Code
                            );
                            if(itemIndex){
                                itemIndex.DictId = obj.Id
                                itemIndex.DictName = obj.Name
                                itemIndex.DictEnName = obj.EnName
                            }
                            if(!itemIndex){
                                itemIndex = obj
                                itemIndex.DictName = obj.Name
                            }
                        //  } 
                         return (
                            itemIndex&&obj.ShowInOrder?
                            <InfoDicView index={index} 
                                            obj={obj} 
                                            itemIndex={itemIndex} 
                                            value_Change={(text)=>{
                                                this._valueCHange(text, obj);
                                            }}
                                            select_DicList={()=>{
                                                this._toSelectDicList(obj)
                                            }}
                                    />
                            :null
                         )
                     })
                     : null
                }
            </KeyboardAwareScrollView>
            {
                ViewUtil.getThemeButton('保存', this._finishBtnClick)
            }

            </View>
        )
    }
    _valueCHange = (text, obj) => {
        const { AdditionIfo } = this.state;
        let itemIndex = AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(
            item => item.DictCode === obj.Code
        );
        if (itemIndex) {
            // Util.Parse.isChinese()?
            // itemIndex.ItemName = text
            // :
            // itemIndex.ItemEnName = text;
            itemIndex.ItemName = text
            itemIndex.DictCode = obj.Code
            itemIndex.NeedInput = obj.NeedInput
            itemIndex.DictId = obj.Id
        } else {
            let model = {
                DictId: obj.Id,
                Id: obj.Id,
                DictName: obj.Name,
                ItemId: '',
                ItemSerialNumber: '',
                ItemName: text,
                // ItemEnName: Util.Parse.isChinese()?'':text,
                FormatRegexp:obj.FormatRegexp,
                Remark:obj.Remark,
                EnName:obj.EnName,
                RemarkNo:obj.RemarkNo,
                DictCode: obj.Code,
                NeedInput:obj.NeedInput
            }
            AdditionIfo.DictItemList.push(model);
        }
        this.setState({});
    }
    _toSelectDicList = (obj) => {
        const { AdditionIfo } = this.state;
        this.push('DicList', {
            title: Util.Parse.isChinese() ? obj.Name :(obj.EnName?obj.EnName:obj.Name),
            Id: obj.Id,
            callBack: (data) => {
                let dic = AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictCode === obj.Code);
                if (dic) {
                    dic.ItemId = data.Id;
                    dic.Id = data.Id;
                    dic.ItemSerialNumber = data.SerialNumber;
                    dic.ItemInput = `${data.SerialNumber} - ${data.Name} - ${data.EnName}`;
                    dic.ItemName = data.Name;
                    // dic.EnName = data.EnName
                    dic.ItemEnName = data.EnName
                    dic.DictCode = obj.Code
                    dic.NeedInput = obj.NeedInput
                } else {
                    let model = {
                        DictId: obj.Id,
                        Id: obj.Id,
                        DictName: obj.Name,
                        ItemId: data.Id,
                        ItemSerialNumber: data.SerialNumber,
                        ItemInput: `${data.SerialNumber} - ${data.Name} - ${data.EnName}`,
                        ItemName: data.Name,
                        FormatRegexp:obj.FormatRegexp,
                        // EnName:data.EnName,
                        ItemEnName:data.EnName,
                        RemarkNo:obj.RemarkNo,
                        DictCode: obj.Code,
                        NeedInput:obj.NeedInput
                    }
                    AdditionIfo&&AdditionIfo.DictItemList.push(model);
                }
                this.setState({});

            }
        })
    }
}
export default connect()(HotelEditPassengerScreen);
const styles = StyleSheet.create({

    row: {
        flexDirection: 'row',
        height: 40,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 10
    }
    , right: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 7,
    },
    rowRight: {
        flex: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    input: {
        flex: 6,
        marginLeft:15
    },
})
const trainNameNotice = `
乘客姓名填写说明：

1、确认姓名中生僻字无法输入时，可用生僻字拼音或同音字替代。
2、输入姓名保存后，遇有系统无法正确显示的汉字，可用该汉字的拼音或同音字重新修改后保存。
3、姓名中有繁体字无法输入时，可用简体替代。
4、姓名较长，汉字与英文字符合计超过30个（1个汉字算2个字符）的，需按姓名中第一个汉字或英文字符开始按顺序连续输入30个字符（空格字符不输入），其中英文字符输入时不区别大小写。
5、姓名中有“.”或“• ”时，请仔细辨析身份证件原件上的“.”或“• ”，准确输入。
6、姓名中有“,”时，请使用空格替换`;
const trainNameEnNotice = `Instructions for filling out the passenger's name:

1. The passenger's name and ID number must match the name and number on the card used when riding. If there is a Chinese name, please fill in the Chinese name.
2. If the name contains a rare word, you can directly input the pinyin instead. For example: "Wang Hao" can be entered as "Wang Yan".
3. Enter a maximum of 30 characters (1 Chinese character is 2 characters). If it exceeds 30 characters, please input 30 characters in sequence according to the first Chinese character or English character in the name. enter).
4. When there is "." or "?" in the name, please carefully discriminate the "." or "?" on the original ID card and input it accurately.`;