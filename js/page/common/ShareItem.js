import React from 'react';
import {
    View,
    Modal,
    Platform,
    Image,
    TouchableHighlight
} from 'react-native';
import DeviceUtil from '../../util/DeviceUtil';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomText from '../../custom/CustomText';
import PropTypes from 'prop-types';
const TAB_BAR_HEIGHT = Platform.OS === 'ios' &&  DeviceUtil.is_iphonex() ? 34:0;

export default class ShareItem extends React.Component {
    static propTypes = {
        toastMessage: PropTypes.func.isRequired,
        filePath: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        isHome: PropTypes.bool
    }
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }
    _dismiss = () => {
        this.setState({
            visible: false
        })
    }

    _show = () => {
        this.setState({
            visible: true
        })
    }

    _sharebtnclick = (text) => {
        const { toastMessage, filePath, title, description } = this.props;
        if (!text) return;
        this._dismiss();
        let data1 = {
            title: title,
            description: description,
            webpageUrl: filePath,
            thumbImageUrl: baseH5Url + '/content/images/logo128.png',
            scene:0
        }
        let data2 = {
            title: title,
            description: description,
            webpageUrl: filePath,
            thumbImageUrl: baseH5Url + '/content/images/logo128.png',
            scene:1
        }

        if (text === '微信' || text === '朋友圈') {
            wechat.isWXAppInstalled().then(isInstall => {
                if (isInstall) {
                    if (text === '微信') {
                        wechat.shareWebpage(data1).then(result => {
                            toastMessage('分享成功');
                        }).catch(error => {
                            toastMessage('分享失败');
                        })
                    } else {
                        wechat.shareWebpage(data2).then(result => {
                            toastMessage('分享成功');
                        }).catch(error => {
                            toastMessage('分享失败');
                        })
                    }
                } else {
                    toastMessage('您没有安装微信客户端，请您安装微信客户端后重试');
                }
            }).catch(error => {
                toastMessage(error.message || '打开微信异常');
            });
        }
    }
    render() {
        const { isHome } = this.props;
        let height = isHome ? TAB_BAR_HEIGHT : (DeviceUtil.is_iphonex() ? 34 : 0);
        return (
            <Modal transparent={true} visible={this.state.visible}>
                <TouchableHighlight style={{ flex: 8 }} underlayColor='transparent' onPress={() => { this.setState({ visible: false }) }}>
                    <View style={{ backgroundColor: 'black', opacity: 0.6, flex: 1, }}></View>
                </TouchableHighlight>
                <View style={{ backgroundColor: 'white', flex: 2, marginBottom: height, flexDirection: 'row' }}>
                    <TouchableHighlight style={{ flex: 1, alignItems: 'center', }} underlayColor='transparent' onPress={this._sharebtnclick.bind(this, '微信')}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesome name={'weixin'} size={50} color={'green'} style={{ marginLeft: 5 }} />
                            <CustomText style={{ marginTop: 5 }} text='微信' />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ flex: 1 }} underlayColor='transparent' onPress={this._sharebtnclick.bind(this, '朋友圈')}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Image style={{ width: 50, height: 50, }} source={require('../../res/image/personal_circle.png')} />
                            <CustomText style={{ marginTop: 5 }} text='朋友圈' />
                        </View>
                    </TouchableHighlight>
                </View>
            </Modal>

        )
    }
}
