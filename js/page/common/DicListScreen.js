import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableHighlight
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import ViewUtil from '../../util/ViewUtil';
import CustomText from '../../custom/CustomText';
import I18nUtil from '../../util/I18nUtil';
import CommonService from '../../service/CommonService';
import Theme from '../../res/styles/Theme';
import Util from '../../util/Util';
export default class DicListScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: this.params.title,
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            keyWord: '',
            page: '',
            projectList: [],
            isNoMoreData: false,
            isLoading: true,
            isLoadingMore: false,
            page: 1,
        }
    }
    componentDidMount() {
        this._reloadProjectList();
    }
    _reloadProjectList = () => {
        let model = {
            query: {
                DictId: this.params.Id,
                KeyWord: this.state.keyWord,
                Status: 1,
                ParentName:this.params.ParentValue
            },
            pagination: {
                PageIndex: this.state.page,
                PageSize: 15
            }
        }
        CommonService.dictList(model).then(response => {
            if (response && response.success) {
                if (response.data && response.data.ListData) {
                    this.state.projectList = this.state.projectList.concat(response.data.ListData);
                }
                if (response.data.TotalRecorder <= this.state.projectList.length) {
                    this.state.isNoMoreData = true;
                }
                this.setState({
                    isLoading: false,
                    isLoadingMore: false
                })
            } else {
                this._detailLoadFail();
                this.toastMsg(response.message || '加载数据失败请重试');
            }
        }).catch(error => {
            this._detailLoadFail();
            this.toastMsg(error.message || '加载数据失败请重试');
        })
    }


    _detailLoadFail = () => {
        if (this.state.isLoadingMore) {
            this.state.page--;
        }
        this.setState({
            isLoading: false,
            isLoadingMore: false
        })
    }
    _submitEditing = () => {
        this.setState({
            isLoading: true,
            isNoMoreData: false,
            isLoadingMore: false,
            projectList: [],
            page: 1
        }, () => {
            this._reloadProjectList();
        })
    }

    _backOrderClick = (item) => {
        this.params.callBack(item);
        this.pop();
    }
    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._backOrderClick.bind(this, item)}>
                <View style={styles.row}>
                    <CustomText style={{ flex: 1, marginLeft: 10 }} numberOfLines={3} text={Util.Parse.isChinese()?item.Name:item.EnName} />
                    <CustomText style={{ flex: 1, marginRight: 10, textAlign: 'right' }} text={item.SerialNumber} />
                </View>
            </TouchableHighlight>
        )
    }

    _renderFooter = () => {
        const { isLoading, isLoadingMore, isNoMoreData, projectList } = this.state;
        return ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData, !isLoading && projectList.length === 0);
    }
    renderBody() {
        const { keyWord, projectList, isLoading, isNoMoreData } = this.state;
        let placeholder = '输入名称';
        return (
            <View style={{ flex: 1 }}>
                <SearchInput placeholder={placeholder} value={keyWord} onChangeText={(text) => this.setState({ keyWord: text })} onSubmitEditing={this._submitEditing} />
                <FlatList
                    data={projectList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => String(index)}
                    onEndReachedThreshold={0.1}
                    onEndReached={() => {
                        setTimeout(() => {
                            if (this.canLoadMore && !isNoMoreData) {
                                this.setState({
                                    isLoadingMore: true,
                                    page: ++this.state.page
                                }, () => {
                                    this._reloadProjectList();
                                    this.canLoadMore = false;
                                })
                            }
                        }, 100);
                    }}
                    refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                        this.setState({
                            page: 1,
                            isNoMoreData: false,
                            isLoadingMore: false,
                            projectList: [],
                        }, () => {
                            this._reloadProjectList();
                        })
                    })}
                    ListFooterComponent={this._renderFooter}
                    onMomentumScrollBegin={() => {
                        this.canLoadMore = true;
                    }}
                />
            </View>
        )
    }
}
const styles = StyleSheet.create({
    row: {
        backgroundColor: 'white',
        height: 60,
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop:6,
        borderRadius:6
    }
})