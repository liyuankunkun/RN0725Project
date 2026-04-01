/**
 * 加载遮罩
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Text,
    Image
} from 'react-native';
import I18nUtil from '../util/I18nUtil';
import Theme from '../res/styles/Theme';
import CustomText from '../custom/CustomText';
export default class LoadingView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoading: false,
            title: '正在加载'
        }
    }
    show() {
        this.setState({
            showLoading: true
        })
    }
    dismiss() {
        this.setState({
            showLoading: false
        })
    }

    setTitle(title) {
        this.setState({
            title:title?title:'正在加载',
            showLoading: true
        })
    }

    render() {
        const { showLoading,title } = this.state;
        return (
            <Modal onRequestClose={() => this.dismiss()} visible={showLoading} transparent={true}>
                <View style={[styles.loadingView]} >
                    <View style={{}}>
                       <Image style={{ width: 38, height:38 }} source={require('../res/loading.gif') } />
                        {/* <ActivityIndicator animating={showLoading} color={Theme.theme} size="small" />
                        <View style={{flexDirection:'row'}}>
                            <CustomText style={{fontSize: 13, color: Theme.theme, marginTop: 5}} text={title}></CustomText>
                            <CustomText style={{fontSize: 13, color: Theme.theme, marginTop: 5}} text={'...'}></CustomText>                           
                        </View> */}
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 20,
        width: '100%',
        height: '100%',
    },
    loadingImage: {
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
        // padding:5,
        // backgroundColor:'#eee',
        // elevation:1.5, shadowColor:'#999', shadowOffset:{width:2.5,height:2.5}, shadowOpacity: 0.6, shadowRadius: 1.5
    },
});