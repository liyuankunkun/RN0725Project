
import React from 'react';
import {
    SectionList,
    View,
    StyleSheet,
    TouchableHighlight,
    InteractionManager,
    PixelRatio,
    Dimensions
} from 'react-native';
import SuperView from "../../super/SuperView";
import SearchInput from '../../custom/SearchInput';
import StorageUtil from '../../util/StorageUtil';
import Key from '../../res/styles/Key';
import FlightService from '../../service/FlightService';
import CustomText from '../../custom/CustomText';
import Theme from '../../res/styles/Theme';
import sectionListGetItemLayout from '../../custom/SectionListGetItemLayout';
import Util from '../../util/Util';
export default class FlightCityScreen extends SuperView {

    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: '城市选择'
        }
        this._tabBarBottomView = {
            bottomInset: true
        }
        this.state = {
            hotCitys: [],
            letters: [],
            sections: [],
            recordSections: [],
            keyWord: ''
        }
        this.widthScreen = Dimensions.get('window').width
        this.getItemLayout = sectionListGetItemLayout({
            // The height of the row with rowData at the given sectionIndex and rowIndex
            getItemHeight: (rowData, sectionIndex, rowIndex) => 45,

            // These four properties are optional
            getSeparatorHeight: () => 0, // The height of your separators
            getSectionHeaderHeight: () => 35, // The height of your section headers
            getSectionFooterHeight: () => 0, // The height of your section footers
            listHeaderHeight: 320, // The height of your list header
        })
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            StorageUtil.loadKeyId(Key.FlightCitysData).then(response => {
                if (response) {
                    this._analyData(response);
                }
            }).catch(error => {
                this._loadCityData();
            })

        })
    }

    _loadCityData = () => {
        this.showLoadingView();
        FlightService.GetCityList2().then(response => {
            this.hideLoadingView();
            if (response && response.success) {
                if (response.data) {
                    StorageUtil.saveKeyId(Key.FlightCitysData, response.data);
                    this._analyData(response.data);
                }
            } else {
                this.toastMsg(response.message || '获取城市信息失败');
            }
        }).catch(error => {
            this.hideLoadingView();
            this.toastMsg(error.message || '获取城市信息失败');
        })
    }
    /**
     *  分析数据
     */
    _analyData = (data) => {
        if (!data) return;
        let lettersArr = [];
        let sections = [];
        let hotsArr = [];
        for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
            lettersArr.push(String.fromCharCode(i));
            sections.push({ title: String.fromCharCode(i), data: [] });
        }
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            if (obj.EnName) {
                let letter = [...obj.EnName][0];
                let section = sections.find(item => item.title === letter);
                if (!section) {
                    continue;
                }
                section.data.push(obj);
            }
            if (obj.Hot > 7 && hotsArr.length < 20) {
                hotsArr.push(obj);
            }
        }
        this.setState({
            hotCitys: hotsArr,
            letters: lettersArr,
            sections,
            recordSections: sections
        })
    }
    /**
     *  城市点击事件
     */
    _cityBtnClick = (item) => {
        this.params && this.params.setBackCity(item);
        this.pop();
    }
    /**
     *  字母检索点击事件
     */
    _letterBtnClick = (item) => {
        if (!item) return;
        if (this.state.sections.length === 1) return;


        let index = this.state.letters.findIndex(obj => obj === item);
        if (index > -1) {
            this.sectionList.scrollToLocation({ sectionIndex: index, itemIndex: 0 });
        }
    }
    /**
     *  检索
     */
    _onSubmitEditing = () => {
        const { keyWord } = this.state;
        if (!keyWord || keyWord.length === 0) {
            this.setState({
                sections: this.state.recordSections
            })
        } else {
            let list = [];
            this.state.recordSections.forEach(item => {
                if (item.data) {
                    item.data.forEach(obj => {
                        let miniLetters = []
                        let arrLetters = obj&&obj.Letters&&obj.Letters.split('|')
                        arrLetters&&arrLetters.map(_item=>{
                            miniLetters.push(_item.toLowerCase()) 
                        })
                        let miniKey = this.state.keyWord.toLowerCase();
                        let lower = keyWord.toUpperCase();
                         let upperName = (obj.EnName && obj.EnName.toUpperCase());
                        if ((upperName && upperName.includes(lower)) ||  (obj.Name&&obj.Name.includes(keyWord)) || (obj.Code&&obj.Code.includes(keyWord)) || (obj.EnName && obj.EnName.includes(keyWord)) || (miniLetters &&miniLetters.includes(miniKey))) {
                            list.push(obj);
                        }
                    })
                }
            })
            this.setState({
                sections: [{ title: '搜索结果', data: list }]
            })
        }
    }
    _onchange = (text) => {
        this._onSubmitEditing();
    }
    _renderSearchView = () => {
        return <SearchInput placeholder='城市名称' value={this.state.keyWord} onChangeText={(text) => this.setState({ keyWord: text }, this._onchange)}  fromSearch={true}/>    
    }

    // 头部视图
    _renderHenderView = () => {
        const { hotCitys, letters } = this.state;
        return (
            <View>

                {
                    hotCitys && hotCitys.length > 0 ?
                        <View >
                            <CustomText text='热门' style={{ marginLeft: 15,marginTop:10,color:Theme.commonFontColor }} />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {
                                    hotCitys.map((item, index) => {
                                        return (
                                            <TouchableHighlight key={index} underlayColor="transparent" onPress={this._cityBtnClick.bind(this, item)}>
                                                <View style={{
                                                    width: this.widthScreen / 5,
                                                    height: 30,
                                                    borderRadius: 4,
                                                    backgroundColor: 'white',
                                                    marginTop: 10,
                                                    marginLeft: this.widthScreen / 5 / 5,
                                                    alignItems: 'center',
                                                    justifyContent: "center",
                                                    borderWidth:1,
                                                    borderColor:Theme.promptFontColor
                                                }}>
                                                    <CustomText numberOfLines={1} text={Util.Parse.isChinese() ? item.Name : item.EnName} style={{fontSize:13,color:Theme.commonFontColor}} />
                                                </View>
                                            </TouchableHighlight>
                                        )
                                    })
                                }
                            </View>
                        </View> : null
                }
                {
                    letters && letters.length > 0 ?
                        <View style={{marginBottom:15}}>
                            <CustomText text='字母检索' style={{ marginLeft: 15, marginTop: 10 }} />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap',marginLeft:15,justifyContent: 'flex-start', marginTop: 5 }}>
                                {
                                    letters.map((item, index) => {
                                        return (
                                            <TouchableHighlight key={index} underlayColor="transparent" onPress={this._letterBtnClick.bind(this, item)}>
                                                <View style={{
                                                    width:this.widthScreen / 10,
                                                    height: this.widthScreen / 10,
                                                    borderRadius: 3,
                                                    backgroundColor: 'white',
                                                    marginTop: this.widthScreen / 10 / 6,
                                                    marginRight: this.widthScreen / 10 / 6,
                                                    alignItems: 'center',
                                                    justifyContent: "center",
                                                    borderWidth:1,
                                                    borderColor:Theme.promptFontColor,
                                                }}>
                                                    <CustomText numberOfLines={1} text={item} style={{color:Theme.commonFontColor}} />
                                                </View>
                                            </TouchableHighlight>
                                        )
                                    })
                                }
                            </View>
                        </View> : null
                }
            </View>
        )
    }
    _renderSectionHeader = ({ section: { title } }) => {
        return (
            <View style={styles.section}>
                <CustomText style={{ marginLeft: 10, color: Theme.fontColor }} text={title} />
            </View>
        )
    }
    _renderItem = ({ item, index }) => {
        return (
            <TouchableHighlight underlayColor='transparent'
                onPress={this._cityBtnClick.bind(this, item)}>
                <View style={{
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    height: 44,
                    marginLeft: this.widthScreen / 5 / 5,
                    marginRight: this.widthScreen / 5 / 5,
                    borderRadius: 5
                }}>
                    <CustomText style={{ marginLeft: 5, color:Theme.commonFontColor }} text={Util.Parse.isChinese() ? item.Name : item.EnName} />
                </View>
            </TouchableHighlight>
        )
    }

    renderBody() {
        return (
            <View style={{ flex: 1,backgroundColor:"#fff" }}>
                {this._renderSearchView()}
                <SectionList
                    style={{ flex: 1 }}
                    ref={sectionList => this.sectionList = sectionList}
                    ListHeaderComponent={this.state.sections.length > 1 ? this._renderHenderView : null}
                    sections={this.state.sections}
                    renderItem={this._renderItem}
                    renderSectionHeader={this._renderSectionHeader}
                    keyExtractor={(item, index) => String(index)}
                    getItemLayout={this.getItemLayout}
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    section: {
        height: 35,
        justifyContent: 'center',
        flex: 1,
        backgroundColor: Theme.normalBg,
        paddingLeft:9,
    }
})