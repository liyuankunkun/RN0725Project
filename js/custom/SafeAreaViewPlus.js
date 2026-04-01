import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    Platform,
    StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import DeviceUtil from '../util/DeviceUtil';
import Theme from '../res/styles/Theme';

/**
 * 安全区域组件增强版
 * 1. 支持自定义顶部和底部安全区域颜色
 * 2. 自动适配 iPhone X 系列刘海屏
 * 3. 支持启用/禁用增强模式
 */
export default class SafeAreaViewPlus extends Component {

    static propTypes = {
        style: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array,
            PropTypes.number
        ]),
        topColor: PropTypes.string,
        bottomColor: PropTypes.string,
        enablePlus: PropTypes.bool,
        topInset: PropTypes.bool,
        bottomInset: PropTypes.bool,
        children: PropTypes.node
    }

    static defaultProps = {
        topColor: Theme.TopColor || '#ffffff', // 增加默认值防空
        bottomColor: Theme.normalBg || '#f5f5f5',
        enablePlus: true,
        topInset: true,
        bottomInset: false
    }

    /**
     * 渲染顶部安全区域占位
     */
    renderTopArea() {
        const { topColor, topInset } = this.props;
        if (!topInset || Platform.OS !== 'ios') return null;
        
        const isIPhoneX = DeviceUtil.is_iphonex();
        const topAreaHeight = isIPhoneX ? 44 : 20;

        return (
            <View style={[styles.topArea, { backgroundColor: topColor, height: topAreaHeight }]} />
        );
    }

    /**
     * 渲染底部安全区域占位
     */
    renderBottomArea() {
        const { bottomColor, bottomInset } = this.props;
        // 只有在 iPhone X 系列且启用了 bottomInset 时才显示
        if (!bottomInset || !DeviceUtil.is_iphonex()) return null;

        return (
            <View style={[styles.bottomArea, { backgroundColor: bottomColor }]} />
        );
    }

    /**
     * 渲染增强版 SafeAreaView (自定义 View 模拟)
     */
    renderSafeAreaViewPlus() {
        const { style, children, ...otherProps } = this.props;
        return (
            <View style={[styles.container, style]} {...otherProps}>
                {this.renderTopArea()}
                <View style={styles.content}>
                    {children}
                </View>
                {this.renderBottomArea()}
            </View>
        );
    }

    /**
     * 渲染原生 SafeAreaView
     */
    renderSafeAreaView() {
        const { style, children, ...otherProps } = this.props;
        return (
            <SafeAreaView style={[styles.container, style]} {...otherProps}>
                {children}
            </SafeAreaView>
        );
    }

    render() {
        const { enablePlus } = this.props;
        // Android 平台通常不需要刘海屏处理（除非特定机型），或者直接使用 StatusBar
        // 这里保持原逻辑：enablePlus 为 true 时使用自定义模拟方案
        return enablePlus ? this.renderSafeAreaViewPlus() : this.renderSafeAreaView();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: Theme.normalBg // 移除默认背景，避免覆盖外部传入的 style
    },
    content: {
        flex: 1
    },
    topArea: {
        height: 44, // iPhone X 顶部安全区域高度
    },
    bottomArea: {
        height: 34, // iPhone X 底部安全区域高度
    }
});