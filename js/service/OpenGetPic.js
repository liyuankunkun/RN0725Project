
import CommonService from './CommonService';
import RNFetchBlob from 'rn-fetch-blob';
import I18nUtil from '../util/I18nUtil';
// import ImagePicker from 'react-native-image-picker';

export default class OpenGetPic {
    static getFile(_this) {
        return new Promise((resolve, reject) => {
            var options = {
                //底部弹出框选项
                title: I18nUtil.translate('请选择'),
                cancelButtonTitle: I18nUtil.translate('取消'),
                takePhotoButtonTitle: I18nUtil.translate('拍照'),
                chooseFromLibraryButtonTitle: I18nUtil.translate('选择相册'),
                quality: 0.5,
                allowsEditing: false,
                noData: false,
                storageOptions: {
                    skipBackup: false,
                    path: 'images'
                }
            }
            // ImagePicker.showImagePicker(options, (response) => {
            //     if (response.didCancel) {
            //     } else if (response.error) {
            //     } else {
            //          let imageInfo = response
            //             let url = null;
            //             if (response.uri.search('file://') > -1) {
            //                 url = response.uri.slice(7);
            //             } else {
            //                 url = response.uri;
            //             }
            //             let pos = url.lastIndexOf('/')
            //             let fileName = url.slice(pos+1)
            //             let pname = fileName.substring(0, fileName.lastIndexOf("."))
            //             let phouzhui = url.substring(url.lastIndexOf(".")+1)
            //             let data = RNFetchBlob.wrap(url)
            //             let model = [];
            //             model.unshift({ name: pname , data: data, filename: fileName, type:phouzhui});
            //             CommonService.TravelApplyFileUpload(model).then(response => {
            //                 if (response && response.success) {
            //                   response.imageInfo = imageInfo
            //                   resolve(response);
            //                 } else {
            //                   this.toastMsg('上传失败');
            //                 }
            //             }).catch(error => {
            //               this.toastMsg('上传失败');
            //             })
            //     }
            // })
            
        })
    }
}