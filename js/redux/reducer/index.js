
import { combineReducers } from 'redux'

import journey from './journey';
import language from './language';
import feeType from './feeType';
import passenger from './passenger';
import apply from './apply';
import consume from './consume';
import enterpriseOrder from './enterpriseOrder';
import comp_userInfo from './comp_userInfo';
import compSwitch from './compSwitch';
import comp_travelers from './comp_travelers';
import compMassOrderId from './compMassOrderId';
import compCreate_bool from './compCreate_bool';
import comp_checkTravellers from './comp_checkTravellers';
import customerInfo_userInfo from './customerInfo_userInfo';
import compReferenceEmployee from './compReferenceEmployee';
import hotelCanselRule from './hotelCanselRule';
import highRisk from './highRisk';
import highRisk2 from './highRisk2';
import hotel_shareArr from './hotel_shareArr';
import airportEnName from './airportEnName';
import profileCommonEnum from './profileCommonEnum'; 
// import theme from './theme';
export default combineReducers({ 
    journey, 
    language, 
    feeType,
    passenger,
    apply, 
    consume,
    enterpriseOrder,
    // theme,
    comp_userInfo,
    compSwitch,
    comp_travelers,
    compMassOrderId,
    compCreate_bool,
    comp_checkTravellers,
    customerInfo_userInfo,
    compReferenceEmployee,
    hotelCanselRule,
    highRisk,
    highRisk2,
    hotel_shareArr,
    airportEnName,
    profileCommonEnum,
 });