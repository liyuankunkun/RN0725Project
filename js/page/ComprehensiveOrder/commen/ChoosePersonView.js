
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    FlatList,
    Image
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../../../custom/CustomText';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Theme from '../../../res/styles/Theme';
class ChoosePersonView extends React.Component {
    // static propTypes = {
    //     name: PropTypes.string,
    //     num: PropTypes.string,
    // }
    render(){
        const {comp_userInfo, comp_travelers,compCreate_bool} = this.props;
        //comp_userInfo 是创建综合订单时储存的出差人信息
        //comp_travelers 是综合订单列表 继续预订 ，已经选好的出差人
        let chooseLists;
        if(compCreate_bool){//判断该综合订单是创建还是继续预订
            if(!comp_userInfo || !comp_userInfo.userInfo || !comp_userInfo.employees || !comp_userInfo.travellers){
                return;
            }
            chooseLists = (comp_userInfo.employees || []).concat(comp_userInfo.travellers || [])
        }else{
            chooseLists = (comp_travelers && comp_travelers.compEmployees ? comp_travelers.compEmployees : []).concat(comp_travelers && comp_travelers.compTraveler ? comp_travelers.compTraveler : [])
        }
        return(
            <View style={styles.personsStylel}>
                <Image source={require('../../../res/Uimage/travellers.png')} style={{width:20,height:20}}/>
                <CustomText text={'出差人:'} style={{marginTop:10,marginLeft:5,fontSize:14,}}/>
            {
                chooseLists&&chooseLists.map((item,index)=>{
                    return(
                        <View style={{}} key={index}>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',margin:6,borderRadius:17,borderColor:Theme.themed2}}>
                                <CustomText text={item.Name} style={{fontSize:14}}/>
                        </View>
                        </View>  
                    )
                })
            }
            </View>
        )
    }
    
}

function ChoosePersonViewWrapper(props) {
    const navigation = useNavigation();
    return <ChoosePersonView {...props} navigation={navigation} />;
}

export default ChoosePersonViewWrapper;


const styles = StyleSheet.create({
    personsStylel:{
        marginVertical:10,
        padding:20,
        borderRadius:6,
        backgroundColor:'#fff',
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'center',
    },
})
