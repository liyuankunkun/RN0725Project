
import {
    Dimensions,
    Platform,
} from 'react-native';


export default class DeviceUtil {

    /**
     *  鉴定是刘海屏
     */
    static is_iphonex() {
        const { width, height } = Dimensions.get('screen');
        if (Platform.OS) {
            if ((height === 812 && width === 375) || // X和XS和11pro
                (height === 896 && width === 414) || //XR和XSMax和11
                (height === 896 && width === 414) || //XR和XSMax和11
                (height === 852 && width === 393) || // 14 Pro
                (height === 932 && width === 430) || // 14 Pro Max
                (height === 844 && width === 390) || // 15 Pro
                (height === 926 && width === 428) || // 15 Pro Max
                (height === 874 && width === 402) || // 16 Pro
                (height === 956 && width === 440) || // 16 Pro Max
                (height === 852 && width === 393) || // 16
                (height === 932 && width === 430)   // 16 Plus
            ) {
                return true;
            }
        }
        return false;
    }

}