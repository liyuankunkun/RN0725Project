import React from 'react';
import {
    View,
    StyleSheet,
    SectionList,
} from 'react-native';
import { connect } from 'react-redux';
import action from '../../redux/action';
import SectionHeader from './JourneyView/SectionHeader';
import Theme from '../../res/styles/Theme';
import FlightCellView from './JourneyView/FlightCellView';
import HotelCellView from './JourneyView/HotelCellView';
import TrainCellView from './JourneyView/TrainCellView';
import IntlFlightCellView from './JourneyView/IntlFlightCellView';
import IntlHotelCellView from './JourneyView/IntlHotelCellView';


class CompCreateJourneyView extends React.Component {
    constructor(props) {
        super(props);
        // this.params = (props.route ? props.route.params : {}) || {};
        this.state = {
            keyWord:null,
            cellDataArray:[],
            compSectionList:this.props.limitedSectionList
        }
        this.cellDatas = [
            {key:'1',title:'上海-浦东国际机场',time_come:'2021/05/10',time_go:'2021/05/15',show:true,data:[
                    {key:'1',title:'flight',time:'2021/05/10',airport_come:'xxx机场',airport_go:'xxx机场',airCode:'HO',comeCity:'北京',toCity:'上海',img:require('../../res/image/icon-65-1-2.png')} ,
                    {key:'2',title:'train',time:'2021/05/10',airport_come:'xxx机场',airport_go:'xxx机场',airCode:'HO',comeCity:'北京',toCity:'上海',img:require('../../res/image/icon-65-3-2.png')} ,
                    {key:'3',title:'hotel',time:'2021/05/10',airport_come:'xxx机场',airport_go:'xxx机场',airCode:'HO',comeCity:'北京',toCity:'上海',img:require('../../res/image/icon-65-5-2.png')}
                ]
            }
        ]
    }

    componentDidMount() {
        const{ compSectionList } = this.props;
        let newArray = JSON.parse(JSON.stringify(this.cellDatas));
        //compSectionList 保留前5条
        const limitedSectionList = compSectionList?.slice(0, 5) || [];
        this.setState({
            cellDataArray:newArray,
            compSectionList: limitedSectionList
        });
    }

    handlerSectionHeader = (info) => {
        const{compSectionList} = this.state;
        compSectionList.map((item, index) => {
            if (item === info.section) {
                item.show = !item.show;
            }
        });
        let newDatas= JSON.parse(JSON.stringify(compSectionList));
        this.setState({
            compSectionList:newDatas
        })
    };

    //section头部
    _renderSectionHeader=(item)=>{
        return  (
                <SectionHeader
                    info={item}
                    handlerSectionHeader = {this.handlerSectionHeader.bind(this)}
                />
               )
    }

    _renderItem = (info) => {
        if(info.section.show == true){
            return(
                <View></View>
            )
        }else {
            return(
                info.item.Category===1?
                <FlightCellView item={info.item} callback={()=>{this._flightDetail(info.item)}}/>
                :
                info.item.Category===5?
                <TrainCellView item={info.item} callback={()=>{this._trainDetail(info.item)}}/>
                :
                info.item.Category===4?
                <HotelCellView item={info.item} callback={()=>{this._hotelDetail(info.item)}}/>
                :
                info.item.Category==7?
                <IntlFlightCellView item={info.item} callback={()=>{this._intlflightDetail(info.item)}}/>
                :
                info.item.Category ===6?
                <IntlHotelCellView item={info.item} callback={()=>{this._IntlHotelDetail(info.item)}}/>
                :null
            )
        }
    };
    _flightDetail=(item)=>{
        this.props.otw_this.push('FlightOrderDetail', {Id: item.OrderId, otwThis:this.props.otw_this, userInfoId:this.props.userInfo?.Id})  
    }
    _intlflightDetail=(item)=>{
        this.props.otw_this.push('IntlFlightOrderDetail',{order: item.OrderId});
    }
    _trainDetail=(item)=>{
        this.props.otw_this.push('TrainOrderDetailScreen',{Id: item.OrderId})
    }
    _hotelDetail=(item)=>{
        this.props.otw_this.push('HotelOrderDetailScreen',{OrderId: item.OrderId})
    }
    _IntlHotelDetail=(item)=>{
        this.props.otw_this.push('InterHotelOrderDetail',{orderId: item.OrderId})
    }

    render() {
        const {compSectionList} = this.state;
        return (
            <View style={styles.container}>
                {
                this.state.cellDataArray.length>0?
                <View>
                    <SectionList
                        showsVerticalScrollIndicator={false}
                        renderSectionHeader={this._renderSectionHeader}
                        renderItem={this._renderItem}
                        sections={compSectionList}
                        extraData={this.state}
                    />
                </View>
                : 
                <View style={{justifyContent:'center',alignItems:'center'}}></View>   
                }
            </View>
        )
    }
}

const mapDispatchToProps = dispatch =>({
    setComp_Id: (value) => dispatch(action.setComp_Id(value)),  
})
export default connect(mapDispatchToProps)(CompCreateJourneyView);

const styles = StyleSheet.create({
    container:{
        flex: 1,
        marginTop:5,
        backgroundColor:Theme.normalBg
    }   
})

