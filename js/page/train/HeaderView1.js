
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    Image
} from 'react-native';
import Theme from '../../res/styles/Theme';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import TrainEnum from '../../enum/TrainEnum';
import Feather from 'react-native-vector-icons/Feather';
export default class HeaderView1 extends React.Component {

    static propTypes = {
        trainInfo: PropTypes.object.isRequired,
        otwThis: PropTypes.object.isRequired,
        titleTxt: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
          
        }
    }

    _showRules = () => {
        const { otwThis,trainInfo } = this.props;
        let _alertA = Util.Parse.isChinese() ? TrainEnum.trainOrderNotice.cn : TrainEnum.trainOrderNotice.en
        let _alertB = Util.Parse.isChinese() ? TrainEnum.trainOrderNoticeGSG.cn : TrainEnum.trainOrderNoticeGSG.en
        otwThis.showAlertView( (trainInfo.FromStationCode==="XJA" || trainInfo.ToStationCode==="XJA") ? _alertB : _alertA );
    }



    render() {
        const { trainInfo, Amount } = this.props;
        const departureTime = Util.Date.toDate(trainInfo.DepartureTime);
        let runtime = trainInfo.RunTime;
        if (!Util.Parse.isChinese()) {
            runtime = runtime && runtime.replace('小时', 'h');
            runtime = runtime && runtime.replace('分钟', 'm');
        }
        return <View style={{ marginHorizontal: 10,borderRadius:6 }}>
           <View style={{ backgroundColor: 'white', borderRadius: 6,padding:10 }}>
                <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: '#f3f3f3', borderBottomWidth: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexDirection: 'row' }}>
                        {
                                    this.props.titleTxt ?
                                        <View style={styles.lostyle} >
                                            <CustomText text={this.props.titleTxt} style={{ color: 'white',fontSize:12 }} />
                                        </View> : null
                        }
                        <Text allowFontScaling={false} >{departureTime && departureTime.format('MM-dd')} {departureTime.getWeek()} </Text>
                    </View>
                    <TouchableOpacity onPress={this._showRules}>
                        <CustomText style={{ color: Theme.theme, fontSize: 12 }} text='预订须知' />
                    </TouchableOpacity>
                </View>
                {
                    <View style={{flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical:15  }}>
                        <View style={{ flex: 1, justifyContent: 'space-around' }}>
                                <CustomText style={styles.detailTimeFont} text={trainInfo.StartTime} />
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    {/* <CustomText style={{height:15,width:15,backgroundColor:Theme.theme,color:'#fff',borderRadius:2,fontSize:12,textAlign:'center',marginRight:2}} text={'始'}></CustomText>  */}
                                    <View style={{flexDirection:'row',height:14,width:14,backgroundColor:Theme.theme,alignItems:'center',justifyContent:'center',borderRadius:2,marginRight:2}}>
                                        <Feather name={'arrow-up-right'} style={{textAlign:'center'}} size={15} color={'#fff'}/>
                                    </View>
                                    <CustomText style={styles.detailMainFont} numberOfLines={1} text={Util.Parse.isChinese() ? trainInfo.FromStationName : trainInfo.FromStationEnName} />
                                </View>
                        </View>
                            <View style={[{ flex: 1 }, styles.center]}>
                            <CustomText style={styles.detailMainFont} text={trainInfo.Checi} />
                            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={require('../../res/Uimage/arrow.png')} style={{ width: 60, height: 3 }}></Image>
                            </View>
                            <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={()=>{}}>
                                <CustomText allowFontScaling={false} style={{ color: Theme.aidFontColor,fontSize:12 }} text={runtime} />
                                <Image style={{marginLeft:2,height:5,width:7}} source={require('../../res/Uimage/trainFloder/caret_down.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'flex-end' }}>
                            <CustomText style={[styles.detailTimeFont, { alignItems: 'flex-end' }]} text={trainInfo.ArriveTime} />
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent: 'flex-end'}}>
                                {/* <CustomText style={{height:15,width:15,backgroundColor:Theme.theme,color:'#fff',borderRadius:2,fontSize:12,textAlign:'center',marginRight:2}} text={'过'}></CustomText>  */}
                                <View style={{flexDirection:'row',height:14,width:14,backgroundColor:Theme.RedMarkColor,alignItems:'center',justifyContent:'center',borderRadius:2,marginRight:2}}>
                                       <Feather name={'arrow-down-right'} style={{textAlign:'center'}} size={15} color={'#fff'}/>
                                </View>
                                <CustomText style={[styles.detailMainFont, { alignItems: 'flex-end' }]} numberOfLines={1} text={Util.Parse.isChinese() ? trainInfo.ToStationName : trainInfo.ToStationEnName} />
                            </View>
                        </View>
                    </View>
                }
                <View style={{ flexDirection: 'row', alignItems: 'center',paddingHorizontal:10,borderTopWidth:1,paddingVertical:10,borderColor:Theme.lineColor }}>
                        <CustomText style={styles.detailMarkFont} text={trainInfo.Zwname} />
                        <CustomText style={styles.detailMarkFont} text={': ¥ ' + Amount} />
                </View>
            </View>
        </View>
    }
}
const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    detailMarkFont: {
        fontSize: 12,
        color: Theme.annotatedFontColor
    },
    aidFont: {
        color: Theme.aidFontColor,
        fontSize: 15
    },
    detailTimeFont: {
        fontSize: 25,
        fontWeight:'bold'
    },
    detailMainFont: {
        color: Theme.commonFontColor
    },
    lostyle:{ 
        backgroundColor: Theme.orangeColor, 
        marginRight: 5,
        // width:16,
        height:16,
        alignItems:'center',
        justifyContent: 'center',
        borderRadius:2,
        paddingHorizontal:3
    }
});