import {
    Platform, DeviceEventEmitter, NativeModules
} from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
export default class MapService{
    static getCurrentPosition() {
        // if (Platform.OS == 'ios') {
        //     return new Promise((resolve, reject) => {
        //         Geolocation.getCurrentPosition((position) => {
        //             try {
        //                 console.log(NativeModules);
        //                 NativeModules.GeolocationModule.reverseGeoCodeGPS(position.coords.latitude, position.coords.longitude);
        //             }
        //             catch (e) {
        //                 reject(e);
        //                 return;
        //             }
        //             DeviceEventEmitter.once('onGetReverseGeoCodeResult', resp => {
        //                 resp.latitude = parseFloat(resp.latitude);
        //                 resp.longitude = parseFloat(resp.longitude);
        //                 resolve(resp);
        //                 DeviceEventEmitter.removeAllListeners('onGetReverseGeoCodeResult');
        //             });
        //         }, (error) => {
        //             reject(error);
        //             DeviceEventEmitter.removeAllListeners('onGetReverseGeoCodeResult');
        //         }, {
        //             enableHighAccuracy: true,
        //             timeout: 20000,
        //             maximumAge: 1000
        //         });
        //     });
        // }
        // return new Promise((resolve, reject) => {
        //     try {
        //         NativeModules.GeolocationModule.getCurrentPosition();
        //     }
        //     catch (e) {
        //         reject(e);
        //            DeviceEventEmitter.removeAllListeners('onGetCurrentLocationPosition');
        //         return;
        //     }
        //     DeviceEventEmitter.addListener('onGetCurrentLocationPosition', resp => {
        //         resolve(resp);
        //         DeviceEventEmitter.removeAllListeners('onGetCurrentLocationPosition');
        //     });
        // });
    }

    static geocode(city, addeess) {
        // return new Promise((resolve, reject) => {
        //     try {
        //         NativeModules.GeolocationModule.geocode(city, addeess);
        //     }
        //     catch (e) {
        //         reject(e);
        //         return;
        //     }
        //     DeviceEventEmitter.once('onGetGeoCodeResult', resp => {
        //         resolve(resp);
        //     });
        // });
    }



}