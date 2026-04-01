import React from 'react';
import {
    Modal,
    View,
    Animated,
    StyleSheet,
    Platform
} from 'react-native';

import CustomText from '../custom/CustomText';
import I18nUtil from '../util/I18nUtil';

const DEFAULT_DURATION = 2000;
const FADE_DURATION = 250;

export default class ToastView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            message: '',
            opacity: new Animated.Value(0)
        };
        this._timer = null;
        this._anim = null;
    }

    componentWillUnmount() {
        this._clearTimer();
    }

    _clearTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    /**
     * 显示 Toast
     * @param {string} message 消息内容
     * @param {number} duration 显示时长 (ms)
     * @param {string} position 显示位置 'top' | 'center' | 'bottom'
     */
    show(message, duration = DEFAULT_DURATION, position) {
        if (!message) return;

        // 如果有正在进行的动画或计时器，先清除
        this._clearTimer();
        if (this._anim) {
            this._anim.stop();
        }

        // 确定显示位置（优先使用方法参数，其次使用 props，最后默认 center）
        const pos = position || this.props.position || 'center';
        
        // 更新状态并开始动画
        this.setState({
            visible: true,
            message: I18nUtil.t(message), // 添加国际化支持
            position: pos
        }, () => {
            // 淡入动画
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: FADE_DURATION,
                useNativeDriver: true // 启用原生驱动
            }).start(() => {
                // 延迟后执行淡出
                this._timer = setTimeout(() => {
                    this.dismiss();
                }, duration);
            });
        });
    }

    /**
     * 隐藏 Toast
     */
    dismiss() {
        this._anim = Animated.timing(this.state.opacity, {
            toValue: 0,
            duration: FADE_DURATION,
            useNativeDriver: true
        });
        
        this._anim.start(() => {
            this.setState({
                visible: false,
                message: ''
            });
        });
    }

    _getPositionStyle() {
        const { position } = this.state;
        switch (position) {
            case 'top':
                return { justifyContent: 'flex-start', paddingTop: Platform.OS === 'ios' ? 60 : 40 };
            case 'bottom':
                return { justifyContent: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 60 : 40 };
            case 'center':
            default:
                return { justifyContent: 'center' };
        }
    }

    render() {
        const { visible, message, opacity } = this.state;
        
        // 如果不可见且透明度为0，则不渲染 (虽然 Modal visible 控制了显示，但为了保险)
        if (!visible && opacity._value === 0) return null;

        const positionStyle = this._getPositionStyle();

        return (
            <Modal 
                transparent 
                visible={visible} 
                animationType="none" // 使用自定义动画
                onRequestClose={() => this.dismiss()} // Android 返回键处理
            >
                {/* 
                    pointerEvents="none" 确保 Toast 不会阻挡用户点击背景
                    注意：如果 Modal 覆盖全屏，可能会阻挡。
                    但在 RN Modal 中，如果 transparent=true，通常背景是透明的。
                    为了确保点击穿透，可以在最外层 View 使用 pointerEvents="box-none"
                */}
                <View style={[styles.container, positionStyle]} pointerEvents="box-none">
                    <Animated.View style={[styles.content, { opacity }]}>
                        <CustomText 
                            text={message} 
                            style={styles.text} 
                            numberOfLines={3} // 限制行数，防止过长
                        />
                    </Animated.View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // backgroundColor: 'transparent' // 默认就是透明
    },
    content: {
        marginHorizontal: 30,
        backgroundColor: "rgba(0,0,0,0.8)", // 半透明黑色背景
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        // 增加阴影
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxWidth: '80%' // 限制最大宽度
    },
    text: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 20
    }
});
