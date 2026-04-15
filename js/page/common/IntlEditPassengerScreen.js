import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableHighlight
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
import GlobalStyles from '../../res/styles/GlobalStyles'
import Util from '../../util/Util';
import CustomActioSheet from '../../custom/CustomActionSheet';
import PickerHelper from '../../common/PickerHelper';
import IntlFlightEnum from '../../enum/IntlFlightEnum';
import I18nUtil from '../../util/I18nUtil';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import CommonService from '../../service/CommonService';
import HighLight  from '../../custom/HighLight';
import { Bt_inputView, InfoDicView, SelectView }  from '../../custom/HighLight';
import UserInfoDao from '../../service/UserInfoDao'
 
// let textInput = React.createRef();
export default class IntlEditPassengerScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this.passenger = Util.Encryption.clone(this.params.passenger || {  Gender: null, CertificateType : '护照' });
        this._navigationHeaderView = {
            title:this.params.title||"编辑旅客",
        }
        let options = ['护照', '台湾通行证', '港澳通行证（含电子港澳通行证）', '台湾居民来往大陆通行证', '港澳居民来往内地通行证', '港澳台居民居住证', '外国人永久居留身份证','大陆居民往来台湾通行证','外交部签发的驻华外交人员证','民航局规定的其他有效乘机身份证件'];
        if(this.params.from === 'presonal' ||this.params.from === 'em_presonal'){
            options.unshift("身份证");
        }
        let addition = typeof(this.passenger.Addition)=="string"? JSON.parse(this.passenger.Addition):this.passenger.Addition
        this.state = {
            isEditSerinumber: false,
            options: options,
            GenderOptions:['男','女'],
            isEditMobile:false,
             // 数据字典
             AdditionIfo: addition ? {
                ...addition,
                DictItemList: addition.DictItemList ? addition.DictItemList : []
            } : {
                    DictItemList: []
            },
            user_info:{}
        }
    }
    componentDidMount(){
        UserInfoDao.getUserInfo().then(response => {
            this.setState({
                user_info:response
            })
        })    
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        PickerHelper.hide();
    }

    _pickerShow = () => {
        PickerHelper.create(PickerHelper.createYYYYMMDDDate(), null, (data) => {
            this.passenger.Birthday = data.join('-');
            this.setState({});
        })
    }
    _pickerExpire = () => {

        PickerHelper.create(PickerHelper.createYYYYMMDDDate(), new Date(), (data) => {
            this.passenger.CertificateExpire = data.join('-');
            this.setState({});
        })
    }
    _finishBtnClick = () => {
        const { passenger } = this;
        const { customerInfo} = this.params;
        if (!passenger) {
            this.toastMsg('获取乘客信息失败');
            return;
        }
        if (!passenger.LastName) {
            this.toastMsg('请填写英文姓');
            return;
        }
        if (!passenger.FirstName) {
            this.toastMsg('请填写英文名');
            return;
        }
        // // 添加英文字符串校验
        // const englishRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
        // if (!englishRegex.test(passenger.LastName)) {
        //     this.toastMsg('英文姓必须是英文字符');
        //     return;
        // }
        // if (!englishRegex.test(passenger.FirstName)) {
        //     this.toastMsg('英文名必须是英文字符');
        //     return;
        // }
        if (!passenger.Name) {
            this.toastMsg('请填写姓名');
            return;
        }
        if(this.state.AdditionIfo){
            passenger.Addition = this.state.AdditionIfo;
            passenger.AdditionInfo = this.state.AdditionIfo;
        }
        if (customerInfo&&customerInfo.EmployeeDictList) {
            for (let i = 0; i < customerInfo.EmployeeDictList.length; i++) {
                const obj = customerInfo.EmployeeDictList[i];
                let dicItem = passenger.Addition.DictItemList&&passenger.Addition.DictItemList.find(dic => dic.DictId === obj.Id);
                // if (obj.IsRequire && obj.ShowInOrder) {
                if (obj.IsRequire) {
                    // if (userInfo && userInfo.Customer.Id === Customer.DRHJ && obj.Name === '实施阶段') {
                    //     continue;
                    // }
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
                }else if(obj.NeedInput && (dicItem&&dicItem.ItemName) && obj.FormatRegexp){
                    let regex=new RegExp(obj.FormatRegexp)
                    if(!regex.test(dicItem.ItemName)){
                        this.toastMsg(I18nUtil.tranlateInsert('{{noun}}格式不符合规则', I18nUtil.translate(Util.Parse.isChinese()?dicItem.DictName:dicItem.DictEnName)));
                        return;
                    }
                }

            }
        }
        // if(this.params.index ===1){//综合订单编辑员工时不显示成本中心
           
        // }else if( customerInfo&&customerInfo.Setting.MassOrderConfig.FrequentTravellerCostCenterMode===1){
        //     if((this.params.title=='新增乘客'||passenger.CostCenterRequired) && !passenger.CostCenter){
        //         this.toastMsg('请填写成本中心');
        //         return;
        //     }
        // }
        if (!passenger.Mobile) {
            this.toastMsg('请填写手机号');
            return;
        }
        // 添加手机号格式校验
        const mobileRegex = /^1[3-9]\d{9}$/;
        if (!mobileRegex.test(passenger.Mobile)) {
            this.toastMsg('请输入正确的手机号');
            return;
        }
        if (!passenger.NationalName) {
            this.toastMsg('请选择国籍/地区');
            return;
        }
        if (!passenger.CertificateType) {
            this.toastMsg('请选择证件类型');
            return;
        }
        if (this.params.from !== 'presonal' && this.params.from !== 'em_presonal') {
            let isVaild = IntlFlightEnum.validCertificates.some(item => item.desc === passenger.CertificateType);
            if (!isVaild) {
                this.toastMsg('不支持该证件类型');
                return;
            }
        }
        if (!passenger.CertificateNumber) {
            this.toastMsg('请填写证件号码');
            return;
        }
        if (!passenger.CertificateExpire) {
             if(passenger.CertificateType != '身份证' && passenger.CertificateType != 'Chinese ID Card'){
                this.toastMsg('请选择证件有效期');
                return;
             }
        } else {
            let now = new Date();
            // if (Util.Date.toDate(passenger.CertificateExpire) < now.setMonth(now.getMonth() + 6)) {
            //     this.toastMsg('证件有效期不足半年');
            //     return;
            // }
            // if (Util.Date.toDate(passenger.CertificateExpire) > now.setMonth(now.getMonth() + 120)) {
            //     this.toastMsg('证件有效期大于10年');
            //     return;
            // }
            // if (passenger.CertificateExpire && !passenger.CertificateExpire.includes('T')) {
            //     passenger.CertificateExpire += 'T00:00:00';
            // }
        }
        if (!passenger.IssueNationName && !(passenger.CertificateType=='身份证'||passenger.CertificateType=="Chinese ID Card")) {
            this.toastMsg('请选择证件签发国');
            return;
        }
       

        if(!passenger.Email && customerInfo.EmailRequired){
            this.toastMsg('邮箱不能为空');
            return;
        }
        if (passenger.Email && !Util.RegEx.isEmail(passenger.Email)) {
            this.toastMsg('请输入正确的邮箱格式');
            return;
        }
        
        if (!passenger.Birthday) {
            this.toastMsg('出生日期不能为空');
            return;
        }
        // if (passenger.Birthday && !passenger.Birthday.includes('T')) {
        //     passenger.Birthday += 'T00:00:00';
        // }
        // if (!passenger.SexDesc) {
        //     this.toastMsg('请选择性别');
        //     return;
        // }
        if(!passenger.Sex && !passenger.Gender){
            this.toastMsg('请选择性别');
            return;
        }

        if (this.params.from === 'presonal') {
            let Certificate = {
                Type: Util.Read.certificateType(passenger.CertificateType),
                Expire: passenger.CertificateExpire,
                TypeDesc: passenger.CertificateType,
                NationalCode: passenger.NationalCode,
                NationalName: passenger.NationalName,
                SerialNumber: passenger.CertificateNumber,
                IssueNationCode: passenger.IssueNationCode,
                IssueNationName: passenger.IssueNationName
            }
            let cerlist = [];
            if (passenger.CertificateList) {
                cerlist = JSON.parse(passenger.CertificateList);
                cerlist.push(Certificate);
            } else {
                cerlist.push(Certificate);
            }
            let model = {
                Id: passenger.Id,
                Sex: passenger.Sex ? passenger.Sex : 0,
                Gender:passenger.Gender ? passenger.Gender : 0,
                Name: passenger.Name,
                Birthday: passenger.Birthday,
                Nationality: passenger.Nationality,
                NationalName: passenger.NationalName,
                NationalCode: passenger.NationalCode,
                NationalityCode:passenger.NationalCode,
                IssueNationCode: passenger.IssueNationCode,
                IssueNationName: passenger.IssueNationName,
                Mobile: passenger.Mobile,
                Tel: passenger.Tel,
                Email: passenger.Email,
                Certificate: JSON.stringify(Certificate),
                CertificateList: cerlist,
                TravallerCard: '',
                Intro: '',
                EmployeeId: '',
                FirstName: passenger.FirstName,
                MiddleName: '',
                LastName: passenger.LastName,
                IsShare: false,
                CustomerId: 0,
                Status: 1,
                CertificateInfo: Certificate,
                CardTravellerList: {

                },
                SexDesc: passenger.SexDesc,
                CostCenter: passenger.CostCenter,
                Addition:passenger.Addition
            }
            if (this.params.passenger) {
                this.showLoadingView();
                CommonService.CurrentUserTravellerEdit(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this.showAlertView('编辑常旅客成功', () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                this.params.callBack(passenger);
                                this.pop();
                            })
                        })
                    } else {
                        this.toastMsg(response.message || '操作失败');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || "操作失败");
                })


            } else {
                this.showLoadingView();
                CommonService.CurrentUserTravellerAdd(model).then(response => {
                    this.hideLoadingView();
                    if (response && response.success && response.data) {
                        this.showAlertView('添加常旅客成功', () => {
                            return ViewUtil.getAlertButton("确定", () => {
                                this.dismissAlertView();
                                if(this.params&&this.params.callBack){
                                    this.params.callBack(response.data);
                                }
                                this.pop();
                            })
                        })
                    } else {
                        this.toastMsg(response.message || '添加常旅客失败');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || '添加常旅客异常');
                })
            }
        } else {
      
            this.params.callBack(passenger);
            this.push('FlightOrderScreeb');
            this.pop();
           
        }
    }
    _handlePress = (index) => {
        const { options } = this.state;
        if (this.passenger.CertificateType !== options[index]) {
            this.passenger.CertificateType = options[index];
            this.passenger.CertificateNumber = '';
            this.passenger.Expire = '';
            this.passenger.IssueNationName = '';
            this.passenger.IssueNationCode = '';
            this.passenger.CertificateExpire = '';
            if (this.passenger.Certificate) {
                let CertificateList = JSON.parse(this.passenger.Certificate) || [];
                let Type = Util.Read.certificateType2(this.passenger.CertificateType)
                let obj = CertificateList.find(item => item.Type == Type );
                if (obj) {
                    this.passenger.CertificateNumber = obj.SerialNumber;
                    this.passenger.Expire = obj.Expire;
                    this.passenger.IssueNationName = obj.IssueNationName;
                    this.passenger.IssueNationCode = obj.IssueNationCode;
                    this.passenger.CertificateExpire = obj.Expire;
                }
            }
        }
        // textInput.current._root.focus();
        this.setState({});
    }
    /**
     *  选择图片
     */
    _selectImage = () => {
        var options = {
            //底部弹出框选项
            title: I18nUtil.translate('请选择'),
            cancelButtonTitle: I18nUtil.translate('取消'),
            takePhotoButtonTitle: I18nUtil.translate('拍照'),
            chooseFromLibraryButtonTitle: I18nUtil.translate('选择相册'),
            quality: 0.75,
            allowsEditing: true,
            noData: false,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        }
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
            } else if (response.error) {
            } else {

                this.passenger.ImageUrl = response.uri;
                this.setState({

                }, () => {
                    this._uploadImage();
                })

            }
        })
    }
    /**
       * uploadImage
       */
    _uploadImage = () => {
        const { ImageUrl } = this.passenger;
        let url = null;
        if (ImageUrl.search('file://') > -1) {
            url = ImageUrl.slice(6);
        } else {
            url = ImageUrl;
        }
        let model = [{ name: 'avatar', filename: 'avatar.jpg', data: RNFetchBlob.wrap(url) }];
        this.showLoadingView('正在上传图片');
        CommonService.CertificateImageUpload(model).then(response => {
            this.hideLoadingView();
            if (response && response.success == 1) {
                this.passenger.ImageUrl = response.data;
                this.toastMsg('上传图片成功');
            } else {
                this.toastMsg(response.message || '图片上传失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '图片上传失败');
        })

    }

    _deletePasseneger = () => {
        const { deletBack } = this.params;
        this.showAlertView('确定要删除常旅客吗？', () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this.showLoadingView();
                CommonService.CurrentUserTravellerRemove({
                    TravellerId: this.passenger.Id
                }).then(response => {
                    this.hideLoadingView();
                    if (response && response.success) {
                        this.showAlertView("删除常旅客成功", () => {
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                this.pop();
                                deletBack();
                            })
                        })
                    } else {
                        this.toastMsg(response.message || '数据请求失败');
                    }
                }).catch(error => {
                    this.hideLoadingView();
                    this.toastMsg(error.message || '数据请求异常');
                })
            })
        })
    }



    renderBody() {
        const { passenger } = this;
        const { customerInfo } = this.params;  
        const { isEditSerinumber, isEditMobile,options, AdditionIfo , user_info,GenderOptions} = this.state;
        if (passenger.Birthday) {
            if (passenger.Birthday === '0001-01-01T00:00:00') {
                passenger.Birthday = '';
            } else {
                passenger.Birthday = Util.Date.toDate(passenger.Birthday).format('yyyy-MM-dd');
            }
        }
        if (passenger.CertificateExpire) {
            if (passenger.CertificateExpire === '0001-01-01T00:00:00'||passenger.CertificateExpire === 'Invalid dateT00:00:00') {
                passenger.CertificateExpire = '';
            } else {
                passenger.CertificateExpire = Util.Date.toDate(passenger.CertificateExpire).format('yyyy-MM-dd');
            }
        }
        let soure = null;
        if (passenger.ImageUrl) {
            soure = {
                uri: passenger.ImageUrl
            }
        }
        if(passenger.CertificateNumber&& !passenger.Birthday){
            let str ;
            function insertStr(soure, start, newStr){   
                return soure.slice(0, start) + newStr + soure.slice(start);
             }
            if(passenger.CertificateNumber.length==18){
                passenger.CertificateNumber.slice(7,13)
                str= passenger.CertificateNumber.slice(6,14)
                str= insertStr(str,4,"-");
                str= insertStr(str,7,"-");
                str = str +'T00:00:00'
                let birthdayStr = Util.Date.toDate(str).format('yyyy-MM-dd'); 
                passenger.Birthday = birthdayStr==='NaN-aN-aN' ? '' : birthdayStr
            }
        }
        let costCenter = customerInfo&&customerInfo.Setting&&customerInfo.Setting.MassOrderConfig&&customerInfo.Setting.MassOrderConfig.FrequentTravellerCostCenterMode
        if(costCenter===0){
            passenger.CostCenter = user_info&&user_info.SettlementSubjectName
        }else if(costCenter===2){
            passenger.CostCenter = customerInfo.Setting.MassOrderConfig.FrequentTravellerCostCenter
        }
        passenger.NationalName = passenger.NationalName?passenger.NationalName:passenger.Nationality?passenger.Nationality:null
        return (
            <View style={{ flex:1}}>
                {
                    ViewUtil.getNameTips()
                }
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={GlobalStyles.keyViewSy}>
                        <Bt_inputView dicKey={'姓名'} 
                                  required={true}
                                  bt_text={passenger.Name} 
                                  _placeholder={'证件上的真实姓名'} 
                                  _callBack={(text)=>{
                                        passenger.Name = text;
                                        this.setState({});
                                  }}
                                  
                        />
                        <Bt_inputView dicKey={'英文姓'}
                                  required={true} 
                                  bt_text={passenger.LastName} 
                                  _placeholder={'姓氏'} 
                                  warm_text={'需与证件一致'} 
                                  _callBack={(text)=>{
                                        passenger.LastName = text;
                                        this.setState({});
                                  }}
                                  isEnName={true}
                        />
                        <Bt_inputView dicKey={'英文名'}
                                  required={true} 
                                  bt_text={passenger.FirstName} 
                                  _placeholder={'名'} 
                                  warm_text={'需与证件一致'} 
                                  _callBack={(text)=>{
                                        passenger.FirstName = text;
                                        this.setState({});
                                  }}
                                  isEnName={true}
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
                        {/* titleName,_selectName, _callBack,required,_placeholder */}
                        <SelectView titleName={'国籍/地区'}
                                      required={true}
                                      _selectName={passenger.NationalName}
                                      _placeholder={'请选择国籍/地区'} 
                                      _callBack={()=>{
                                            this.push('NationalCity', {
                                                refresh: (item) => {
                                                    passenger.NationalCode = item.Code;
                                                    this.passenger.NationalName = item.Name;
                                                    this.passenger.Nationality = item.Name;
                                                    this.passenger.NationalityCode = item.Code;
                                                    this.setState({
                                                    });
                                                },
                                                CertificateType:passenger.CertificateType
                                            });
                                      }}
                        />

                        <SelectView titleName={'证件类型'}
                                      required={true}
                                      _selectName={passenger.CertificateType}
                                      _placeholder={''} 
                                      _callBack={()=>{
                                        this.actionSheet.show();
                                      }}
                        />
                        <Bt_inputView dicKey={'证件号码'}
                                  required={true} 
                                  bt_text={isEditSerinumber ? passenger.CertificateNumber : Util.Read.simpleReplace(passenger.CertificateNumber)} 
                                  _placeholder={'证件号码(必填)'} 
                                  _onFocus={()=>{
                                        passenger.CertificateNumber = '';
                                        this.setState({ isEditSerinumber: true })
                                  }}
                                  _onBlur={()=>{
                                        this.setState({ isEditSerinumber: false })
                                  }}
                                  _callBack={(text)=>{
                                        if (this.state.isEditSerinumber) {
                                            passenger.CertificateNumber = text;
                                            this.setState({});
                                        }
                                  }}
                        />
                        {
                            (passenger.CertificateType=='身份证' || passenger.CertificateType == 'Chinese ID Card')?null:
                            <SelectView titleName={'有效期至'}
                                        required={true}
                                        _selectName={passenger.CertificateExpire}
                                        _placeholder={''} 
                                        _callBack={()=>{
                                            this._pickerExpire()
                                        }}
                            />
                        }
                        <SelectView titleName={'证件签发国'}
                                      required={(passenger.CertificateType=='身份证'||passenger.CertificateType=="Chinese ID Card")?false:true}
                                      _selectName={passenger.IssueNationName}
                                      _placeholder={'请选择'} 
                                      _callBack={()=>{
                                            this.push('NationalCity', {
                                                refresh: (item) => {
                                                    this.passenger.IssueNationCode = item.Code;
                                                    this.passenger.IssueNationName = item.Name;
                                                    this.setState({
                                                    });
                                                },
                                                // CertificateType:passenger.CertificateType
                                            });
                                      }}
                        />
                        <SelectView titleName={'出生日期'}
                                    required={true}
                                    _selectName={passenger.Birthday}
                                    _placeholder={'请选择出生日期'} 
                                    _callBack={()=>{
                                        this._pickerShow();
                                    }}
                        />
                        <SelectView titleName={'性别'}
                                    required={true}
                                    _selectName={passenger.SexDesc}
                                    _placeholder={'请选择性别'} 
                                    _callBack={()=>{
                                        this.GenderActionSheet.show();
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
                        {/* {
                          this.params.index ===1?null://综合订单编辑员工时不显示成本中心
                            customerInfo&&customerInfo.Setting.MassOrderConfig.FrequentTravellerCostCenterMode===1?
                                <Bt_inputView dicKey={'成本中心'}
                                    required={(this.params.title=='新增乘客'||passenger.CostCenterRequired) ? true : false} 
                                    bt_text={passenger.CostCenter} 
                                    _placeholder={this.params.title=='新增乘客'||passenger.CostCenterRequired?'请填写成本中心(必填)':'成本中心'} 
                                    _callBack={(text)=>{
                                            passenger.CostCenter = text;
                                            this.setState({});
                                    }}
                                />
                            :null 
                        } */}
                        {
                            customerInfo&&customerInfo.EmployeeDictList && customerInfo.EmployeeDictList.length > 0 ?
                            customerInfo.EmployeeDictList.map((obj, index) => {
                                let itemIndex;
                                // if(obj.BusinessCategory&256){
                                    itemIndex = AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(
                                        item => item.DictId === obj.Id
                                    );
                                    if(!itemIndex){
                                        itemIndex = obj
                                        itemIndex.DictName = obj.Name
                                        itemIndex.DictCode = obj.Code
                                    }
                                // }
                                
                                return (
                                    // itemIndex&&obj.ShowInOrder?
                                    itemIndex ?
                                    <InfoDicView index={index} 
                                                 obj={obj} 
                                                 editable={this.params.from === 'presonal'?true:false}
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
                        <View style={{height:30}}></View>
                        <CustomActioSheet ref={o => this.actionSheet = o} options={options} onPress={this._handlePress} />
                        <CustomActioSheet ref={o => this.GenderActionSheet = o} options={GenderOptions} onPress={this._genderHandlePress} />
                </KeyboardAwareScrollView>
                {
                        this.params.isDelet ?
                        ViewUtil.getTwoBottomBtn('删除', this._deletePasseneger,'完成', this._finishBtnClick)
                        : 
                        ViewUtil.getThemeButton('完成', this._finishBtnClick)
                }       
            </View>
        )
    }
    _genderHandlePress = (index) => {
        const { passenger } = this;
        if (index === 1) {
            passenger.SexDesc = '女';
            passenger.Sex = 2;
            passenger.Gender = 2;
        } else {
            passenger.SexDesc = '男';
            passenger.Sex = 1;
            passenger.Gender = 1;
        }
        this.setState({});
    }
    _valueCHange = (text, obj) => {
        const { AdditionIfo } = this.state;
        let itemIndex = AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictId === obj.Id);
        if (itemIndex) {
            itemIndex.ItemName = text;
            itemIndex.DictCode = obj.Code
            itemIndex.NeedInput = obj.NeedInput
        } else {
            let model = {
                DictId: obj.Id,
                DictName: obj.Name,
                ItemId: '',
                ItemSerialNumber: '',
                ItemName: text,
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
                let dic = AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictId === obj.Id);
                if (dic) {
                    dic.ItemId = data.Id;
                    dic.ItemSerialNumber = data.SerialNumber;
                    dic.ItemInput = `${data.SerialNumber} - ${data.Name} - ${data.EnName}`;
                    dic.ItemName = data.Name;
                    dic.EnName = data.EnName;
                    dic.DictCode = obj.Code
                    dic.NeedInput = obj.NeedInput
                } else {
                    let model = {
                        DictId: obj.Id,
                        DictName: obj.Name,
                        ItemId: data.Id,
                        ItemSerialNumber: data.SerialNumber,
                        ItemInput: `${data.SerialNumber} - ${data.Name} - ${data.EnName}`,
                        ItemName: data.Name,
                        FormatRegexp:obj.FormatRegexp,
                        EnName:data.EnName,
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
const styles = StyleSheet.create({
    row: {
        // height: 44,
        backgroundColor: 'white',
        // paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        paddingVertical:10
    },
    text: {
        // flex: 3,
    },
    input: {
        flex: 7,
        marginLeft:12,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 7,
        marginLeft:12
    },
    
})