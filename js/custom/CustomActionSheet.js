
import React from 'react';
import {
    View, Modal, Animated, StyleSheet, ScrollView, TouchableHighlight, TouchableOpacity
} from 'react-native';
import CustomText from './CustomText';
import PropTypes from 'prop-types';
import Theme from '../res/styles/Theme';
import DeviceUtil from '../util/DeviceUtil';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
let CancelButtonHeight = DeviceUtil.is_iphonex() ? 84 : 50;
export default class CustomActioSheet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            modelOpacity: new Animated.Value(0),
            modelHeight: new Animated.Value(0)
        }
    }
    /**
     *  规定用法
     */
    static propTypes = {
        title: PropTypes.string,
        options: PropTypes.array.isRequired,
        onPress: PropTypes.func.isRequired,
        select: PropTypes.any
    }
    show() {
        this.setState({
            visible: true
        }, () => {
            Animated.parallel([
                Animated.timing(this.state.modelOpacity, {
                    toValue: 0.6,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(this.state.modelHeight, {
                    toValue: this._getHeight(),
                    duration: 300,
                    useNativeDriver: false
                })
            ]).start();
        })

    }
    _hide = () => {
        Animated.parallel([
            Animated.timing(this.state.modelOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(this.state.modelHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false
            })
        ]).start(() => {
            this.setState({
                visible: false
            })
        });
    }


    _hideBack = (index) => {

        Animated.parallel([
            Animated.timing(this.state.modelOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(this.state.modelHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false
            })
        ]).start(() => {
            this.setState({
                visible: false
            }, () => {
                this.props.onPress(index);
            })
        });
    }

    _getHeight = () => {
        const { options } = this.props;
        if (options.length < 8) {
            return CancelButtonHeight + options.length * 50 + 40;
        } else {
            return CancelButtonHeight + 8 * 50 + 40;
        }
    }

    _detailOptions = () => {
        const { options } = this.props;
        let values = [
            <CustomText text='取消' style={{ color: Theme.theme, fontSize: 16 }} />
        ]
        options.forEach(item => {
            if (typeof item === 'number' || typeof item === 'string') {
                values.push(<CustomText text={item} />)
            }
        })
        return values;
    }

    _cancelClick = () => {
        // this.props.onPress('cancel');
        this._hide();
    }

    render() {
        const { title, onPress, options, select, cancelButtonText } = this.props;
        const { visible, modelOpacity, modelHeight } = this.state;
        return (
            <Modal transparent visible={visible}>
                {/* <KeyboardAwareScrollView> */}
                <TouchableOpacity style={{ flex: 1 }} underlayColor='white' onPress={this._hide}>
                    <Animated.View style={{ backgroundColor: 'black', flex: 1, opacity: modelOpacity }}>
                    </Animated.View>
                </TouchableOpacity>
                <View style={{ backgroundColor: Theme.normalBg }}>
                    <Animated.View style={{ height: modelHeight, }}>
                        <View style={styles.titleHeader}>
                            {
                                typeof title === 'string' || !title ?
                                    <CustomText text={title || '请选择'} style={{ color: Theme.theme, fontSize: 16 }} />
                                    :
                                    title
                            }
                        </View>
                        {
                            options && options.length < 8 ?
                                options.map((item, index) => {
                                    return (
                                        <TouchableHighlight key={index} underlayColor='transparent' onPress={() => {
                                            this._hideBack(index);
                                        }}>
                                            <View style={[styles.buttonView, { borderBottomWidth: index === options.length - 1 ? 0 : 1 }]}>
                                                {
                                                    typeof item === 'string' ?
                                                        <CustomText text={item} style={{ fontSize: 15, color: item === select ? Theme.specialColor2 : null }} />
                                                        :
                                                        item
                                                }
                                            </View>
                                        </TouchableHighlight>
                                    )
                                })
                                :
                                <ScrollView>
                                    {
                                        options.map((item, index) => {
                                            return (
                                                <TouchableHighlight key={index} underlayColor='transparent' onPress={() => {
                                                    this._hideBack(index);
                                                }}>
                                                    <View style={[styles.buttonView, { borderBottomWidth: index === options.length - 1 ? 0 : 1 }]}>
                                                        {
                                                            typeof item === 'string' ?
                                                                <CustomText text={item} style={{ fontSize: 15, color: item === select ? Theme.specialColor2 : null }} />
                                                                :
                                                                item
                                                        }
                                                    </View>
                                                </TouchableHighlight>
                                            )
                                        })
                                    }
                                </ScrollView>
                        }
                        <TouchableHighlight underlayColor='transparent' onPress={this._cancelClick}>
                            <View style={styles.cancelButtonBox}>
                                <View style={{flexDirection:'row',justifyContent:'space-between',width:cancelButtonText?'100%':null,paddingHorizontal:10}}>
                                    <CustomText text='取消' style={{ color: Theme.theme, fontSize: 16 }} />
                                    {cancelButtonText && 
                                       <TouchableOpacity style={{padding:10}} onPress={()=>{this._hideBack('cancel');}}>
                                          <CustomText text={cancelButtonText} style={{ color: Theme.theme, fontSize: 16 }} />
                                       </TouchableOpacity>
                                    }
                                </View>
                                {/* <View style={{ flex: 1, backgroudColor: 'white' }}>
                                </View> */}
                            </View>
                        </TouchableHighlight>
                    </Animated.View>
                </View>
                {/* </KeyboardAwareScrollView> */}
            </Modal >

        )
    }
}

const styles = StyleSheet.create({
    titleHeader: {
        height: 40,
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: 'white',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
    },
    buttonView: {
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "white",
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1
    },
    cancelButtonBox: {
        height: CancelButtonHeight,
        marginTop: 6,
        paddingBottom: DeviceUtil.is_iphonex() ? 34 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    cancelView: {
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:10
    }
})
