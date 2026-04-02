
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableHighlight
} from 'react-native';
import CustomText from '../../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../../navigator/NavigationUtils';
import Theme from '../../../res/styles/Theme';
import  LinearGradient from 'react-native-linear-gradient';
import CommonService from '../../../service/CommonService';
import Util from '../../../util/Util';
class PersonalPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        //    cleck:false
            panelArray : [{
                    key: 'flight',
                    name: '国内机票',
                    img: require('../../../res/Uimage/m_flight.png'),
                    img2: require('../../../res/image/icon-65-1-2.png'),
                    cleck:false
                }
                    , {
                    key: 'hotel',
                    name: '国内酒店',
                    img: require('../../../res/Uimage/m_hotel.png'),
                    img2: require('../../../res/image/icon-65-5-2.png'),
                    cleck:false
                },
                {
                    key: 'train',
                    name: '火车票',
                    img: require('../../../res/Uimage/m_train.png'),
                    img2: require('../../../res/image/icon-65-3-2.png'),
                    cleck:false
                },
                {
                    key: 'intlFlight',
                    name: '港澳台及国际机票',
                    img: require('../../../res/Uimage/m_intFlight.png'),
                    img2: require('../../../res/image/icon-65-2-2.png'),
                    cleck:false
                },
                {
                    key: 'intlHotel',
                    name: '港澳台及国际酒店',
                    img: require('../../../res/Uimage/m_intHotel.png'),
                    img2: require('../../../res/image/icon-80-6-2.png'),
                    cleck:false
                }, 
                // {
                //     key: 'taxi',
                //     name: '用车',
                //     img: require('../../../res/Uimage/m_car.png'),
                //     img2: require('../../../res/image/icon-65-4-2.png'),
                //     cleck:false
                // }, 
                // {
                //     key: 'mice',
                //     name: '会奖旅游',
                //     img: require('../../../res/image/icon-65-6.png'),
                //     img2: require('../../../res/image/icon-65-6-2.png'),
                //     cleck:false
                // }, 
                // {
                //     key: 'manager',
                //     name: '管理中心',
                //     img: require('../../../res/image/icon-65-7.png'),
                //     img2: require('../../../res/image/icon-65-7-2.png'),
                //     cleck:false
                // },
            ]
        }
    }

    componentDidMount = () => {
        const {panelArray} = this.state;
        // let invoice = {
        //     key: 'invoice',
        //     name: 'Invoice',
        //     img: require('../../../res/image/icon-65-6.png'),
        //     img2: require('../../../res/image/icon-65-6-2.png'),
        //     cleck:false
        // }
        CommonService.OrderHubInvoiceRight().then(response => {//获取是否展示invoice
            if (response && JSON.parse(response).success) {
                // panelArray.push(invoice); 
                this.setState({});
            } else {
                    this.toastMsg(response.message || 'No Invoice');
            }
        }).catch(error => {
            this.toastMsg(error.message || 'No Invoice');
        })
    }

    _toDetail = (item) => {
        const { navigation,employeePermission } = this.props;
        item.cleck=!item.cleck
        this.setState({})
        if (item.key === 'flight') {
            NavigationUtils.push(navigation, 'FlightOrderList',{backtoMy:true});
        } else if (item.key == 'hotel') {
            NavigationUtils.push(navigation, 'HotelOrderListScreen',{backtoMy:true});
        } else if (item.key === 'train') {
            NavigationUtils.push(navigation, 'TrainOrderListScreen',{backtoMy:true});
        } else if (item.key === 'intlFlight') {
            NavigationUtils.push(navigation, 'IntlFlightOrderList',{backtoMy:true});
        } else if (item.key === 'intlHotel') {
            NavigationUtils.push(navigation, 'InterHotelOrderListScreen',{backtoMy:true});
        } else if (item.key === 'taxi') {
            NavigationUtils.push(navigation, 'CarOrderList');
        } else if (item.key === 'mice') {
            NavigationUtils.push(navigation, 'MiceOrderList');
        }else if (item.key === 'manager') {
            NavigationUtils.push(navigation, 'managerCenterScreen');
        }
        // else if (item.key === 'invoice') {
        //     NavigationUtils.push(navigation, 'DownInvoiceListScreen');
        // }
    }

    render() {
        const {employeePermission } = this.props;
        const {panelArray} = this.state;
        return (
                <LinearGradient 
                        start={{x: 1, y: 0}} 
                        end={{x: 1, y: 1}}
                        style={styles.viewStyle}
                        colors={['#fff','#fff',]}
                        >
                    {/* <View style={{height:26, paddingHorizontal:10, marginTop:20, width:screenWidth-60,}}>
                        <View  style={styles.lableStyle}>
                           <CustomText  style={{fontSize:15}} text={'我的订单'} />
                        </View>
                    </View> */}
                    {
                        panelArray.map((item, index) => {
                            return (
                                <TouchableHighlight key={index} underlayColor='transparent'  
                                        onPress={()=>{
                                            item.cleck=!item.cleck
                                            this.setState({})
                                        }}
                                        onLongPress={()=>{
                                            item.cleck=!item.cleck
                                            this.setState({})
                                        }} 
                                        onPressOut={this._toDetail.bind(this, item)}
                                        style={{ marginBottom: 10, marginTop:10, alignItems: Util.Parse.isChinese()?'center':'flex-start',}}
                                         delayLongPress={300} // 适当延长长按触发时间
                                         shouldCancelWhenOutside={true} // 滑动到组件外时取消
                                        > 
                                            
                                        { 
                                            <View style={[styles.center, { width: (screenWidth-22) / 3 ,paddingVertical:10}]}>
                                                <View style={styles._vStyle}>
                                                <Image source={item.img} style={{ height: 26, width: 26 }} />
                                                </View>
                                                <CustomText allowFontScaling={false} style={{ marginTop: 5, fontSize:11, color:Theme.fontColor}} text={item.name} />
                                            </View>
                                        }                                 
                                </TouchableHighlight>
                            )
                        })
                    }
                
                </LinearGradient>
        )
    }
}

export default function(props) {
    const navigation = useNavigation();
    return <PersonalPanel {...props} navigation={navigation} />;
}



const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        // justifyContent: 'center',
    },
    _vStyle:{
        height: 50, 
        width: 50 ,
        backgroundColor:Theme.greenBg,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:25,
        elevation:1.0, shadowColor:'#999999', shadowOffset:{width:2,height:2}, shadowOpacity: 0.1, shadowRadius: 1, 
    },
    viewStyle: { 
        backgroundColor: 'white', 
        flexDirection: 'row',
        flex: 1, 
        margin: 10, 
        flexWrap: 'wrap',
        // borderWidth:1,
        borderRadius:6,
        // borderColor:Theme.theme,
        // elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5, 
    },
    viewStyle2: { 
        backgroundColor: 'white', 
        flex: 1, 
        margin: 10, 
        // flexWrap: 'wrap',
        borderRadius:6,
        borderWidth:1,
        borderColor:Theme.theme,
        elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5, 
    },
    lableStyle:{
        width:80,
        backgroundColor:Theme.themeJ,
        alignItems:'center',
        justifyContent:'center',
        flex: 1,
        borderTopLeftRadius:14,
        borderBottomRightRadius:14,
        elevation:1.5, shadowColor:'#BBBBBB', shadowOffset:{width:1,height:1}, shadowOpacity: 0.8, shadowRadius: 3}
})