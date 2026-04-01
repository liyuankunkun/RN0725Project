import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableHighlight,

} from 'react-native';
import CustomText from './CustomText';
import Theme from '../res/styles/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
/**
 * 多选框
 */
export default class CheckBox extends React.Component {
    static propTypes = {
        leftText: PropTypes.string,
        leftTextView: PropTypes.element,
        rightText: PropTypes.string,
        leftTextStyle: Text.propTypes.style,
        rightTextView: PropTypes.element,
        rightTextStyle: Text.propTypes.style,
        checkedImage: PropTypes.element,
        unCheckedImage: PropTypes.element,
        onClick: PropTypes.func.isRequired,
        isChecked: PropTypes.bool.isRequired,
        imgStyle: Image.propTypes.style
    }

    static defaultProps = {
        isChecked: false,
        leftTextStyle: {},
        rightTextStyle: {},
        tintColor: 'gray'
    }
    

    _renderLeft() {
        if (this.props.leftTextView) return this.props.leftTextView;
        if (!this.props.leftText) return null;
        return (
            <CustomText style={[styles.leftText, this.props.leftTextStyle]} text = {this.props.leftText}/>
        );
    }
    _renderRight() {
        if (this.props.rightTextView) return this.props.rightTextView;
        if (!this.props.rightText) return null;
        return (
            <CustomText style={[styles.rightText, this.props.rightTextStyle]} text = {this.props.rightText}/>
        );
    }

    _renderImage() {
        if (this.props.isChecked) {
            return this.props.checkedImage ? this.props.checkedImage : this.genCheckedImage();
        } else {
            return this.props.unCheckedImage ? this.props.unCheckedImage : this.genCheckedImage();
        }
    }

    genCheckedImage() {
        return (
            <MaterialIcons
                name={this.props.isChecked ? 'check-box' : 'check-box-outline-blank'}
                size={18}
                color={this.props.isChecked ?Theme.theme:this.props.tintColor}
              />
        );
    }

    render() {
        return (
            <TouchableHighlight
                style={this.props.style}
                onPress={this.props.onClick}
                underlayColor='transparent'
            >
                <View style={styles.container}>
                    {this._renderLeft()}
                    {this._renderImage()}
                    {this._renderRight()}
                </View>
            </TouchableHighlight>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    leftText: {
        flex: 1,
    },
    rightText: {
        flex: 1,
        marginLeft: 10
    }
});