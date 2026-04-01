import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Theme from '../../res/styles/Theme';
import CropImage from '../../custom/CropImage';
import Utils from '../../util/Util';
import FlightEnum from '../../enum/FlightEnum';
import CustomText from '../../custom/CustomText';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';
import FlightService from '../../service/FlightService';
import PropTypes from 'prop-types';
// import { Themed, withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import CommonService from '../../service/CommonService';

class CompListItem extends React.PureComponent {

    static propTypes = {
        order: PropTypes.object.isRequired,
        otwThis: PropTypes.object,
    }
    constructor(props) {
        super(props);
        this.state = {
            // showServiceCharge:true
        }
    }
    componentDidMount = () => {
        // let model = {
        //     OrderCategory: 1,//国内飞机
        //     MatchModel: null,
        // }
        // CommonService.CurrentCustomerServiceFees(model).then(response => {
        //     if (response && response.success && response.data) {
        //         this.setState({
        //             showServiceCharge: response.data.IsShowServiceFee
        //         })
        //     }else{
        //         this.toastMsg('获取数据异常');
        //     }
        // }).catch(error => {
        //     this.toastMsg(error.message);
        // })
    }

    render() {
        const { listArray,item } = this.props;
        let imgurl = ''
        listArray.map((item2) => {
            if (item.Category == item2.Category) {
                imgurl = item2.img
            }
        })
        let itemDesc =''
        let itemsDescs = [];
        if(item.Category ==4 || item.Category==6){//ArrivalTime 在酒店里是入住时间
            if(item.BriefInfo&&item.BriefInfo.ArrivalTime){
                itemDesc = Util.Date.toDate(item.BriefInfo.ArrivalTime).format('yyyy-MM-dd') +','+ item.BriefInfo.HotelName
            }
        }else if(item.Category ==14){
            if(item?.InternalOrder?.ProductCode == 9){
                itemDesc =Util.Parse.isChinese()? item?.InternalOrder?.SpecialTypeName : item?.InternalOrder?.SpecialTypeEnName
            }else{
                itemDesc = Util.Parse.isChinese()?'其他':"Miscellaneous"
            }
        }else if(item.Category == 7){
            itemsDescs = Array.isArray(item?.BriefInfo?.OrderBriefInfoTrips)
            ? 
            item.BriefInfo.OrderBriefInfoTrips.map((trip) => {
                const departure = trip.DepartureTime ? Util.Date.toDate(trip.DepartureTime).format('yyyy-MM-dd') : '';
                // const arrival = trip.ArrivalTime ? Util.Date.toDate(trip.ArrivalTime).format('yyyy-MM-dd') : '';
                const deptureCity = trip.DeptureCity || '';
                const arrivalCity = trip.ArrivalCity || '';
                return {
                    itemDesc: `${departure}，${deptureCity}-${arrivalCity}`
                };
            }) 
            : 
            [];
        }else{
            if(item.BriefInfo&&item.BriefInfo.DepartureTime){
                itemDesc = Util.Date.toDate(item.BriefInfo.DepartureTime).format('yyyy-MM-dd') +','+item.BriefInfo.DeptureCity+'-'+item.BriefInfo.ArrivalCity
            }
        }
        return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start',backgroundColor:'#fff',paddingHorizontal:10,borderBottomWidth:1,borderColor:Theme.normalBg }}>
                <Image source={imgurl} style={{ width: 36, height: 36,marginTop:6 }} />
                <View style={{  marginLeft: 15, paddingVertical:6,justifyContent:'space-between' }}>
                    {
                        item.Category == 7
                        ?
                        itemsDescs.map((item, index)=>{
                            return(
                                <CustomText key={item.itemDesc ? String(item.itemDesc) : String(index)} text={item.itemDesc} style={{ fontSize: 14, fontWeight: ('bold', '600'), color:Theme.fontColor,flexWrap:'wrap',marginRight:25 }} />
                            )
                        })
                        :
                        <CustomText text={itemDesc} style={{ fontSize: 14, fontWeight: ('bold', '600'), color:Theme.fontColor,flexWrap:'wrap',marginRight:25 }} />
                    }
                    <View style={{ flexDirection: 'row',marginTop:2 }}>
                        <CustomText style={{ fontSize: 12, color:Theme.commonFontColor }} text={'出行人'} />
                        <CustomText style={{ fontSize: 12, color:Theme.commonFontColor }} text={'：'} />
                        {
                            item.Category ===14?
                                <CustomText style={{ fontSize: 12 ,marginLeft:5, color:Theme.commonFontColor}} text={item?.InternalOrder?.OrderTravellerDesc} />
                            :
                            item&&item.BriefInfo&&item.BriefInfo.Travellers&&item.BriefInfo.Travellers.map((item, index)=>{
                                return(
                                    <CustomText key={`${String(item)}-${index}`} style={{ fontSize: 12 ,marginLeft:5, color:Theme.commonFontColor}} text={item} />
                                )
                            })
                        }
                    </View>
                </View>
            </View>
        )
    }
}
// export default withNavigation(CompListItem);
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <CompListItem {...props} />
    )
}

const styles = StyleSheet.create({
    // btn: {
    //     backgroundColor: Theme.theme,
    //     height: 22,
    //     marginLeft: 10,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     borderRadius:2,
    //     paddingHorizontal:15,       
    // },
    // btn2: {
    //     height: 22,
    //     marginLeft: 10,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     paddingHorizontal:15,
    //     borderWidth:1,
    //     borderColor:Theme.theme,
    //     borderRadius:2       
    // }
})
