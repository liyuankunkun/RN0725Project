import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import SearchInput from '../../custom/SearchInput';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
export default class EmployeesScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '选择差标及审批流',
        },
        // this._tabBarBottomView = {
        //     bottomInset: true
        // }
        this.state = {
            keyWord: '',
            page: '',
            projectList: [],
            isNoMoreData: false,
            isLoading: true,
            isLoadingMore: false,
            page: 1,
        }
    }

    _backOrderClick = (item) => {
        const { callBack } = this.params;
        callBack(item);
        this.pop();
    }
 
    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._backOrderClick.bind(this, item)}>
                <View style={{marginTop: 10,backgroundColor:'#fff',paddingHorizontal:20,paddingVertical:12,borderRadius:6,marginHorizontal:10}}>
                    <CustomText style={{fontSize:15, }} text={item.Name + '  ' +(item.DepartmentName?item.DepartmentName:'')} />
                    {/* <View style={{flexDirection:'row'}}>
                        <CustomText text={item.Certificates&&item.Certificates[0]&&item.Certificates[0].TypeDesc} style={{fontSize:13,color:Theme.assistFontColor}}></CustomText>
                        <CustomText text={": "+item.Certificates&&item.Certificates[0]&&item.Certificates[0].SerialNumber} style={{fontSize:13,color:Theme.assistFontColor}}></CustomText>
                    </View> */}
                </View>
            </TouchableHighlight>
        )
    }

    renderBody() {
        const { employees, userInfo } = this.params;
        let employee = JSON.parse(JSON.stringify(employees))
        let userinfo = {
            Certificates: userInfo.CertificateList,
            Name:userInfo.Name,
            DepartmentName:userInfo.Department&&userInfo.Department.Name,
            Id:userInfo.Id
        }
        let mark = false;
        employee.map((item)=>{
            if(item&&item.PassengerOrigin&&item.PassengerOrigin.EmployeeId == userInfo.Id){
                mark =true
            }
        })
        if(!mark){
            employee.push(userinfo);
        } 
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={employee}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => String(index)}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: 'white',
        height: 60,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    }
})