import React from 'react';
import {
    View, ScrollView, TouchableHighlight, DeviceEventEmitter, Image, Modal,TouchableOpacity,StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import ApplicationService from '../../service/ApplicationService';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import OrderDetailInfoView from '../common/OrderDetailInfoView';
import ViewUtil from '../../util/ViewUtil';
import NavigationUtils from '../../navigator/NavigationUtils';
import Key from '../../res/styles/Key';
import CustomeTextInput from '../../custom/CustomTextInput';
import I18nUtil from '../../util/I18nUtil'
import  LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TextViewTitle from '../../custom/TextViewTitle';
import { Bt_inputView }  from '../../custom/HighLight';
import HighLight from '../../custom/HighLight';

export default class ApplicationOrderDetailScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "申请单详情",
            // hide:true,
            statusBar: {
                backgroundColor: Theme.theme,
            },
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
            comment: '',
            visible: false,
            showImageUrl: ''
        }
    }

    componentDidMount() {
        this.showLoadingView();
        let promise = null;
        if (!this.params.isApprove) {
            promise = ApplicationService.travelApplyDetail({
                Id: this.params.Id
            })
        } else {
            promise = ApplicationService.TravelApplyApprovalDetail({ ApplyId: this.params.Id })
        }
        promise.then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.setState({
                    order: response.data
                })
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
     * 取消订单
     */
    _cancelOrder = () => {
        const { order } = this.state;
        this.showLoadingView();
        let model = {
            Id: order.Id
        };
        ApplicationService.TravelApplyCancel(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('取消订单成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit('deleteApply', {});
                        NavigationUtils.popToTop(this.props.navigation);
                    })
                });
            } else {
                this.toastMsg(response.message || '取消订单失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '取消订单异常');
        })
    }

    _LeftTitleBtn = () => {
        this.pop();     
    }

    renderBody() {
        const { order } = this.state;
        const { approve,reject,approveShow} = this.params
        if (!order) return null;
        let journeyType = [];
        if (order.JourneyList) {
            order.JourneyList.forEach(obj => {
                journeyType.push(obj.JourneyTypeDesc);
            })
        }
        let commentReason = null;
        if (order.ApprovedList) {
            commentReason = order.ApprovedList.find(item => {
                return item.StatusDesc === "不同意";
            })
        }
        let createTime = Util.Date.toDate(order.CreateTime);
        let beginTime = Util.Date.toDate(order.Destination && order.Destination.BeginTime);
        let endTime = Util.Date.toDate(order.Destination && order.Destination.EndTime);
        return (
            <View style={{ flex:1 }}>
            <LinearGradient start={{x: 1, y: 0}} end={{x: 1, y: 0.5}} style={{flex:1}} colors={[Theme.theme,Theme.normalBg]}>
            <View style={{flexDirection:'row',justifyContent:'space-around',marginHorizontal:10,marginTop:15}}>
               <View style={{alignItems:'center'}}>
                    <Image source={require('../../res/Uimage/dt_select.png')} style={{width:20,height:20}}/>
                    <CustomText style={{fontSize:14, color:'#fff',marginTop:15}} text={'已提交'}></CustomText>
               </View>
               <View style={{width:98,height:2,backgroundColor:'#fff',marginTop:10}}></View>
               <View style={{alignItems:'center'}}>
                    <Image source={require('../../res/Uimage/dt_select.png')} style={{width:20,height:20}}/>
                    <CustomText style={{fontSize:14, color:'#fff',marginTop:15}} text={'审批中'}></CustomText>
               </View>
               <View style={{width:98,height:2,backgroundColor:order.Status==1?'#fff':'rgba(255,255,255,0.3)',marginTop:15,marginTop:10}}></View>
               <View style={{alignItems:'center'}}>
                    <Image source={require('../../res/Uimage/dt_select.png')} style={{width:20,height:20,tintColor:order.Status==1?'#fff':'rgba(255,255,255,0.3)'}}/>
                    <CustomText style={{fontSize:14, color:order.Status==1?'#fff':'rgba(255,255,255,0.3)',marginTop:15}} text={'已同意'}></CustomText>
               </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{marginTop:10}}>
                <View style={styles.viewStyle}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                        <CustomText text='基本信息' style={styles.titleStyle} />
                    </View>
                    <View style={{ backgroundColor: Theme.lineColor, height: 1, marginTop: 5 }}></View>
                    <View style={{  }}>
                        <View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='出差单号' />
                            <CustomText style={styles.itemTextStyle2}  text={order.SerialNumber} />
                        </View>
                        {
                        order.ExternalCode&&<View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='外部出差单号' />
                            <CustomText style={styles.itemTextStyle2}  text={order.ExternalCode} />
                        </View>
                        }
                        <View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='提交日期' />
                            {createTime?<CustomText style={styles.itemTextStyle2} text={createTime.format('yyyy-MM-dd')} />:null}
                        </View>
                        <View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='提交人' />
                            <CustomText style={styles.itemTextStyle2} text={order.CustomerEmployee.Name} />
                        </View>
                        <View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='出差事由' />
                            <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={order.TravelReason} />
                        </View>
                        <View style={styles.itemStyle}>
                            <CustomText style={styles.itemTextStyle} text='费用归属' />
                            <CustomText style={styles.itemTextStyle2} text={order.ApproveOrigin ? order.ApproveOrigin.Desc : null} />
                        </View>
                    </View>
                </View>
                <View style={styles.viewStyle}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                    <CustomText text='计划行程' style={styles.titleStyle} />
                    </View>
                    <View style={{ backgroundColor: Theme.lineColor, height: 1, marginTop: 5 }}></View>
                    {
                        order.TravelApplyMode == 1 ?
                            order.JourneyList.map((item, index) => {
                                return <View key={index}>
                                    <View style={styles.itemStyle}>
                                        <CustomText style={styles.itemTextStyle} text='行程信息' />
                                        <View style={{flexDirection:'row'}}>
                                        <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={Util.Date.toDate(item.BeginTime)?.format('yyyy/MM/dd')} numberOfLines={2} />
                                        {item?.EndTime? <CustomText style={{}} text={" - "+Util.Date.toDate(item?.EndTime)?.format('yyyy/MM/dd')} numberOfLines={2} />:null}
                                        </View>
                                    </View>
                                    <View style={styles.itemStyle}>
                                        <CustomText style={styles.itemTextStyle} text='出发城市' />
                                        <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]}text={Util.Parse.isChinese() ?item.Departure:item.DepartureEn} />
                                    </View>
                                    <View style={styles.itemStyle}>
                                        <CustomText style={styles.itemTextStyle} text='目的地城市' />
                                        <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={Util.Parse.isChinese() ?item.Destination:item.DestinationEn} />
                                    </View>
                                    <View style={styles.itemStyle}>
                                        <CustomText style={styles.itemTextStyle} text='预订类目' />
                                        <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={Util.Parse.isChinese() ? item.CategoryIntro : item.CategoryIntroEn} />
                                    </View>
                                    <View style={styles.itemStyle}>
                                        <CustomText style={styles.itemTextStyle} text='行程类型' />
                                        {/* <CustomText style={{ marginLeft: 30 }} text={journeyType.length > 0 ? journeyType.join(',') : ''} /> */}
                                        <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={item.JourneyTypeDesc} />

                                    </View>
                                    {
                                        commentReason ?
                                            <View style={styles.itemStyle}>
                                                <CustomText style={styles.itemTextStyle} text='驳回原因' />
                                                <CustomText style={styles.itemTextStyle2} text={commentReason.Comment} />
                                            </View> : null
                                    }
                                </View>
                            })
                            :
                            <View>
                                <View style={styles.itemStyle}>
                                    <CustomText style={styles.itemTextStyle} text='行程日期' />
                                    <View style={{ marginLeft: 30, flexDirection: 'row' }}>
                                        {beginTime?<CustomText text={beginTime.format('yyyy-MM-dd')} style={styles.itemTextStyle2} />:null}
                                        <CustomText text={' '} style={styles.itemTextStyle2} />
                                        <CustomText text={'至'} style={styles.itemTextStyle2} />
                                        <CustomText text={' '} style={styles.itemTextStyle2} />
                                        {endTime?<CustomText text={endTime.format('yyyy-MM-dd')} style={styles.itemTextStyle2} />:null}
                                    </View>
                                </View>
                                <View style={styles.itemStyle}>
                                    <CustomText style={styles.itemTextStyle} text='业务类目' />
                                    <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={order.Destination && order.Destination.CategoryIntro} />
                                </View>
                                <View style={styles.itemStyle}>
                                    <CustomText style={styles.itemTextStyle} text='出发城市' />
                                    <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={order.Destination && order.Destination.Departure} />
                                </View>
                                <View style={styles.itemStyle}>
                                    <CustomText style={styles.itemTextStyle} text='目的地城市' />
                                    <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={order.Destination && order.Destination.Destination} />
                                </View>
                                <View style={styles.itemStyle}>
                                    <CustomText style={styles.itemTextStyle} text='行程类型' />
                                    {/* <CustomText style={{ marginLeft: 30, flex: 1 }} text={journeyType.length > 0 ? journeyType.join(',') : ''} /> */}
                                    <CustomText style={[styles.itemTextStyle3,{ width:global.screenWidth/2}]} text={order.Destination && order.Destination.JourneyTypeDesc} />
                                </View>
                            </View>
                    }
                </View>
                <View style={styles.viewStyle}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                        <CustomText text='出差信息' style={styles.titleStyle} />
                    </View>
                    <View style={{ backgroundColor: Theme.lineColor, height: 1, marginTop: 5 }}></View>
                    <View style={{  }}>
                        {
                            order.TravellerList && order.TravellerList ?
                                order.TravellerList.map((obj, index) => {
                                    return (<View key={index}>
                                        <View style={styles.itemStyle}>
                                            <CustomText style={styles.itemTextStyle} text='出差人' />
                                            <View style={{flexDirection:'row'}}>
                                                <CustomText style={styles.itemTextStyle2} text={obj.Name } />
                                                <CustomText style={[styles.itemTextStyle2,{marginLeft:4}]}text={obj.Mobile} />
                                            </View>
                                        </View>
                                        <View style={styles.itemStyle}>
                                            <CustomText style={styles.itemTextStyle} text='所在部门' />
                                            <CustomText style={styles.itemTextStyle2} text={obj.DepartmentName ? obj.DepartmentName : obj.R2} />
                                        </View>
                                        {
                                            order.CostBudget && order.CostBudget > 0 ?
                                                <View style={styles.itemStyle}>
                                                    <CustomText style={styles.itemTextStyle} text='费用预算' />
                                                    <CustomText style={styles.itemTextStyle2} text={order.CostBudget} />
                                                </View>
                                                : null
                                        }
                                        <View style={[styles.itemStyle]}>
                                            <CustomText style={styles.itemTextStyle} text='证件类型' />
                                            <CustomText style={styles.itemTextStyle2} text={obj.Certificate && obj.Certificate.TypeDesc && obj.Certificate.TypeDesc} />
                                        </View>
                                        <View style={styles.itemStyle}>
                                            <CustomText style={styles.itemTextStyle} text='证件号码' />
                                            <CustomText style={styles.itemTextStyle2} text={obj.Certificate && obj.Certificate.SerialNumber && Util.Read.simpleReplace(obj.Certificate.SerialNumber)} />
                                        </View>
                                    </View>)
                                })
                                : null
                        }
                    </View>
                </View>
                {this._linkManInfoText()}
                <OrderDetailInfoView fromApplyOrder={true} order={order} customerInfo={{}} otwThis={this} showImage={(url) => {
                    this.setState({
                        showImageUrl: url,
                        visible: true
                    })
                }} />
                {this._renderCancel(order)}
                {this._renderApproveBtn(order)}
                {this._renderShowBigImage()}
            </ScrollView>
            </LinearGradient>
            { 
                approveShow?
                ViewUtil.getTwoBottomBtn('拒绝',this._rejectConfim,'同意',this._agreeConfim):
                null
            }
            </View>
        )
    }

    _linkManInfoText =()=>{
        const { order } = this.state
        if(!order || !order.Contact){return}
        return(
            <View style={{backgroundColor:'#fff',marginHorizontal:10,marginTop:10,borderRadius:6,paddingBottom:15,paddingTop:10}}>
                <TextViewTitle title={'知会人'} imgIcon={require('../../res/Uimage/shu.png')}style={{marginHorizontal:20,borderBottomWidth:1,borderColor:Theme.lineColor,marginLeft:20}}/>
                <View style={{paddingHorizontal:20}}>
                    <Bt_inputView dicKey={'姓名'} 
                                    required={false}
                                    bt_text={order.Contact.Name}//passenger.Name 
                                    no_editable={true}
                    />
                    <Bt_inputView dicKey={'手机号'}
                                    required={false} 
                                    bt_text={order.Contact?.Mobile?.replace(/(\d{3})(\d{4})(\d{4})/,"$1****$3")} 
                                    _placeholder={'手机号'} 
                                    no_editable={true}
                    />
                    <Bt_inputView dicKey={'Email'}
                                    required={false} 
                                    bt_text={order.Contact.Email} 
                                    no_editable={true}
                    />                    
                </View>
                
            </View>
        )
    }

    /**
  *  同意
  * @param  order 
  */
    _agreeConfim = () => {
        this.showAlertView(
            () => {
                return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <CustomText text='请输入同意原因' />
                    <CustomeTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
                </View>)
            }
            , () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定同意', () => {
                this.dismissAlertView();
                this._approve();
            })
        })
    }
    _approve = () => {
        const { order,comment } = this.state;
        let model = {
            BusinessId: order.Id,
            Comment: comment,
            Status: 1
        };
        this.showLoadingView();
        ApplicationService.TravelApplyApprove(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('审批成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit(Key.ApprovalChange, order);
                        this.pop();
                    })
                })
            } else {
                this.toastMsg(response.message || '审批失败,请联系客服');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })

    }

    /**
     *  驳回
     */
    _rejectConfim = (order) => {
        this.showAlertView(() => {
            return (<View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
                <HighLight name={'请输入驳回原因'} />
                <CustomeTextInput onChangeText={text => this.setState({ comment: text })} multiline={true} style={{ height: 60, width: 250, marginTop: 10, borderWidth: 1, borderColor: Theme.lineColor }} />
            </View>)
        }, () => {
            return ViewUtil.getAlertButton('我再想想', () => {
                this.dismissAlertView();
            }, '确定驳回', () => {
                this.dismissAlertView();
                this._reject(order);
            })
        })
    }
    _reject = () => {
        const { comment, order } = this.state;

        if (!comment) {
            this.toastMsg('驳回原因不能为空');
            return;
        }
        let model = {
            BusinessId: order.Id,
            Comment: comment,
            Status: 2
        };
        this.showLoadingView();
        ApplicationService.TravelApplyApprove(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                this.showAlertView('驳回成功', () => {
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        DeviceEventEmitter.emit(Key.ApprovalChange, order);
                        this.pop();
                    })
                })
            } else {
                this.toastMsg(response.message || '驳回失败,请联系客服');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
*  渲染审批按钮
*/
    _renderApproveBtn = (order) => {
        if (this.params.isApprove && order.StatusDesc === '待审批') {
            return (
                <View style={{ flexDirection: 'row', height: 60 }}>
                    <TouchableHighlight style={[{ flex: 1, backgroundColor: Theme.theme, margin: 10, borderRadius: 2 }, { alignItems: 'center', justifyContent: 'center' }]} onPress={this._agreeConfim} underlayColor='transparent'>
                        <CustomText style={{ color: 'white' }} text='同意' />
                    </TouchableHighlight>
                    <TouchableHighlight style={[{ flex: 1, backgroundColor: Theme.specialColor2, margin: 10, borderRadius: 2 }, { alignItems: 'center', justifyContent: 'center' }]} onPress={this._rejectConfim} underlayColor='transparent'>
                        <CustomText style={{ color: 'white' }} text='驳回' />
                    </TouchableHighlight>
                </View>
            )
        }
    }
    _renderCancel = () => {
        const { order } = this.state;
        if (order.StatusDesc === '待审批' && !this.params.isApprove) {
            return (
                <View>
                    {
                        ViewUtil.getSubmitButton('取消订单', this._cancelOrder)
                    }
                </View>
            )
        }
    }

    _renderShowBigImage = () => {
        return (
            <Modal transparent visible={this.state.visible}>
                <TouchableHighlight style={{ flex: 1 }} underlayColor='transparent' onPress={() => {
                    this.setState({
                        visible: false,
                        showImageUrl: ''
                    })
                }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: "center", justifyContent: 'center' }}>
                        <Image style={{ width: screenWidth-20, height: screenHeight-20, resizeMode:'contain' }} source={{ uri: this.state.showImageUrl }} />
                    </View>
                </TouchableHighlight>
            </Modal>
        )
    }


}
const styles = StyleSheet.create({
    viewStyle:{ 
        marginTop: 10, 
        backgroundColor: 'white', 
        padding: 20, 
        marginHorizontal: 10, 
        borderRadius: 6 
    },
    itemStyle:{ 
        flexDirection: 'row',
        justifyContent:'space-between',
        marginTop: 15 
    },
    titleStyle:{ 
        fontWeight: 'bold', 
        color: Theme.fontColor,
        fontSize:14 
    },
    itemTextStyle:{ 
        // width: 80
        fontSize:14,
        color:Theme.commonFontColor  
    },
    itemTextStyle2:{ 
        // width: 80,
        fontSize:14,
        color:Theme.fontColor  
    },
    itemTextStyle3:{ 
        // width: 80,
        fontSize:14,
        color:Theme.fontColor, 
        textAlign: 'right',
        // width:global.screenWidth/2,
        // backgroundColor:'yellow'
    }
})