export default class MerchantPriceUtil {
    /**
     * 
     * @param {*} category 业务类型
     * @param {*} customerInfo 
     * @param {*} price 总价
     * @param {*} serviceCharge 服务费
     * @param {*} personlCost 个人支付
     * @param {*} feeType 因公因私
     * @returns 
     */
    static merchantPrice(category, customerInfo, price, serviceCharge, personlCost=0, feeType,needCreditCard) {
       //totalamount在线支付金额
       var totalAmount = 0;
       if(!customerInfo || !customerInfo.Setting){return}
       if(category===1){
           if(customerInfo.Setting.IsPaymentOnline || feeType==2){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsAirServiceFee || feeType==2)
           {
               totalAmount+=serviceCharge;
           }
       }else if(category == 7){
           if(customerInfo.Setting.IsIntlFlightPaymentOnline || feeType==2){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsIntlAirServiceFee || feeType==2)
           {
               totalAmount+=serviceCharge;
           }
       }else if(category == 4){
           if(customerInfo.Setting.IsHotelOrderPaymentOnline || feeType==2){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsHotelServiceFees|| feeType==2)
           {
               totalAmount+=serviceCharge;
           }
       }else if(category == 6){
           if(customerInfo.Setting.IsForeignHotelOrderPaymentOnline || feeType==2){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsForeignHotelServiceFees || feeType==2)
           {
               totalAmount+=serviceCharge;
           }
       }else if(category == 5){
           if(customerInfo.Setting.IsTrainOrderPaymentOnline || feeType==2){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsTrainServiceFees || feeType==2)
           {
               totalAmount+=serviceCharge;
           }
       }else if(category == 9){
           if(customerInfo.Setting.IsCarOrderPaymentOnline){
               totalAmount += price;
           }
           if(customerInfo.Setting.PaymentConfig.IsCarServiceFee)
           {
               totalAmount+=serviceCharge;
           }
       }
       if(customerInfo.SettleType==3)
       {
         //现结重新赋值
         totalAmount = price + serviceCharge;
       }
       //国内酒店超标现付
       if(category==4 && personlCost>0){
           totalAmount = personlCost;
       }

       if(totalAmount!= 0 && customerInfo.Setting.PaymentConfig.IsMerchantFees && customerInfo.Setting.PaymentConfig.MerchantFeesRate !=0){
        let n = Math.pow(10, 2)
        let num = totalAmount * customerInfo.Setting.PaymentConfig.MerchantFeesRate / 100
        if(needCreditCard){
            num = serviceCharge * customerInfo.Setting.PaymentConfig.MerchantFeesRate / 100
        }
         return (Math.ceil(num * n) / n)
       }
       return 0;
    }
    
}