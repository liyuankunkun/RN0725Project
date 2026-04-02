import React from 'react';
import {
    Modal,
    View,
    Animated,
    StyleSheet,
    ScrollView,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import TrainService from '../../service/TrainService';
import I18nUtil from '../../util/I18nUtil';
export default class PayInfoView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            moadlHeight: new Animated.Value(0),
            trainlistData: null
        }
    }
    /**
     * 
     * @param 标题 title 
     * @param  数据 data 
     */
    show(data,detail) {
        // data.departureDate = data.departureDate.format('yyyy-MM-dd', true);
        let model = {}
        if(detail){
            model = {
                TrainNo: data.TrainNo,
                DepartureDate: data.departureDate,
                DepartureCode:data.FromStationCode,
                DestinationCode:data.ToStationCode,
                TrainCode:data.Checi
            }

        }else{
            model = {
                TrainNo: data.train_no,
                DepartureDate: data.departureDate,
                DepartureCode:data.from_station_code,
                DestinationCode:data.to_station_code,
                TrainCode:data.train_code
            }

        }
        
        // this.showLoadingView();
        TrainService.TrainStopStations(model).then(response => {
            // this.hideLoadingView();
            if (response && response.success) {
                if (response.data) {
                    // data.trainStopStations = response.data;
                    // this.setState({
                    //     trainlistData: response.data
                    // })
                    this.setState({
                        trainlistData: response.data,
                        visible: true
                    }, () => {
                        Animated.parallel([
                            Animated.timing(this.state.moadlHeight, {
                                toValue: screenHeight * 0.65,
                                duration: 200,
                                useNativeDriver: false
                            }),
                        ]).start();
                    })
                }
            } else {
                // this.toastMsg(response.message || '获取数据失败');
            }
        }).catch(error => {
            // this.hideLoadingView();
            // this.toastMsg(error.message || '获取数据异常');
        })
        // this.setState({
        //     // trainlistData: data,
        //     visible: true
        // }, () => {
        //     Animated.parallel([
        //         Animated.timing(this.state.moadlHeight, {
        //             toValue: screenHeight * 0.65,
        //             duration: 200
        //         }),
        //     ]).start();
        // })

    }
    _dismiss = () => {
        Animated.timing(this.state.moadlHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            this.setState({
                visible: false,
                priceInfo: null
            })
        });
    }


    /**
     *  价格信息
     */
    _priceInfo = () => {
        const { customerInfo } = this.props;
        const { priceInfo } = this.state;
        if (!priceInfo) return null;


        return (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10,marginHorizontal:10,marginTop:10,backgroundColor:Theme.lineColor2,borderRadius:6 }}>
                <View style={styles.row}>
                    <CustomText text='公司支付' style={{ marginTop: 5 }} />
                    <CustomText text={'¥' + priceInfo.Addition.CompanyAmount} style={{ marginTop: 5, color: Theme.theme }} />
                </View>

                <View style={styles.row}>
                    <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <CustomText text='个人支付' />
                    </View>
                    <CustomText text={'¥' + priceInfo.Addition.PersonalAmount} style={{ marginTop: 5, color: Theme.theme }} />
                </View>
                <View style={styles.row}>
                    <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                        <CustomText text='服务费' />
                    </View>
                    <CustomText text={'¥' + priceInfo.Addition.ServiceCharge} style={{ marginTop: 5, color: Theme.theme }} />
                </View>
                <CustomText text='超标现付' style={{ color: Theme.theme,fontSize:11 }} />

            </View>
        )
    }
    render() {
        const { visible, moadlHeight, trainlistData } = this.state;
        return (
            <Modal transparent visible={visible}>
                <Animated.View style={[styles.view]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                       this._dismiss()
                    }}></TouchableOpacity>
                    <Animated.View style={[styles.AnimatedView, { height: moadlHeight }]}>
                        <View style={styles.headerView}>
                            <CustomText />
                            <CustomText text={'经停站信息'} style={{ fontSize: 16 }} />
                            {/* <TouchableHighlight underlayColor='transparent' onPress={this._dismiss}>
                                <Ionicons name={'ios-close-circle-outline'} size={24} color={Theme.darkColor} />
                            </TouchableHighlight> */}
                            <CustomText />
                        </View>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 20, borderBottomColor: Theme.lineColor, borderBottomWidth: 0.5,justifyContent:'space-around' }}>
                                {/* <View style={{ flex: 1, flexDirection: 'row' }}>
                                 
                                    <View style={{ justifyContent: "center", alignItems: 'center', backgroundColor: Theme.theme, width: 24, height: 16, borderRadius: 8 }}>
                                        <CustomText style={{ fontSize: 10, color: 'white' }} text={'站点'} />
                                    </View>
                                    <CustomText style={{ flex: 1, marginLeft: 5 }} numberOfLines={1} text={''} />
                                </View> */}
                                <CustomText style={{ flex: 1 }} text={'站点'} />
                                <CustomText style={{ flex: 1 }} text={'到时'} />
                                <CustomText style={{ flex: 1 }} text={'发时'} />
                                <CustomText style={{ flex: 1 }} text={I18nUtil.translate('停留')} />
                            </View>
                           <View>
                            {
                                trainlistData && trainlistData.length > 0 ?
                                trainlistData.map((item, index) => {
                                        return (
                                            <View key={item.StationName + index} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderBottomColor: Theme.lineColor, borderBottomWidth: 0.5, backgroundColor: 'white' }}>
                                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                                    <View style={{ justifyContent: "center", alignItems: 'center', backgroundColor: Theme.theme, width: 16, height: 16, borderRadius: 8 }}>
                                                        <CustomText style={{ fontSize: 10, color: 'white' }} text={item.station_no} />
                                                    </View>
                                                    <CustomText style={{ flex: 1, marginLeft: 5 }} numberOfLines={1} text={ item.station_name} />
                                                </View>
                                                <CustomText style={{ flex: 1 }} text={ item.start_time } />
                                                <CustomText style={{ flex: 1 }} text={ item.arrive_time } />
                                                <CustomText style={{ flex: 1 }} text={I18nUtil.translate('停') + item.stopover_time} />
                                            </View>
                                        )
                                    }) : null
                            }
                            </View>
                        </ScrollView>

                    </Animated.View>
                </Animated.View>

            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    view: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    AnimatedView: {
        backgroundColor: 'white'
    },
    headerView: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomWidth:1,
        borderColor:Theme.lineColor,
        paddingHorizontal:20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    }
})
