import React from 'react';

import {
  View,
  Image,
  Linking,
  ScrollView,
  TouchableHighlight,
  StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import PersonalPanel from './view/PersonalPanel';
import PersonalList from './view/PersonalList';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import I18nUtil from '../../util/I18nUtil';
import CommonService from '../../service/CommonService';
import UserInfoDao from '../../service/UserInfoDao';
import  LinearGradient from 'react-native-linear-gradient';
import Theme from '../../res/styles/Theme';
import RNFileSelect from 'react-native-file-select-mk';
import RNFetchBlob from 'rn-fetch-blob';
export default class PresonalScreen extends SuperView {

  constructor(props) {
    super(props);
    this._navigationHeaderView = {
      title: '我的',
      // hideLeft: false,
      // rightButton: this._rightHeaderView()
    }
    this.state = {
      customerInfo:null,
      userInfo:{},
      filePath:[],
      data12306code:null,
      login12306Name:null,
    }
  }

  _rightHeaderView = () => {
    return (
      <TouchableHighlight underlayColor='transparent' onPress={this._toSettting}>
        <AntDesign name={'setting'} color={Theme.fontColor} size={26} style={{ paddingRight: 16 }} />
      </TouchableHighlight>
    )
  }
  _toSettting = () => {
    this.push('Setup');
  }

  static navigationOptions = ({ navigation }) => ({
    tabBarLabel: I18nUtil.translate('我的'),
    tabBarIcon: ({ tintColor, focused }) => {
      let source = focused ? require('../../res/image/icon-48-4-cur.png') : require('../../res/image/icon-48-4.png');
      return (
        <Image source={source} style={[{ width: 19, height: 19 }, { tintColor: tintColor }]} />
      );
    },
    header: null
  });
  componentDidMount() {
    this.addPageFouces = this.props.navigation.addListener('willFocus', () => {
      this.setState({})
    });
    UserInfoDao.getUserInfo().then(userInfo => {
      UserInfoDao.getCustomerInfo().then(customerInfo => {
            this.setState({
                userInfo:userInfo,
                customerInfo:customerInfo
            },()=>{
              this.setState()
            })
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }).catch(error => {
        this.toastMsg(error.message || '获取数据异常');
    })
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    // this.addPageFouces && this.addPageFouces.remove();
  }


  /**
     * 联系客服
     */
  _btnContactTel = () => {
    var url = 'tel:13121508893';
   const {customerInfo} = this.state;
   if(customerInfo&& customerInfo.Setting && customerInfo.Setting.ServiceTelExtras && customerInfo.Setting.ServiceTelExtras.Tel){
     url = `tel:${customerInfo.Setting.ServiceTelExtras.Tel}`
   }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log('Can\'t handle url: ' + url);
      }
    }).catch(err => {
      console.log(err);
    });
  }
  /**
   *  底部客服电话
   */
  _renderTel = () => {
    const {customerInfo} = this.state;
    return (
      <LinearGradient 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 0}}
                    style={styles.aboutStyle}
                    colors={['#fff','#fff']} 
                    >
        <TouchableHighlight underlayColor='transparent' onPress={this._btnContactTel}>
          <View style={{ flexDirection: 'row',alignItems:'center' }}>
            {/* <AntDesign name={'customerservice'} size={26} color={'gray'} />
             */}
             <Image source={require('../../res/image/icon-50.png')} style={{width:18,height:18}}/>
            <CustomText style={{ fontSize: 20, color: Theme.theme, marginLeft: 5 }} text={customerInfo&& customerInfo.Setting && customerInfo.Setting.ServiceTelExtras && customerInfo.Setting.ServiceTelExtras.Origin? customerInfo.Setting.ServiceTelExtras.Origin:'13121508893'} />
          </View>
        </TouchableHighlight>
      </LinearGradient>
    )
  }
 
  // _renderContact = ()=>{
  //   return (
  //     <LinearGradient 
  //                   start={{x: 0, y: 0}} 
  //                   end={{x: 1, y: 0}}
  //                   style={styles.aboutStyle}
  //                   colors={['#fff','#fff']}
  //                   >
  //       <TouchableHighlight underlayColor='transparent' onPress={()=>{
  //         this.push('AboutUs');
  //       }}>
  //         <View style={{ flexDirection: 'row' }}>
  //           <CustomText style={{ fontSize: 17, color: 'gray', marginLeft: 5 }} text={'关于我们'} />
  //         </View>
  //       </TouchableHighlight>
  //     </LinearGradient>
  //   )
  // }

 
  renderBody() {
    const {userInfo,login12306Name,login12306Data} = this.state;
    let employeePermission = userInfo&&userInfo.EmployeePermission
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor:Theme.normalBg}} keyboardShouldPersistTaps='handled'>
          <PersonalPanel employeePermission={employeePermission}/>
          <PersonalList login12306Name={login12306Name} login12306Data={login12306Data} />
          {/* {this._renderTel()}
          {this._renderContact()}*/}
          {/* {this._renderTel1()} */}
          {/* {this._renderxx()} */}
      </ScrollView>
    );
  }

  _renderxx (){
    return (
      <TouchableHighlight underlayColor='transparent' onPress={()=>{this._testClick1()}}>
        <View style={{ flexDirection: 'row',alignItems:'center' }}>
          <CustomText style={{ fontSize: 20, color: Theme.theme, marginLeft: 5 }} text={'000000'} />
        </View>
      </TouchableHighlight>
    )
  }

  _testClick1=()=>{
    this.push('CameryScreen');
    // this.push('AppaScreen');
  }

  _testBtnClick = () => {
    RNFileSelect.showFileList((res) => {
      let pos = res.path.lastIndexOf('/')
      let fileName = res.path.substr(pos+1)
      let pname = fileName.substring(0, fileName.lastIndexOf("."))
      let phouzhui = res.path.substring(res.path.lastIndexOf(".")+1)
      if(!res){return}
      if (res.type === 'cancel') {
        //用户取消
      } else if (res.type === 'path') {
        let data = RNFetchBlob.wrap(res.path)
        let model = [];
        model.unshift({ name: pname , data: data, filename: fileName, type:phouzhui});
        // 选中单个文件
        CommonService.TravelApplyFileUpload(model).then(response => {
            if (response && response.success) {
              
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            // this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
      } else if (res.type === 'paths') {
        // 选中多个文件 看管理器支持情况目前采用默认的，只有会调用path
      } else if (res.type === 'error') {
        // 选择文件失败 
      }
    })    
  }

  _renderTel1 = () => {
    const {customerInfo} = this.state;
    return (
        <TouchableHighlight underlayColor='transparent' onPress={()=>{this._testBtnClick()}}>
          <View style={{ flexDirection: 'row',alignItems:'center' }}>
            <CustomText style={{ fontSize: 20, color: Theme.theme, marginLeft: 5 }} text={customerInfo&& customerInfo.Setting && customerInfo.Setting.ServiceTelExtras && customerInfo.Setting.ServiceTelExtras.Origin? customerInfo.Setting.ServiceTelExtras.Origin:'13121508893'} />
          </View>
        </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  aboutStyle:{ alignItems: 'center', margin:10,height:50,backgroundColor:'#fff',borderRadius:5,justifyContent:'center',elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.2, shadowRadius: 1.5, }
})
