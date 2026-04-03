import React from 'react';
import {
    View,
    TouchableOpacity
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from './CustomText';
import CustomTextInput from './CustomTextInput';

/**
 * 简单输入框
 */
export default class SimpleInpput extends React.Component {
    render() {
        const { name, placeholder, maxLength, action, keyboardType, style, secureTextEntry, eyeOffAction } = this.props;
        return (
            <View style={[{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopColor: '#ebebeb',  borderBottomColor: '#ebebeb', borderBottomWidth: 0.5 }, style]}>
                <View style={[ { flex: 3 ,}]}>
                    <CustomText allowFontScaling = {false}   style={{ fontSize: 14 }} text = {name}/>
                </View>
                <CustomTextInput keyboardType={keyboardType ? keyboardType : 'default'} maxLength={maxLength > 0 ? maxLength : 20} placeholder={placeholder} 
                                 style={{ marginLeft: 10, fontSize: 14, flex: 7, padding: 0 }} 
                                 onChangeText={action} 
                                 underlineColorAndroid={'transparent'} secureTextEntry={secureTextEntry ? true : false} />
                <TouchableOpacity style={{padding:2,height:30}} onPress={eyeOffAction}>
                                <Feather name={secureTextEntry?'eye-off':'eye'} size={18} color={'#999999'}  style={{ marginLeft: 5 }} />
                </TouchableOpacity>
            </View>
        );
    }
}