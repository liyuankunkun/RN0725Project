import React from 'react';
import {
    Modal,
    View,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
} from 'react-native';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { TitleView }  from '../../custom/HighLight';

export default class RuleView2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            model: {},
            visible: false,
            modelHeight: new Animated.Value(0)
            // modelHeight: screenHeight * 0.8
        }
    }

    show(model) {
        if (!model) return;
        this.setState({
            model,
            visible: true
        }, () => {
            Animated.timing(this.state.modelHeight, {
                toValue: screenHeight * 0.8,
                duration: 200,
                useNativeDriver: false
            }).start();
        })
    }
    _hide = () => {

        Animated.timing(this.state.modelHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            this.setState({
                model: {},
                visible: false
            })
        });
    }

    render() {
        return (
            <Modal visible={this.state.visible} transparent>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(0,0,0,0.6)" }}>
                    <Animated.View style={[styles.view]}>
                            <View style={styles.topView}>
                                <CustomText />
                                <CustomText text='行李说明' style={{  fontSize: 16 }} />
                                <TouchableHighlight underlayColor='transparent' onPress={this._hide}>
                                    <AntDesign name={'close'} size={22} color={Theme.assistFontColor} />
                                </TouchableHighlight>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false} style={{borderBottomLeftRadius:10, borderBottomRightRadius:10}} keyboardShouldPersistTaps='handled'>
                                {this._renderRules()}
                            </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        )
    }
    _renderRules() {
        const { PolicySummary } = this.state.model;
        return (
            <View style={{ backgroundColor: "white", paddingHorizontal: 10,  }}>
                <TitleView title={'行李说明'} style={{}}></TitleView>
                {this._renderBuddge()}
                <CustomText text='*具体费用按航空公司官网规定收取' style={{ fontSize: 13, color: Theme.orangeColor,marginTop:10,marginLeft:10 }} />
            </View>
        )
    }
    _renderBuddge() {
        const { PolicySummary } = this.state.model;
        return (
            PolicySummary && PolicySummary.BaggagePolicy ?
            <View style={{ marginHorizontal:10,borderWidth:1,padding:10,borderRadius:2,borderColor:Theme.lineColor }}>
                <CustomText style={{fontSize: 13,color:Theme.commonFontColor,lineHeight:22}} text={(PolicySummary.BaggagePolicy.Desc) || '无行李额'} />
            </View>
            :
            <View style={{ marginHorizontal:10,borderWidth:1,padding:10,borderRadius:2,borderColor:Theme.lineColor }}>
                <CustomText text='行李额以航司为准' style={{  fontSize: 12,color:Theme.assistFontColor }} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: '#fff',
        width: '90%',
        height: '36%',
        borderRadius: 10,
        borderTopLeftRadius:10, borderTopRightRadius:10
    },
    view2: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '90%',
        height: '36%',
        borderRadius: 10
    },
    topView:{ height: 48,justifyContent: "space-between", 
        paddingHorizontal: 15, alignItems: "center",
        backgroundColor:'#fff', flexDirection: "row",
        borderTopLeftRadius:10, 
        borderTopRightRadius:10,
        borderBottomWidth:1,
        borderColor:Theme.lineColor }

})
