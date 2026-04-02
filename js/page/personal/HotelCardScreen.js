import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    Text,
    StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import ViewUtil from '../../util/ViewUtil';

class HotelCardScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '酒店常客卡',
            // rightButton: this._rightTitleBtn(),
        }
        this._tabBarBottomView = {
            bottomInset: true,
            bottomColor: 'white'
        }
        this.state = {
            dataList: this.params.HotelCardTravellerList,
        }
    }

    _rightTitleBtn = () => {
        return (
        <TouchableHighlight underlayColor='transparent' onPress={this._addBtnClick}>
            <AntDesign name={'pluscircleo'} size={24} color={Theme.theme} style={{paddingRight:16}}/>
        </TouchableHighlight>
        )
    }

    _addBtnClick = () => {
        const {dataList} = this.state;
        this.push('AddNewHotelCardScreen', {
             callBack: (item) => {
                dataList.push(item);
                this.setState({});
            },
        })
    }

    // componentDidMount = () =>{
    //     this.setState({
    //         dataList: this.params.HotelCardTravellerList,
    //     });
    // }

    _rowClick = (index) => {
        const {dataList} = this.state;
        dataList.splice(index,1);
        this.setState({});
    }
    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent'>
                <View style={styles.row} >
                    <View style={{  justifyContent: "center", flex: 1 }}>
                        <CustomText text={item.HotelGroupName} />
                        <Text allowFontScaling={false} style={{ marginTop: 5 ,color:'gray'}}>{item.SerialNumber}</Text>
                    </View>
                    <AntDesign name={'delete'} size={18}  style={{color:Theme.theme}} onPress={this._rowClick.bind(this, index)}/>
                </View>
            </TouchableHighlight>
        )
    }
    renderBody() {
        const { dataList } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <FlatList style={{ flex: 1 }}
                    data={dataList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                />
                {
                    ViewUtil.getSubmitButton('新增',this._addBtnClick)
                }
                {/* <TouchableHighlight underlayColor='transparent' onPress={{}}>
                    <View style={{ height: 40, backgroundColor: Theme.theme, justifyContent: "center", alignItems: 'center', flexDirection: 'row' }}>
                        <CustomText text={'确认'} style={{ color: "#fff",fontSize:17, marginLeft: 5 }} />
                    </View>
                </TouchableHighlight> */}
            </View>
        )
    }
}
const getStateProps = state => ({
    // customerInfo_userInfo: state.customerInfo_userInfo
})
export default connect(getStateProps)(HotelCardScreen);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flex: 1,
        height: 60,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginHorizontal:10,
        marginTop:10,
        borderRadius:5
    }
})