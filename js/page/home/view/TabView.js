
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    FlatList,
    Image
} from 'react-native';
import CustomText from '../../../custom/CustomText';
import { useNavigation } from '@react-navigation/native';
import Theme from '../../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';

class TabView extends React.Component {
    // static propTypes = {
    //     name: PropTypes.string,
    //     value: PropTypes.string,
    // }
    render() {
        const {name, img, callBack,red} = this.props
        return (
               <TouchableOpacity style={styles.btnStyle}
                                 onPress={callBack}
               >
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                    {/* <AntDesign name={'message1'} size={22} color={Theme.fontColor} /> */}
                    <Image source={img} style={{width:20,height:20}}/>
                    <CustomText text={name} style={{marginLeft:10,color:red?Theme.redColor:Theme.fontColor}}></CustomText>
                  </View>
                  <AntDesign name={'right'} size={16} color={Theme.assistFontColor} />
               </TouchableOpacity>
        )
    }
}
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return <TabView {...props} navigation={navigation} />;
}

const styles = StyleSheet.create({
    borderStyle:{
        // borderBottomColor:Theme.lineColor,
        // borderBottomWidth:1,
        paddingVertical:10,
        marginLeft:10,
        flexDirection:'row',
    },
    btnStyle:{
        flexDirection:'row',
        marginHorizontal:10,
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor:'#fff',
        height:46
    }
})