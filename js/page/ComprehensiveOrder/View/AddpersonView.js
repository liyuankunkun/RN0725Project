
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    TouchableOpacity
} from 'react-native';
import CustomText from '../../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';

import NavigationUtils from '../../../navigator/NavigationUtils';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../../res/styles/Theme';
import Util from '../../../util/Util'
class AddpersonView extends React.Component {

    render() {
        return (
            <TouchableOpacity style={styles.viewStyle}
                              onPress={()=>{ this.props.editCallBack(this.props.employeesItem) }}
            >
                <CustomText text={this.props.employeesItem&&this.props.employeesItem.Name} style={{fontSize:14,color:Theme.commonFontColor,marginLeft:15}}/>
                <AntDesign name={'delete'} size={18} color={Theme.theme} 
                         onPress={()=>{ this.props.callBack({item:this.props.employeesItem}) }}
                />
            </TouchableOpacity>    
        )
    }
}

// export default withNavigation(AddpersonView);
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <AddpersonView {...props}  navigation={navigation}/>
    )
}


const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    titleStyle: {
        flexDirection:'row',
        paddingLeft:15,
        paddingTop:10,
        justifyContent:"space-between",
        backgroundColor:'#fff',
        borderRadius:6
    },
    viewStyle:{ 
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        paddingHorizontal: 4,
        height: 44,
        // borderRadius:8 ,
        alignItems:'center',
        // borderBottomWidth:0.5,
        borderColor:Theme.themeLine,
        justifyContent:'space-between',
        borderTopWidth:1,

    },
    btnstyle:{
        borderWidth:0.7,
        borderColor:'gray',
        alignItems:'center',
        marginRight:20,
        height:26,
        borderRadius:13,
    },
})