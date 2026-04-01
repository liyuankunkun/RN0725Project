
import React from 'react';
import ProTypes from 'prop-types'
import {
    View,
    Image,
    StyleSheet,
    ViewPropTypes
} from 'react-native';
import Svg,{ Path   } from 'react-native-svg';
import _airiconsvg from '../res/js/airIconSvg';

export default class CropImage extends React.Component {

    static propTypes = {
        onPress: ProTypes.func,
        code: ProTypes.string.isRequired
    }
    static defaultProps = {
        onPress: () => { },
    }
    
    _getCodeTop = (name) => {
        let num = 32
        var a = 0;
        if (name == '3U') {
            a = 0 * num;
        } else if (name == '8C') {
            a = 1 * num;
        } else if (name == '8L') {
            a = 2 * num;
        } else if (name == 'BK') {
            a = 3 * num;
        } else if (name == 'CA') {
            a = 4 * num;
        } else if (name == 'CN') {
            a = 5 * num;
        } else if (name == 'CZ') {
            a = 6 * num;
        } else if (name == 'EU') {
            a = 7 * num;
        } else if (name == 'FM') {
            a = 8 * num;
        } else if (name == 'G5') {
            a = 9 * num;
        } else if (name == 'GS') {
            a = 10 * num;
        } else if (name == 'HO') {
            a = 11 * num;
        } else if (name == 'HU') {
            a = 12 * num;
        } else if (name == 'KN') {
            a = 13 * num;
        } else if (name == 'MF') {
            a = 14 * num;
        } else if (name == 'MU') {
            a = 15 * num;
        } else if (name == 'NS') {
            a = 16 * num;
        } else if (name == 'PN') {
            a = 17 * num;
        } else if (name == 'SC') {
            a = 18 * num;
        } else if (name == 'ZH') {
            a = 19 * num;
        } else if (name == 'VD') {
            a = 20 * num;
        } else if (name == 'JR') {
            a = 21 * num;
        } else if (name == 'KY') {
            a = 22 * num;
        } else if (name == 'TV') {
            a = 23 * num;
        } else if (name == '9C') {
            a = 24 * num;
        } else if (name == 'JD') {
            a = 25 * num;
        } else if (name == 'G8') {
            a = 26 * num;
        } else if (name == 'GJ') {
            a = 27 * num;
        } else if (name == 'DZ') {
            a = 28 * num;
        } else if (name == 'YI') {
            a = 29 * num;
        } else if (name == 'QW') {
            a = 30 * num;
        } else if (name == 'DR') {
            a = 31 * num;
        } else if (name == 'UQ') {
            a = 32 * num;
        } else if (name == 'FU') {
            a = 33 * num;
        } else if (name == 'AQ') {
            a = 34 * num;
        } else if (name == 'GX') {
            a = 35 * num;
        } else if (name == 'OQ') {
            a = 36 * num;
        } else if (name == 'A6') {
            a = 37 * num;
        } else if (name == 'GY') {
            a = 38 * num;
        } else if (name == 'Y8') {
            a = 39 * num;
        }
        return a;
    }

    //获取机场svg
    _getAirSvg = (airCode) =>{
        if(!airCode){
            return (<View></View>); 
        }
       let viewBox = "";
       let path =[];
       const airsvg = _airiconsvg.find(item=>item.attributes.id == "icon-m-"+airCode);
       if(airsvg){
        viewBox = airsvg.attributes.viewBox  
        if(airsvg.children && airsvg.children.length > 0){
            airsvg.children.map((item,index)=>{
                if(item.attributes.d){
                    path.push({d:item.attributes.d,fill:item.attributes.fill})
                }
            })
        }
       }
       if(path.length == 0){
           return (<View></View>); 
       }
        return  (<View>
            <Svg style={{
                    width: 16,
                    height: 16,
                }}  viewBox={viewBox} >
                {
                    path.map((item,index)=>{
                        return <Path d={item.d} fill={item.fill} />
                    })
                }
            </Svg>
            </View>
        )

    }

    render() {
        const { style, onPress, code } = this.props;
        //let top = this._getCodeTop(code);
        return (
            <View style={[styles.view, style]}>
                {/* <Image source={require('../res/image/flight_air_logo.png')}
                    resizeMode='contain'
                    style={{
                        width: 16,
                        height: 1264,
                        marginTop: top * -1,
                        marginLeft: 0
                    }}
                    onPress={onPress} /> */}

                    {
                     this._getAirSvg(code)
                    }
            </View>
        )
    }

}
const styles = StyleSheet.create({
    view: {
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: 16,
        height: 16
    }
})