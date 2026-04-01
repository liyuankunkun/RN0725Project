import { onRefreshJoruney, journeyChangeText, onLoadMoreJourney, journeyChangeCurrentType, journeySeach } from './journey';
import { onRefreshConsume , onLoadMoreConsume, consumeChangeCurrentType,consumeSeach,consumeClean } from './consume';
import { languageChange, languageLoad } from './language';
import { feeTypeTransform } from './feeType';
import {passengerLoad,passengerLoadMore,passengerReset} from './passenger';
import {applySet} from './apply';
import {loadFlightData} from './enterpriseOrder/index.js';
import {onLoadcomprehensiveData} from './comp_userInfo';
import {loadComprehensiveSwitch} from './compSwitch';
import {setComp_travellers} from './comp_travelers';
import {setComp_Id} from './compMassOrderId';
import {onClickSure} from './compCreate_bool';
import {setCheckTravellers} from './comp_checkTravellers';
import {setCustomer_userInfo} from './customerInfo_userInfo';
import {setReferenceEmployee} from './setReferenceEmployee';
import {loadHotelCanselRule} from './hotelCanselRule'
import {highRiskSetData} from './highRisk';
import {highRiskSetData2} from './highRisk2';
import {setHotelShareArr} from './hotle_shareArr';
import {getAirPortEnName} from './airportEnName';
import {getProfileCommonEnum} from './ProfileCommonEnum';
// import {onThemeChange} from './theme';
export default {
    onRefreshJoruney,
    journeyChangeText,
    onLoadMoreJourney,
    journeySeach,
    journeyChangeCurrentType,
    languageChange,
    languageLoad,
    feeTypeTransform,
    passengerLoad,
    passengerLoadMore,
    passengerReset,
    applySet,
    onRefreshConsume,
    onLoadMoreConsume,
    consumeSeach,
    consumeChangeCurrentType,
    consumeClean,
    loadFlightData,//获取企业航班订单
    // onThemeChange,
    onLoadcomprehensiveData,
    loadComprehensiveSwitch,
    setComp_travellers,
    setComp_Id,
    onClickSure,
    setCheckTravellers,
    setCustomer_userInfo,
    setReferenceEmployee,
    loadHotelCanselRule,
    highRiskSetData,
    highRiskSetData2,
    setHotelShareArr,
    getAirPortEnName,
    getProfileCommonEnum
}
