import React from 'react';
import {
    TouchableHighlight,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../../custom/CustomText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import I18nUtil from '../../util/I18nUtil';
import Theme from '../../res/styles/Theme';
import Feather from 'react-native-vector-icons/Feather';
import Util from '../../util/Util';
import Foundation from 'react-native-vector-icons/Foundation';

export default class LisItemView extends React.PureComponent {

    static propTypes = {
        item: PropTypes.object.isRequired,
        filterOptions: PropTypes.object.isRequired,
        callBack: PropTypes.func.isRequired,
    }


    _onClick = (item,index) => {
        this.props.callBack(item,index);
    }
    render() {
        const { item, index,filterOptions, cityList } = this.props;
        if (!item) return null;
        getMinPrice(item);
        //进行一步筛选
        // if (filterOptions.TrainType !== '不限' && filterOptions.TrainType !== item.trainType) {
        //     return null;
        // }
        if (filterOptions.TrainNewType !== '不限' && filterOptions.TrainNewType !== item.train_type) {
            return null;
        }
        //如果和filterOptions.FromStations2这个数组里的每个只值都不一样 则返回null
        if (filterOptions.FromStations2&&filterOptions.FromStations2.length > 0 && !filterOptions.FromStations2.includes(item.from_station_name)) {   
            return null;
        }
        if (filterOptions.ToStations2&&filterOptions.ToStations2.length > 0 && !filterOptions.ToStations2.includes(item.to_station_name)) {
            return null;
        }
        if (filterOptions.FromStations !== '不限' && filterOptions.FromStations !== item.from_station_name) {
            return null;
        }
        if (filterOptions.ToStations !== '不限' && filterOptions.ToStations !== item.to_station_name) {
            return null;
        }
        if(filterOptions.TrainGroup !== '不限' &&  !new RegExp(filterOptions.TrainGroup).test(item.fxh_flag)){//智能动车 复兴号 等筛选
            return null;
        }
        if(filterOptions.TrainTicketType !== '不限'){
            let trainTicketList = []
            item.ticketTypes.map((_t_obj)=>{
                trainTicketList.push(_t_obj.seat)
            })
            if(!trainTicketList.includes(filterOptions.TrainTicketType)){
                return null;
            }     
        }
        if (filterOptions.FromTime!== '不限') {
            if(_timeClick(filterOptions.FromTime,item.start_time)==1){
                return null;
            }
        }
        if (filterOptions.ToTime!== '不限') {
            if(_timeClick(filterOptions.ToTime,item.arrive_time)==1){
                return null;
            }
        }
        cityList&&cityList.map((_item)=>{
                if(_item.Code == item.from_station_code){
                    item.FromStationEnName = _item.EnName
                }else if(_item.Code == item.to_station_code){
                    item.ToStationEnName = _item.EnName
                }
         })
         let noSaleStr = Util.Parse.isChinese() ? '未开售' : 'Not On Sale'
         let saleStr =Util.Parse.isChinese() ? '已售完' : 'Sold out'
         //如果还没有到达开售时间sell_ticket_date 则显示未开售
         let str = ''
         if(item.sell_ticket_date){
            function getDateWithoutTime(date) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
            let _nowTime = new Date();
            let _time = new Date(item.sell_ticket_date)
            const dateOnly = getDateWithoutTime(_nowTime);
            const dateOnly2 = getDateWithoutTime(_time);
            if(dateOnly.getTime() < dateOnly2.getTime()){
                str = noSaleStr;
            }
            if(dateOnly.getTime() >= dateOnly2.getTime()){
                str = saleStr;
            }
         }
         let regex1 = new RegExp(1);// 正则表达 判断返回字符串是否包含1 复兴号
         let regex2 = new RegExp(2);// 2智能动车
         let regex3 = new RegExp(3);// 3动感号
        return(
            <TouchableOpacity onPress={this._onClick.bind(this, item,index)} style={{ backgroundColor:Theme.normalBg}}>
                <View style={{marginBottom:10,borderRadius:6,backgroundColor:'#fff',marginHorizontal:10,padding:10}}>
                    <View style={{flexDirection:'row',backgroundColor:'#fff'}}>
                    {
                        regex1.test(item.fxh_flag) ?
                            <View style={{backgroundColor:Theme.orangeBg,height:18,borderBottomRightRadius:6,borderTopLeftRadius:6,paddingHorizontal:10,alignItems:'center',justifyContent:'center'}}>
                                <CustomText text={'复兴号'} style={{fontSize:11,color:Theme.orangeColor}}></CustomText>
                            </View>
                        :null
                    }
                    {
                        regex2.test(item.fxh_flag) ?
                            <View style={{backgroundColor:'rgba(245, 240, 236, 1)',height:18,borderBottomRightRadius:6,borderBottomLeftRadius:6,paddingHorizontal:10,alignItems:'center',justifyContent:'center',marginLeft:5}}>
                                <CustomText text={'智能动车'} style={{fontSize:11,color:'rgba(163,108,71,1)'}}></CustomText>
                            </View>
                        :null
                    }
                    {
                        regex3.test(item.fxh_flag)?
                       
                            <View style={{backgroundColor:Theme.pinkBg,height:18,borderBottomRightRadius:6,borderTopLeftRadius:6,paddingHorizontal:10,alignItems:'center',justifyContent:'center'}}>
                                <CustomText text={'动感号'} style={{fontSize:11,color:Theme.redColor}}></CustomText>
                            </View>
                        :null
                    }
                    </View>
                    <View style={{paddingHorizontal:10,paddingVertical:10,backgroundColor:'#fff'}}> 
                    <View style={styles.flightTimeView}>
                        <View style={styles.fleghtLittleView}>
                            <View style={{justifyContent: 'flex-start',width:80,marginRight:-10}}>
                                <CustomText text={item.start_time} style={{ fontSize: 20, fontWeight: 'bold' }}></CustomText>
                                <View style={{flexDirection:'row',marginTop:2,alignItems:'flex-start'}}>
                                    <View style={{flexDirection:'row',height:14,width:14,backgroundColor:Theme.theme,alignItems:'center',justifyContent:'center',borderRadius:2,marginRight:2}}>
                                        <Feather name={'arrow-up-right'} style={{textAlign:'center'}} size={15} color={'#fff'}/>
                                    </View>
                                    <CustomText style={{ fontSize: 12,textAlign:'left',lineHeight: 16  }} text={Util.Parse.isChinese() ? item.from_station_name : item.FromStationEnName} ></CustomText>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center',marginTop:-3 }}>
                                <View style={{ flexDirection: 'row' ,alignItems:'center'}}>
                                    <CustomText style={{ fontSize: 13, color: Theme.commonFontColor }} text={item.train_code} />
                                    {
                                        item.isQuietCoach?
                                        <Image style={{height:13,width:13}} source={require('../../res/Uimage/trainFloder/quiteIcon.png')}></Image>
                                        :null
                                    }                                  
                                {item.is_support_card == 1? <Image style={{marginLeft:5,height:16,width:20}} source={require('../../res/image/ID_Identity.png')}/>:null} 
                                </View>
                                <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                                <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => this.props.trainlistCallBack?.(item, index)}>
                                    <CustomText text={item.runTimeDesc} style={{ fontSize: 11, color: Theme.aidFontColor, marginTop: 1 }} />
                                    <Image style={{marginLeft:2,height:5,width:7}} source={require('../../res/Uimage/trainFloder/caret_down.png')}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{width:80,marginLeft:-10}}>
                                <View style={{ flexDirection: 'row',justifyContent: 'flex-end' }}>
                                <CustomText text={item.arrive_time} style={{ fontSize: 20, fontWeight: 'bold' }}></CustomText>
                                {
                                    item.arrive_days > 0 ?
                                        <CustomText style={{ marginRight: -11, fontSize: 12, marginLeft: 3 }} text={'+' + item.arrive_days + (Util.Parse.isChinese() ? '天' : 'day')} />
                                        : null
                                }
                                </View>
                                <View style={{flexDirection:'row',justifyContent: 'flex-end', marginTop: 2,alignItems:'flex-start'}}>
                                    <View style={{flexDirection:'row',height:14,width:14,backgroundColor:Theme.RedMarkColor,alignItems:'center',justifyContent:'center',borderRadius:2,marginRight:2}}>
                                       <Feather name={'arrow-down-right'} style={{textAlign:'center'}} size={15} color={'#fff'}/>
                                    </View>
                                    <CustomText style={{ fontSize: 12,textAlign:'right',marginRight:item.arrive_days > 0 ? 18 :0 }} text={Util.Parse.isChinese() ? item.to_station_name : item.ToStationEnName} ></CustomText>
                                </View>
                            </View>
                        </View>
                        <View style={{backgroundColor: '#fff', flex: 1, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: "flex-end" }}>
                                <CustomText text={'¥ '} style={{ fontSize: 14, marginTop: 6, color: Theme.theme }}></CustomText>
                                <CustomText text={item.displayPrice} style={{ fontSize: 20, color: Theme.theme }}></CustomText>
                            </View>
                            {
                                this.props.highRisk && this.props.highRisk.Level>0 &&
                                <Foundation name={'info'} style={{ marginRight: 5 }} size={20} color={this.props.highRisk.Level == 1 ? Theme.theme : this.props.highRisk.Level == 2 ? Theme.redColor : null} />
                            }
                        </View>
                    </View>
                    <View style={{justifyContent:'center',borderTopWidth:1,borderColor:Theme.lineColor, marginTop: 15,backgroundColor:'#fff'}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12,backgroundColor:'#fff'  }}>
                            {
                                item.ticketTypes && item.ticketTypes.map((obj, index) => {
                                    return (
                                        item.can_buy_now==='N'?
                                        <View style={{ flexDirection: 'row', marginRight: 20, alignItems: 'center' }} key={index}>
                                                <CustomText text={obj.seat} style={styles.aidFont} />
                                                <Text style={{fontSize: 10,color: Theme.orangeColor,marginLeft:2}}>{noSaleStr}</Text>
                                        </View>:
                                        <View style={{ flexDirection: 'row', marginRight: 20, alignItems: 'center' }} key={index}>
                                            <CustomText text={obj.seat} style={styles.aidFont} />
                                            <Text style={styles.aidFont2}>{isNaN(obj.seatCount)||obj.seatCount==0 ? str : obj.seatCount}</Text>
                                            {isNaN(obj.seatCount)||obj.seatCount==0?null: <CustomText text='张' style={styles.aidFont2} />}
                                        </View>
                                    )
                                })
                            }
                    </View>
                    </View>
                </View>
                </View>
            </TouchableOpacity>
        ) 
    }
}
/**
 * 动车编码（动车，高铁，高速动车，城际高速，香港直通车）
 */
// const dcCodes = ['D', 'G', 'GD', 'C', 'XGZ'];
function getMinPrice(item) {
    item.ticketTypes = [];
    item.runTimeDesc = item.run_time.replace(/[:：]/g, I18nUtil.translate('时')) + I18nUtil.translate('分');
    let check = item.IsCheckSeat == 1 && item.TrainSerat;
    // if (dcCodes.includes(item.train_type)) {
    //     item.trainType = '高铁动车';
    // } else {
    //     item.trainType = '普通列车';
    // }
    if (+item.yz_price > 0) {
        item.ticketTypes.push({
            seat: '硬座',
            seatCount: !isNaN(item.yz_num) || item.yz_num ? (+item.yz_num) : 0,
            price: +item.yz_price,
            checkSeat: check ? check.is_checkyz_num : 1
        });
    }
    if (+item.wz_price > 0) {
        item.ticketTypes.push({
            seat: '无座',
            seatCount: !isNaN(item.wz_num) || item.wz_num ? (+item.wz_num) : 0,
            price: +item.wz_price,
            checkSeat: check ? check.is_checkwz_num : 1
        });
    }
    if (+item.rz_price > 0) {
        item.ticketTypes.push({
            seat: '软座',
            seatCount: !isNaN(item.rz_num) || item.rz_num ? (+item.rz_num) : 0,
            price: +item.rz_price,
            checkSeat: check ? check.is_checkrz_num : 1
        });
    }
    if (+item.yw_price > 0) {
        item.ticketTypes.push({
            seat: '硬卧',
            seatCount: !isNaN(item.yw_num) || item.yw_num ? (+item.yw_num) : 0,
            price: +item.ywx_price,
            checkSeat: check ? check.is_checkyw_num : 1
        });
    }
    if (+item.rw_price > 0) {
        item.ticketTypes.push({
            seat: '软卧',
            seatCount: !isNaN(item.rw_num) || item.rw_num ? (+item.rw_num) : 0,
            price: +item.rwx_price,
            checkSeat: check ? check.is_checkrw_num : 1
        });
    }
    if (+item.dw_price > 0) {
        item.ticketTypes.push({
            seat: '动卧',
            seatCount: !isNaN(item.dw_num) || item.dw_num ? (+item.dw_num) : 0,
            price: +item.dwx_price,
            checkSeat: check ? check.is_checkdw_num : 1
        })
    }
    if (+item.gjrw_price > 0) {
        item.ticketTypes.push({
            seat: '高级软卧',
            seatCount: !isNaN(item.gjrw_num) || item.gjrw_num ? (+item.gjrw_num) : 0,
            price: +item.gjrw_price,
            checkSeat: check ? check.is_checkgjrw_num : 1
        });
    }
    if (+item.edz_price > 0) {
        item.ticketTypes.push({
            seat: '二等座',
            seatCount: !isNaN(item.edz_num) || item.edz_num ? (+item.edz_num) : 0,
            price: +item.edz_price,
            checkSeat: check ? check.is_checkedz_num : 1
        });
    }
    if (+item.ydz_price > 0) {
        item.ticketTypes.push({
            seat: '一等座',
            seatCount: !isNaN(item.ydz_num) || item.ydz_num ? (+item.ydz_num) : 0,
            price: +item.ydz_price,
            checkSeat: check ? check.is_checkydz_num : 1
        });
    }
    if (+item.edw_price > 0) {
        item.ticketTypes.push({
            seat: '二等卧',
            seatCount: !isNaN(item.edw_num) || item.edw_num ? (+item.edw_num) : 0,
            price: +item.edwx_price,
            checkSeat: check ? check.is_checkedw_num : 1
        });
    }
    if (+item.ydw_price > 0) {
        item.ticketTypes.push({
            seat: '一等卧',
            seatCount: !isNaN(item.ydw_num) || item.ydw_num ? (+item.ydw_num) : 0,
            price: +item.ydwx_price,
            checkSeat: check ? check.is_checkydw_num : 1
        });
    }
    if (+item.swz_price > 0) {
        item.ticketTypes.push({
            seat: '商务座',
            seatCount: !isNaN(item.swz_num) || item.swz_num ? (+item.swz_num) : 0,
            price: +item.swz_price,
            checkSeat: check ? check.is_checkswz_num : 1
        });
    }
    if (+item.tdz_price > 0) {
        item.ticketTypes.push({
            seat: '特等座',
            seatCount: !isNaN(item.tdz_num) || item.tdz_num ? (+item.tdz_num) : 0,
            price: +item.tdz_price,
            checkSeat: check ? check.is_checktdz_num : 1
        });
    }
    if (+item.yxydz_price > 0) {
        item.ticketTypes.push({
            seat: '优选一等座',
            seatCount: !isNaN(item.yxydz_num) || item.yxydz_num ? (+item.yxydz_num) : 0,
            price: +item.yxydz_price,
            checkSeat: check ? check.is_checktdz_num : 1
        });
    }
    if (item.ticketTypes.length > 0) {
        let minPriceTicket = item.ticketTypes[0];
        item.displaySeat = minPriceTicket.seat;
        item.displayPrice = isNaN(minPriceTicket.price) ? 0 : minPriceTicket.price;
        item.displayStatus = getStatusDesc(minPriceTicket.seatCount);
    } else {
        item.displaySeat = '无座';
        item.displayPrice = 0;
        item.displayStatus = '已售完';
    }
}
function _timeClick (fromTime,time)  {
    if(fromTime == '0-8点'){
        let _time = '08:00'
        const fullDate1 = new Date(`2023-01-01T${time}`); 
        const fullDate2 = new Date(`2023-01-01T${_time}`); 
        if(fullDate2 - fullDate1 < 0){ 
            return 1;
        }
    }else if(fromTime == '8-12点'){
        let _time = '08:00'
        let _etime = '12:00'
        const fullDate1 = new Date(`2023-01-01T${time}`); 
        const fullDate2 = new Date(`2023-01-01T${_time}`);
        const fullDate3 = new Date(`2023-01-01T${_etime}`); 
        if(fullDate2 - fullDate1 > 0){
            return 1;
        }
        if(fullDate3 - fullDate1 < 0){ 
            return 1;
        }
    }else if(fromTime == '12-18点'){
        let _time = '12:00'
        let _etime = '18:00'
        const fullDate1 = new Date(`2023-01-01T${time}`); 
        const fullDate2 = new Date(`2023-01-01T${_time}`);
        const fullDate3 = new Date(`2023-01-01T${_etime}`); 
        if(fullDate2 - fullDate1 > 0){
            return 1;
        }
        if(fullDate3 - fullDate1 < 0){ 
            return 1;
        }
    }else if(fromTime == '18-24点'){
        let _time = '18:00'
        let _etime = '24:00'
        const fullDate1 = new Date(`2023-01-01T${time}`); 
        const fullDate2 = new Date(`2023-01-01T${_time}`);
        const fullDate3 = new Date(`2023-01-01T${_etime}`); 
        if(fullDate2 - fullDate1 > 0){
            return 1;
        }
        if(fullDate3 - fullDate1 < 0){ 
            return 1;
        }
    }
}

//获取售票状态
getStatusDesc = (number) => {
    if (!number) return '无票';
    var tmpNum = Number(number);
    if (isNaN(tmpNum) || tmpNum < 1) {
        return '无票';
    } else if (tmpNum > 20) {
        return '充足';
    } else {
        return number + '张';
    }
}


const styles = StyleSheet.create({
    /**
   * 主色字体
   */
    mainFont: {
        fontSize: 20,
        color: '#333'
    },
    /**
     * 价格字体
     */
    priceFont: {
        fontSize: 20,
        color: Theme.theme
    },
    /**
    * 辅助字体
    */
    aidFont: {
        fontSize: 12,
        color: '#999'
    },
    aidFont2: {
        fontSize: 12,
        color: Theme.orangeColor,
        marginLeft:2
    },
    /**
    * 价格辅助字体
    */
    priceAidFont: {
        fontSize: 12,
        color: Theme.theme
    },
    flightTimeView: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1,
        backgroundColor:'#fff'
    },
    fleghtLittleView: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        flex: 3
    },
    noTrainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noTrainText: {
        fontSize: 16,
        color: Theme.aidFontColor,
    },
})