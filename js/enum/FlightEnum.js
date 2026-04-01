/**
 * 国内机票相关枚举
 */
const FlightEnum = {
    /**
     * 订单状态
     */
    OrderStatus: {
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
    },

    /**
     * 订单分类标签
     */
    OrderStatusLabel: {
        /**
         * 全部
         */
        All: 'All',

        /**
         * 未完成
         */
        UnCompleted: 'UnCompleted',

        /**
         * 未出行
         */
        UnTravel: 'UnTravel',

        /**
         * 待付款
         */
        WaitingPayment: 'WaitingPayment',

        /**
         * 支付超时
         */
        PaymentTimeout: 'PaymentTimeout',

        /**
         * 已出票，已退票，已改签
         */
        Manage: 'Manage',

        /**
         * 为出行订单
         */
        UnUsedTicket:'UnUsedTicket'
    },

    /**
     * 供应商类型
     */
    SupplierType: {

        /**
         * IBE+
         */
        ibePlus: 1,

        /**
         * 官网51Book
         */
        gw51Book: 2,

        /**
         *  春秋航空
         */
        chunqiuAir: 3,
        /**
         *  航办管家
         */
        flightSteWard: 4
    },
    /**
     * 订单类型
     */
    OrderType: {
        /**
         * 订票单
         */
        Issued: 1,
        /**
         * 改签单
         */
        Reissue: 2,
        /**
         * 退票单
         */
        Refund: 3
    }

};

export default FlightEnum;