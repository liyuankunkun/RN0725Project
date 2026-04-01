
import CommonService from './CommonService';
// import RNFetchBlob from 'rn-fetch-blob';
// import RNFileSelect from 'react-native-file-select-mk';
export default class OpenGetFile {
    static getFile(_this) {
        // return new Promise((resolve, reject) => {
        //     RNFileSelect.showFileList((res) => {
        //         let pos = res.path.lastIndexOf('/')
        //         let fileName = res.path.substr(pos+1)
        //         let pname = fileName.substring(0, fileName.lastIndexOf("."))
        //         let phouzhui = res.path.substring(res.path.lastIndexOf(".")+1)
        //         if(!res){return}
        //         if (res.type === 'cancel') {
        //           //用户取消
        //         } else if (res.type === 'path') {
        //           let data = RNFetchBlob.wrap(res.path)
        //           let model = [];
        //           model.unshift({ name: pname , data: data, filename: fileName, type:phouzhui});
        //         //   选中单个文件
        //           CommonService.OrderFileUpload(model).then(response => {
        //               if (response && response.success) {
        //                 resolve(response.data[0]);
        //               } else {
        //                 //   _this.toastMsg(response.message || '获取数据失败');
        //                 _this.toastMsg('上传失败');
        //               }
        //           }).catch(error => {
        //             //   _this.toastMsg(error.message || '获取数据异常');
        //             _this.toastMsg('上传失败');
        //           })
        //         } else if (res.type === 'paths') {
        //           // 选中多个文件 看管理器支持情况目前采用默认的，只有会调用path
        //         } else if (res.type === 'error') {
        //           // 选择文件失败 
        //           _this.toastMsg('上传失败');
        //         }
        //       })    
        // })
    }
}