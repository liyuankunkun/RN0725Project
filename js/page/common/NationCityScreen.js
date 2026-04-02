import React from 'react';
import {
    View,
    FlatList,
    TouchableHighlight
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import Util from '../../util/Util';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import CommonService from '../../service/CommonService';


export default class NationCityScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '选择国家/地区'
        }
        this.state = {
            dataList: [],
            keyword: ''
        }
    }
   componentDidMount(){
       this._loadList();
   }

    _loadList = () => {
        this.showLoadingView();
        let model = {
            Keyword: this.state.keyword
        }
        CommonService.getCountryList(model).then(response => {
            this.hideLoadingView();
            if (response) {
                this.setState({
                    dataList: response.data
                })
            } else {
                this.toastMsg('获取国家数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取国家数据异常');
        })
    }

    _backRefresh = (item) => {
        const { refresh } = this.params;
        refresh(item);
        this.pop();
    }
    _renderItem = ({ item, index }) => {
        const { CertificateType } = this.params;
        return (
            // (CertificateType=='外国人永久居留身份证'||CertificateType=="Foreigner's Permanent Residence ID Card")&&index==0?null:
            <TouchableHighlight underlayColor='transparent' onPress={this._backRefresh.bind(this, item)}>
                <View style={{ height: 50, backgroundColor: "white", flexDirection: 'row', borderBottomColor: Theme.lineColor, borderBottomWidth: 1, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'space-between',marginHorizontal:10,marginTop:5,borderRadius:4 }}>
                    <CustomText text={Util.Parse.isChinese() ? item.Name : item.EnName} />
                    <CustomText text={item.Code} />
                </View>
            </TouchableHighlight>
        )
    }
    renderBody() {
        const { dataList } = this.state;
        return (
            <View>
                <SearchInput placeholder='请输入国家' value={this.state.keyword} onChangeText={text => this.setState({ keyword: text })} onSubmitEditing={this._loadList} />
                <FlatList
                    keyExtractor={(item, index) => String(index)}
                    data={dataList}
                    showsVerticalScrollIndicator={false}
                    renderItem={this._renderItem}
                    style={{marginTop:2}}
                />
            </View>
        )
    }

}