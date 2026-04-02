import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Image
} from 'react-native';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import PropTypes from 'prop-types';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import I18nUtil from '../../util/I18nUtil';
import Util from '../../util/Util';

class CusInsurancesView extends React.Component {

    static propTypes = {
        cusiItem: PropTypes.array.isRequired,
    }
    constructor(props) {
        super(props);
    }
    /**
     *  选择不选保险
     */
    _InsuranceSelectBtnclick = (item) => {
        item.show = !item.show;
        this.props.otwThis.setState({});
    }
    /**
     *  展示保险内容
     */
    _showInsuranceContentClick = (item) => {
        if (!item || !item.detail || item.detail.length === 0) return;
        function extractText(htmlString) {
            // 去除HTML标签
            const text = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
            return text;
          }
        const { otwThis } = this.props;
        let InsuDesc = extractText(Util.Parse.isChinese() ? item.detail[0].InsuranceDesc  : item.detail[0].InsuranceEnDesc ? item.detail[0].InsuranceEnDesc : item.detail[0].InsuranceDesc)
        otwThis.showAlertView(Util.Parse.isChinese() ? item.detail[0].InsuranceDesc  : item.detail[0].InsuranceEnDesc ? item.detail[0].InsuranceEnDesc : item.detail[0].InsuranceDesc);
    }

    render() {
        const { cusiItem} = this.props;
        if(!cusiItem || cusiItem.length === 0){
            return null;
        }
        return (
            <View style={styles.view}>
                <View style={styles.titleView}> 
                    <Image source={require('../../res/Uimage/shu.png')} style={{width:14,height:14}}/>
                    <CustomText style={{ fontSize:14,fontWeight:'bold' }} text={'航空保险'} />
                </View>   
                {
                    cusiItem&&cusiItem.length > 0 ?
                        cusiItem.map((item, index) => {
                            return (
                                <TouchableHighlight key={index} underlayColor='transparent' disabled={item.AtLeast} onPress={this._InsuranceSelectBtnclick.bind(this, item)}>
                                <View>
                                    <View style={styles.pageView}>
                                        <View>
                                            {
                                                item.detail.length > 0 ?
                                                    <CustomText style={{  color: 'gray',fontSize:12 }} text={Util.Parse.isChinese() ? item.detail[0].ProductName : item.detail[0].ProductEnName?item.detail[0].ProductEnName:item.detail[0].ProductName} />
                                                : null
                                            }
                                            <View style={{flexDirection:'row',marginTop:4}}>
                                                <TouchableHighlight underlayColor='transparent' onPress={this._showInsuranceContentClick.bind(this, item)}>
                                                    <View style={{height:16,width:16,borderRadius:8,alignItems:'center',justifyContent:'center',backgroundColor:Theme.theme}}>
                                                    <Image source={require('../../res/Uimage/myself/complist.jpg')} style={{width:12,height:12,tintColor:'#fff'}}/>
                                                    </View>
                                                </TouchableHighlight>
                                                <CustomText style={{  color: Theme.theme,fontSize:12,marginLeft:5 }} text={'¥' + item.detail[0].SalePrice + '*'+item.Count+'/' + I18nUtil.translate('份')} />
                                            </View>
                                        </View>
                                        <View style={{  }}>
                                            <MaterialIcons
                                                name={item.show ? 'check-box' : 'check-box-outline-blank'}
                                                size={18}
                                                color={item.show?Theme.theme:Theme.promptFontColor}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.bottomView}></View>
                                </View>
                                </TouchableHighlight>
                            )
                        })
                    : null
                    }
            </View>
        )
    }
}
// export default withNavigation(CusInsurancesView);
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <CusInsurancesView {...props} navigation={navigation} />;
}
const styles = StyleSheet.create({
    view: {backgroundColor:'#fff',marginHorizontal:10,marginTop:10,paddingBottom:10,borderRadius:6},
    titleView:{flexDirection:'row',marginHorizontal:20,alignItems:'center',borderBottomWidth:1,borderColor:Theme.lineColor,paddingVertical:10},
    pageView:{ paddingHorizontal:20, justifyContent: 'space-between',flexDirection:'row',alignItems:'center',paddingVertical:5},
    bottomView:{ marginHorizontal: 20, backgroundColor: Theme.lineColor, height: 1, marginTop: 5 }
})