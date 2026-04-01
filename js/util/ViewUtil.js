import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    TouchableHighlight,
    Image
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../custom/CustomText';
import Theme from '../res/styles/Theme';
import I18nUtil from './I18nUtil';
import Util from './Util';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Placeholder, PlaceholderMedia, PlaceholderLine, Fade } from 'rn-placeholder';

export default class ViewUtil {

    /**
     *  通用左侧返回按钮
     * @param callBack 点击回调
     * @param color 图标颜色，默认 Theme.fontColor
     */
    static getLeftBackButton(callBack, color) {
        return (
            <TouchableOpacity onPress={callBack} style={{ padding: 8, paddingLeft: 12 }}>
                <AntDesign name={'arrowleft'}
                    size={20}
                    style={[{ color: color || Theme.fontColor }]}
                />
            </TouchableOpacity>
        )
    }

    /**
     * 白色左侧返回按钮 (兼容旧代码)
     */
    static getLeftBackButton2(callBack) {
        return this.getLeftBackButton(callBack, '#fff');
    }

    /**
     * 通用提示信息
     * @param text 提示文本
     * @param bgColor 背景色
     * @param textColor 文本颜色
     * @param fontSize 字体大小
     */
    static getTips(text, bgColor, textColor, fontSize = 14) {
        return (
            <View style={{ paddingHorizontal: 10, paddingVertical: 10, backgroundColor: bgColor, flexDirection: 'row', borderRadius: 4 }}>
                <CustomText style={{ color: textColor, lineHeight: 20, fontSize: fontSize }} text={text} />
            </View>
        )
    }

    static getNameTips() {
        const text = Util.Parse.isChinese() 
            ? '请输入中文姓名，非持有中国大陆居民身份证件请按照旅行证件上的输入，英文姓名录入格式为LastName/FirstName' 
            : 'If you are not a Chinese Mainland Resident, please input your name format as LastName/FirstName as in the travel documentation, use "/" as the separator.';
        return this.getTips(text, Theme.yellowBg, Theme.theme);
    }

    static getNameTips2() {
        const text = '注：乘客已关联员工身份，若为其他人预订请返回上页添加员工或常旅客';
        return this.getTips(text, Theme.orangeBg, Theme.orangeColor, 13);
    }

    /**
     *  获取右边的按钮
     * @param  title 
     * @param {*} callBack 
     */
    static getRightButton(title, callBack) {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={callBack}>
                <CustomText text={title} style={{ fontSize: 13, color: Theme.fontColor, paddingRight: 20 }} />
            </TouchableHighlight>
        )
    }

    /**
     *  获取右边图片按钮的通用方法
     */
    static _getRightImgBtn(source, style, callBack) {
        return (
            <TouchableOpacity style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={callBack}>
                <Image source={source} style={style} />
            </TouchableOpacity>
        )
    }

    /**
     *  获取右边图标的按钮 (拆标图标)
     */
    static getRightImageButton(callBack) {
        return this._getRightImgBtn(require('../res/Uimage/_chaibiao.png'), { width: 20, height: 20 }, callBack);
    }

    /**
     * 首页右侧图标按钮
     */
    static _getRightHomeButton(callBack) {
        return this._getRightImgBtn(require('../res/image/icon-48-1-cur.png'), { width: 17, height: 17, tintColor: Theme.theme }, callBack);
    }

    /**
     *  获取右边图标的按钮 (默认样式)
     */
    static _getRightButton(callBack) {
        return this._getRightImgBtn(require('../res/image/icon-48-1-cur.png'), {}, callBack);
    }

    /**
     * 通用主题按钮
     */
    static getThemeButton(title, callBack) {
        return (
            <View style={styles.whiteSty}>
                <TouchableHighlight
                    underlayColor='transparent'
                    onPress={callBack}
                    style={{ marginHorizontal: 16, borderRadius: 4, overflow: 'hidden', }}
                >
                    <View style={{
                        backgroundColor: Theme.theme,
                        height: 44,
                        justifyContent: "center",
                        alignItems: 'center',
                    }}>
                        <CustomText
                            text={title}
                            style={{ color: '#fff', fontSize: 16, fontWeight: '600', }}
                        />
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    static getThemeButton2(title, callBack) {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={callBack}>
                <View style={{ height: 50, borderTopWidth: 1, borderTopColor: Theme.normalBg }}>
                    <View style={{ height: 44, backgroundColor: Theme.theme, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginHorizontal: 10, borderRadius: 2, marginTop: 10 }}>
                        <CustomText text={title} style={{ color: '#fff', marginLeft: 5, fontSize: 16 }} />
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    /**底部两个按键 */
    static getTwoBottomBtn(title1, callBack, title2, callBack2) {
        return (
            <View style={styles.bottomp}>
                <TouchableOpacity onPress={callBack}
                    style={styles.btnsty2}>
                    <CustomText text={title1} style={{ fontSize: 16, color: Theme.theme }}></CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={callBack2}
                    style={styles.btnsty}>
                    <CustomText text={title2} style={{ fontSize: 16, color: '#fff' }}></CustomText>
                </TouchableOpacity>
            </View>
        )
    }

    /**底部按钮 */
    static getSubmitButton(title, callBack) {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={callBack}>
                <View style={{ height: 80, backgroundColor: '#fff', justifyContent: "center", borderTopWidth: 1, borderTopColor: Theme.normalBg }}>
                    <View style={{ height: 44, backgroundColor: Theme.theme, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginHorizontal: 20, borderRadius: 2, marginBottom: 10 }}>
                        <CustomText text={title} style={{ color: '#fff', marginLeft: 5, fontSize: 16 }} />
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    static getSubmitButton2(title, callBack) {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={callBack}>
                <View style={{ height: 80, backgroundColor: '#fff', justifyContent: "center" }}>
                    <View style={{ height: 44, backgroundColor: Theme.theme, justifyContent: "center", alignItems: 'center', flexDirection: 'row', marginHorizontal: 10, borderRadius: 2, marginBottom: 10 }}>
                        <CustomText text={title} style={{ color: '#fff', marginLeft: 5, fontSize: 16 }} />
                    </View>
                </View>
            </TouchableHighlight>
        )
    }

    /**底部双按钮含渐变色 */
    static getSubmitButtons(title1, callBack, title2, callBack2) {
        return (
            <View style={styles._buttonStyle}>
                <LinearGradient
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={['#000', '#000']}
                    style={styles.gradientBtn}
                >
                    <TouchableOpacity style={styles.btStyle3}
                        onPress={callBack}>
                        <CustomText text={title1} style={{ color: Theme.theme, fontSize: 16, fontWeight: 'bold' }} />
                    </TouchableOpacity>
                </LinearGradient>
                <LinearGradient
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={['#000', '#000']}
                    style={styles.gradientBtn}
                >
                    <TouchableOpacity style={styles.btStyle3}
                        onPress={callBack2}
                    >
                        <CustomText text={title2} style={{ color: Theme.theme, fontSize: 16, fontWeight: 'bold' }} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        )
    }

    /**
     * 
     * @param 左边按钮 leftTitle 
     * @param 左边按钮的点击事件 leftCallBack 
     * @param 右边按钮 rightTitle 
     * @param 右边按钮的点击事件 rightCallBack 
     */
    static getAlertButton(leftTitle, leftCallBack, rightTitle, rightCallBack) {
        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                {leftTitle && leftCallBack ? <TouchableHighlight style={{ marginBottom: 5, flex: 1, backgroundColor: '#ffffff', alignItems: 'center' }} underlayColor='transparent' onPress={leftCallBack} >
                    <View style={{ height: 25, justifyContent: "center", alignItems: "center" }}>
                        <CustomText style={{ color: leftTitle && rightTitle ? 'black' : Theme.theme, fontSize: 16, fontWeight: 'bold' }} text={leftTitle} />
                    </View>
                </TouchableHighlight> : null}
                {
                    leftCallBack && rightCallBack ?
                        <View style={{ height: 25, backgroundColor: Theme.lineColor, width: 1 }}></View>
                        : null
                }
                {rightTitle && rightCallBack ? <TouchableHighlight style={{ marginBottom: 5, flex: 1, backgroundColor: '#ffffff', alignItems: 'center' }} underlayColor='transparent' onPress={rightCallBack} >
                    <View style={{ height: 25, justifyContent: "center", alignItems: "center" }}>
                        <CustomText style={{ color: Theme.theme, fontSize: 15, fontWeight: 'bold' }} text={rightTitle} />
                    </View>
                </TouchableHighlight> : null}
            </View>
        )
    }

    /**
     * 
     * @param 是否加载 isLoading 
     * @param  事件 onRefresh 
     */
    static getRefreshControl(isLoading, onRefresh) {
        return (
            <RefreshControl
                title='Loading...'
                colors={[Theme.theme]}
                refreshing={isLoading}
                onRefresh={onRefresh}
                tintColor={Theme.theme}
            />
        )
    }

    /**
     * 
     * @param  加载更多 isLoadingMore 
     * @param  没有更多 isNoMoreData 
     * @param  需要加载 isLoading 
     */
    static getRenderFooter(isLoadingMore, isNoMoreData, isLoading) {

        if (isLoadingMore) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator style={{ color: Theme.theme, margin: 5 }} />
                    <CustomText text={I18nUtil.translate('正在加载更多') + '...'} style={{ color: Theme.theme }} />
                </View>
            )
        }
        if (isNoMoreData) {
            return (
                <View style={{ alignItems: 'center', padding: 15 }}>
                    <CustomText style={{ color: Theme.greenBg }} text={I18nUtil.translate('没有更多数据了') + '...'} />
                </View>
            )
        }
        if (isLoading) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <CustomText text='下拉刷新...' />
                </View>
            )
        }
        return null;
    }

    /**
     *等待加载
     *PlaceholderView 酒店详情等待
     */
    static PlaceholderView() {
        return (
            <Placeholder Animation={Fade}>
                <PlaceholderLine width={100} style={{ borderRadius: 0, height: 140 }} />
                <PlaceholderLine width={80} style={{ height: 25, marginBottom: 30 }} />
                <Placeholder
                    Animation={Fade}
                    Left={PlaceholderMedia}
                >
                    <PlaceholderLine width={80} />
                    <PlaceholderLine />
                    <PlaceholderLine width={30} />
                </Placeholder>
                <Placeholder
                    Animation={Fade}
                    Left={PlaceholderMedia}
                >
                    <PlaceholderLine width={80} />
                    <PlaceholderLine />
                    <PlaceholderLine width={30} />
                </Placeholder>
                <Placeholder
                    Animation={Fade}
                    Left={PlaceholderMedia}
                >
                    <PlaceholderLine width={80} />
                    <PlaceholderLine />
                    <PlaceholderLine width={30} />
                </Placeholder>
            </Placeholder>
        )
    }
    /**
     *等待加载
     *PlaceholderList 综合详情列表
     */
    static PlaceholderDetail() {
        let num = [1, 2, 3, 4]
        return (
            <Placeholder Animation={Fade} style={{ backgroundColor: Theme.normalBg }}>
                <PlaceholderLine width={100} style={{ borderRadius: 0, height: 140 }} />
                {
                    num.map((item, index) => {
                        return <Placeholder key={index} Animation={Fade} Left={PlaceholderMedia} >
                            <PlaceholderLine width={80} />
                            <PlaceholderLine width={60} />
                            <PlaceholderLine width={30} />
                        </Placeholder>
                    })
                }
            </Placeholder>
        )
    }

    /**
   *等待加载
   *PlaceholderList 列表
   */
    static PlaceholderList() {
        let num = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        return (
            <Placeholder Animation={Fade} style={{ backgroundColor: Theme.normalBg, marginLeft: 10 }}>
                {
                    num.map((item, index) => {
                        return <Placeholder key={index} Animation={Fade} Left={PlaceholderMedia}>
                            <PlaceholderLine width={85} />
                            <PlaceholderLine width={60} />
                            <PlaceholderLine width={30} />
                        </Placeholder>
                    })
                }
            </Placeholder>
        )
    }
}


const styles = StyleSheet.create({
    btnTouch: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        height: 50,
        borderRadius: 2,
        marginHorizontal: 20,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
    },
    _buttonStyle: {
        height: 40,
        position: 'absolute',
        bottom: 5,
        right: 10,
        left: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        elevation: 1.5, shadowColor: '#999999', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.3, shadowRadius: 1.5
    },
    btStyle3: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        flex: 1
    },
    gradientBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    btnsty: {
        height: 44,
        width: 168,
        backgroundColor: Theme.theme,
        marginLeft: 9,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnsty2: {
        height: 44,
        width: 168,
        borderWidth: 1,
        borderColor: Theme.theme,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomp: {
        height: 80,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        borderTopWidth: 1, borderTopColor: Theme.normalBg
    },
    keyViewSy: {
        margin: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 6
    },
    whiteSty: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: Theme.normalBg,
        paddingTop: 12,
        paddingBottom: 15,
        elevation: 2, // Android 阴影
        shadowColor: "#000", // iOS 阴影
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }

})
