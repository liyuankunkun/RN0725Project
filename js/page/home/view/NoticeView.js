import React from 'react';
import {
    View,
    Image,
    TouchableHighlight,
    StyleSheet,
    Dimensions
} from 'react-native';
import CommonService from '../../../service/CommonService';
import Theme from '../../../res/styles/Theme';
import CustomText from '../../../custom/CustomText';
import { useNavigation } from '@react-navigation/native';
import NavigationUtils from '../../../navigator/NavigationUtils';
import { MarqueeHorizontal,MarqueeVertical } from 'react-native-marquee-ab';

const screenWidth = Dimensions.get('window').width;

class NoticeView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null
        }
    }
    componentDidMount() {
        let model = {
            Pagination: {
                PageIndex: this.state.page,
                PageSize: 15
            }
            // Pagination: {
            //     PageIndex: 1,
            //     PageSize: 15,
            // },
            // Query:{
            //     Category:0,
            //     HomeNotice: true
            // }
        }
        CommonService.noticeList(model).then(response => {
            if (response) {
                if (response.ListData) {
                    this.setState({
                        data: response.ListData
                    })
                }
            } else {

            }
        }).catch(error => {

        })
    }
    _toMore = () => {
        NavigationUtils.push(this.props.navigation, 'NoticeList');
    }
    // _toDetail = ()=>{
    //     NavigationUtils.push(this.props.navigation, 'NoticeDetail',this.state.data);
    // }
    render() {
        const { data } = this.state;
        if (!data) return null;
        const commenArr = 
            data.map((item,index) => ({  
                label :index,
                value :item.CategoryDesc+': '+item.Title,
                content: item.Content,
                title: item.Title,
                LinkUrl:item.LinkUrl
            }))
        return (
            // <View style={{ marginTop: 10, height: 40, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 20, borderBottomColor: Theme.lineColor, borderBottomWidth: 1, }}>
            //     <Image source={require('../../../res/image/personal_notice_icon.png')} style={{ width: 30, height: 30 }} />
            //     {/* <View style={{ width: 1, backgroundColor: Theme.darkColor, marginHorizontal: 10, height: 30 }}></View> */}
            //     <TouchableHighlight underlayColor='transparent' onPress={this._toDetail} style={{flex:1,justifyContent:'center'}}>
            //         <CustomText text = {data.Title} numberOfLines={1} style={{marginLeft:10,fontSize:14}}/>
            //     </TouchableHighlight>
            //     <CustomText text='更多' style={{ color: Theme.annotatedFontColor }} onPress={this._toMore} />
            // </View>
            <View style={styles.viewStyle}>
                <Image source={require('../../../res/image/WechatIMG1026.png')} style={{ width: 18, height: 18 ,marginLeft:20}} />
                 <MarqueeVertical
                    textList = {commenArr}
                    width = {screenWidth-40-38}
                    height = {44}
                    direction = {'up'}
                    numberOfLines = {1}
                    bgContainerStyle = {{backgroundColor : '#fff'}}
                    textStyle = {{fontSize : 12,color : Theme.commonFontColor,marginLeft:6}}
                    onTextClick = {(item) => {
                        NavigationUtils.push(this.props.navigation, 'NoticeDetail',
                            { item: item }
                        )
                    }}
                />
                <CustomText text='更多' style={{ color: Theme.themed1, fontSize : 12 }} onPress={this._toMore} />
            </View>
        )
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <NoticeView {...props} navigation={navigation} />;
}
const styles = StyleSheet.create({
     viewStyle:{
         flexDirection:'row',
         alignItems:'center',
        
         borderColor:Theme.lineColor,
         backgroundColor:'#fff',
         height:44,
        //  elevation:1.5, shadowColor:'#999999', shadowOffset:{width:5,height:5}, shadowOpacity: 0.15, shadowRadius: 1.5
    }
})