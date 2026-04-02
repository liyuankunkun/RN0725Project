import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import CustomText from '../../custom/CustomText';
import CustomeTextInput from '../../custom/CustomTextInput';
import Theme from '../../res/styles/Theme';
import HighLight from '../../custom/HighLight';
import { Bt_inputView }  from '../../custom/HighLight';
export default class ContactView extends React.Component {

    static propTypes = {
        model: PropTypes.shape({
            Name: PropTypes.string,
            Mobile: PropTypes.string,
            Email: PropTypes.string
        }),
        from: PropTypes.oneOf(['flight', 'train', 'hotel', 'intlHotel', 'intlFlight', 'mice', 'car', 'application'])
    }
    constructor(props) {
        super(props);
        this.state = {
            isEditMobile: false
        }
    }

    render() {
        const { model,from } = this.props;
        const {isEditMobile} = this.state;
        return (
            <View style={styles.view}>
                {/* <View style={styles.row}>
                    {(from==='intlHotel'||from==='hotel')?<HighLight  name={'联系人'} />:<CustomText text='联系人' style={styles.text} />}
                    <View style={{justifyContent:'center'}}>
                      <CustomeTextInput style={styles.put} placeholder='添加其他联系人姓名' value={model.Name} onChangeText={(text) => { model.Name = text; this.setState({}) }} />
                    </View>
                </View> */}
                <View style={styles.row}>
                    {(from==='intlHotel'||from==='hotel')?<HighLight  name={'电话'} />:<CustomText text='电话' style={styles.text} />}
                    <View style={{justifyContent:'center'}}>
                      <CustomeTextInput style={styles.put} 
                          placeholder='电话号码' 
                          value={isEditMobile?model.Mobile:model.Mobile&&model.Mobile.replace(/(\d{3})(\d{4})(\d{4})/,"$1****$3")} 
                          onChangeText={(text) => { model.Mobile = text; this.setState({}) }} 
                          _onFocus={()=>{
                                // passenger.Mobile = '';
                                this.setState({ isEditMobile: true })
                          }}
                          _onBlur={()=>{
                                this.setState({ isEditMobile: false })
                          }}
                    />
                    </View>
                </View>
                {/* <View style={[styles.row, { borderBottomWidth: 0 }]}>
                    {from==='intlHotel'?<HighLight  name={'电子邮件'} />:<CustomText text='电子邮件' style={styles.text} />}
                    <View style={{justifyContent:'center'}}>
                      <CustomeTextInput style={styles.put} placeholder='电子邮件' value={model.Email} onChangeText={(text) => { model.Email = text; this.setState({}) }} />
                    </View>
                </View> */}
                <View style={{paddingHorizontal:13,borderBottomWidth:1,borderBottomColor:Theme.lineColor}}>
                <Bt_inputView dicKey={'Email'}
                            required={from==='intlHotel'?true:false} 
                            bt_text={model.Email} 
                            _placeholder={'请输入电子邮箱'} 
                            _callBack={(text)=>{
                                model.Email = text
                                this.setState({});
                            }}
                />
                </View>
                <CustomText text={'支持最多 4 个邮箱，需用英文分号（;）分隔'} style={{marginRight:10,color:Theme.assistFontColor,paddingHorizontal:15,paddingVertical:10}}></CustomText>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: 'white',
        marginTop: 10,
        marginHorizontal:10,
        paddingHorizontal:10,
        borderRadius:6
    },
    row: {
        height: 44,
        paddingHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomColor: Theme.lineColor,
        borderBottomWidth: 1,
        justifyContent:'space-between'
    },
    text: {
        flex: 3,
        fontSize:14
    },
    put: {
        fontSize:14,
        textAlign:'right'

    }
})