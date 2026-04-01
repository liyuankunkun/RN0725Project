
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
import NavigationUtils from '../../../navigator/NavigationUtils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Theme from '../../../res/styles/Theme';
class TextView extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        value: PropTypes.string,
    }
    render() {
        return (
            <View style={styles.borderStyle}>
                <CustomText text={this.props.name} style={{fontSize:14,color:Theme.commonFontColor,flex: 0.4,marginRight: 8}}/>                
                <CustomText text={this.props.value} style={{fontSize:14,marginLeft:10,flex: 0.6,flexWrap: 'wrap'}}/>
            </View>
        )
    }
}
export default function(props) {
    const navigation = useNavigation();
    return (
        <TextView {...props} navigation={navigation} />
    )
}

const styles = StyleSheet.create({
    borderStyle:{
        // height: 44,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent:'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        paddingVertical:10
    }
})