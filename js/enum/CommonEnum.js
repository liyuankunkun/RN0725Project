/**
 * 公共枚举
 */
const CommonEnum = {
    /**
     * 订单类型
     */
    OrderType: {
        /**
         * 国内机票
         */
        flight: 'flight',
        /**
         * 国际机票
         */
        intlFlight: 'intlFlight',
        /**
         * 火车票
         */
        train: 'train',
        /**
         * 国内酒店
         */
        hotel: 'hotel',
        /**
         * 港澳台及国际酒店
         */
        intlHotel: 'intlHotel'
    },
    orderIdentification: {
        //国内机票
        flight: 1,
        //保险
        insurance: 2,
        //国内机票改签
        flightRescheduling: 3,
        //国内酒店
        hotel: 4,
        // 火车票
        train: 5,
        //国内酒店
        intlHotel: 6,
        //国际机票
        intlFlight: 7,
        //需求单
        requisition: 8,
        //用车
        userCar: 9,
        //其他
        other: 14,
    },
    /**
     * 审批状态
     */
    approvedStatus: {
        /**
         * 批准
         */
        Approve: 1,

        /**
         * 驳回
         */
        Reject: 2
    },
    /**
     * 语言类型
     */
    languageType: {
        /**
         * 汉语
         */
        zh: 'zh',
        /**
         * 英语
         */
        en: 'en'
    },
    /**
     * 支付类型
     */
    SettleType: {
        // 企业月结
        Credit: 1,
        // 企业钱包
        Prestored: 2,
        // 在线支付
        Cash: 3
    },

    /**
     *  支付单类型
     */
    PaymnetSettleType: {
        // 企业月结
        Credit: 1,
        // 企业钱包
        Prestored: 3,
        // 在线支付
        Cash: 2
    },
    /**
     *  业务类目
     */
    BusinessCategogry:{
        /**
         * 1：国内机票
         */
        Flight: 1,
        /**
         * 2：火车票
         */
        Train: 2,
         /**
         * 4：国内酒店
         */
        Hotel: 4,
         /**
         * 8：国际机票
         */
        IntlFlight: 8,
         /**
         * 16：国际酒店
         */
        Foreignhotel: 16,
         /**
         * 32：用车
         */
        car:32,
    },
    /**
     *  业务类目
     */
    CategogryId:{
        /**
         * 1：国内机票
         */
        flight: 1,
        /**
         * 2：火车票
         */
        train: 5,
         /**
         * 4：国内酒店
         */
        hotel: 4,
         /**
         * 8：国际机票
         */
        intlFlight: 7,
         /**
         * 16：国际酒店
         */
        intlHotel: 6,
         /**
         * 32：用车
         */
        comp:13,
    }
}

export default CommonEnum;