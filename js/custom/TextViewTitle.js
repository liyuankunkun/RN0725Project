
import React from 'react';
import {
    View,
    StyleSheet,
    Image
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../custom/CustomText';
// import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';

class TextViewTitle extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        imgIcon:PropTypes.any,
        style:PropTypes.any,
        from:PropTypes.any,
    }
    render() {
        let _long = this.props.from =='_hotel'? 17:15
        return (
            <View style={[styles.borderStyle,this.props.style]}>
                <Image style={{height:_long, width:_long}} source={this.props.imgIcon}></Image>
                <CustomText text={this.props.title} style={{fontSize:14,fontWeight:'bold',marginLeft:1}}/>
            </View>
        )
    }
}
// export default withNavigation(TextViewTitle);
// 使用 Hook 包装类组件以获取 navigation
export default function(props) {
    const navigation = useNavigation();
    return (
        <TextViewTitle {...props} />
    )
}

const styles = StyleSheet.create({
    borderStyle:{
        paddingVertical:10,
        marginLeft:15,
        flexDirection:'row',
        alignItems:'center',
    }
})