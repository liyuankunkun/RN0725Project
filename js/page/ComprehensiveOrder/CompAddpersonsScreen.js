import React from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity
} from 'react-native';
import SuperView from '../../super/SuperView';
import SearchInput from '../../custom/SearchInput';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import ComprehensiveService from '../../service/ComprehensiveService'
import AddObjectView from './View/AddObjectView'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ViewUtil from '../../util/ViewUtil';
import Util from '../../util/Util'


export default class CompAddpersonsScreen extends SuperView {
    constructor(props) {
        super(props);
        this.params = props.navigation.state.params || {};
        this.passengers = Util.Encryption.clone(this.params.passengers);
        this._navigationHeaderView = {
            title:'选择',
            rightButton: ViewUtil.getRightButton('保存',this._rightClick)
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            keyWord: '',
            projectList: [],
            projectAfterList: [],
            selectList:[]
        }
    }
    componentDidMount() {
        this._reloadProjectList();
    }
    _rightClick =() =>{
        const {projectList,selectList} = this.state;
        const { callBack } = this.params;
        projectList&&projectList.map((item)=>{
            if(item.select){
                this.passengers.push(item);
            }
        })
        this.setState({});
        callBack(this.passengers);
        this.pop();
    }
    _reloadProjectList = () => {
        const { keyWord,projectList } = this.state;
        const { index } = this.params
        let model = {
            Query: {
                Keyword: keyWord,//指定关键字查询，为空则查询最近出差人
                OriginType: index,//出差人所属类型，1：员工，其他值为常旅客
            },
            Pagination: {
                PageIndex: 1,//当前页码
                PageSize: 20//数量限制
            }
        }
        ComprehensiveService.MassOrderQueryTravellers(model).then(response => {
            this.hideLoadingView()
            if (response && response.success) {
                if (response.data&&response.data.ListData) {
                    response.data.ListData.map((item)=>{
                        item.select=false
                    })
                    this.setState({
                        projectList:response.data.ListData
                    })
                }
           }
        }).catch(error => {
            this.hideLoadingView();
            this._detailLoadFail();
            this.toastMsg(error.message || '加载数据失败请重试');
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
        const { projectAfterList} = this.state;
        return (
            <TouchableOpacity style={styles.viewStyle}
                              onPress = {()=>{
                                  item.select = !item.select
                                  this.setState({})
                              }}
            >
                <View style={styles.borderStyle}> 
                   <MaterialIcons name={item.select?'check-box':'check-box-outline-blank'} size={25} color={item.select?Theme.theme:Theme.darkColor} />                   
                </View> 
                <View style={{marginLeft:10}}>
                    <CustomText text={item.Name} style={{fontSize:14}}/>
                    {/* {item.Certificates&&item.Certificates[0]&&<View style={{flexDirection:'row',marginTop:10}}>
                        <CustomText text={item.Certificates[0].TypeDesc+'：'} style={{fontSize:14,color:Theme.darkColor}}/>
                        <CustomText text={item.Certificates[0].SerialNumber} style={{fontSize:14,color:Theme.darkColor}}/>
                    </View>} */}
                    {Array.isArray(item.Certificates) && item.Certificates.length > 0 && (
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <CustomText text={`${item.Certificates[0].TypeDesc}：`} style={{ fontSize: 14, color: Theme.darkColor }} />
                            <CustomText text={item.Certificates[0].SerialNumber} style={{ fontSize: 14, color: Theme.darkColor }} />
                        </View>
                    )}
                    {item.RulesTravelName&&<CustomText text={item.RulesTravelName} style={{fontSize:14,marginTop:5}}/>}
                </View>
            </TouchableOpacity>    
        )
    }
    renderBody() {
        const { keyWord, projectList } = this.state;
        let placeholder = '请输入至少2个连续字进行搜索';
        return (
            <View style={{ flex: 1 }}>
                <SearchInput style={{}} placeholder={placeholder} value={keyWord} onChangeText={(text) => this.setState({ keyWord: text })} onSubmitEditing={this._submitEditing} />
                {
                  !projectList? ViewUtil.PlaceholderList():
                  <FlatList
                    data={projectList}
                    renderItem={this._renderItem}
                    showsVerticalScrollIndicator={false}
                    // keyExtractor={(item, index) => String(index)}
                    // onEndReachedThreshold={0.1}
                    // onEndReached={() => {
                    //     setTimeout(() => {
                    //         if (this.canLoadMore && !isNoMoreData) {
                    //             this.setState({
                    //                 isLoadingMore: true,
                    //                 page: ++this.state.page
                    //             }, () => {
                    //                 this._reloadProjectList();
                    //                 this.canLoadMore = false;
                    //             })
                    //         }
                    //     }, 100);
                    // }}
                    // refreshControl={ViewUtil.getRefreshControl(isLoading, () => {
                    //     this.setState({
                    //         page: 1,
                    //         isNoMoreData: false,
                    //         isLoadingMore: false,
                    //         projectList: [],
                    //     }, () => {
                    //         this._reloadProjectList();
                    //     })
                    // })}
                    // ListFooterComponent={this._renderFooter}
                    onMomentumScrollBegin={() => {
                        this.canLoadMore = true;
                    }}
                  />}
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
        paddingHorizontal: 10,
    },
    btnstyle:{
        borderWidth:0.7,
        borderColor:'gray',
        alignItems:'center',
        marginRight:20,
        height:26,
        borderRadius:13,
    },
    borderStyle:{
        width:30,
        height:30,
        // backgroundColor:Theme.themeg3,
        // borderRadius:6,
        // alignItems:"center",
        // justifyContent:'center'
    },
    viewStyle:{ 
        backgroundColor: 'white', 
        flexDirection: 'row', 
        padding: 15,
        borderRadius:8 ,
        alignItems:'center',
        borderBottomWidth:0.5,
        borderColor:Theme.lineColor,
        // justifyContent:'space-between',
        marginHorizontal:5
    },
})