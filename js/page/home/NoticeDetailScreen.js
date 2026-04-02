import React from 'react';
import {
    View,
    ScrollView,
    DeviceEventEmitter
} from 'react-native';
import SuperView from '../../super/SuperView';
import HTMLView from 'react-native-htmlview';
import Theme from '../../res/styles/Theme';
import CustomText from '../../custom/CustomText';
import Util from '../../util/Util';
import ViewUtil from '../../util/ViewUtil';
import CommonService from '../../service/CommonService';
import HTML from 'react-native-render-html';

export default class NoticeDetailScreen extends SuperView {
    constructor(props) {
        super(props);
        this._navigationHeaderView = {
            title: '消息详情'
        }
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
    }
    renderBody() {
        const { item } = this.params;
        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = Util.Date.toDate(dateString);
            return date ? date.format('yyyy-MM-dd HH:mm') : '-';
        };
        let content = item.Content.replace(/font-family\s*:\s*[^;]+;?/gi, '');
        return (
            <View style={{ flex: 1, backgroundColor: Theme.normalBg }}>
                <View style={{flex: 1, paddingHorizontal: 15, backgroundColor: '#fff', marginTop: 5,paddingVertical:15,marginTop:10,marginHorizontal:10,borderRadius:6 }}>
                    <View style={{ flexDirection:'row',alignItems:'center' }}>
                        {/* {
                            item.ReadStatus ===2 ? null :
                            <View style={{height:8,width:8,borderRadius:5,backgroundColor:Theme.redColor,marginRight:5}}></View>
                        } */}
                        <CustomText text={item.Title} style={{ fontSize: 15, fontWeight: 'bold' }} />
                    </View>
                    <CustomText text={ formatDate(item.PublishTime) } style={{ fontSize: 12, color: 'gray' }}/>
                    <ScrollView style={{marginTop:10}} showsVerticalScrollIndicator={false}>
                        {/* <HTMLView value={item.Content} stylesheet={{ img: { width: '100%', height: 'auto',resizeMode: 'contain', } }} /> */}
                        <HTML
                            contentWidth={global.screenWidth}
                            source={{ html: content }}
                            tagsStyles={{
                                '*': {
                                    fontFamily: 'System', // iOS和Android默认系统字体
                                },
                                // 其他标签样式...
                            }}
                        />
                    </ScrollView>
                </View>
                {/* {
                    item.ReadStatus ===2 ? 
                    ViewUtil.getThemeButton('标记未读',()=>{this._getCompList(1)})
                    :
                    ViewUtil.getThemeButton('标记已读',()=>{this._getCompList(2)})
                } */}
            </View>
        )
    }

    _getCompList = (index) => {
           this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
           const { item } = this.params;
           let model = {
                Status: index,
                MessageIdList: [item.MessageId],
           }
           CommonService.CurrentUserMessageChangeStatus(model).then(response => {
               if (response && response.success) {
                   DeviceEventEmitter.emit('refreshMassege', {}),
                   this.pop();
               } else {
                   this.toastMsg(response.message || '获取数据失败');
               }
           }).catch(error => {
               this.toastMsg(error.message || '获取数据异常');
           })
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