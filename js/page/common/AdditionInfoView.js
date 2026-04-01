import React from 'react';

import {
    View,
    StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import UserInfoUtil from '../../util/UserInfoUtil';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Customer from '../../res/styles/Customer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import NavigationUtils from '../../navigator/NavigationUtils';
import {InfoDicView} from '../../custom/HighLight';
import Util from '../../util/Util';
let itemIndex;
class AdditionInfoView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            item_index:{}
        }
    }
    static propTypes = {
        AdditionIfo: PropTypes.object.isRequired,
        customerInfo: PropTypes.object.isRequired,
        userInfo: PropTypes.object.isRequired,
        ApproveOrigin: PropTypes.object.isRequired,
        DicList: PropTypes.array
    }

    _valueCHange = (text, obj) => {
        if(!obj){return}
        const { AdditionIfo } = this.props;
        itemIndex = AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictId === obj.Id);
        if (itemIndex) {
            itemIndex.ItemName = text;
            itemIndex.ItemInput = text;
            itemIndex.ItemEnName = text;
            itemIndex.Id = obj.Id;
            itemIndex.DictCode = obj.Code
            itemIndex.NeedInput = obj.NeedInput
        } else {
            let model = {
                DictId: obj.Id,
                Id: obj.Id,
                DictName: obj.Name,
                DictEnName: obj.EnName,
                ItemId: '',
                ItemSerialNumber: '',
                ItemName: text,
                ItemEnName: text,
                FormatRegexp: obj.FormatRegexp,
                Remark: obj.Remark,
                EnName: obj.EnName,
                RemarkNo: obj.RemarkNo,
                ItemInput: text,
                DictCode: obj.Code,
                NeedInput:obj.NeedInput
        }
            AdditionIfo&&AdditionIfo.DictItemList.push(model);
        }
        this.setState({});
    }
    _toSelectDicList = (obj) => {
        if(!obj){return}
        const { AdditionIfo } = this.props;
        NavigationUtils.push(this.props.navigation, 'DicList', {
            title: Util.Parse.isChinese()?obj.Name:obj.EnName,
            Id: obj.Id,
            ParentValue:obj.parentValue,
            callBack: (data) => {
                let dic = AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictId === obj.Id);
                if(obj.NextId){
                    AdditionIfo.DictItemList.forEach(itemDic => {
                        if(itemDic.DictId == obj.NextId){
                            itemDic.parentValue = data.Name
                        }
                    })
                }
                if (dic) {
                    dic.ItemId = data.DictId;
                    dic.Id = data.DictId;
                    dic.ItemSerialNumber = data.SerialNumber;
                    dic.ItemName = data.Name;
                    dic.ItemEnName = data.EnName;
                    dic.EnName = obj.EnName;
                    dic.DictEnName = obj.EnName;
                    dic.ItemInput = data.SerialNumber+" - "+data.Name+" - "+data.EnName;
                    dic.DictCode = obj.Code
                    dic.NeedInput = obj.NeedInput
                } else {
                    let model = {
                        DictId: data.DictId,
                        Id: data.DictId,
                        DictName: data.Name,
                        EnName: data.EnName,
                        DictEnName:data.EnName,
                        ItemId: data.Id,
                        ItemSerialNumber: data.SerialNumber,
                        ItemName: data.Name,
                        ItemEnName:data.EnName,
                        RemarkNo:obj.RemarkNo,
                        ItemInput:data.SerialNumber+" - "+data.Name+" - "+data.EnName,
                        DictCode: obj.Code,
                        NeedInput:obj.NeedInput
                    }
                    AdditionIfo&&AdditionIfo.DictItemList.push(model);
                }
                this.setState({});

            }
        })
    }
    render() {
        const { AdditionIfo, customerInfo, userInfo, ApproveOrigin, DicList,fromNo,PdfDictList } = this.props;
        if (!customerInfo || !customerInfo.Setting) return null;
        let additonArr = UserInfoUtil.Addition(customerInfo);
        let customerDicList = customerInfo.DictList;//公司字典项列表
        let DicListArr=[];//储存公司字典项Id
        let EmployeeDictListArr=[]//储存个人字典项Id
        let diffDicList = [];
        customerDicList&&customerDicList.map((item)=>{
            DicListArr.push(item.Id);
        })
        customerInfo.EmployeeDictList&&customerInfo.EmployeeDictList.map((item)=>{
            EmployeeDictListArr.push(item.Id);
        })
        let diffArr;
        if(fromNo===128){
            diffArr = DicListArr
        }else{
            diffArr = DicListArr.filter(function (val) { //算出公司字典和用户字典的差集Id：公司字典含有的、用户字典没有含有的 展示在公司字典处
                return EmployeeDictListArr&&EmployeeDictListArr.indexOf(val)===-1
            })
        }
        customerDicList&&customerDicList.map((item)=>{
            diffArr&&diffArr.map((diffitem)=>{
                if(item.Id == diffitem){
                    diffDicList.push(item)
                }
            })
        })
        if(PdfDictList&&PdfDictList.length>0){
            PdfDictList.forEach((pdfItem,index)=>{
                AdditionIfo.DictItemList.forEach((item,index)=>{
                    if(item.DictName == pdfItem.DictName){
                        item.ItemInput = pdfItem.Value
                        item.ItemName = pdfItem.Value
                        item.ItemEnName = pdfItem.Value
                    }
                })
            })
        }
        return (
            <View style={styles.view}>
                {
                    additonArr.length > 0 ?
                        additonArr.map((obj, index) => {
                            return (
                                <View key={index} style={styles.row}>
                                    <CustomText text={obj.name} style={{ flex: 3 }} />
                                    <CustomeTextInput style={{ flex: 7 }} placeholder={obj.state?'必填':'选填'} value={AdditionIfo[obj.en]} onChangeText={(text) => { AdditionIfo[obj.en] = text; this.setState({}) }} />
                                </View>
                            )
                        })
                        : null
                }
                {
                    !DicList && diffArr  ?
                    diffDicList.map((obj, index) => {
                            if (userInfo && userInfo.Customer && userInfo.Customer.Id === Customer.DRHJ) {
                                if (obj.Name === '实施阶段' && ApproveOrigin.OriginType === 2) {
                                    return null;
                                }
                            }
                            let itemIndex =AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => 
                                // obj.NeedInput ? item.DictName === obj.Name : item.DictId === obj.Id
                                item.DictCode == obj.Code
                            );
                            if(itemIndex){
                                itemIndex.BusinessCategory = obj.BusinessCategory
                                itemIndex.Id = obj.Id
                                itemIndex.DictId = obj.Id
                                itemIndex.DictName = obj.Name
                                itemIndex.DictEnName = obj.EnName
                                itemIndex.Sort = obj.Sort
                                itemIndex.Remark = obj.Remark
                                itemIndex.EnRemark = obj.EnRemark
                                itemIndex.ShowInOrder = obj.ShowInOrder
                                itemIndex.DictCode = obj.Code
                                itemIndex.NeedInput = obj.NeedInput
                           }
                            return (
                                obj.BusinessCategory&fromNo && obj.ShowInOrder? //判断指定业务
                                <View key={index} style={styles.row}>
                                    <InfoDicView index={index} 
                                                obj={obj} 
                                                itemIndex={itemIndex}
                                                value_Change={(text)=>{
                                                    this._valueCHange(text, obj);
                                                }}
                                                select_DicList={()=>{
                                                    this._toSelectDicList(obj)
                                                }}
                                    />
                                </View>
                                // <View key={index} style={styles.row}>
                                //     {obj.IsRequire?<HighLight name={Util.Parse.isChinese()? obj.Name:obj.EnName} style={{ height:20,backgroundColor:'#fff',alignItems:'center',justifyContent: 'center',marginTop:10,fontSize:14 }} value={''}/>:<CustomText text={Util.Parse.isChinese()? obj.Name:obj.EnName} style={{ height:20,backgroundColor:'#fff',alignItems:'center',marginTop:10,fontSize:14 }} />}
                                //     {
                                //         obj.NeedInput ?
                                //             <View style={{ height:40,justifyContent:'center' }}>
                                //                 <CustomeTextInput value={itemIndex && itemIndex.ItemName} 
                                //                                   style={{borderColor:obj.IsRequire&& !(itemIndex && itemIndex.ItemName)?Theme.redColor:'#fff',height:40,borderBottomWidth:1,color:Theme.commonFontColor,fontSize:14,}} 
                                //                                   placeholder={Util.Parse.isChinese()?obj.Remark?obj.Remark:'请输入':obj.EnRemark} 
                                //                                   placeholderTextColor={Theme.promptFontColor}
                                //                                 //   editable={obj.IsEditInput}
                                //                                   onChangeText={(text) => {
                                //                                         this._valueCHange(text, obj);
                                //                                   }} />
                                //             </View>
                                //             :
                                //             <View style={{ justifyContent:'center' ,flexDirection:'row',borderColor:obj.IsRequire&& !(itemIndex&&itemIndex.ItemName)?Theme.redColor:'#fff',borderBottomWidth:1}}>
                                //                 <CustomText text={itemIndex ? (Util.Parse.isChinese()?itemIndex.ItemName:itemIndex.ItemEnName) :(Util.Parse.isChinese()? obj.Remark: obj.EnRemark)} 
                                //                             style={{ color: itemIndex ? Theme.commonFontColor: '#ccc', flex: 1, paddingTop:10,fontSize:14}} 
                                //                             onPress={this._toSelectDicList.bind(this, obj)} />
                                //                 <Ionicons name={'ios-arrow-forward'} size={22} color={'lightgray'} style={{height:40,paddingTop:9}} />
                                //             </View>
                                //     }
                                // </View>
                                :null
                            )
                        })
                        : null
                }
                {
                    DicList && DicList.length > 0 ?//申请单
                        DicList.map((obj, index) => {
                            let itemIndex =AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => item.DictId === obj.Id);
                            return (
                                <View key={index} style={styles.row}>
                                <InfoDicView index={index} 
                                            obj={obj} 
                                            itemIndex={itemIndex} 
                                            value_Change={(text)=>{
                                                this._valueCHange(text, obj);
                                            }}
                                            select_DicList={()=>{
                                                this._toSelectDicList(obj)
                                            }}
                                            editable={true}
                                />
                                </View>
                                // <View key={index} style={styles.row}>
                                //     {/* <CustomText text={obj.Name} style={{ flex: 3 }} /> */}
                                //     {obj.IsRequire?<HighLight name={obj.Name} value={itemIndex}/>:<CustomText text={obj.Name} style={{ flex: 3 }} />}
                                //     {
                                //         obj.NeedInput ?
                                //             <View style={{ height:40,justifyContent:'center' }}>
                                //             <CustomeTextInput style={{ flex: 7 }} value={itemIndex && itemIndex.ItemName} 
                                //                               placeholder={obj.Remark}  onChangeText={(text) => {
                                //                 this._valueCHange(text, obj);
                                //             }} />
                                //             </View>
                                //             :
                                //             <View style={{ justifyContent:'center' ,flexDirection:'row',borderColor:obj.IsRequire&& !(itemIndex&&itemIndex.ItemName)?Theme.redColor:'#fff',borderBottomWidth:1}}>
                                //                 <CustomText text={itemIndex ? itemIndex.ItemName : obj.Remark} style={{ color: itemIndex ? Theme.commonFontColor: '#ccc', flex: 1, paddingTop:10,fontSize:14}} 
                                //                 onPress={this._toSelectDicList.bind(this, itemIndex)} />
                                //                 <Ionicons name={'ios-arrow-forward'} size={20} color={'lightgray'} />
                                //             </View>
                                //     }
                                // </View>
                            )
                        })
                        : null
                }
            </View>
        )
    }
}
const getStatePorps = state => ({
    compSwitch:state.compSwitch.bool, 
})
// export default connect(getStatePorps)(withNavigation(AdditionInfoView));
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <AdditionInfoView {...props} navigation={navigation} />
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginTop:10,
        borderRadius:6,
        paddingVertical:10
    },
    row: {
        marginHorizontal: 20,
        borderBottomColor: Theme.lineColor,
        // borderBottomWidth: 1,
    },
    rowRight: {
        flex: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})