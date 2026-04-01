import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableHighlight
} from 'react-native';

import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CompListItem from '../ComprehensiveOrder/CompListItem'
import I18nUtil from '../../util/I18nUtil';

/**
 * 综合订单审批项
 */
class CompApprovalItem extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        customerInfo: PropTypes.object.isRequired,
        // approvalStatus: PropTypes.number.isRequired,
        // onDetail: PropTypes.func.isRequired,
        onApprove: PropTypes.func,
        onReject: PropTypes.func
    }
    _toDetail = () => {
        const { item } = this.props;
        let workd ;
        item.ApprovalModel?.Steps.map((obj)=>{
             if(obj.level == item.ApprovalModel?.CurrentStep){
                workd = obj.Worked
             }
        })
        NavigationUtils.push(this.props.navigation,'CompDetailScreen',{
            orderId:item.Id, 
            approve: true,
            approveShow: (this.props.status != 2) && (item.Status ===1|| !workd) ? true:false });
    }
    render() {
        const { item , reject, approve, customerInfo,status } = this.props;
        if (!item) {
            return null
        }
        let fromDateDesc;
        if (item.DepartureTime) {
            let departureTime = Util.Date.toDate(item.DepartureTime);
            if (departureTime) {
                fromDateDesc = departureTime.format('yyyy-MM-dd HH:mm');
            }
        }
        let workd ;
        item.ApprovalModel?.Steps.map((obj)=>{
             if(obj.level == item.ApprovalModel?.CurrentStep){
                workd = obj.Worked
             }
        })
        let CreatorName = I18nUtil.tranlateInsert('预订人员：{{noun}}',item.Creator.Name);
        return (
            <TouchableHighlight onPress={this._toDetail} underlayColor='transparent'>
                <View style={{ backgroundColor: 'white', marginTop: 10, marginHorizontal:10, borderRadius:6,paddingHorizontal:10 }}>
                    <View style={{backgroundColor:'#fff',padding:10}}>
                        <View style={{borderBottomWidth:1,flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderColor:Theme.normalBg}}>
                            <View>
                                <CustomText text={CreatorName} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                                <CustomText text={Util.Date.toDate(item.CreateTime).format('yyyy-MM-dd HH:mm')} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                            </View>
                            
                            <View style={{alignItems:'flex-end'}}>
                                <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                    <View>
                                    <CustomText text={item.StatusDesc} style={{color:Theme.theme}}></CustomText>
                                    <CustomText text={Util.multipleOrderStatusDesc(item.Status)} style={{color:Theme.theme,fontSize:10}}></CustomText>
                                    </View>
                                    {
                                        item.Status === 5 ? (
                                            <View style={{marginLeft:5,marginTop:-18}}>
                                                <Image style={{ width: 28, height: 28 }} source={require('../../res/image/reject_icon.png')} />
                                            </View>
                                        ) : null
                                    }{
                                        item.Status === 3 ? (
                                            <View style={{marginLeft:5}}>
                                                <Image style={{ width: 28, height: 28 }} source={require('../../res/image/agree_icon.png')} />
                                            </View>
                                        ) : null
                                    }
                                </View>
                                <CustomText text={item.SerialNumber} style={{color:Theme.commonFontColor, padding:2, fontSize:12}}></CustomText>
                                
                            </View>
                        </View>
                    </View>
                    {
                        item.OrderItems.map((littleitem, index)=>{
                            return(
                                <CompListItem key={String(littleitem?.Id ?? littleitem?.OrderId ?? index)} listArray={listArray} item={littleitem} />
                            )
                        })
                    }
                {
                    (status != 2) && (item.Status ===1|| !workd)  ? (
                        <View style={styles.linViewS}>
                            <TouchableHighlight style={styles.btn2} underlayColor={'transparent'} onPress={reject} >
                                <CustomText style={{ color: Theme.theme }} text='驳回' />
                            </TouchableHighlight>
                            <TouchableHighlight style={styles.btn} underlayColor={'transparent'} onPress={approve}>
                                <CustomText style={{ color: 'white' }} text='同意' />
                            </TouchableHighlight>
                        </View>
                    ) : null
                }
                </View>
            </TouchableHighlight>
        );
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <CompApprovalItem {...props}  navigation={navigation}/>
    )
}

const styles = StyleSheet.create({
    mainFont: {
        fontSize: 15
    },
    aidFont: {
        marginTop: 5,
        fontSize: 12,
        color: Theme.aidFontColor
    },
    btn: {
        backgroundColor: Theme.theme,
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:15,       
    },
    btn2: {
        height: 22,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal:15,
        borderWidth:1,
        borderColor:Theme.theme,
        borderRadius:2       
    },
    linViewS:{ 
        flexDirection: 'row-reverse', 
        paddingBottom: 10, 
        paddingVertical:10,
        paddingHorizontal:10
    }
});
let listArray=[
    {
        Category: '1',
        name: '国内飞机',
        img: require('../../res/Uimage/plane.png'),
    },
    {
        Category: '4',
        name: '国内酒店',
        img: require('../../res/Uimage/hotel.png'),
    },
    {
        Category: '5',
        name: '火车',
        img: require('../../res/Uimage/train.png'),
    },
    {
        Category: '7',
        name: '国际飞机',
        img: require('../../res/Uimage/intPlane.png'),
    },
    {
        Category: '6',
        name: '国际酒店',
        img: require('../../res/Uimage/intHotel.png'),
    },
]
