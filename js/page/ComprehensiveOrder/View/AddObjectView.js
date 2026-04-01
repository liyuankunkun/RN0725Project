
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../../../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Theme from '../../../res/styles/Theme';
class AddpersonView extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        num: PropTypes.string,
    }
    render() {
        return (
            <View style={styles.viewStyle}>
                <View style={styles.borderStyle}>
                  <FontAwesome name={'line-chart'} size={12} color='#fff' />
                </View>
                <CustomText text={this.props.name} style={{fontSize:14,flex:1,marginLeft:10}}/>
                <CustomText text={this.props.num} style={{fontSize:14,color:Theme.darkColor}}/>
               
            </View>    
        )
    }
}

export default function(props) {
    const navigation = useNavigation();
    return (
        <AddpersonView {...props} navigation={navigation} />
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
        backgroundColor: 'white', 
        flexDirection: 'row', 
        padding: 15,
        borderRadius:8 ,
        alignItems:'center',
        borderBottomWidth:0.5,
        borderColor:Theme.lineColor,
        justifyContent:'space-between'
    },
    btnstyle:{
        borderWidth:0.7,
        borderColor:'gray',
        alignItems:'center',
        marginRight:20,
        height:26,
        borderRadius:13,
    },
    borderStyle:{
        width:20,
        height:20,
        backgroundColor:Theme.themeg3,
        borderRadius:6,
        alignItems:"center",
        justifyContent:'center'
    }
})