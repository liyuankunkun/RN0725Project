import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import SuperView from '../../super/SuperView';
import CustomText from '../../custom/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import CustomActionSheet from '../../custom/CustomActionSheet';
import Util from '../../util/Util';
export default class TrainFilterScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '筛选'
        }
        this.state = {
            options: [],
            currentType: '',
            filterOptions: Util.Encryption.clone(this.params.filterOptions)
        }
    }

    componentDidMount() {
        this.params.list.forEach(item => {
            if (!trainFilters.FromStations.includes(item.from_station_name)) {
                trainFilters.FromStations.push(item.from_station_name);
            }
            if (!trainFilters.ToStations.includes(item.to_station_name)) {
                trainFilters.ToStations.push(item.to_station_name);
            }
        })

    }



    _handlePress = (index) => {
        const { currentType, filterOptions } = this.state;
        let data = trainFilters[currentType];
        filterOptions[currentType] = data[index];
        this.setState({

        });
    }

    _handlePress2 = (item ,type) => {
        const { filterOptions } = this.state;
        if(type=='TrainNewType'|| type=='TrainGroup'){
            filterOptions[type] = item.code;
        }else{
            filterOptions[type] = item
        }
        this.setState({})
    }

    _showSelectTab = (type) => {
        this.setState({
            currentType: type,
            options: trainFilters[type]
        }, 
        () => {
            this.actionSheet.show();
        }
       )
    }


    //确定按钮
    _sureBtnClick = () => {
        const { list, callBack } = this.params;
        const { filterOptions } = this.state;
        let isFilter = false;
        for (const key in filterOptions) {
            if (filterOptions.hasOwnProperty(key)) {
                const element = filterOptions[key];
                if (element !== '不限') {
                    isFilter = true;
                }
            }
        }
        callBack(isFilter,filterOptions);
        this.pop();
    }


    renderBody() {
        const { options, filterOptions } = this.state;
        return (
            <View style={{flex:1, backgroundColor: '#fff'}}>
            <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
                 <View style={{}}>
                    <CustomText text='车次类型' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.TrainNewType.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'TrainNewType')}} 
                                              style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                      borderColor:filterOptions['TrainNewType']==item.code?Theme.theme:Theme.lineColor,
                                                      color:filterOptions['TrainNewType']==item.code?Theme.theme:Theme.lineColor,
                                                      backgroundColor:filterOptions['TrainNewType']==item.code?Theme.greenBg:'#fff',
                                                    }]}
                            >
                                <CustomText text={item.name} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='车组类型' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.TrainGroup.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'TrainGroup')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['TrainGroup']==item.code?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['TrainGroup']==item.code?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['TrainGroup']==item.code?Theme.greenBg:'#fff'}]}
                            >
                                <CustomText text={item.name} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='席别类型' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.TrainTicketType.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'TrainTicketType')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['TrainTicketType']==item?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['TrainTicketType']==item?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['TrainTicketType']==item?Theme.greenBg:'#fff'}]}
                            >
                                <CustomText text={item} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='出发时段' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.FromTime.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'FromTime')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['FromTime']==item?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['FromTime']==item?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['FromTime']==item?Theme.greenBg:'#fff'}]}
                            >
                                <CustomText text={item} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='到达时段' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.ToTime.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'ToTime')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['ToTime']==item?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['ToTime']==item?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['ToTime']==item?Theme.greenBg:'#fff'}]}
                            >
                                <CustomText text={item} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='出发站' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.FromStations.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'FromStations')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['FromStations']==item?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['FromStations']==item?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['FromStations']==item?Theme.greenBg:'#fff'}]}
                            >
                                <CustomText text={item} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                <View style={{}}>
                    <CustomText text='到达站' style={{padding:10}} />
                    <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {
                        trainFilters.ToStations.map((item)=>{
                            return(
                            <TouchableOpacity onPress={()=>{this._handlePress2(item,'ToStations')}} style={[styles.itemStyle, {width:(global.screenWidth-60)/3-2,
                                                        borderColor:filterOptions['ToStations']==item?Theme.theme:Theme.lineColor,
                                                        color:filterOptions['ToStations']==item?Theme.theme:Theme.lineColor,
                                                        backgroundColor:filterOptions['ToStations']==item?Theme.greenBg:'#fff'}]}
                                
                            >
                                <CustomText text={item} />
                            </TouchableOpacity>
                            )
                        })
                    }
                    </View>
                </View>
                {
                    ViewUtil.getSubmitButton('确定', this._sureBtnClick)
                }
            </ScrollView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 50,
        backgroundColor: 'white'
    },
    rightView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemStyle:{
        borderRadius:2,
        borderWidth:1,
        borderColor:Theme.lineColor,
        // width:(global.screenWidth-60)/3,
        alignItems: 'center',
        paddingVertical:6,
        marginBottom:10,
        marginHorizontal:10
    }
})

/**
 * 筛选项
 */
const trainFilters = {
    /**
     * 出发站
     */
    FromStations: ['不限'],
    /**
     * 到达站
     */
    ToStations: ['不限'],
     /**
     * 出发时间
     */
    FromTime: ["不限","0-8点","8-12点","12-18点","18-24点"],
    /**
     * 到达时间
     */
    ToTime:["不限","0-8点","8-12点","12-18点","18-24点"],
    TrainNewType:[
        {code: "不限",name:'不限'},
        {code: "K",name:'快速列车'},
        {code: "G",name:'高速动车组'},
        {code: "C",name:'城际列车'},
        {code: "Z",name:'直达特快列车'},
        {code: "T",name:'特快列车'},
        {code: "",name:'其他'},
        {code: "D",name:'动车组'},
        // '不限','K','G','C','Z','T','','D',
    ],
    TrainGroup:[
       {code: "不限",name:'不限'},
       {code: "3",name:'动感号'},
       {code: "2",name:'智能动车'},
       {code: "1",name:'复兴号'},
       {code: "0",name:'其他车组'},
    ],
    TrainTicketType:['不限','硬座','无座','硬卧','软卧','二等座','一等座','商务座','优选一等座','二等卧','一等卧'],


    
}
