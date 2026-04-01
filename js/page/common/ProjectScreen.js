import React from 'react';
import {
    TouchableHighlight,
    View,
    FlatList,
    StyleSheet
} from 'react-native';
import SuperView from '../../super/SuperView';
import CommonService from '../../service/CommonService';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import ViewUtil from '../../util/ViewUtil';
import SearchInput from '../../custom/SearchInput';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import Customer from '../../res/styles/Customer';
import CryptoJS from "react-native-crypto-js";//加密、解密
export default class ProjectScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: this.params.title,
        },
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
            userInfo: {}
        }
    }

    componentDidMount() {
        StorageUtil.loadKey(Key.UserInfo).then(response => {
            let bytes = CryptoJS.AES.decrypt(response, Key.UserInfo);
            let decryptedUserInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            if (decryptedUserInfo && decryptedUserInfo.Customer && decryptedUserInfo.Customer.Id === Customer.DRHJ) {
                this.setState({
                    userInfo: decryptedUserInfo,
                    isLoading: false
                })
            } else {
                this._reloadProjectList();
            }
        }).catch(error => {
            this._reloadProjectList();
        })

    }


    _reloadProjectList = () => {
        const{CustomerId} = this.params
        let model = {
            query: {
                KeyWord: this.state.keyWord,
                Status: 1,
                CustomerId:CustomerId,
            },
            pagination: {
                PageIndex: this.state.page,
                PageSize: 15
            },
        }
        if (this.state.userInfo && this.state.userInfo.Customer && this.state.userInfo.Customer.Id === Customer.DRHJ) {
            if (this.state.keyWord.length < 6) {
                this.toastMsg('请输入至少6个连续字进行搜索');
                return;
            }
        }
        CommonService.projectList(model).then(response => {
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


    _backOrderClick = (item) => {
        const { callBack } = this.params;
        callBack(item);
        this.pop();
    }
    _submitEditing = () => {
        const { userInfo } = this.state;
        if (userInfo && userInfo.Customer && userInfo.Customer.Id === Customer.DRHJ && this.state.keyWord.length < 6) {
            this.toastMsg('请输入至少6个连续字进行搜索');
            return
        }
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

    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent' onPress={this._backOrderClick.bind(this, item)}>
                <View style={styles.row}>
                    <CustomText style={{ flex: 1, marginLeft: 20, fontSize:14 }} numberOfLines={3} text={item.Name} />
                    <CustomText style={{ flex: 1, marginRight: 20,fontSize:14, textAlign: 'right' }} text={item.SerialNumber} />
                </View>
            </TouchableHighlight>
        )

    }

    _renderFooter = () => {
        const { isLoading, isLoadingMore, isNoMoreData, projectList } = this.state;
        return ViewUtil.getRenderFooter(isLoadingMore, isNoMoreData, !isLoading && projectList.length === 0);
    }
    renderBody() {
        const { keyWord, projectList, isLoading, isNoMoreData, userInfo } = this.state;
        let placeholder = userInfo && userInfo.Customer && userInfo.Customer.Id === Customer.DRHJ ? '请输入至少6个连续字进行搜索' : '输入项目名称';
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
        height: 82,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical:5,
        borderRadius:4
    }
})