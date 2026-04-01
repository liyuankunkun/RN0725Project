import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import PropTypes from 'prop-types';
import { Themed } from 'react-navigation';
export default class TitleSwitchView extends React.Component {

    static propTypes = {
        callBack: PropTypes.func.isRequired,
        leftTitle: PropTypes.string.isRequired,
        rightTitle: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            status: Status.left
        }
    }
    _titleTabClick = (statu) => {
        this.setState({
            status: statu
        }, () => {
            this.props.callBack(statu);
        })
    }

    render() {
        const { status } = this.state;
        return (
            <View style={styles.titleView}>
                <TouchableOpacity style={[ status === Status.left ? styles.selectedTitleTab : styles.unSelectedTitleTab]} onPress={() => this._titleTabClick(Status.left)}>
                    <CustomText style={status === Status.left ? styles.selectedTitleText : styles.unSelectedTitleText} text={this.props.leftTitle} />
                </TouchableOpacity>
                <TouchableOpacity style={[ styles.center, status === Status.right ? styles.selectedTitleTab : styles.unSelectedTitleTab]} onPress={() => this._titleTabClick(Status.right)}>
                    <CustomText style={status === Status.right ? styles.selectedTitleText : styles.unSelectedTitleText} text={this.props.rightTitle} />
                </TouchableOpacity>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white'
    },
    selectedTitleText: {
        color: Theme.theme,
        fontSize:16,
    },
    unSelectedTitleText: {
        color: Theme.commonFontColor,
        fontSize:16,
    },
    selectedTitleTab: {
        padding: 5,
        borderBottomWidth: 2,
        borderColor:Theme.theme,
    },
    unSelectedTitleTab: {
        padding: 5,
        borderBottomWidth: 2,
        borderColor:'white',
    },
})

const Status = {
    left: 1,
    right: 2
}