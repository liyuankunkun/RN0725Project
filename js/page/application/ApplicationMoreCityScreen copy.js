import React from 'react';
import {
    View,
    TouchableHighlight,
    StyleSheet,
    FlatList
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import hotCitys from '../../res/js/applicationHotCity';
import CustomText from '../../custom/CustomText';
import CommonService from '../../service/CommonService';
import Theme from '../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ViewUtil from '../../util/ViewUtil'
var selectCityArr = [];
export default class ApplicationMoreCityScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = props.navigation.state.params || {};
        this._navigationHeaderView = {
            title: this.params.title,
            rightButton: ViewUtil.getRightButton("保存", this._toSaveCitys)
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            dataList: [],
            keyWorld: '',
            selectCity:[],
        }
    }
    /**
     * 保存选择的城市
     */
    _toSaveCitys = () => {
        this.params.callBack(this.state.selectCity);
        this.pop();
    }
    _seatchClick = () => {
        if (!this.state.keyWorld) {
            this.toastMsg('请输入关键字');
            return;
        }
        let model = {
            Keyword: this.state.keyWorld,
            Domestic:this.params.national
            // Limit: 10,
            // NationType: this.params.national ? '1' : '0',
            // PageIndex: 1
        }
        this.showLoadingView();
        CommonService.CommonCity(model).then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data && response.data) {
                    this.setState({
                        dataList: response.data
                    })
                }
            } else {
                this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取数据异常');
        })
    }
    /**
     * 选择城市
     * @param {选择的城市} obj 
     */
    _cityBtnClick = (obj) => {
        // this.params.callBack(obj);
        // this.pop();
        const {selectCity } = this.state;
        if(selectCity&&selectCity.length<5){
            this.state.selectCity.push(obj);
            var resultArr;
            resultArr = this.state.selectCity.filter(function (item, index, self) {
            return self.indexOf(item) == index;
            });
            this.setState({
                selectCity:resultArr
            })
        }else{
            this.toastMsg('城市选择不能超过5个');
        }
        
    }
    _cityBtnDelet = (obj) => {
        var resultArr;
        resultArr = this.state.selectCity.filter(function (item, index, self) {
            return item != obj;
            });
        this.setState({
            selectCity:resultArr
        })    
    }

    renderBody() {
        const { dataList, keyWorld,selectCity } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder='请输入城市名称' value={keyWorld} onChangeText={keyWorld => this.setState({ keyWorld })} onSubmitEditing={this._seatchClick} />
                {
                    hotCitys && hotCitys.length > 0 ?
                        <View style={{ margin: 10 }}>
                            
                            {selectCity&&selectCity.length!=0?
                            <View>
                            <CustomText text='已选' />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    selectCity.map((item, index) => {
                                        return (
                                            <View key={index} style={{flexDirection:'row',justifyContent:'flex-end',paddingBottom:10}}>
                                                <TouchableHighlight  >
                                                    <View style={styles.headerView2}>
                                                        <CustomText style={{color:'#fff'}} numberOfLines={1} text={item.Name} />
                                                    </View>
                                                </TouchableHighlight>
                                                <TouchableHighlight style={{position:'absolute',width:20,height:20,backgroundColor:'#fff',borderRadius:10,borderColor:'gray'}}
                                                                    key={index} underlayColor="transparent"
                                                                    onPress={this._cityBtnDelet.bind(this, item)}
                                                >
                                                   <AntDesign name={'close'} size={20} color={'gray'} />
                                                </TouchableHighlight>
                                            </View>
                                        )
                                    })
                                }</View>
                            </View>:null
                            }
                            <CustomText text='热门' />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    hotCitys.map((item, index) => {
                                        return (
                                            <TouchableHighlight key={index} underlayColor="transparent" onPress={this._cityBtnClick.bind(this, item)}>
                                                <View style={styles.headerView}>
                                                    <CustomText numberOfLines={1} text={item.Name} />
                                                </View>
                                            </TouchableHighlight>
                                        )
                                    })
                                }
                            </View>
                        </View> : null
                }
                <FlatList
                    data={dataList}
                    renderItem={this._renderItem}
                    keyExtractor={(item, index) => String(index)}
                />
            </View>
        )
    }

    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._cityBtnClick.bind(this, item)}>
                <View style={styles.row}>
                    <CustomText style={{ marginLeft: 5 }} text={item.Name} />
                </View>
            </TouchableHighlight>
        )
    }
}
const styles = StyleSheet.create({
    headerView: {
        width: 60,
        height: 30,
        borderRadius: 5,
        backgroundColor: 'white',
        marginTop: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: "center"
    },
    headerView2: {
        width: 60,
        height: 30,
        borderRadius: 5,
        backgroundColor: Theme.theme,
        marginTop: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: "center"
    },
    row: {
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: 44,
    },
})