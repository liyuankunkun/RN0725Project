import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    Image,
    Easing
} from 'react-native';
import CustomText from '../../../custom/CustomText'
import Theme from '../../../res/styles/Theme';

export default class SectionHeader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rotateValue: new Animated.Value(180),
            listArray: [
                {
                    Category: '1',
                    name: '国内飞机',
                    img: require('../../../res/Uimage/plane.png'),
                },
                {
                    Category: '4',
                    name: '国内酒店',
                    img: require('../../../res/Uimage/hotel.png'),
                },
                {
                    Category: '5',
                    name: '火车',
                    img: require('../../../res/Uimage/train.png'),
                },
                {
                    Category: '7',
                    name: '国际飞机',
                    img: require('../../../res/Uimage/intPlane.png'),
                },
                {
                    Category: '6',
                    name: '国际酒店',
                    img: require('../../../res/Uimage/intHotel.png'),
                },
            ],
            arrowOpen: false,
        }
    }

    handlerSectionHeader = (info) => {
        this.props.handlerSectionHeader(info);
        if (info.section.show) {
            this.state.rotateValue.setValue(0);
            Animated.timing(this.state.rotateValue, {
                toValue: 180,
                duration: 400,
                easing: Easing.linear,
                useNativeDriver: true
            }).start();// 开始spring动画

        } else {
            this.state.rotateValue.setValue(180);
            Animated.timing(this.state.rotateValue, {
                toValue: 0,
                duration: 400,
                easing: Easing.linear,
                useNativeDriver: true
            }).start();// 开始spring动画
        }
    };

    render() {
        const { info } = this.props;
        const { listArray, arrowOpen } = this.state;
        let imgurl = ''
        listArray.map((item) => {
            if (info.section.data[0].Category == item.Category) {
                imgurl = item.img
            }else if(info.section.data[0].Category == 4 || info.section.data[0].Category == 6){
                //酒店保留一个城市
                info.section.title = info.section.title.split('-')[0]
            }
        })
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ arrowOpen: !arrowOpen })
                        this.handlerSectionHeader(info)
                    }
                    }
                    style={styles.subView}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={imgurl} style={{ width: 36, height: 36 }} />
                        <View style={{ marginVertical: 6, marginLeft: 15 }}>
                            <CustomText text={info.section.title} style={{ fontSize: 16, fontWeight: ('bold', '600') }} />
                            <View style={{ flexDirection: 'row' }}>
                                <CustomText style={{ fontSize: 13 }} text={info.section.BeginDate} />
                                <CustomText text={' ~ '} />
                                <CustomText style={{ fontSize: 13 }} text={info.section.EndDate} />
                            </View>
                        </View>
                    </View>
                    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={arrowOpen ? require('../../../res/Uimage/toTop.png') : require('../../../res/Uimage/toBottom.png')} style={{ width: 20, height: 20 }} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.normalBg,
        justifyContent: 'center',
    },
    subView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    image: {
        width: 20,
        height: 20,
        marginLeft: 25
    }
});
