import React from 'react';
import {
    View,
    Image,
    TouchableHighlight
} from 'react-native';
import CustomText from './CustomText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import PropTypes from 'prop-types';
export default class NetworkFaildView extends React.Component {

    static propTypes = {
        refresh: PropTypes.func.isRequired
    }

    render() {
        const { refresh } = this.props;
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
                <AntDesign name={'wifi'} size={60} color={'gray'} />
                <CustomText style={{ marginHorizontal: 40, marginTop: 10, color: 'gray', fontSize: 18, textAlign: 'center' }} text='网络出问题了~请您查看网络设置点击刷新，重新加载' />
                <TouchableHighlight onPress={refresh} underlayColor='transparent'>
                    <View style={{ width: 120, height: 40, marginTop: 10, borderColor: 'gray', borderWidth: 1, alignItems: 'center', justifyContent: 'center', }}>
                        <CustomText style={{ fontSize: 18, color: "gray" }} text='刷新' />
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

}