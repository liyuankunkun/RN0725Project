import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
    Image
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import { connect } from 'react-redux';
import CustomActioSheet from '../../custom/CustomActionSheet';
import TrainService from '../../service/TrainService';
import CommonService from '../../service/CommonService';
import ViewUtil from '../../util/ViewUtil';
import Feather from 'react-native-vector-icons/Feather';
import Util from '../../util/Util';
import StorageUtil from '../../util/StorageUtil';

class TrainRelateScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView={
            title:'登录12306账号',
            leftButton:ViewUtil.getLeftBackButton(this._clickLeft)       
        }

        this.state = {
            name:'',
            passWord:'',
            VerificatCode:'',
            login12306Data:null,
            login12306Name:null,
            value:true,
            isDigit:'',
            trainLinkloading:false,
            validateCode: null,
            btnValideTxt: '获取验证码',
            validateSeconds: 60,
            messegeAlertShow:false,
            eyeOff:true,
            _switch:this.params._switch,
            readTrainMsm:false
        }
    }

    _clickLeft = ()=> {
        const {login12306Name,passWord,login12306Data} = this.state;
        const {_switch} = this.state;
        const {callBack} = this.props;
        if(login12306Name && !_switch){
            callBack&&callBack(login12306Name,passWord,login12306Data);
        }
        this.pop();
    }

    componentDidMount = ()=> {
        this._loadAgain();
        this.backFromShopListener = DeviceEventEmitter.addListener(
            'load123',  //监听器名
            () => {
                this.setState({ _switch:false})
                this._loadAgain();
            },
          );
    }

    _loadAgain=()=>{
        CommonService.customerInfo().then(response => {
            this.setState({
                customerInfo:response.data
            },()=>{
                this._getTrainLink(response.data);
            })
        }).catch(error => {
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    _getTrainLink=(customerInfo)=>{
        if(customerInfo&&customerInfo.TrainAccount){
          //获取完信息先免密登录12306---------------------------
          this.hideLoadingView();
              let model = {
                  TrainAccount:customerInfo.TrainAccount
              } 
              this.showLoadingView(); 
              TrainService.Train12306AutoLogin(model).then(response =>{
                  this.hideLoadingView();
                  if(response.success){
                        this.setState({
                              login12306Name:customerInfo.TrainAccount,
                              login12306Data:customerInfo.TrainAccountId,
                              trainLinkloading:true,
                        })
                  }else{
                    this.setState({
                        trainLinkloading:true,
                    })
                  }
              }).catch(error=>{
                  this.hideLoadingView();
                  this.toastMsg(error || '操作失败');
              })
        }else{
            this.setState({
                trainLinkloading:true,
            })
        }
    }

    _relactClick3 = () => {
        this.linkActionSheet.show();    
    }

    _relactClick = () => {
        const {name,passWord,value,isDigit,readTrainMsm} = this.state
        const {callBack,orderNum} = this.params;
        if(!name){ 
            this.toastMsg('请输入用户名');
            return
          }
        if(!passWord){ 
            this.toastMsg('请输入账号密码');
            return
        }
        if(!readTrainMsm){
            this.toastMsg('请阅读并勾选同意《火车购票服务》');
            return
        }
        let ApplyLoginModel = {
            OrderId:orderNum?orderNum:'',
            TrainAccount:{
                trainAccount:name,
                pass:passWord,
            },
            RememberPassword:value,
            isDigit:isDigit,
        }
        this.showLoadingView();
            TrainService.Train12306ApplyLogin(ApplyLoginModel).then(response => {                
                this.hideLoadingView();
                if (response && response.success) {
                    this.setState({
                        login12306name: name,
                        login12306Data:response.data
                    },()=>{
                        StorageUtil.saveKey('login12306Data',response.data);
                    })
                    if(this.params.from){
                        this.showAlertView('绑定成功',()=>{
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                callBack&&callBack(name,passWord,response.data);
                                this.pop();
                            })
                        })
                    }else{
                        callBack&&callBack(name,passWord,response.data);
                        this.pop();
                    }

                } else {
                    if(response.code=="8"){
                        this.setState({
                            messegeAlertShow:true
                        })
                    }else if(response.code=="7"){//返回code=7的时候需要请求短信验证

                        this.push('TrainValidateScreen',{passWord,name,orderNum,value});

                    }else if(response.code=="9"){//返回code=9人脸识别

                        this.push('CameryScreen',{passWord,name});

                    }else if(response.code=="10"){//返回code=10包含7、9

                        this.linkActionSheet.show();
                            
                    }else{
                        this.toastMsg(response.message || '操作失败');
                    }       
                 }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '操作失败');
            })       
    }
  
    _relactClick1 = () => {
        const {name,passWord,VerificatCode,value,isDigit,validateCode,login12306Name,login12306Data} = this.state
        const {callBack,orderNum} = this.params;

        if(!validateCode){
            this.toastMsg('请输入验证码');
            return;
        }

        let SmsVerifyModel = {
            OrderId:orderNum?orderNum:'',
            TrainAccount:{
                trainAccount:name,
                pass:passWord,
            },
            RememberPassword:value, 
            VerifyCode:validateCode?validateCode:VerificatCode,
        }
        if(validateCode){
            TrainService.Train12306SmsVerify(SmsVerifyModel).then(response =>{
                if (response && response.success) {
                    if(this.params.from){
                        this.showAlertView('绑定成功',()=>{
                            return ViewUtil.getAlertButton('确定', () => {
                                this.dismissAlertView();
                                callBack&&callBack(login12306Name,passWord,login12306Data);
                                this.pop();
                            })
                        })
                    }else{
                        callBack&&callBack(login12306Name,passWord,login12306Data);
                        this.pop();
                    }
                }else{
                    this.toastMsg(response.message||'操作失败');
                }
            }).catch(error => {
                this.hideLoadingView();
                this.toastMsg(error.message || '操作失败');
            })
        }

    }
       
    renderBody() {
        const {login12306Name,login12306Data,trainLinkloading} = this.state;
        const {_switch} = this.state;
        return (
            !trainLinkloading?<View/>:
            login12306Name && login12306Data && !_switch ?
            this.getcard()
            :
            this.editCard()
        )
    }

    getcard(){
        const {login12306Name} = this.state;
        return <View style={{flex:1}}>
                <View style={{flex:1,margin:10, height:80, borderColor:Theme.theme}}>
                    <View style={{flexDirection:'row',alignItems:'center',padding:10, backgroundColor:'#fff', borderRadius:6}}>
                        <Image style={{width:38,height:38}} source={require('../../res/Uimage/trainFloder/train12306.png')}/>
                        <View style={{}}>
                            <CustomText style={{fontSize:14,padding:10, color:Theme.darkColor}} text='已登录12306账号'/>
                            <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:10,alignItems:'center'}}>
                                <View style={{flexDirection:'row',alignItems:'center',marginHorizontal:10}}>
                                    <CustomText style={{fontSize:14}} text={login12306Name}/>
                                    <CustomText style={{fontSize:14}} text={'(已登录)'}/>
                                </View>
                                {/* <TouchableOpacity style={{width:32,height:32,justifyContent:'center',alignItems:'center'}} onPress={this._logoutClick}>
                                    <AntDesign name={'closecircle'} size={16} color={Theme.darkColor}/>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    </View>
                </View>
                {ViewUtil.getThemeButton('退出关联账号',this._logoutClick)}
            </View>
    }

    editCard(){
        const {name,passWord,value,messegeAlertShow,eyeOff,readTrainMsm} = this.state;
        const linkOPtions = ['人脸核验','短信核验']
        return <View style={{ flex: 1 }}>
                <View style={{flexDirection:'row',justifyContent:'center',backgroundColor:Theme.yellowBg,padding:15,paddingLeft:25}}>
                    <AntDesign name={'exclamationcircleo'} size={15} color={Theme.theme}/>
                    <CustomText style={{fontSize:13,marginLeft:2,color:Theme.theme}} text='请确保12306账号和密码的有效性，否则可能导致出票失败。'/>
                </View>
                <View style={{flex:1, margin:10}}>
                    <View style={{paddingHorizontal:6,borderRadius:6,backgroundColor:'#fff'}}>
                        <View style={{flexDirection:'row',height:50,paddingLeft:10,alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor}}>
                            <CustomText style={{marginRight:10}} text='用户名'/>
                            <CustomeTextInput placeholder='12306用户名/邮箱/手机号' style={{flex:7}} value={name} onChangeText={(text) => {this.setState({name:text})}} />
                        </View>
                        <View style={{flexDirection:'row',height:50,paddingLeft:10,alignItems:'center',borderColor:Theme.lineColor}}>
                            <CustomText style={{marginRight:10}} text='密   码'/>
                            <CustomeTextInput placeholder='请输入12306密码' style={{flex:7}} value={passWord} secureTextEntry={eyeOff} onChangeText={(text) => {this.setState({passWord:text})}} />
                            <TouchableOpacity style={{marginRight:15}} onPress={() => { this.setState({ eyeOff: !eyeOff }) }}>
                                        <Feather name={eyeOff?'eye-off':'eye'} size={20} color={'#999999'}  style={{ }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height: 44,flexDirection: 'row',alignItems: 'center'}}>
                        <TouchableOpacity onPress={()=>{
                                this.setState({
                                    readTrainMsm:true
                                })
                            }} style={{width:25,height:40,justifyContent:'center'}}>
                        <MaterialIcons  name={readTrainMsm?'check-box':'check-box-outline-blank'} size={18} color={readTrainMsm?Theme.theme:'lightgray' }/>
                        </TouchableOpacity>
                        <View  style={{flexDirection:'row',flexWrap:'wrap'}}>
                            <CustomText text='我已阅读并同意' style={{ color:'gray' }} onPress={()=>{
                                this.setState({
                                    readTrainMsm:true
                                })
                            }} />
                            <CustomText text='《火车购票服务》' style={{ color:Theme.theme }}  onPress={this.trainBtnToTerms} />
                        </View>
                    </View>
                </View>
                {/* <View style={{padding:10,backgroundColor:'#fff'}}>
                    <TouchableOpacity onPress={this._relactClick}
                        style={{backgroundColor:Theme.theme,height:50,borderRadius:4,marginTop:10,justifyContent:'center',alignItems:'center'}}>
                       <CustomText style={{color:'#fff',fontSize:17}} text={'关联12306'}/>
                    </TouchableOpacity>
                </View> */}
                <CustomActioSheet ref={o => this.linkActionSheet = o} options={linkOPtions} onPress={this._linkHandlePress} />
                {/* <View style={{padding:5,backgroundColor:'#fff'}}/> */}
                {messegeAlertShow?this._testAlert():null}
                {
                    ViewUtil.getThemeButton('提交',this._relactClick)
                } 
            
            </View>
    }
    trainBtnToTerms = ()=>{
        let url = Util.Parse.isChinese()?
             global.baseUrl + `/Content/Pages/Train/TrainTicketService.html`
             :
             global.baseUrl + `/Content/Pages/Train/TrainTicketService.en-us.html`
        this.push('Web', {
          title: '火车购票服务',
          url: url,
        })
    }

    _testAlert = () => {
        const {isDigit,btnValideTxt} = this.state;
        return(
          <View  style={{position:'absolute',top:-94, height:global.screenHeight, width:global.screenWidth}}>
            <View style={styles.container2}>
            {//图片宽250 高300， 头部高35，底部高40
                <View style={{marginHorizontal:8,backgroundColor:'#fff',width:300,borderRadius:6}}>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',borderBottomWidth:0.5,borderColor:Theme.lineColor}}>
                        <View style={{height:40,width:250,alignItems:'center',justifyContent:'center'}}>
                            <CustomText text='短信验证' style={{fontSize:16}}></CustomText>
                        </View>
                        <AntDesign name='closecircleo' onPress={()=>{this.setState({messegeAlertShow:false})}} style={{fontSize:18}}></AntDesign>
                    </View>
                    <CustomeTextInput placeholder='身份证后4位' style={{height:40,alignItems:'center',justifyContent:'center',margin:15,borderWidth:0.5,borderColor:Theme.lineColor,borderRadius:6}} value={isDigit} onChangeText={(text) => {this.setState({isDigit:text})}} />
                    <View style={{height:40,marginHorizontal:15,flexDirection:'row',justifyContent:'space-between'}}>
                        <CustomeTextInput placeholder='请输入验证码' style={{height:40,width:120,borderWidth:0.5,borderColor:Theme.lineColor,borderRadius:6}} onChangeText={(validateCode) => { this.setState({ validateCode }) }} />
                        <TouchableOpacity onPress={this.btnSendValidateCode} style={{height:40,backgroundColor:'#cff',width:120,alignItems:'center',justifyContent:'center',borderRadius:6,backgroundColor:Theme.lineColor}}>
                            <CustomText text={btnValideTxt}></CustomText>
                        </TouchableOpacity>  
                    </View>
                    <TouchableOpacity onPress={this._relactClick1} style={{height:40,backgroundColor:Theme.theme,margin:15,alignItems:'center',justifyContent:'center',borderRadius:6}}>
                       <CustomText text='确定' style={{fontSize:16}}></CustomText>
                    </TouchableOpacity>
                </View>
              }
              </View>
          </View>
        )
    }

    /**
   *  发送验证码
   */
  btnSendValidateCode = () => {
    if (!this.state.isDigit) {
      this.toastMsg('请输入身份证后4位');
      return;
    }
    if (this.state.btnValideTxt !== '获取验证码') {
      return;
    }
    const getValidateModel = {
        TrainAccount:{
            trainAccount:this.state.name,
            pass:this.state.passWord,
        },
        isDigit:this.state.isDigit,
    };
    this.showLoadingView();
    TrainService.Train12306LoginCode2(getValidateModel).then((response) => {
      this.hideLoadingView();
      if (response && response.success) {
        this.validateTimer = setInterval(() => {
          if (this.state.validateSeconds === 0) {
            if (this.validateTimer) {
              clearInterval(this.validateTimer);
            }
            this.setState(() => ({
              validateSeconds: 60,
              btnValideTxt: '获取验证码'
            }));
          } else {
            this.setState(() => ({
              validateSeconds: this.state.validateSeconds - 1,
              btnValideTxt: this.state.validateSeconds + ''
            }));
          }
        }, 1000);
      } else {
        this.toastMsg(response.message || '获取验证码失败');
      }
    }).catch((error) => {
      this.hideLoadingView();
    });
  }
    
  _logoutClick =() =>{
        this.showAlertView('您确定要解绑该账号吗？', () => {
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '确定', () => {
                this.dismissAlertView();
                this._logoutClick1();
            })
        })
  }

   //退出绑定12306
  _logoutClick1 =() =>{
        this.showLoadingView();
        const {login12306Name} = this.state;
        let model = {
                trainAccount:login12306Name, 
        }
        TrainService.TrainAccountCancelApp(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) { 
               StorageUtil.removeKey('login12306Data');               
               this.setState({
                  login12306name:false,
                  login12306Data:null
               },()=>{
                this.showAlertView('删除成功',()=>{
                    return ViewUtil.getAlertButton('确定', () => {
                        this.dismissAlertView();
                        this.pop();
                    })
                })
               })
              
            } else {
                this.toastMsg(response.message || '退出12306账号失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '退出12306账号失败');
        })
    }

    _linkHandlePress =(index)=> {
        const { passenger, passWord, name, value} = this.state
        const {orderNum} = this.params
        if(index != 'cancel'){
            if(index===0){
                this.push('CameryScreen',{passWord,name});
            }
            if(index===1){
                this.push('TrainValidateScreen',{passWord,name,orderNum,value});
            }
        }else{
          
        }

    }
}

const getStatusProps = state => ({
    customerInfo: state.customerInfo_userInfo.customerInfo,
})

export default connect(getStatusProps)(TrainRelateScreen);

const styles = StyleSheet.create({
    header: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    container2:{
        flex:1,
        backgroundColor:'rgba(0, 0, 0, 0.3)',
        justifyContent:'center',
        alignItems:'center'
    },
    row: {
        height: 44,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 0.5,
    },
})