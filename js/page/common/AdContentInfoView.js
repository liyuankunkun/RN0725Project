import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    DeviceEventEmitter,
    ImageBackground
} from 'react-native';
import PropTypes from 'prop-types';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../navigator/NavigationUtils';
import StorageUtil from '../../util/StorageUtil';
const FCM_SHOW_ADLIST = 'FCMSHOWADLIST';
import Swiper from 'react-native-swiper';

class AdContentInfoView extends React.Component {
    static propTypes = {
        adList: PropTypes.array,
        detail_ad:PropTypes.bool
    }
    constructor(props) {
        super(props);
        this.state = {
            textAds: [],
            isShowAds: false
        }
    }

    componentDidMount() {
        StorageUtil.loadKeyId(FCM_SHOW_ADLIST).then(res => {
            if (res && res == 'on') {
                this.setState({
                    isShowAds: true
                })
            }
        }).catch(error => {
            this.setState({
                isShowAds: true
            })
        })
        DeviceEventEmitter.addListener('home_close_open_adlist',(res)=>{
            this.setState({
                isShowAds:res
            })
        })
    }

    /**
      *  广告详情页面
      */
    _toAdDetail = (item) => {
        if (item.AdContentInfo) {
            if (item.AdContentInfo.AdLink) {
                NavigationUtils.push(this.props.navigation, "Web", {
                    title: item.ContentName,
                    url: item.AdContentInfo && item.AdContentInfo.AdLink
                })
            } else {
                let items = {
                    content: item.AdContentInfo.Content,
                    title: item.AdContentInfo.Name,
                    LinkUrl: null
                }
                NavigationUtils.push(this.props.navigation, 'NoticeDetail',
                    { item: items }
                )
            }
        }
    }

    _renderList = () => {
        const { adList } = this.props;
        return (
                <View style={{height: screenWidth / 3,borderRadius:10,width: screenWidth}}>
                    <Swiper
                        autoplay={true}
                        style={{}}
                        paginationStyle = {{bottom:35}}
                        dotStyle={{width:5,height:5}}
                        activeDotStyle={{width:5,height:5,backgroundColor:Theme.theme}}
                    >
                        {
                            adList.map((obj, index) => {
                                return (
                                    <TouchableHighlight key={index} underlayColor='transparent' onPress={this._toAdDetail.bind(this, obj)}>
                                        <View style={{ }}>
                                            <ImageBackground source={obj.AdContentInfo&&obj.AdContentInfo.ImgUrl ? { uri: `${obj.AdContentInfo.ImgUrl}` } : require('../../res/Uimage/addflipic.jpg')} style={{ borderRadius:10 }} >
                                                <View style={{justifyContent:'space-between',height: screenWidth / 3}}>
                                                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                                            <Image source={require('../../res/Uimage/tuijian.png')} style={{  width: 55, height: 18}} />
                                                            <TouchableOpacity style={{height: 20,width:20,marginRight:5,marginTop:5}} 
                                                                            onPress={() => {
                                                                                    this.setState({
                                                                                        isShowAds:false
                                                                                    },()=>{
                                                                                        StorageUtil.saveKeyId(FCM_SHOW_ADLIST,'off');
                                                                                    })
                                                                            }}>
                                                                <AntDesign name={'closecircle'} size={18} color={'rgba(0, 0, 0, 0.3)'} style={{}} />
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={{width: screenWidth, height:35,backgroundColor:Theme.touMingColor,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:10}}>
                                                            <CustomText style={{  color:'#fff',fontSize:12}} text={obj.ContentName} numberOfLines={2} />
                                                            <CustomText style={{  color:'#fff',fontSize:12}} text={'查看详情 >'} numberOfLines={2} />
                                                        </View>
                                                    </View>
                                            </ImageBackground>
                                        </View>
                                    </TouchableHighlight>
                                )
                            })
                        }
                    </Swiper>
                </View>
        )
    }

    _renderDetail_ad = () => {
        const { adList } = this.props;
        return (
                <View style={{  height: screenWidth / 3,borderRadius:6,width: screenWidth-20,marginHorizontal:10 }}>
                    <Swiper
                        autoplay={true}
                        style={{}}
                        paginationStyle = {{bottom:35}}
                        dotStyle={{width:5,height:5}}
                        activeDotStyle={{width:5,height:5,backgroundColor:Theme.theme}}
                    >
                        {
                            adList.map((obj, index) => {
                                return (
                                    <TouchableHighlight key={index} underlayColor='transparent' onPress={this._toAdDetail.bind(this, obj)}>
                                        <View style={{ }}>
                                            <ImageBackground source={obj.AdContentInfo&&obj.AdContentInfo.ImgUrl ? { uri: `${obj.AdContentInfo.ImgUrl}` } : require('../../res/Uimage/addflipic.jpg')} style={{ height: screenWidth / 3,borderRadius:6,width: screenWidth-20 }} imageStyle={{ borderRadius:6}}>
                                                <View style={{justifyContent:'space-between',height: screenWidth / 3}}>
                                                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                                        <Image source={require('../../res/Uimage/tuijian.png')} style={{  width: 55, height: 18,borderTopLeftRadius:6,borderBottomRightRadius:6}} imageStyle={{ borderRadius:6}} />
                                                        <TouchableOpacity style={{height: 20,width:20,marginRight:5,marginTop:5}} 
                                                                        onPress={() => {
                                                                                this.setState({
                                                                                    isShowAds:false
                                                                                },()=>{
                                                                                    StorageUtil.saveKeyId(FCM_SHOW_ADLIST,'off');
                                                                                })
                                                                        }}>
                                                            <AntDesign name={'closecircle'} size={18} color={'rgba(0, 0, 0, 0.3)'} style={{}} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{width: screenWidth-20, height:35,backgroundColor:Theme.touMingColor,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:10,borderBottomLeftRadius:6,borderBottomRightRadius:6}}>
                                                        <CustomText style={{  color:'#fff',fontSize:12}} text={obj.ContentName} numberOfLines={2} />
                                                        <CustomText style={{  color:'#fff',fontSize:12}} text={'查看详情 >'} numberOfLines={2} />
                                                    </View>
                                                </View>
                                            </ImageBackground>
                                        </View>
                                    </TouchableHighlight>
                                )
                            })
                        }
                    </Swiper>
                </View>
        )
    }
    
    render() {
        if (!this.props.adList || this.props.adList.length == 0 || !this.state.isShowAds) {
            return null;
        }
        return (
            <View style={{}}>
                {
                    this.props.adList && this.props.adList.length > 0 ?
                    this.props.detail_ad? this._renderDetail_ad() :this._renderList()
                    :null
                }
            </View>
        )
    }
}
// export default withNavigation(AdContentInfoView);
export default function(props) {
    const navigation = useNavigation();
    return (
        <AdContentInfoView {...props} navigation={navigation} />
    )
}
const styles = StyleSheet.create({
    ad: {
        backgroundColor: "white"
    },
})