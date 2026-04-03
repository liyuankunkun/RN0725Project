import React from 'react';

import {
    View,
    Image,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Text
} from 'react-native';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import FlightEnum from '../../enum/FlightEnum';
import FlightService from '../../service/FlightService';
import Pop from 'rn-global-modal';
import ViewUtil from '../../util/ViewUtil';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class MorePriceView extends React.PureComponent {

    _ruleBtnClick = () => {
        const { moreThis, priceObj } = this.props;
        if(priceObj.SupplierType==2){
            this._chTravellerRules(priceObj,1);
            return;
        }
        moreThis.ruleView.show(priceObj);
    }
    _ruleBtnClick2 = () => {
        const { moreThis, priceObj } = this.props;
        if(priceObj.SupplierType==2){
            this._chTravellerRules(priceObj,2);
            return;
        }
        moreThis.ruleView2.show(priceObj);
    }

    _chTravellerRules(priceObjItem,index) {
            const { moreThis, priceObj } = this.props;
            if(!priceObj){return};
            let model51 = {
                segId: priceObjItem.Id,
                cabin: priceObjItem.ResBookDesigCode,
                dataId: priceObjItem.DataId,
                supplierType: priceObjItem.SupplierType,
                DepartureTime:priceObjItem.DepartureTime,
            }
            FlightService.ChTravellerRules(model51).then(response => {
                if (response && response.success&& response.data) {
                    if(priceObj){
                        priceObj.PolicySummary = response.data
                    }
                    index==1?
                    moreThis.ruleView.show(priceObj)
                    :
                    moreThis.ruleView2.show(priceObj);
                }else{
                    moreThis.toastMsg(response.message || '获取数据异常'); 
                } 
            }).catch(error => {
                moreThis.toastMsg(error.message || '获取数据异常');
            })
    }

    _showCanbinDes = (obj) => {
        const { moreThis } = this.props;
        moreThis.toastMsg(Util.Parse.isChinese()? obj.CabinTagDesc:obj.CabinEnTagDesc);
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
    getViolationModeDesc = (mode) => {
        const modeMap = {
          0: '超标弹窗提示',
          1: '超标禁止预订',
          2: '超标审批',
          3: '超标现付',
          4: '超标自选审批或现付',
        };
        return modeMap[mode] || '未知处理模式';
      }
    _alert = (obj) => {
        Pop.show(
            <View style={styles.popStyle}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',margin:20}}>
                    <CustomText text={'违背政策详情'} style={{fontSize:15,fontWeight:'bold',color:Theme.RedMarkColor}}/>
                    <TouchableOpacity onPress={()=>{Pop.hide()}}>
                    <FontAwesome name='close' size={15} color={Theme.darkColor} style={{marginLeft:10}}></FontAwesome>
                    </TouchableOpacity>
                </View>
                <View style={{width:'100%',height:1,backgroundColor:Theme.lineColor}}></View>
                {
                    obj.map((item)=>{
                        return (
                            <View style={{padding:10,backgroundColor:Theme.pinkBg,marginHorizontal:20,marginTop:15,borderRadius:8}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                <FontAwesome name='exclamation-circle' size={15} color={Theme.RedMarkColor} style={{marginLeft:10}}></FontAwesome>
                                <CustomText text={item.RuleTypeDesc} style={{color:Theme.RedMarkColor,marginLeft:5}}/>
                                </View>
                                <CustomText text={this.getViolationModeDesc(item.ViolationMode)} style={{marginLeft:30}}/>
                            </View>
                        )
                    })
                }
            </View>,
            {animationType: 'slide-up', maskClosable: true, onMaskClose: ()=>{}}
        )
    }
    _selectCabinList(applyCanbinLimit){
        if(!applyCanbinLimit){return}
        switch(applyCanbinLimit){
            case 'F':
                //返回经济舱和超值经济舱
                return['F','Y','W','C-J-F']
            case 'CJ':
                //返回经济舱和超值经济舱
                return['Y','W','C-J-F']
            case 'C':
                //返回经济舱和超值经济舱
                return['Y','W','C-J-F']
            case 'J':
                //返回经济舱和超值经济舱
                return['Y','W','C-J-F'] 
            case 'P':
                //返回经济舱和超值经济舱
                return['Y','W']
            case 'Y':
                //返回经济舱和超值经济舱
                return['Y']           
        }
    }

    render() {
        const { priceObj, isChange, feeType, orderBtnClick, oldModel,moreThis ,travellerNum, oldPolicySummary,customerInfo,isOnlyApply,applyCanbinLimit} = this.props;
        if (!priceObj) return null;
        let data = priceObj
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
         let setNum = true;//判断席位是否比人数多 A是大于9席
         if(data.ResBookDesigQuantity != 'A' && travellerNum>data.ResBookDesigQuantity){
                setNum = false
         }
        //改期规则 
        let dataPtice ;
        let dataTax ;
        if(isChange){
             dataPtice = priceObj.PriceCha
             dataTax = data.Tax - oldModel.Tax //税额差价    费用差价和税额差价的和<0的话，不允许改签
        }else{
            dataPtice = data.Price
            dataTax = data.Tax
        }
        // this._selectCabinList(applyCanbinLimit)//返回可选择的舱位
        // applyCanbinLimit如果不包含该舱位data.ServiceCabin，就不显示这条
        if(this._selectCabinList(applyCanbinLimit) && !(this._selectCabinList(applyCanbinLimit).includes(data.ServiceCabin))){
            return null
        }
        return (
            <View style={styles.view}>
                {
                    data.MorePriceTag ?
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ backgroundColor: Theme.orangeBg,borderTopLeftRadius:6,borderBottomRightRadius:6  }}>
                                <CustomText style={{ color: Theme.orangeColor, fontSize: 11,paddingHorizontal:5, paddingVertical:2}} text={data.MorePriceTag} />                                
                            </View>
                           </View> 
                        :
                        null
                }
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal:20,flex:1,paddingVertical:10 }}>
                    <View style={{flex:7}}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {  
                                    // dataPtice?
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5 }}>
                                        {isChange?<CustomText style={{fontSize: 16}} text='+' />:null}
                                        <Text>
                                        <CustomText style={{fontSize: 14,fontWeight:'bold'}} text='¥' />
                                        <CustomText style={{ fontSize: 20,fontWeight:'bold' }} text={dataPtice} />
                                        </Text>
                                    </View>
                                //    :null
                                }
                                <View style={{ flexDirection: 'row'}}>
                                    <CustomText style={{ fontSize: 14 }} text={Util.Parse.isChinese() ? (isChunQiuSer ? ('商务' + data.ResBookDesinCodeDesc) : data.ResBookDesinCodeDesc) : data.EnResBookDesinCodeDesc} />
                                    <CustomText style={{ fontSize: 14}} text={'('+ data.ResBookDesigCode+')' } />
                                </View>
                                <CustomText style={{ fontSize: 14,marginHorizontal:5  }} text={DiscountRateDesc} /> 
                            </View>
                            <View style={{ marginTop: 10, flexDirection: 'row',flexWrap:'wrap', alignItems: 'center' }}>
                                {(!isChange && feeType===1)?
                                    <TouchableOpacity 
                                        onPress={()=>{
                                            if(data.ViolationRules && data.ViolationRules.length>0){
                                                this._alert(data.ViolationRules)
                                            }
                                        }}>
                                        <CustomText text={(data.ViolationRules && data.ViolationRules.length>0) ?'违背':'符合'} 
                                                    style={{ backgroundColor: (data.ViolationRules && data.ViolationRules.length>0) ?Theme.redColor:Theme.theme, borderRadius: 2, color: '#fff', paddingHorizontal: 5, fontSize: 11, paddingVertical:1,marginRight:4 }}
                                            />
                                    </TouchableOpacity>:null
                                }
                                {
                                    flightstate == 1 ?
                                            <CustomText text='协议' style={styles.xyStyle} />
                                        :null
                                }
                                {
                                    data.ProductCabins&&data.ProductCabins.map((item)=>{
                                        return( <CustomText style={styles.xyStyle3} 
                                                    text={Util.Parse.isChinese()? item.ProductTag: item.ProductEnTag} 
                                                    onPress={()=>{
                                                        moreThis.showAlertView(Util.Parse.isChinese()? item.ProductDesc: item.ProductEnDesc,()=>{
                                                            return ViewUtil.getAlertButton("确定",()=>{
                                                                moreThis.dismissAlertView();
                                                            })
                                                        })
                                                    }}
                                        />)
                                    })
                                }
                                {
                                    data.CabinTag ?
                                       
                                        Util.Parse.isChinese()?
                                        <CustomText text={ data.CabinTag} onPress={this._showCanbinDes.bind(this, data)} style={styles.xyStyle2} />
                                        :
                                        <CustomText text={data.CabinEnTag} onPress={this._showCanbinDes.bind(this, data)} style={styles.xyStyle2} />
                                       
                                    : null
                                }

                                <CustomText style={{ fontSize: 12, marginRight: 10 ,color:Theme.commonFontColor }} text={'CO₂ : '+data.CarbonEmission+"kg"} />
                            </View>
                            <View style={{ marginTop: 10, flexDirection: 'row',flexWrap:'wrap', alignItems: 'center' }}>        
                                <CustomText style={{ fontSize: 12, marginRight: 10,color:Theme.theme,textDecorationLine: 'underline',textDecorationStyle:'solid' }}  onPress={this._ruleBtnClick} text='退改规则' />
                                <CustomText style={{ fontSize: 12, marginRight: 10 ,color:Theme.theme,textDecorationLine: 'underline',textDecorationStyle:'solid' }} onPress={this._ruleBtnClick2} text='行李说明' />
                            </View>
                    </View>
                    <View style={{flex:3,justifyContent: 'flex-end',flexDirection:'row'}}>
                        <View style={{}}>
                        {
                        isOnlyApply ||(!data.EnableBook && this.props.feeType === 1)?
                            <TouchableOpacity underlayColor='transparent'
                                               style={[styles.orderbtn,{backgroundColor:'gray'}]} 
                                                onPress={()=>{
                                                    if(!data.EnableBook && this.props.feeType === 1){
                                                        moreThis.toastMsg(data.BlockBookingReason||'不符合您的差标规则，禁止预订');
                                                        return;
                                                    }else{
                                                        moreThis.toastMsg("请选择申请单预订");
                                                        return;
                                                    }
                                                }} 
                                                disabled={false}  >
                                    <CustomText style={{ color:'#fff'}}
                                        text={isChange ? '改签' : '预订'}
                                    />
                            </TouchableOpacity>
                        :
                            setNum&&<TouchableOpacity underlayColor='transparent' 
                                                onPress={orderBtnClick}
                                                style={[styles.orderbtn,{ backgroundColor: isChange ? ((dataPtice+dataTax < 0) || (!data.EnableBook) ? 'lightgray' : Theme.theme) : (this.props.highRiskLevel==2?'lightgray':(data.EnableBook ? Theme.theme : (feeType == 2 ? Theme.theme : 'lightgray'))) }]} 
                                                disabled={isChange ?
                                                                (dataPtice+dataTax < 0? true : (data.EnableBook ? false : true)) 
                                                                : false}  >
                                 <CustomText style={{color: '#fff'}} text={isChange ? '改签' : '预订'}/>
                            </TouchableOpacity>
                        }
                        { 
                          FlightCabinCategoryDesc?
                          <CustomText style={{ fontSize: 11, color: Theme.theme,textAlign:'center',marginTop:2 }} text={FlightCabinCategoryDesc} />
                          :null
                        }
                        {!setNum&&<TouchableOpacity underlayColor='transparent'
                                            style={styles.orderbtn2}  
                                            disabled={true}  >
                                <CustomText style={{ color:'#fff'}} text={'余票不足'} />
                        </TouchableOpacity>}
                        </View>
                    </View>
                </View>
            </View>    
        )
    }
}

const styles = StyleSheet.create({
    view: {
        // flexDirection: 'column',
        backgroundColor: 'white',
        marginTop:10,
        marginHorizontal: 10,
        // marginVertical: 10,
        borderRadius: 6,
        // padding: 20,
        // elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5,
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
        // marginRight: 10,
        height: 30,
        backgroundColor: Theme.theme,
        width: 50,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
       
        
        
    },
    orderbtn2: {
        backgroundColor: Theme.pinkBg,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding:1,
        marginTop:2
    },
    viewShadow:{ //该属性只支持>=android 5.0 
        elevation:1.5, shadowColor:'#aac', shadowOffset:{width:0,height:0}, shadowOpacity: 1, shadowRadius: 1.5, 
    },
    xyStyle:{
        backgroundColor: Theme.orangelableColor, 
        borderRadius: 2, 
        color: '#fff', 
        paddingHorizontal: 5, 
        fontSize: 11,
        marginRight:4,
        paddingVertical:1,
    },
    xyStyle2:{
        backgroundColor: Theme.pinkBg, 
        borderRadius: 2, 
        color: Theme.redColor, 
        paddingHorizontal: 3, 
        fontSize: 11,
        marginRight:4,
        paddingVertical:1
    },
    xyStyle3:{
        // backgroundColor: Theme.redColor, 
        borderRadius: 2, 
        color: Theme.orangeColor, 
        paddingHorizontal: 3, 
        fontSize: 11,
        marginRight:4,
        borderWidth:1,
        borderColor:Theme.orangeColor,
        textAlign:'center',
        justifyContent:'center',
        alignItems:'center',
        marginTop:5
    },
    popStyle:{height:500,
        backgroundColor:'#fff',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
    }    
})