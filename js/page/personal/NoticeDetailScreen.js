import React from 'react';
import {
    View,
    ScrollView,
} from 'react-native';
import SuperView from '../../super/SuperView';
import HTMLView from 'react-native-htmlview';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
export default class NoticeDetailScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '公告详情'
        }
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    }
    renderBody() {
        const { item } = this.params || {};
        return (
            <View style={{ flex: 1, backgroundColor: Theme.normalBg }}>
                <View style={{ paddingHorizontal: 15, backgroundColor: '#fff', marginTop: 5 }}>
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <CustomText text={this.params.title} style={{ fontSize: 18, fontWeight: 'bold' }} />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <HTMLView value={item.content} />
                        {/* <CustomText text={item.content} style={{ flex: 1,paddingTop:5,lineHeight:25}} 
                                     onPress={()=>{this._toAdDetail(item)}}
                              /> */}
                    </ScrollView>
                </View>
            </View>
        )
    }

    _toAdDetail = (item) => {
        let text = item.content.slice(0, 4);
        if (item.LinkUrl) {
            this.push("Web", {
                title: item.title,
                url: item.LinkUrl
            })
        } else if (text == 'http') {
            this.push("Web", {
                title: item.title,
                url: item.content
            })
        }
    }
}