import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import CustomTextInput from './CustomTextInput';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../res/styles/Theme';
export default class SearchInput extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        maxLength: PropTypes.number,
        onChangeText: PropTypes.func,
        onSubmitEditing: PropTypes.func,
        onEndEditing: PropTypes.func,
        onChange: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.state = {
            textInputValue: ''
        }
    }
    _onChangeText = (text) => {
        this.setState({
            textInputValue: text
        })
    }
    _sumitEditing = () => {
        const { onSubmitEditing } = this.props;
        onSubmitEditing && onSubmitEditing(this.state.textInputValue);
    }
    render() {
        const { placeholder, maxLength, onChangeText, onEndEditing, onChange, value, fromSearch } = this.props;
        return (
            <View style={{ height: 44, marginHorizontal:fromSearch ? 15 : 10, marginTop:10}}>
                <View style={[styles.viewStyle,{backgroundColor:fromSearch? Theme.normalBg: 'white' }]}>
                    <Feather name={'search'} size={18} color={Theme.promptFontColor} style={{ marginHorizontal: 10 }} />
                    <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
                        <CustomTextInput
                            maxLength={maxLength}
                            placeholder={placeholder}
                            placeholderTextColor={"red"}
                            underlineColorAndroid='transparent'
                            onChangeText={onChangeText || this._onChangeText}
                            onSubmitEditing={this._sumitEditing}
                            style={{ flex: 1, padding: 0, fontSize:14 }}
                            clearButtonMode='always'
                            returnKeyType='search'
                            onEndEditing={onEndEditing}
                            onChange={onChange}
                            value={value || this.state.textInputValue}
                        />
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    btnStyle: {
        height:25,
        borderWidth:1,
        borderColor:Theme.theme,
        alignItems:'center',
        justifyContent:'center',
        marginRight:10, 
        borderRadius:4
    },
    viewStyle:{ 
        flex: 1, 
        flexDirection: 'row',
        borderRadius: 3, 
        justifyContent: 'center', 
        alignItems: 'center',
    }
})