import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
    Text
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HotelService from '../../service/HotelService';
import NavigationUtils from '../../navigator/NavigationUtils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PickerHelper from '../../common/PickerHelper';
import CommonService from '../../service/CommonService';
import ChinaBankList from '../../res/js/ChinaBankList';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import cardTypeList from '../../res/js/hotelcardtypelist.js';
export default class AddCreditCardScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "添加银行卡"
        }
        this.state = {
            cardName: null,
            guaranteeOptions: [
                '维萨卡(Visa)',
                '日财卡(Japanese Credit Bureau Credit Card)',
                '美国运通卡(American Express)',
                '大莱卡(Diners Club)',
                '发现卡(Discover Card)',
                '环球航空旅行计划卡(Universal Air Travel Card)',
                '中国银联卡(China Union Pay Card)',
                '万事达卡(Master Card)'
            ],
            Expire: null,
            eyeOff: true,
            CardNo: null,
            beforeCardNo:null,
            IsEdit: false,
        }

        //编辑赋值
        if (this.params && this.params.editcredit) {
            this._navigationHeaderView.title = "编辑信用卡"
            this.state.cardName = cardTypeList.find(m => m.CardType == this.params.editcredit.CardType);
            this.state.Expire = this.params.editcredit.Expire;
            this.state.CardNo = this.params.editcredit.CardNo;
            this.state.IsEdit = true;
        }

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

    _selectCard = () => {
        const { yilong } = this.state;
        this.push('SelectCreditCardScreen', {
            callBack: (obj) => {
                this.setState({
                    cardName: obj
                })
            }
        })
    }

    _submitButton = () => {
        const { cardName, guaranteeOptions, CardNo, Expire } = this.state;

        if (!cardName) {
            this.toastMsg('请选择信用卡类型');
            return;
        }
        if (!CardNo) {
            this.toastMsg('信用卡卡号不能为空');
            return;
        }
        if (!Expire) {
            this.toastMsg('有效期不能为空');
            return;
        }
        //是否验证卡号 编辑时如未修改卡号无序再次验证
        var isValidateCardNo = true;
        if(this.state.IsEdit && this.params.editcredit.CardNo == CardNo){
            isValidateCardNo = false;
        }

        if(isValidateCardNo){
            if (cardName.Name === guaranteeOptions[0]) {//Visa以4开头，有16位数字
                var stuCardReg = /^4\d{15}$/
                var stuCardReg2 = /^4\d{11}$/
                if (!stuCardReg.test(CardNo) && !stuCardReg2.test(CardNo)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }
            else if (cardName.Name === guaranteeOptions[7]) {//数字51到55或2221到2720开头。全部有16位数字 万事达卡
                var stuCardReg = /^5[1-5][0-9]{14}|^(222[1-9]|22[3-9]\\d|2[3-6]\\d{2}|27[0-1]\\d|2720)[0-9]{12}$/
                if (!stuCardReg.test(CardNo)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            } else if (cardName.Name === guaranteeOptions[1]) {//JCB以35开头，有16位数字 以2131或1800开头的15位
                var stuCardReg = /^35\d{14}$/
                var stuCardReg2 = /^2131\d{11}$/
                var stuCardReg3 = /^1800\d{11}$/
                if (!stuCardReg.test(CardNo) && !stuCardReg2.test(CardNo) && !stuCardReg3.test(CardNo)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            } else if (cardName.Name === guaranteeOptions[2]) {//美国运通卡号以34或37开头，有15位数字
                var stuCardReg1 = /^34\d{13}$/
                var stuCardReg2 = /^37\d{13}$/
                if (!stuCardReg1.test(CardNo) && !stuCardReg2.test(CardNo)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            } else if (cardName.Name === guaranteeOptions[3]) {//卡号从300到305、36或38开头，全部有14个数字。或者以5开头有16位数字 大来卡
                var stuCardReg = /^5\d{15}$/
                var stuCardReg2 = /^30[0-5]\d{11}$/
                var stuCardReg3 = /^36\d{12}$/
                var stuCardReg4 = /^38\d{12}$/
                if (!stuCardReg.test(CardNo) &&
                    !stuCardReg2.test(CardNo) &&
                    !stuCardReg3.test(CardNo) &&
                    !stuCardReg4.test(CardNo)
                ) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            } else if (cardName.Name === guaranteeOptions[4]) { //发现卡
                var stuCardReg = /^65\d{14}$/
                var stuCardReg2 = /^6011\d{12}$/
                if (!stuCardReg.test(CardNo) && !stuCardReg2.test(CardNo)) {
                    this.toastMsg('信用卡卡号格式有误，请重新输入');
                    return;
                }
            }
        }

        //个人
        let models = {
            CardNo: CardNo,
            CardType: cardName.CardType,
            Expire: Expire,
        }
        
        //出行人
        let model2 = {
            CardNo: CardNo,
            CardType: cardName.CardType,
            Expire: Expire,
            EmployeeId: this.params.Id
        }

        //新增信用卡
        var saveService = this.params.cardFrom && this.params.cardFrom === 'handerCredit' ? CommonService.HandShakeCreateCreditCard : CommonService.CreateCreditCard;
        //编辑信用卡
        if (this.state.IsEdit) {
            saveService = this.params.cardFrom && this.params.cardFrom === 'handerCredit' ? CommonService.HandShakeUpdateCreditCard : CommonService.UpdateCreditCard;
            var model = this.params.cardFrom && this.params.cardFrom === 'handerCredit' ? model2 : models;
            model.Id = this.params.editcredit.Id;
        }
        let request = this.params.cardFrom && this.params.cardFrom === 'handerCredit' ? model2 : models

        let refreshKey = this.params.cardFrom && this.params.cardFrom === 'handerCredit' ? 'handerCardRefresh' : 'CardRefresh'
        this.showLoadingView();
        saveService(request).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('保存成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit(refreshKey, {});
                        this.pop()
                    })
                })
            } else {
                this.toastMsg(response.message || '获取数据异常')
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message);
        })
    }

    clickSure = (validate, model) => {
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
                        if (result.data && result.data.IsPayConfirm) {
                            this.push('HotelGuranteeMessageVertify', { OrderId: this.params.OrderId, CreditCard: model.CreditCard, isIntl: this.params.isIntl });
                        } else {
                            this.showAlertView('订单生成成功,您可去我的订单中查看', () => {
                                return ViewUtil.getAlertButton('取消', () => {
                                    this.dismissAlertView();
                                    NavigationUtils.popToTop(this.props.navigation);
                                }, '确定', () => {
                                    this.dismissAlertView();
                                    if (this.params.isIntl) {
                                        this.push('InterHotelOrderListScreen');
                                    } else {
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

    pickerYear = () => {
        PickerHelper.create(PickerHelper.createYYYYDate(), null, (data) => {
            if (data) {
                this.setState({
                    validYear: data[0]
                });
            }
        })
    }

    pickerMonth = () => {
        PickerHelper.create(PickerHelper.createMMDate(), null, (data) => {
            if (data) {
                this.setState({
                    validMonth: data[0]
                });
            }
        })
    }

    _pickerExpire = () => {
        
        PickerHelper.create(PickerHelper.createYYYYMMDate(), new Date(), (data) => {
            let Expire = data[1] + '/' + data[0].substr(-2, 2)
            this.setState({
                Expire: Expire
            });
        })
    }

    renderBody() {
        const { CardNo, cvv, validYear, validMonth, Name, SeriNumber, Type, options, cardName, Mobile, yilong, bankStr, isUnionPay, Expire, eyeOff } = this.state;
        let elongBank = ['中国工商银行', '中国银行', '交通银行', '兴业银行', '招商银行', '广东发展银行', '中国民生银行', '中信银行'];
        let markStr = "在个人信用卡中维护信用卡信息即认为您认知并同意如下事宜:"
        let markStr2 = "我们收集您的信用卡号、信用卡到期日等个人敏感信息仅用于实现您的酒店预定担保用途，维护在您的个人资料中的信用卡卡号、信用卡类型、信用卡到期日等数据按照支付卡行业数据安全标准（PCI-DSS）存储和传输。为了您的财产安全，请您妥善保管个人账号和密码，建议每三个月更换密码。如您对此有疑问，请联系我们。"
        return (
            <View style={{ flex: 1, backgroundColor: Theme.normalBg }}>
                {
                    isUnionPay && <CustomText style={{ margin: 10, marginLeft: 15, color: Theme.orangeColor }} text='注意：请使用带有银联标记的信用卡' />
                }
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: Theme.yellowBg }}>
                    <Text>
                        <Text style={{ flexDirection: 'row', lineHeight: 18 }}>
                            <AntDesign name={'exclamationcircleo'} color={Theme.theme} size={14} style={{}} />
                            <CustomText text={' '} style={{ fontSize: 12, color: Theme.theme }} />
                            <CustomText text={markStr} style={{ fontSize: 12, color: Theme.theme, marginLeft: 5 }} />
                        </Text>
                        <CustomText text={markStr2} style={{ fontSize: 12, color: Theme.theme, marginTop: 8 }} />
                    </Text>
                </View>
                <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" style={{ margin: 10 }} showsVerticalScrollIndicator={false}>
                    <View style={{ padding: 10, borderRadius: 6, backgroundColor: 'white' }}>
                        <View style={styles.row}>
                            <View style={{
                                flex: 3,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <CustomText text='信用卡类型' />
                                <CustomText text='*' style={{ color: Theme.redColor, fontSize: 18 }} />
                            </View>

                            <View style={styles.right}>
                                <CustomText text={cardName && cardName.Name} style={{ flex: 1, color: Theme.commonFontColor }} onPress={this._selectCard} />
                                <Ionicons name={'chevron-forward'} size={20} color={'lightgray'} />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={{
                                flex: 3,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <CustomText text='信用卡号' />
                                <CustomText text='*' style={{ color: Theme.redColor, fontSize: 18 }} />
                            </View>
                            <CustomeTextInput placeholder='请输入信用卡卡号' style={{ flex: 7, color: Theme.commonFontColor }}
                                value={CardNo}
                                onFocus={() => {
                                    if(CardNo && CardNo.includes('**')){
                                        this.setState({ beforeCardNo:CardNo,CardNo:null });
                                    }
                                }}
                                onBlur={() => {
                                    if (CardNo) {
                                        if (isUnionPay || yilong) {
                                            let model = {
                                                cardNo: IdName,
                                            }
                                            CommonService.validateAndCacheCardInfo(model).then(response => {
                                                if (response && response.bank) {
                                                    ChinaBankList.map(item => {
                                                        if (item.name == response.bank) {
                                                            if (yilong) {
                                                                if (elongBank && elongBank.includes(item.value)) {
                                                                    this.setState({ bankStr: item.value })
                                                                } else {
                                                                    this.toastMsg('只接受发卡行（中信银行，中国银行，中国工商银行，中国民生银行，兴业银行，广发银行，招商银行，交通银行）的银联卡，请更换');
                                                                    return;
                                                                }
                                                            } else {
                                                                this.setState({ bankStr: item.value })
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    this.toastMsg('卡号录入错误，请检查');
                                                }
                                            }).catch(error => {
                                                this.hideLoadingView();
                                                this.toastMsg(error.message);
                                            })
                                        }
                                    }else{
                                        this.setState({ CardNo:this.state.beforeCardNo })
                                    }
                                }}
                                onChangeText={text => this.setState({ CardNo: text })}
                                secureTextEntry={eyeOff}
                            />
                            <TouchableOpacity style={{ padding: 8 }} onPress={() => { this.setState({ eyeOff: !eyeOff }) }}>
                                <Feather name={eyeOff ? 'eye-off' : 'eye'} size={18} color={eyeOff ? Theme.promptFontColor : Theme.theme} style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 8, paddingRight: 0 }} onPress={() => { this.setState({ CardNo: '' }) }}>
                                <AntDesign name={'closecircle'} size={16} color={Theme.promptFontColor} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <CustomText text='有效期' style={{ flex: 3 }} />
                            <View style={styles.right}>
                                <CustomText style={{ flex: 1 }} text={Expire} onPress={() => {
                                    this._pickerExpire()
                                }} />
                                <Ionicons name={'chevron-forward'} size={20} color={'lightgray'} />
                            </View>
                        </View>
                    </View>

                </KeyboardAwareScrollView>
                {
                    ViewUtil.getThemeButton('提交', this._submitButton)
                }
            </View>
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