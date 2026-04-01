/**
 * 弹窗Modal
 */
import React from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Animated,
    Easing,
    TouchableHighlight,
    ScrollView,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import CustomText from './CustomText';
import Theme from '../res/styles/Theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HTMLView from 'react-native-htmlview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default class AlertView extends React.Component {

    constructor(props) {
        super(props);
        this.defaultAlert = {
            title: "温馨提示",
            content: "",
            btnView: () => (
                <TouchableHighlight style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} underlayColor='#eee' onPress={this.dismiss.bind(this)} >
                    <CustomText style={{ color: Theme.theme, fontSize: 16, fontWeight: 'bold' }} text='确定' />
                </TouchableHighlight>
            )
        };
        this.state = {
            showing: false,
            alertObj: { ...this.defaultAlert },
            modelOpacity: new Animated.Value(0),
            boxshow: false
        };
    }

    dismiss() {
        Animated.timing(this.state.modelOpacity, {
            toValue: 0,
            duration: 200, // 缩短动画时间提升体验
            easing: Easing.linear,
            useNativeDriver: true // 启用原生驱动
        }).start(() => {
            this.setState({
                showing: false,
                alertObj: { ...this.defaultAlert },
                boxshow: false // 重置 checkbox 状态
            });
        });
    }

    showAlertView(alertObj) {
        this.setState({
            alertObj: { ...this.defaultAlert, ...alertObj }, // 合并默认值
            showing: true,
            boxshow: false // 每次显示时重置 checkbox
        }, () => {
            Animated.timing(this.state.modelOpacity, {
                toValue: 1,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: true
            }).start();
        });
    }

    isHtmlString(data) {
        if (typeof data !== 'string') return false;
        // 简单正则匹配是否包含<>标签
        const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
        return htmlTagPattern.test(data);
    }

    renderContent() {
        const { content, contentStyle } = this.state.alertObj;
        
        if (!content) return null;

        const isLongContent = content.length > 300;
        const Container = isLongContent ? ScrollView : View;
        const containerProps = isLongContent ? { 
            style: { maxHeight: screenHeight * 0.5 },
            showsVerticalScrollIndicator: false 
        } : {
            style: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 }
        };

        const contentElement = this.isHtmlString(content) ? (
            <HTMLView value={content} stylesheet={htmlStyles} />
        ) : (
            <CustomText style={[styles.contentText, contentStyle]} text={content} />
        );

        return (
            <View style={{ marginTop: 10, paddingHorizontal: 15, width: '100%' }}>
                <Container {...containerProps}>
                    {contentElement}
                </Container>
            </View>
        );
    }

    render() {
        const { title, btnView, contentView, callBack, redBack } = this.state.alertObj;
        const { showing, modelOpacity, boxshow } = this.state;

        if (!showing) return null;

        return (
            <Modal 
                onRequestClose={() => this.dismiss()} 
                visible={showing} 
                transparent 
                animationType="none"
            >
                <View style={styles.container}>
                    <Animated.View style={[styles.whiteBackView, { opacity: modelOpacity }]}>
                        {/* 标题 */}
                        <CustomText style={styles.titleText} text={title || this.defaultAlert.title} />

                        {/* 内容 */}
                        {contentView && (contentView instanceof Function) ? contentView() : this.renderContent()}

                        {/* 红色提示 */}
                        {redBack ? (
                             <View style={{ width: '100%', paddingHorizontal: 15, marginTop: 10 }}>
                                <CustomText style={{ color: 'red', fontSize: 14 }} text={redBack} />
                             </View>
                        ) : null}

                        {/* 勾选框 */}
                        {callBack ? (
                            <View style={styles.checkBoxContainer}>
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({ boxshow: !boxshow }, () => {
                                            if (callBack) callBack(!boxshow); // 将最新状态回传
                                        });
                                    }}
                                >
                                    <MaterialIcons 
                                        name={boxshow ? 'check-box' : 'check-box-outline-blank'} 
                                        size={20} 
                                        color={boxshow ? Theme.theme : 'gray'} 
                                    />
                                    <CustomText style={{ color: '#333', fontSize: 14, marginLeft: 5 }} text={'下次不再提醒'} />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <View style={styles.lineView}></View>

                        {/* 按钮 */}
                        <View style={styles.btnBackView}>
                            {btnView ? btnView() : this.defaultAlert.btnView()}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    whiteBackView: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        width: screenWidth * 0.8,
        alignItems: 'center',
        paddingTop: 15,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    titleText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 5
    },
    contentText: {
        fontSize: 14,
        color: '#333333',
        lineHeight: 20,
        textAlign: 'center' // 默认居中
    },
    lineView: {
        marginTop: 15,
        height: StyleSheet.hairlineWidth, // 使用细线
        backgroundColor: '#e6e6e6',
        width: '100%'
    },
    btnBackView: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'stretch', // 拉伸填满高度
        justifyContent: 'center',
        width: '100%'
    },
    checkBoxContainer: {
        flexDirection: 'row', 
        marginTop: 10, 
        width: '100%', 
        paddingHorizontal: 15,
        justifyContent: 'flex-start'
    }
});

const htmlStyles = StyleSheet.create({
    p: {
        fontSize: 14,
        color: '#333',
        marginBottom: 0
    }
});
