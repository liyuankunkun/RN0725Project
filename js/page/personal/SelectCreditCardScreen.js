import React from 'react';
import { ScrollView, View,TouchableOpacity,StyleSheet,Image } from 'react-native';
import CustomText from '../../custom/CustomText';
import SuperView from '../../super/SuperView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Theme from '../../res/styles/Theme';
import cardTypeList from '../../res/js/hotelcardtypelist.js';

export default class SelectCreditCardScreen extends SuperView{
    HotelCardTypeList  =  cardTypeList;
    yilongUn = {Name:'中国银联卡(China Union Pay Card)',Value:0,CardType:'UP',require: require('../../res/image/chinaunionpay.png'),}
    constructor(props) {
        super(props);
        this.params = (props.route && props.route.params) || (props.navigation && props.navigation.state && props.navigation.state.params) || {};
        this._navigationHeaderView = {
            title: "请选择"
        }
        let cardList= []       
        this.state = {
            cardName:null,
            IdName: "",
            cvv: '',
            validYear: '',
            validMonth: '',
            Name: '',
            SeriNumber: '',
            Type: "身份证",
            options: ['身份证', '护照', '其它'],
            cardList:cardList&&cardList.length>0?cardList:this.HotelCardTypeList,
        }
    }
    renderBody(){
        const {cardName} = this.params;
        const {cardList} = this.state;
        return (
            <View style={{
                flex:1
            }}>
            <ScrollView>
                {
                    cardList&&cardList.map((obj,index)=>{
                            return(
                                <TouchableOpacity 
                                onPress={()=>{
                                    this.params.callBack(obj);
                                    this.props.navigation.pop();
                                }}
                                >
                                    <View key={index} style={styles.listStyle}>
                                        <Image style={{height:20, width:50, resizeMode:'contain',marginRight:5}} source={obj.require} />
                                        <CustomText text={obj.Name}/>
                                        {
                                         cardName && cardName.Value == obj.Value ? 
                                          <MaterialIcons
                                                name={'check-box'}
                                                size={28}
                                                color={Theme.theme}
                                           /> 
                                           :null
                                        }
                                    </View>
                                </TouchableOpacity>
                            )
                    })
                }
            </ScrollView>
            </View>
        )
    }
}
const styles = StyleSheet.create({
   listStyle:{
                    height:44,
                    backgroundColor:'white',
                    flexDirection:"row",
                    alignItems:"center",
                    // justifyContent:"space-between",
                    paddingHorizontal:10,
                    borderBottomColor:"#e6e6e6",
                    borderBottomWidth:0.5,
                }
})