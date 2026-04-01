import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableHighlight
} from 'react-native';
import Theme from '../../res/styles/Theme';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ApplicationService from '../../service/ApplicationService';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util';

// let category = [
//     {
//         Key:1,
//         Value:'国内机票'
//     },
//     {
//         Key:2,
//         Value:'火车票'
//     },
//     {
//         Key:4,
//         Value:'国内酒店'
//     },
//     {
//         Key:8,
//         Value:'国际机票'
//     },
//     {
//         Key:16,
//         Value:'港澳台及国际酒店'
//     },
//     {
//         Key:32,
//         Value:'用车'
//     },
// ]
let listArr = []
export default class ApplicationCategoryScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '业务类目'
        }
        this.customerInfo = this.params.customerInfo || {}
        const addition = this.customerInfo.Addition || {}
        this.state = {
            select: Util.Encryption.clone(this.params.select) || [],
            category:[
                {
                    Key:1,
                    Value:'国内机票',
                    hasAuth:Util.Encryption.clone(addition.HasAirAuth)
                },
                {
                    Key:2,
                    Value:'火车票',
                    hasAuth:Util.Encryption.clone(addition.HasTrainAuth)
                },
                {
                    Key:4,
                    Value:'国内酒店',
                    hasAuth:Util.Encryption.clone(addition.HasHotelAuth)
                },
                {
                    Key:8,
                    Value:'港澳台及国际机票',
                    hasAuth:Util.Encryption.clone(addition.HasInterAirAuth)
                },
                {
                    Key:16,
                    Value:'港澳台及国际酒店',
                    hasAuth:Util.Encryption.clone(addition.HasInterHotelAuth)
                },
                // {
                //     Key:32,
                //     Value:'用车',
                //     hasAuth:Util.Encryption.clone(this.customerInfo.Addition.HasRentCarAuth)
                // },
            ],
            selectCategoryList:[]


        }
    }
    componentDidMount(){
        const { selectCategoryList ,category} = this.state
        category.map((item)=>{
            item.hasAuth?
            selectCategoryList.push(item)
            :null
        })
        this.setState({})
    }

    _rowClickAtIndex = (item) => {
        if (item.Value === '不限') {
            this.state.select = [item];
        } else {
            let index = this.state.select.findIndex(obj => obj.Key === item.Key);
            if (index > -1) {
                this.state.select.splice(index, 1);
            } else {
                this.state.select.push(item);
            }
            let atIndex = this.state.select.findIndex(obj => obj.Value === '不限');
            if (atIndex > -1) {
                this.state.select.splice(atIndex, 1);
            }
        }
        this.setState({});
    }
    _submit = () => {
        if (!this.state.select || this.state.select.length === 0) {
            this.toastMsg('请选择业务类目');
            return;
        }
        this.params.callBack && this.params.callBack(this.state.select);
        this.pop();
    }
    /**
     * 全选按钮
     */
    _selectAll = () =>{
        const { select, category,selectCategoryList} = this.state;
        if(select.length==selectCategoryList.length){ //如果全选中的话
            this.setState({
                select:[]
            }) 
        }else{
            
            let categoryCopy = JSON.parse(JSON.stringify(selectCategoryList))//序列化反序列化法拷贝
            this.setState({
                select:categoryCopy
            })
        }  
    }
    renderBody() {
        const {  select,category ,selectCategoryList} = this.state;
        
        return (
            <View style={{flex:1}}>
            <View style={{margin:10,borderRadius:6,backgroundColor:'#fff',flex:1}}>
            <ScrollView style={{padding:10}}>
                 <TouchableHighlight underlayColor='transparent' 
                                     onPress={()=>{this._selectAll()}} >
                    <View style={[styles.rowView]}>
                        <CustomText allowFontScaling={false} style={{ marginVertical: 10, flex: 1 }} text={'全部类目'} />
                        <MaterialIcons
                            // name={select.findIndex(obj => obj.Value === item.Value) > -1 ? 'check-box' : 'check-box-outline-blank'}
                            name={select.length==selectCategoryList.length?'check-box':'check-box-outline-blank'}
                            size={22}
                            color={select.length==selectCategoryList.length ? Theme.theme : Theme.darkColor}
                        />
                    </View>
                </TouchableHighlight>
                { 
                    category.map((item, index) => {
                        return (
                            item.hasAuth?
                            <TouchableHighlight underlayColor='transparent' key={index} onPress={this._rowClickAtIndex.bind(this, item)}>
                                <View style={[styles.rowView]}>
                                    <CustomText allowFontScaling={false} style={{ marginVertical: 10, flex: 1 }} text={item.Value} />
                                    <MaterialIcons
                                        name={select.findIndex(obj => obj.Key === item.Key) > -1 ? 'check-box' : 'check-box-outline-blank'}
                                        size={22}
                                        color={select.findIndex(obj => obj.Key === item.Key) > -1 ?Theme.theme:Theme.darkColor}
                                    />
                                </View>
                            </TouchableHighlight>:null
                        )
                    })
                }
            </ScrollView>
            </View>
            {
                ViewUtil.getSubmitButton('确定', this._submit)
            }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    rowView: {
        height: 50,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: Theme.lineColor,
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 10,
    }
})
