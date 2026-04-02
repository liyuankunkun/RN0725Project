import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableHighlight,
    DeviceEventEmitter,
    Keyboard
} from 'react-native';
import SuperView from '../../super/SuperView';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import I18nUtil from '../../util/I18nUtil';
import FlightService from '../../service/FlightService';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
import action from '../../redux/action';
import { connect } from 'react-redux';
import SearchPeopleInput from '../../custom/SearchPeopleInput';
import CommonService from '../../service/CommonService';

class SearchBookerScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '查询',
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            keyWord: '',
            page: '',
            isNoMoreData: false,
            isLoading: true,
            isLoadingMore: false,
            page: 1,
            passenger:null,
            ListData:[],
            ApproveAgentList:[]
        }
    }

    componentDidMount() {
        this._loadApproveAgent();
    }

    _loadData = () => {
        const { page } = this.state;
        let model = {
            Query: {
                Keyword: this.state.keyWord,//指定关键字查询，为空则查询最近出差人
                // OriginType: 1,//出差人所属类型，1：员工，其他值为常旅客
            },
            Pagination: {
                PageIndex: 1,//当前页码
                PageSize: 10//数量限制
            }   
        }
        this.showLoadingView();
        CommonService.HandShakeEmployeeQuery(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data && response.data.ListData) {
                this.setState({
                    ListData:response.data.ListData
                })
            } else {
                this.toastMsg(response.message || '获取员工列表失败');
            }
        }).catch(error => {
            this.toastMsg(error.message || '获取员工列表异常');
        })
    }

    _loadApproveAgent = () => {
        const { page } = this.state;
        let model = {
            Query: {
                Keyword: this.state.keyWord,//指定关键字查询，为空则查询最近出差人
                // OriginType: 1,//出差人所属类型，1：员工，其他值为常旅客
            },
            Pagination: {
                PageIndex: 1,//当前页码
                PageSize: 10//数量限制
            }   
        }
        this.showLoadingView();
        CommonService.EmployeeQueryForApproveAgent(model).then(response => {
            this.hideLoadingView();
            if (response && response.success && response.data && response.data.ListData) {
                this.setState({
                    ApproveAgentList:response.data.ListData
                })
            } else {
                this.toastMsg(response.message || '获取员工列表失败');
            }
        }).catch(error => {
            this.toastMsg(error.message || '获取员工列表异常');
        })
    }

    _detailLoadFail = () => {
        if (this.state.isLoadingMore) {
            this.state.page--;
        }
        this.setState({
            isLoading: false,
            isLoadingMore: false
        })
    }

    _backOrderClick = (item) => {
        let WorkingNamestr =item.WorkingName? '('+ item.WorkingName +')':''
        let str = item.Name +WorkingNamestr+" "+ item.Email
        let content = I18nUtil.tranlateInsert('您正指定{{noun}},成为您的差旅预定人，如您继续下一步且预定人接受申请，您指定的预定人可为您进行差旅预定，并维护您包括证件号和信用卡号在内的个人信息。', I18nUtil.translate(str))
        this.showAlertView(content,()=>{
            return ViewUtil.getAlertButton('取消', () => {
                this.dismissAlertView();
            }, '阅读并确认', () => {
                this.dismissAlertView();
                this.addMyBooker(item);
            })
        })
    }

    addMyBooker=(item)=>{
        let model = {
            EmployeeId:item.Id
        }
        this.showLoadingView();
        FlightService.addMyBooker(model).then(response=>{
            this.hideLoadingView();
            if(response && response.success){
                this.toastMsg('添加成功')
                DeviceEventEmitter.emit('refre',response);
                this.pop()
            }else{
                this.toastMsg(response.message||'添加失败，请重新添加')
            }
        })
    }

    addTraveler=(item)=>{
        let model = {
            EmployeeId:item.Id
        }
        this.showLoadingView();
        FlightService.AddMyNewTraveler(model).then(response=>{
            this.hideLoadingView();
            if(response && response.success){
                this.toastMsg('添加成功')
                DeviceEventEmitter.emit('refTraveler',response);
                this.pop()
            }else{
                this.toastMsg(response.message||'添加失败，请重新添加')
            }
        })
    }

    addApproveAgent=(item)=>{
        const { callBack } = this.params;
        callBack(item)
        this.pop()
    }

    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={
                this.params._from=='审批授权人'
                ?
                this.addApproveAgent.bind(this, item)
                :
                this.params._from=='addTraveler'
                ?
                this.addTraveler.bind(this, item)
                :
                this._backOrderClick.bind(this, item)
            }>
                <View style={styles.row}>
                    <CustomText text={item.Name + (item.DepartmentName ? ('-' + item.DepartmentName) : '')} />
                    <View>
                        <View style={{flexDirection:'row'}}>
                            <CustomText text={'邮箱：'}  />
                            <CustomText text={item.Email}  />
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    renderBody() {
        const {ApproveAgentList} = this.state
        const {_from} = this.params
        return (
            <View style={{ flex: 1 }}>
                <SearchPeopleInput placeholder='请输入至少2个连续字进行搜索' value={this.state.keyWord} 
                             onChangeText={this._changeText} 
                             onChangeBtn={()=>{
                                this.clickSerch()
                            }}
                />
                <FlatList
                    data={_from=='审批授权人'?ApproveAgentList:this.state.ListData}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => String(index)}
                />
            </View>
        )
    }

    clickSerch = () => {
        const { passenger, passengerLoad } = this.props;
        Keyboard.dismiss();
        if(this.params._from=='审批授权人'){
            this._loadApproveAgent();
        }else{
            this._loadData();
        }
    }

    _changeText = (text) => {
        this.setState({
            keyWord:text
        });
    }
}
const getStateProps = state => ({
    passenger: state.passenger,
})
const getActionProps = dispatch => ({
    passengerLoad: (passenger, index, callBack, fromComp, that) => dispatch(action.passengerLoad(passenger, index, callBack, fromComp, that)),
})
export default connect(getStateProps, getActionProps)(SearchBookerScreen);
const styles = StyleSheet.create({
    row: {
        backgroundColor: 'white',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        marginHorizontal: 8,
        marginVertical:2,
        padding:10,
        borderRadius:6
    }
})