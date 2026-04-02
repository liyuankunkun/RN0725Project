import React from 'react';
import {
    View,
    StyleSheet,
    Switch,
    Platform,
} from 'react-native';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
class DepartView extends React.Component {

    static propTypes = {
        customerInfo: PropTypes.object.isRequired,
        ApproveOrigin: PropTypes.object.isRequired
    }

    /** 
     *  OriginType 所属部门
     */
    _switchClick = (OriginType) => {
        const { ApproveOrigin,approveOriginCallBack,CustomerId } = this.props;
        if ((OriginType === 2 && OriginType !== ApproveOrigin.OriginType) || (OriginType === 1 &&  ApproveOrigin.ProjectName)) {
            ApproveOrigin.OriginType = 2;
            ApproveOrigin.ProjectId = '0';
            ApproveOrigin.ProjectName = '';
            if(approveOriginCallBack){
                approveOriginCallBack()
            }
            this.setState({});
        } else if(OriginType === 3){
            NavigationUtils.push(this.props.navigation, 'ProjectScreen', {
                title: '选择项目',
                callBack: (obj) => {
                    ApproveOrigin.ProjectId = obj.Id;
                    ApproveOrigin.ProjectName = obj.Name;
                    if(approveOriginCallBack){
                        approveOriginCallBack()
                    }
                    this.setState({});
                }
            });
        } else{
            NavigationUtils.push(this.props.navigation, 'ProjectScreen', {
                title: '选择项目',
                CustomerId:CustomerId,
                callBack: (obj) => {
                    ApproveOrigin.OriginType = 1;
                    ApproveOrigin.ProjectId = obj.Id;
                    ApproveOrigin.ProjectName = obj.Name;
                    if(approveOriginCallBack){
                        approveOriginCallBack()
                    }
                    this.setState({});
                }
            });
        }
    }

    _toSelectApprover = () => {
        const {ApproveOrigin} = this.props;
        NavigationUtils.push(this.props.navigation, 'ApproverList', {
            callBack: (obj) => {
                ApproveOrigin.ApproverId = obj.Id;
                ApproveOrigin.ApproverName = obj.Name;
                this.setState({});
            }
        })
    }

    render() {
        const { customerInfo, ApproveOrigin,fromCreateApply, fromComp } = this.props;
        if (!customerInfo || !customerInfo.Setting) return null;
        let isHiddenDep = customerInfo.Setting.IsHiddenDepartment;
        let depLabel = customerInfo.Setting.DepartmentLabel ? customerInfo.Setting.DepartmentLabel : '部门出差';
        let proLablel = customerInfo.Setting.ProjectLabel ? customerInfo.Setting.ProjectLabel : '项目出差';
        /**
         *  判断一下在客户配置的情况下默认 originType
         */
        if(!fromCreateApply){
            if (isHiddenDep && (!customerInfo.Setting.IsHiddenProject && customerInfo.IsShowProject)) {
                ApproveOrigin.OriginType = 1;
            }
            if(!isHiddenDep && (customerInfo.Setting&&customerInfo.Setting.IsHiddenProject || !customerInfo.IsShowProject)){
                ApproveOrigin.OriginType = 2;
                ApproveOrigin.OriginTypeDesc="按部门"
            }
            if (customerInfo.Setting.IsShowApprover) {
                ApproveOrigin.OriginType = 3;
            }
        }

        return (
            <View style={styles.view}>
                <View>
                    {/* {
                    fromComp?null:
                    fromCreateApply?null: //新建申请单页面不按此规则展示
                        !isHiddenDep ?
                            <View style={styles.row}>
                                <CustomText text={depLabel} style={{ flex: 3,fontSize:14 }} numberOfLines={1}/>
                                <View style={styles.rowRight}>
                                    <CustomText text='按员工所属部门' style={{ fontSize:14 }} />
                                    <Switch
                                        onValueChange={this._switchClick.bind(this, 2)}
                                        value={ApproveOrigin.OriginType === 2}
                                        disabled={customerInfo.Setting&&customerInfo.Setting.IsHiddenProject || !customerInfo.IsShowProject} 
                                        style={{transform:[{scaleX:0.9},{scaleY:0.9}],marginRight:-5}}
                                        trackColor={{false:'lightgray'}} thumbColor={ApproveOrigin.OriginType === 2?Theme.theme:'#fff'} 
                                    />
                                </View>
                            </View>
                        : null
                    } */}
                    {//新建申请单 
                    fromCreateApply && !customerInfo.Setting.IsApplyHiddenDepartment ?
                            <View style={styles.row}>
                                <CustomText text={depLabel} style={{ flex: 3,fontSize:14 }} numberOfLines={1}/>
                                <View style={styles.rowRight}>
                                    <CustomText text='按员工所属部门' style={{ fontSize:14 }} />
                                    <Switch
                                        onValueChange={!customerInfo.Setting.IsApplyHiddenProject ? this._switchClick.bind(this, 2) : null}
                                        value={ApproveOrigin.OriginType === 2}
                                        style={{transform:[{scaleX:0.9},{scaleY:0.9}],marginRight:-5}}
                                        trackColor={{false:'lightgray'}} 
                                        thumbColor={ApproveOrigin.OriginType === 2 && Platform.OS === 'android' ? Theme.theme : '#fff'} 
                                        disabled={customerInfo.Setting.IsHiddenProject || !customerInfo.IsShowProject} 
                                        />
                                </View>
                            </View>
                            : null
                    }
                    { 
                        fromCreateApply?null://新建申请单页面不按此规则展示
                            // !customerInfo.Setting.IsHiddenProject && customerInfo.IsShowProject ?
                            !customerInfo.Setting.IsHiddenProject?
                                <View style={styles.row}>
                                    <CustomText text={proLablel} style={{ flex: 3 ,fontSize:14}}numberOfLines={1} />
                                    <View style={styles.rowRight}>
                                        <CustomText text={ApproveOrigin.ProjectName} style={{ fontSize:14 }}/>
                                        <Switch
                                            value={(ApproveOrigin.ProjectName) ? true : false}
                                            onValueChange={this._switchClick.bind(this, 1)}
                                            style={{transform:[{scaleX:0.9},{scaleY:0.9}],marginRight:-5}}
                                            trackColor={{false:'lightgray'}} 
                                            thumbColor={(ApproveOrigin.ProjectName &&  Platform.OS === 'android')?Theme.theme:'#fff'} 
                                        />
                                    </View>
                                </View>
                        : null
                    }
                    {//新建申请单
                      fromCreateApply && !customerInfo.Setting.IsApplyHiddenProject?
                            <View style={styles.row}>
                                <CustomText text={proLablel} style={{ flex: 2,fontSize:14 }} numberOfLines={0} />
                                <View style={styles.rowRight}>
                                    <CustomText text={ApproveOrigin.ProjectName} style={{ flex: 4,fontSize:14 }}  onPress={this._switchClick.bind(this, 3)} />
                                    <Switch style={{ flex: 1,transform:[{scaleX:0.9},{scaleY:0.9}],marginRight:-5 }}
                                        value={(ApproveOrigin.ProjectName) ? true : false}
                                        onValueChange={this._switchClick.bind(this, 1)}
                                        trackColor={{false:'lightgray'}} thumbColor={(ApproveOrigin.ProjectName &&  Platform.OS === 'android')?Theme.theme:'#fff'} 
                                    />
                                </View>
                            </View>
                      :null
                    }
                </View>
                {
                    customerInfo.Setting.IsShowApprover ?
                        <View style={styles.row}>
                            <CustomText text={'授权人'} style={{ flex: 4,fontSize:14 }} numberOfLines={1}/>
                            <View style={styles.rowRight}>
                                <CustomText style={{ flex: 1,fontSize:14 }} text={ApproveOrigin.ApproverName} onPress={this._toSelectApprover} />
                                <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                            </View>
                        </View>
                        : null
                }
            </View>
        )
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <DepartView {...props} navigation={navigation} />;
}
const styles = StyleSheet.create({
    view: {
        marginTop: 10,
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        // height: 44,
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor
    },
    rowRight: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft:5
    }
})