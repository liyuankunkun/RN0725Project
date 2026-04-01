import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import CustomTextInput from './CustomTextInput';
import CustomText from './CustomText';
import Feather from 'react-native-vector-icons/Feather';
import Theme from '../res/styles/Theme';
export default class SearchPeopleInput extends React.Component {
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
        const { placeholder, maxLength, onChangeText, onEndEditing, onChange, value,onChangeBtn } = this.props;
        return (
            <View style={{ height: 44, margin: 10, marginBottom:5 }}>
                <View style={styles.viewStyle}>
                    <Feather name={'search'} size={18} color={Theme.assistFontColor} style={{ marginHorizontal: 10 }} 
                            //  onPress={onChangeBtn}
                    />
                    <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
                        <CustomTextInput
                            maxLength={maxLength}
                            placeholder={placeholder}
                            underlineColorAndroid='transparent'
                            onChangeText={onChangeText || this._onChangeText}
                            onSubmitEditing={this._sumitEditing}
                            style={{ flex: 1, padding: 0, fontSize:14 }}
                            clearButtonMode='always'
                            returnKeyType='search'
                            onEndEditing={onChangeBtn}
                            onChange={onChange}
                            value={value || this.state.textInputValue}                            
                        />
                        {/* <TouchableOpacity style={styles.btnStyle}
                            onPress={onChangeBtn}
                        >
                            <CustomText text={'搜索'} style={{paddingHorizontal:10}}/>
                        </TouchableOpacity> */}
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
        backgroundColor: 'white', 
        borderRadius: 3, 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
})