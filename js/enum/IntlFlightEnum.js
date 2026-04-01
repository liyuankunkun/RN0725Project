/**
 * 国际机票枚举
 */
const IntlFlightEnum = {
    /**
     * 舱位
     */
    cabins: [{ name: '不限', code: null },{ code: 'ECONOMY', name: '经济舱' }, { code: 'PREMIUM_ECONOMY', name: '超值经济舱' }, { code: 'BUSINESS', name: '公务舱' }, { code: 'FIRST', name: '头等舱' }],
    /**
     * 有效证件
     */
    validCertificates: [
        { type: 2, desc: '护照', descEn:'Passport' }, 
        { type: 8, desc: '台湾通行证', descEn:'Taiwan Travel Permit for Mainland Residents' }, 
        { type: 16, desc: '港澳通行证', descEn:'Exit-Entry Permit for Travelling to and from Hong Kong and Macao' },
        {type:4,desc:'台湾居民来往大陆通行证', descEn:'Mainland Travel Permit for Taiwan Residents'},
        {type:128,desc:'港澳居民来往内地通行证', descEn:'Mainland Travel Permit for Hong Kong and Macao Residents'},
        {type:512,desc:'港澳台居民居住证', descEn:'Residence Permit for Hong Kong,Macau and Taiwan Residents'},
        {type:1024,desc:'外国人永久居留身份证', descEn:"Foreigner's Permanent Residence ID Card"}
    ],
    /**
     * 订单状态
     */
    orderStatus: {
        /**
         * None
         */
        None: 0,

        /**
         * 待审批
         */
        CheckPending: 2,

        /**
         * 审批中
         */
        Approving: 2,

        /**
         * 出票中
         */
        TicketInDrawer: 3,

        /**
         * 已出票
         */
        TicketIssued: 4,

        /**
         * 已驳回
         */
        Refused: 5,

        /**
         * 退票中
         */
        TicketRefunding: 6,

        /**
         * 已退票
         */
        TicketRefunded: 7,

        /**
         * 改签中
         */
        TicketRescheduling: 8,

        /**
         * 已改签
         */
        TicketRescheduled: 9,

        /**
         * 已取消
         */
        Canceled: 10,

        /**
         * 出票失败
         */
        TicketFailure: 11,

        /**
         * 待付款
         */
        WaitingPayment: 12,

        /**
         * 已支付
         */
        AlreadyPay: 13,

        /**
         * 占座中
         */
        TicketOccupying: 15,

        /**
         * 占座成功
         */
        TicketOccupyed: 16,
    },
    /**
     * 改签单状态
     */
    reissueOrderStatus: {
        /**
         * 改签中
         */
        Reissuing: 1,
        /**
         * 已取消
         */
        Cancel: 4,
        /**
         * 已改签
         */
        Success: 10,
        /**
         * 改签待支付
         */
        WaitPay: 11,
        /**
         * 改签已支付
         */
        Paid: 12,
        /**
         * 已改签
         */
        Reissued: 20,
        /**
         * 退票中
         */
        Refunding: 30,
        /**
         * 已退票
         */
        Refunded: 31,
    },
    /**
     * 退票单状态
     */
    refundOrderStatus: {
        /**
         * 退票中
         */
        Refunding: 1,
        /**
         * 取消退票
         */
        Cancel: 4,
        /**
         * 退票成功
         */
        Success: 10,
    },
    /**
     * 订单标签
     */
    statusLabel: {
        /**
         * 待出票
         */
        WaitIssue: 'WaitIssue',
        /**
         * 退改订单
         */
        RefundAndRes: 'RefundAndRes',
        /**
         * 未出行订单
         */
        WaitTrip: 'WaitTrip',
        /**
         * 已出票
         */
        Issued: 'Issued'
    }
};
export default IntlFlightEnum;