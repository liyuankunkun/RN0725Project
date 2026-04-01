
import React from 'react';
import {
    Text,
    Platform
} from 'react-native';
import  Theme from '../res/styles/Theme';
import I18nUtil from '../util/I18nUtil';
export default class CustomText extends React.Component {

    // 解决办法就是在自定义的复合组件里使用setNativeProps方法把Touchable设置的props传递给自定义复合组件内部的原生子组件。
    setNativeProps(nativeProps) {

        this._root.setNativeProps(nativeProps);
    }
    //判断是苹果手机
    render() {
        const { text, style } = this.props;
        // 确保 style 是一个对象，并提供默认值
        let safeStyle = style || {};
        let fontSize = Platform.OS === 'ios'?14:13; // 默认字体大小
        if(Platform.OS === 'ios'){
            if (safeStyle) {
                if (Array.isArray(safeStyle)) {
                    // 数组情况
                    if (safeStyle.length > 0) {
                        safeStyle.forEach((item,index)=>{
                            let item_f = item&&item.fontSize?item.fontSize:fontSize;
                            safeStyle.fontSize = item_f + 1;
                        })
                    } else {
                        safeStyle.fontSize = safeStyle.fontSize + 1;
                    }
                }else if (typeof safeStyle === 'object' && Object.keys(safeStyle).length > 0) {
                    // 非空对象情况
                    fontSize = safeStyle.fontSize != null ? safeStyle.fontSize + 1 : fontSize;
                    safeStyle = { ...safeStyle, fontSize: fontSize };
                } else {
                    // 空对象或其他情况
                    safeStyle = { fontSize: fontSize };
                }
               
            }else {
                // safeStyle 为 null 或 undefined
                safeStyle = { fontSize: fontSize };
            }
        }
        
        return (
            <Text 
                ref={component => this._root = component} 
                {...this.props} 
                allowFontScaling={false} 
                style={[
                    { color: Theme.fontColor },
                    safeStyle,
                ]}
            >
                {I18nUtil.translate(text)}
            </Text>
        )
    }
}
