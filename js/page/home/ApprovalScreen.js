import React from 'react';

import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import CommonService from '../../service/CommonService';
import I18nUtil from '../../util/I18nUtil';
import  LinearGradient from 'react-native-linear-gradient';
import {connect} from 'react-redux';
// import { Right } from 'native-base'

class ApprovalScreen extends SuperView {
  constructor(props) {
    super(props);
    this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    this._navigationHeaderView = {
      title: '审批',
      hideLeft: false
    }
    this.state = {
       approvalCount:{}
    }
    // approvalThis = this;
  }
  componentDidMount() {
    this.addPageFouces = this.props.navigation.addListener('willFocus', () => {
      this.setState({})
    });
    this.BackApprovalRefreshListener = DeviceEventEmitter.addListener(
      'BackApprovalRefresh',  //监听器名
      () => {
        this.getApproveCount(); //此处写你的得到列表数据的函数
      },
    );
    this.getApproveCount();
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    // this.addPageFouces && this.addPageFouces.remove();
    this.BackApprovalRefreshListener && this.BackApprovalRefreshListener.remove();
  }
  // static navigationOptions = ({ navigation }) => ({
  //   tabBarLabel: I18nUtil.translate('审批'),
  //   tabBarIcon: ({ tintColor, focused }) => {
  //     let source = focused ? require('../../res/image/icon-48-2-cur.png') : require('../../res/image/icon-48-2.png');
  //     return (
  //       <View style={[{ flexDirection: 'row' }, styles.icon]}>
  //         <Image source={source} style={[{ width: 18, height: 19 }, { tintColor: tintColor }]} />
  //         {
  //           navigation.state.params && navigation.state.params.needApprovelCount > 0
  //             ?
  //             <View style={{ backgroundColor: Theme.theme, width: 8, height: 8, borderRadius: 4, marginLeft: -8, marginTop: -1 }}></View>
  //             :
  //             null
  //         }
  //       </View>
  //     );
  //   },
  //   tabBarOnPress: ({ defaultHandler }) => {
  //     /** 处理跳转时间 */
  //     defaultHandler();
  //     ApprovalScreen.getApproveCount(navigation);
  //   },
  //   header: null
  // });
  /**
   *  获取审批数量
   */
  // static getApproveCount = (navigation) => {
  //   CommonService.WaitAooroveCount().then(reponse => {
  //     if (reponse && reponse.success && reponse.data) {
  //       let count = reponse.data.FlightOrderCount + reponse.data.HotelOrderCount + reponse.data.IntlFlightOrderCount + reponse.data.TrainOrderCount + reponse.data.TravelApplyCount;
  //       navigation.setParams({ approvalCount: reponse.data, needApprovelCount: count });
  //     } else {
  //     }
  //   }).catch(error => {
  //     console.log(error);
  //   })
  // }

  getApproveCount = () => {
    CommonService.WaitAooroveCount().then(response => {
      if (response && response.success && response.data) {
        let count = response.data.FlightOrderCount + response.data.HotelOrderCount + response.data.IntlFlightOrderCount + response.data.TrainOrderCount + response.data.TravelApplyCount;
        // navigation.setParams({ approvalCount: reponse.data, needApprovelCount: count });
        this.setState({
          approvalCount:response.data
        })
      } else {
      }
    }).catch(error => {
      console.log(error);
    })
  }
  /**
   *  前往订单页
   */
  _toDetail = (type) => {
    this.push('ApprovalList', { type });
  }

  _renderItem = (item, index) => {
    // const { approvalCount } = this.(props.route ? props.route.params : {}) || {};
    const {approvalCount} = this.state;
    let icon = 0;
    if (approvalCount) {
      if (item.key === 'flight') {
        icon = approvalCount.FlightOrderCount;
      } else if (item.key === 'apply') {
        icon = approvalCount.TravelApplyCount;
      } else if (item.key === 'train') {
        icon = approvalCount.TrainOrderCount;
      } else if (item.key === 'hotel') {
        icon = approvalCount.HotelOrderCount;
      } else if (item.key === 'intlHotel') {
        icon = approvalCount.ForeignHotelOrderCount;
      }
      else if (item.key === 'intlFlight') {
        icon = approvalCount.IntlFlightOrderCount;
      } else if(item.key == 'comprehensive'){
        icon = approvalCount.MassOrderCount
      }
      // else if (item.key === 'car'){
      //   icon = approvalCount.CarApplyCount;
      // }
      // else if (item.key === 'reimbuse'){
      //   icon = approvalCount.s;
      // }
    }
    return (
      <TouchableHighlight key={index} underlayColor='transparent' style={{}} onPress={this._toDetail.bind(this, item.key)}>
      <LinearGradient 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 0}}
                    style={[styles.row,{ borderBottomColor: index === pannelArr.length - 1 ? 'transparent' : Theme.lineColor,borderBottomWidth:1}]}
                    colors={['#fff','#fff']} 
                    >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image style={{ width: 20, height: 20 }} source={item.img} />
              <CustomText style={{ marginLeft: 10,fontSize:14 }} text={item.name} />
            </View>
            <View style={{flexDirection:'row',alignItems:'center'}}>
            {!icon ? null : 
               <View style={{  backgroundColor: Theme.greenBg, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 10,paddingHorizontal:8,paddingVertical:3 }}>
                  <Text style={{ color: Theme.theme, fontSize: 12 }}>{icon > 999 ? '...' : '+' + icon}</Text>
               </View>
            } 
            <Ionicons name={'chevron-forward'}
                        size={20}
                        style={{color: 'lightgray'}}
                      />
            </View>
      </LinearGradient>
      </TouchableHighlight>
    )
  }
  renderBody() {
    const {compSwitch} = this.props;
    const {customerInfo} = this.params;
    return (
      <View style={{backgroundColor:Theme.normalBg,flex:1}}>
        <View style={{margin:10,backgroundColor:'#fff',padding:10, backgroundColor:'#fff',borderRadius:6}}>
          {
            pannelArr.map((item, index) => {
              if(!compSwitch && index==1){
                  return null;
              }else if(!(customerInfo&&customerInfo.Addition&&customerInfo.Addition.HasTravelApplyAuth) && index==0){
                return null;
              }else{
                return this._renderItem(item, index);
              }
            })
          }
        </View>
      </View>
    )
  }
}
const mapStateToProps = state => ({
  compSwitch: state.compSwitch.bool,
});
export default connect(mapStateToProps)(ApprovalScreen);



const pannelArr = [{
  name: '出差申请',
  img: require('../../res/Uimage/bag.png'),
  key: 'apply'
},
{
  name: '综合订单',
  img: require('../../res/Uimage/comLogo.png'),
  key: 'comprehensive'
},
// {
//   name: '报销申请',
//   img: require('../../res/image/icon-65-8.png'),
//   key: 'reimbuse'
// }, 

// {
//   name: '用车申请',
//   img: require('../../res/image/icon-65-2.png'),
//   key: 'car'
// }, 
{
  name: '国内机票',
  img: require('../../res/Uimage/m_flight.png'),
  key: 'flight',
}, {
  name: '火车票',
  img: require('../../res/Uimage/m_train.png'),
  key: 'train',
}, {
  name: '国内酒店',
  img: require('../../res/Uimage/m_hotel.png'),
  key: 'hotel',
}, {
  name: '港澳台及国际机票',
  img: require('../../res/Uimage/m_intFlight.png'),
  key: 'intlFlight',
},
{
  name: '港澳台及国际酒店',
  img: require('../../res/Uimage/m_intHotel.png'),
  key: 'intlHotel',
}
]


const styles = StyleSheet.create({
  row: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    // backgroundColor:'red'
    
  }
})

