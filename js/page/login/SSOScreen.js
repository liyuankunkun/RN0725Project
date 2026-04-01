import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomTextInput from '../../custom/CustomTextInput';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import InflFlightService from '../../service/InflFlightService';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
export default class SSOScreen extends SuperView {
  constructor(props) {
    super(props);
    this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    this._navigationHeaderView = {
      title: ''//单点登录
    }
    this.state = {
      emailStr: '',
    }
  }
  componentDidMount() {
    this._getEmail();
  }

  SsoClick() {
    const { emailStr } = this.state;
    if (!emailStr) {
      this.toastMsg('请输入企业邮箱')
    } else {
      this._loadAirport()
    }

  }
  _loadAirport() {
    const { emailStr } = this.state;
    const model = {
      Email: emailStr
    }
    InflFlightService.testSso(model).then(response => {
      if (response && response.success) {
        this.push('WebHtmlScreen', { linkStr: response.data, emailStr: emailStr });
      } else {
        this.toastMsg(response.message || '获取数据失败');
      }
    }).catch(error => {
      this.toastMsg(error.message || "获取数据异常");
    })
  }

  _getEmail = () => {
    StorageUtil.loadKeyId(Key.SaveSsoEmal).then(response => {
      if (response) {
        this.setState({ emailStr: response })
      }
    })
  }

  renderBody() {
    const { emailStr } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomText text={'欢迎'} style={{ marginLeft: 20, fontSize: 30, fondWidth: "bold" }} ></CustomText>
        <CustomText text={'请输入企业邮箱'} style={{ marginLeft: 20, fontSize: 16, marginVertical: 5 }}></CustomText>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.normalBg, borderRadius: 2, marginHorizontal: 20, marginTop: 35 }}>
          <CustomTextInput placeholder="请输入企业邮箱"
            style={curStyle.rightTextInput}
            placeholderTextColor={Theme.promptFontColor}
            onChangeText={(emailStr) => { this.setState({ emailStr }) }}
            value={emailStr} />
        </View>
        <TouchableOpacity style={curStyle.clickStyle} onPress={() => { this.SsoClick() }}>
          <CustomText text={'单点登录'} style={{ color: '#fff', fontSize: 16 }}></CustomText>
        </TouchableOpacity>
      </View>
    );
  }
}
const curStyle = StyleSheet.create({
  textInput: {
    marginTop: 15,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 4,
    height: 40,
    backgroundColor: 'white'
  },
  clickStyle: {
    height: 50,
    backgroundColor: 'black',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 40,

  },
  rightTextInput: {
    height: 50,
    marginLeft: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
});
