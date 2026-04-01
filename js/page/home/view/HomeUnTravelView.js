import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../../navigator/NavigationUtils';
import Util from '../../../util/Util';
import TrainEnum from '../../../enum/TrainEnum';
import TrainService from '../../../service/TrainService';
import PropTypes from 'prop-types';
import StorageUtil from '../../../util/StorageUtil';
import Key from '../../../res/styles/Key';
import FlightEnum from '../../../enum/FlightEnum';
import FlightService from '../../../service/FlightService';
import InflFlightService from '../../../service/InflFlightService';
import IntlHotelService from '../../../service/IntlHotelService';
import HotelService from '../../../service/HotelService';
import HomeUnTravelItem from './HomeUnTravelItem'
import CustomText from '../../../custom/CustomText';
import Theme from '../../../res/styles/Theme'

// const TIME = 30 * 1000;
const TIME = 1000;
class HomeUnTravelView extends React.Component {
    _extraUniqueKey=(item ,index)=>'index'+ item+index
    constructor(props) {
        super(props);
        this.state = {
            allList:[],
            fligtData:{},
            trainData:{},
            hotelData:{},
            intlhotelData:{},
            InflfligtData:{},
            
        }
        this.aaa = 0
        this.screenWidth = Dimensions.get('window').width
    }
    static propTypes = {
        userInfo: PropTypes.object.isRequired,
        unUsedTrainOrder: PropTypes.object
    }
     componentDidMount() {

        /** 
          *  配置每隔多久请求一次
          */
        /**
           * 获取未执行数据
           */
          StorageUtil.loadKeyId(Key.UnUserTrainTime).then(response => {
            let nowTime = new Date().getTime();
            if (nowTime > Number(response) + TIME) {
                this.loadDataTrain();
          }
          }).catch(error => {
              this.loadDataTrain();
          })
          //配置每隔多久请求一次未出行国内飞机
         StorageUtil.loadKeyId(Key.UnUserFlightTime).then(response => {
            let nowTime = new Date().getTime();
            if (nowTime > Number(response) + TIME) {
              this.loadDataFligt();
            }
          }).catch(error => {
              this.loadDataFligt();
          })
          //配置每隔多久请求一次未出行国际飞机
         StorageUtil.loadKeyId(Key.UnUserInflFlightTime).then(response => {
            let nowTime = new Date().getTime();
            if (nowTime > Number(response) + TIME) {
                this.loadDataInflFlight();
            }
          }).catch(error => {
              this.loadDataInflFlight();
          })
          //配置每隔多久请求一次未入住国内酒店
         StorageUtil.loadKeyId(Key.UnUserHoteltime).then(response => {
            let nowTime = new Date().getTime();
            if (nowTime > Number(response) + TIME) {
              this.loadDataHomeHotel();
            }
          }).catch(error => {
              this.loadDataHomeHotel();
          })
          //配置每隔多久请求一次未入住港澳台及国际酒店
         StorageUtil.loadKeyId(Key.UnUserIntlHotelTime).then(response => {
            let nowTime = new Date().getTime();
            if (nowTime > Number(response) + TIME) {
                this.loadDataIntlHotel();
            }
          }).catch(error => {
              this.loadDataIntlHotel();
          })
    }
     /**
   * 获取未出行火车数据
   */
  loadDataTrain = () => {  
    const { userInfo } = this.props;
    if (!userInfo || !userInfo.Id) return null;
    let model = {
        Pagination: {
            PageIndex: 1,
            PageSize: 1
        },
        Query: {
            StatusLabel: TrainEnum.OrderStatusLabel.UnTravel,
            EmployeeId: userInfo.Id,
            CustomerId: userInfo.Customer.Id,
        }
    }
    TrainService.orderList(model).then(response => {
        if (response.ListData && Array.isArray(response.ListData) && response.ListData.length > 0) {
          
            let order = response.ListData[0];
            if (order.TrainInfo) {
                order.TrainInfo.DepartureTime = Util.Date.toDate(order.TrainInfo.DepartureTime);
                order.TrainInfo.ArrivalTime = Util.Date.toDate(order.TrainInfo.ArrivalTime);
            }
            let trainData = {
                order:order,
                time:`${order.TrainInfo.ArriveDate} ${order.TrainInfo.ArriveTime}`,
                catego:'train'
            }
            this.setState({ 
                unUsedTrainOrder: order,
                trainData:trainData,
                }, () => {
                let time = new Date().getTime();
                StorageUtil.saveKeyId(Key.UnUserTrainTime, String(time));
            });
        } else if (Array.isArray(response.ListData) && response.ListData.length === 0) {
            this.setState({ unUsedTrainOrder: null }, () => {
                let time = new Date().getTime();
                StorageUtil.saveKeyId(Key.UnUserTrainTime, String(time));
            });
        }
        this.props.onThemeChange(response);
    }).catch(error => {

    })
 }
 /**
   * 获取未出行飞机数据
   */
  loadDataFligt() {
    const { userInfo} = this.props;
    if (!userInfo || !userInfo.Id) return null;
    let model = {
        Pagination: {
            PageIndex: 1,
            PageSize: 1
        },
        Query: {
            UnTravel: true,
            EmployeeId: userInfo.Id,
            CustomerId: userInfo.Customer.Id,
            StatusLabel: FlightEnum.OrderStatusLabel.UnTravel
        }
    }
    FlightService.orderList(model).then(response => {
        if (response.ListData && Array.isArray(response.ListData) && response.ListData.length > 0) {
            let order = response.ListData[0];
            order.DepartureTime = Util.Date.toDate(order.DepartureTime);
            order.DestinationTime = Util.Date.toDate(order.DestinationTime);
            let fligtData = {
                order:order,
                time:this.formatDate(Util.Date.toDate(order.DepartureTime),'yyyy-MM-dd h:m:s'),
                catego:'flight'
            }
            this.setState({ 
                unUsedOrder: order ,
                fligtData:fligtData,
            }, () => {
                let time = new Date().getTime();
                StorageUtil.saveKeyId(Key.UnUserFlightTime, String(time));
            });
            
            
        } else if (Array.isArray(response.ListData) && response.ListData.length === 0) {
            this.setState({ 
                unUsedOrder: null 
            }, () => {
                let time = new Date().getTime();
                StorageUtil.saveKeyId(Key.UnUserFlightTime, String(time));
            });
        }
    }).catch(error => {
        console.log(error);
    })
 }
 /**
  * 获取未出行国际飞机数据
  */
 loadDataInflFlight() {
  const { userInfo } = this.props;
  if (!userInfo || !userInfo.Id) return null;
  let model = {
      Pagination: {
          PageIndex: 1,
          PageSize: 1
      },
      Query: {
          StatusLabel: 'WaitTrip',
          EmployeeId: userInfo.Id,
          CustomerId: userInfo.Customer.Id,
      }
  }
  InflFlightService.orderList(model).then(response => {
      if (response.ListData && Array.isArray(response.ListData) && response.ListData.length > 0) {
          let order = response.ListData[0];
          order.DepartureTime = Util.Date.toDate(order.DepartureTime);
          order.DestinationTime = Util.Date.toDate(order.DestinationTime);
          let InflfligtData = {
            order:order,
            time:this.formatDate(Util.Date.toDate(order.DepartureTime),'yyyy-MM-dd h:m:s'),
            catego:'Inflflight'
        }
          this.setState({ 
              unUsedIntlFlightOrder: order,
              InflfligtData:InflfligtData,
             }, () => {
              let time = new Date().getTime();
              StorageUtil.saveKeyId(Key.UnUserInflFlightTime, String(time));
          });
      } else if (Array.isArray(response.ListData) && response.ListData.length === 0) {
          this.setState({ unUsedIntlFlightOrder: null }, () => {
              let time = new Date().getTime();
              StorageUtil.saveKeyId(Key.UnUserInflFlightTime, String(time));
          });
      }
  }).catch(error => {
      console.log(error);
  })
}
/**
 * 获取未入住国内酒店数据
 */
loadDataHomeHotel = () => {
  const { userInfo } = this.props;
  if (!userInfo || !userInfo.Id) return null;
  let model = {
      Pagination: {
          PageIndex: 1,
          PageSize: 1
      },
      Query: {
          EmployeeId: userInfo.Id,
          StatusLabel: 'UnTravel',
          Domestic: true
      }
  }
  HotelService.orderList(model).then(response => {
      if (response && response.success) {

          if (response.data && response.data.ListData && response.data.ListData.length > 0) {
              let hotelData = {
                order:response.data.ListData[0],
                time:response.data.ListData[0].CheckInDate.replace('T', ' '),
                catego:'hotel'
                
              }
              this.setState({ 
                  hotelData:hotelData
                }, () => {
                  let time = new Date().getTime();
                  StorageUtil.saveKeyId(Key.UnUserHoteltime, String(time));
              });
          } else {
              this.setState({ unUsedHotelOrder: null }, () => {
                  let time = new Date().getTime();
                  StorageUtil.saveKeyId(Key.UnUserHoteltime, String(time));
              });
          }
      }
  }).catch(error => {

  })
}
/**
 * 获取未入住国际酒店数据
 */
loadDataIntlHotel = () => {
  let model = {
      Query: {
          KeyWord: '',
          StatusLabel: 'UnTravel',
          Domestic: false
      },
      Pagination: {
          PageIndex: 1,
          PageSize: 1
      }
  }
  HotelService.orderList(model).then(response => {
      if (response && response.success) {
          if(response.data && response.data.ListData && response.data.ListData.length >0){
            let intlhotelData = {
                order:response.data.ListData[0],
                time:response.data.ListData[0].CheckInDate.replace('T', ' '),
                catego:'IntlHotel'
                
              }
              this.setState({ 
                  unUserIntlHotelOrder: response.data.ListData[0],
                  intlhotelData:intlhotelData 
                }, () => {
                  let time = new Date().getTime();
                  StorageUtil.saveKeyId(Key.UnUserIntlHotelTime, String(time));
              });
          }else{
              this.setState({ unUserIntlHotelOrder: null }, () => {
                  let time = new Date().getTime();
                  StorageUtil.saveKeyId(Key.UnUserIntlHotelTime, String(time));
              });
          }    
      } 
  }).catch(error => {

  })
}
/**
 * 转换时间格式
 * @param {接收时间类型参数} date 
 * @param {返回时间类型参数} format 
 */
formatDate(date, format) {
    let time = {
        'M+': date.getMonth()+1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() +3) /3),
        'S+': date.getMilliseconds()
    };

    if(/(y+)/i.test(format)){
        format = format.replace(RegExp.$1,(date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for(let k in time){
       if(new RegExp('(' + k + ')').test(format)){
        format = format.replace(RegExp.$1,RegExp.$1.length === 1 ? time[k] : ('00' +time[k]).substr((''+time[k]).length))
       }
    }
    return format;
}
   
    _toOrder = () => {
        const { unUsedTrainOrder } = this.state;
        NavigationUtils.push(this.props.navigation, 'TrainOrderDetailScreen', { Id: unUsedTrainOrder.Id })
    }
    
    render() {      
        const {trainData,fligtData,hotelData,intlhotelData,InflfligtData} = this.state;
        let allArr = [];
        if(JSON.stringify(trainData)!='{}'||JSON.stringify(fligtData)!='{}'||JSON.stringify(hotelData)!='{}'||JSON.stringify(intlhotelData)!='{}'||JSON.stringify(InflfligtData)!='{}'){
            allArr.push(trainData,fligtData,hotelData,intlhotelData,InflfligtData);
        }
        
        let allArrData =allArr&&allArr.sort(function(a,b){
            return a.time > b.time ? 1 : -1
        })
        this.aaa++;//进入本页请求6次数据，判断最后一次且都为空时显示提示卡        
        return (
            <View style={styles.backgStyle}>
               {
                this.aaa>=6&&allArrData.length==0||allArrData==null?
                <View style={{  height:(this.screenWidth - 50)/5*2+10,
                    width:(this.screenWidth - 20),
                    backgroundColor:'#fff',
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'center',
                    margin:10,
                    borderRadius:8,
                 }}>
                    <Image source={ require('../../../res/image/grayLocation.png')} style={{ width: 55,height:70 }}/>
                    <View style={{marginLeft: 35,width:160,alignItems:'center'}}>
                        <CustomText text={'还未开启您的差旅行程'} style={{ fontSize: 15, color: 'gray' }} /> 
                        {/* <TouchableOpacity style={styles.noneBtnView}> */}
                            <CustomText text={'快去申请或预订吧'} style={{ fontSize: 15, color: Theme.theme,marginTop:10}} />
                        {/* </TouchableOpacity> */}
                    </View>
                </View> 
                :
                <FlatList
                    style={{borderRadius:8}}
                      data={allArrData}
                      showsVerticalScrollIndicator={false}
                      keyExtractor = {this._extraUniqueKey}  
                      renderItem={({item}) => <HomeUnTravelItem itemData={item} />}
                />
            }
            </View>
        )
    }
}

// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <HomeUnTravelView {...props} navigation={navigation} />;
}

const styles = StyleSheet.create({
    backgStyle:{
        // margin:10,
        // elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5
   }
})