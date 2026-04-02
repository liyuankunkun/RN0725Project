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
import NavigationUtils from '../../navigator/NavigationUtils';
import HighLight from '../../custom/HighLight';
import Util from '../../util/Util';
import { InfoDicView }  from '../../custom/HighLight';
import CheckBox from '../../custom/CheckBox';

let itemIndex;
class CompAdditionInfoView extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            item_index:{},
            selectedNeed:true,//是否需要输入审批人
        }
    }
    static propTypes = {
        AdditionIfo: PropTypes.object.isRequired,
        customerInfo: PropTypes.object.isRequired,
    }

    _valueCHange = (text, obj) => {
        // obj.ItemName = text;
        // obj.ItemEnName = text;
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
                NeedInput:obj.NeedInput,
        }
            AdditionIfo&&AdditionIfo.DictItemList.push(model);
        }
        this.setState({});
    }
    _toSelectDicList = (obj) => {
        const { AdditionIfo } = this.props;
        NavigationUtils.push(this.props.navigation, 'DicList', {
            title: obj.DictName,
            Id: obj.DictId,
            ParentValue:obj.parentValue,
            callBack: (data) => {
                    if(obj.NextId){
                        AdditionIfo.DictItemList.forEach(itemDic => {
                            if(itemDic.DictId == obj.NextId){
                                itemDic.parentValue = data.Name
                            }
                        })
                    }
                    obj.ItemId = data.Id;
                    obj.Id = data.Id;
                    obj.ItemSerialNumber = data.SerialNumber;
                    obj.ItemName = data.Name;
                    obj.ItemEnName = data.EnName;
                    // obj.ItemInput = data.SerialNumber+" - "+data.Name+" - "+data.EnName
                    obj.ItemInput = data.Name
                this.setState({});
            }
        })
    }

    render() {
        const {fromNo,customerInfo,AdditionIfo,DicList1,PdfDictList,NoApproval} = this.props;
        //找到AdditionIfo.DictItemList中和PdfDictList中名称相同的对象，并将PdfDictList中对象的属性值赋给AdditionIfo.DictItemList中对象        
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
               { DicList1&&DicList1.length>0 ?null:
                customerInfo.DictList&&customerInfo.DictList.map((obj, index)=>{
                        let itemIndex =AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(item => 
                            item.DictCode === obj.Code
                        );
                        // console.log("itemIndex",itemIndex)
                        //     if(obj.NeedInput&&itemIndex ){
                        //         itemIndex.Id = obj.Id
                        //         itemIndex.DictId = obj.Id
                        //         itemIndex.DictName = obj.Name
                        //         itemIndex.DictEnName = obj.EnName
                        //         itemIndex.Sort = obj.Sort
                        //         itemIndex.Remark = obj.Remark
                        //         itemIndex.EnRemark = obj.EnRemark
                        //         itemIndex.ShowInOrder = obj.ShowInOrder
                        //         itemIndex.ItemName = obj.ItemName
                        //         itemIndex.DictCode = obj.Code
                        //         itemIndex.NeedInput = obj.NeedInput
                        //    }
                       return (
                        obj.BusinessCategory&fromNo && obj.ShowInOrder? //判断指定业务
                            (
                                customerInfo.CustomerHandleName==="Ontheway.TMC.CustomerHandlers.Shell.ShellHandler"&& obj.Name==="approver's email address")?
                                !NoApproval?
                                <View key={index} style={{}}>
                                    <View style={{flexDirection:'row',height:25,marginTop:10}}>
                                        <CustomText text={"本次行程需要审批"} style={{ flex: 3,fontSize:14,color:Theme.commonFontColor }} />
                                        <CheckBox
                                            isChecked={this.state.selectedNeed}
                                            onClick={() =>{ 
                                                this.setState({ 
                                                    selectedNeed: !this.state.selectedNeed,
                                                },()=>{
                                                    customerInfo.selectedNeed = this.state.selectedNeed
                                                })
                                               }
                                            }
                                        />
                                    </View>
                                    {
                                        this.state.selectedNeed ?
                                            <CustomeTextInput value={itemIndex && itemIndex.ItemName} 
                                                            style={{height:40}} 
                                                            placeholder={"请填写审批人邮箱"} 
                                                            onChangeText={(text) => {
                                                                    this._valueCHange(text, obj);
                                                            }} />
                                        :null
                                    }
                                    <View style={{height:1,backgroundColor:Theme.lineColor}} />
                                    {this.state.selectedNeed ? <CustomText text={Util.Parse.isChinese() ? obj.Remark : obj.EnRemark ? obj.EnRemark:obj.Remark} style={{ fontSize:12,color:Theme.assistFontColor,marginBottom:10,marginLeft:5 }} />:null}
                                </View>
                                :null
                            :
                            <InfoDicView index={index}
                                            obj={obj} 
                                            itemIndex={itemIndex} 
                                            value_Change={(text)=>{
                                                this._valueCHange(text, obj);
                                            }}
                                            select_DicList={()=>{
                                                this._toSelectDicList(itemIndex)
                                            }}
                            />
                            
                        :null
                    )
                })
               }
               {
                    DicList1 && DicList1.length > 0 ?//申请单
                        DicList1.map((obj, index) => {
                            let itemIndex =AdditionIfo&&AdditionIfo.DictItemList&&AdditionIfo.DictItemList.find(
                                item => item.DictCode == obj.DictCode
                            );
                            return (
                                obj.BusinessCategory&fromNo && obj.ShowInOrder?
                                    <InfoDicView index={index} 
                                                    obj={obj} 
                                                    itemIndex={itemIndex} 
                                                    value_Change={(text)=>{
                                                        this._valueCHange(text, obj);
                                                    }}
                                                    select_DicList={()=>{
                                                        this._toSelectDicList(itemIndex)
                                                    }}
                                                    editable={true}
                                    />
                                    // <View key={index} style={styles.row}>
                                    //     {obj.IsRequire?<HighLight name={obj.DictName&&obj.DictName} value={itemIndex}/>:<CustomText text={obj.DictName} style={{ flex: 3 }} />}
                                    //     {
                                    //         obj.NeedInput ?
                                    //             <CustomeTextInput style={{ flex: 7, backgroundColor:obj.IsRequire&& !itemIndex.ItemName ?'#F7CCD1': '#fff', height: 40}} value={itemIndex && itemIndex.ItemName} 
                                    //                             placeholder={obj.Remark}  onChangeText={(text) => {
                                    //                 this._valueCHange(text, obj);
                                    //             }} />
                                    //             :
                                    //             <View style={styles.rowRight}>
                                    //                 <CustomText text={itemIndex ? itemIndex.ItemName : obj.Remark} style={{ color: itemIndex ? '#333' : 'gray', flex: 1 }} onPress={this._toSelectDicList.bind(this, itemIndex)} />
                                    //                 <Ionicons name={'chevron-forward'} size={22} color={'lightgray'} />
                                    //             </View>
                                    //     }
                                    // </View>
                                :null                                
                            )
                        })
                    : null
                }
             </View>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <CompAdditionInfoView {...props} navigation={navigation} />
     )
}
const styles = StyleSheet.create({
    view: {
        backgroundColor: 'white',
        paddingHorizontal:20,
    },
    row: {
        height: 44,
        marginHorizontal: 20,
        flex: 1,
        borderBottomColor: Theme.themeLine,
        borderBottomWidth: 1
    },
    rowRight: {
        flex: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})