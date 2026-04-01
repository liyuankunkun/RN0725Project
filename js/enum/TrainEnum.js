
/**
 * 火车票相关枚举
 */
const TrainEnum = {
    /**
     * 订单状态
     */
    OrderStatus: {
        /**
         * 出票中
         */
        TicketInDrawer: 1,
        /**
         * 已出票
         */
        TicketIssued: 2,
        /**
         * 退票中
         */
        TicketRefunding: 3,
        /**
         * 已退票
         */
        TicketRefunded: 4,
        /**
         * 改签中
         */
        TicketReissuing: 5,
        /**
         * 已改签
         */
        TicketReissued: 6,
        /**
         * 已取消
         */
        Canceled: 10,
        /**
         * 待审批
         */
        CheckPending: 12,
        /**
         * 审批中
         */
        Approving: 12,
        /**
         * 已驳回
         */
        Refused: 15,
        /**
         * 占座中
         */
        SeatApply: 16,
        /**
         * 占座失败
         */
        SeatApplyFail: 17,
        /**
         * 占座成功
         */
        SeatApplySuccess: 18,
        /**
         * 退票失败
         */
        TicketRefundFail: 19,
        /**
         * 改签失败
         */
        TicketReissueFail: 20
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
    },
    /**
     * 订单标签
     */
    OrderStatusLabel: {
        /**
         * 未完成
         */
        UnCompleted: 'UnCompleted',
        /**
         * 未出行
         */
        UnTravel: 'UnTravel',
        /**
         * 出票中
         */
        Issueing: 'Issueing',
        /**
         * 已出票
         */
        TicketIssued: 'TicketIssued',
        /**
         * 退改订单
         */
        TicketChanged: 'TicketChanged'
    },
       /**
     * 预订须知
     */
    trainOrderNotice:{
        cn:`
        12306车票改签费用收取标准（不含广深港跨境列车）：
        车票仅允许进行一次改签；
        距票面乘车站开车前48小时以上改签时，或开车前不足48小时改签票面乘车日期及以前的列车时，以及开车后在当日24时之前改签当日其他列车时，均不收改签费；
        开车前24小时以上、不足48小时，改签票面乘车日期之后的列车时，按改签前后低票价车票票面价格的5%计；
        开车前不足24小时，改签票面乘车日期之后的列车时，按改签前后低票价车票票面价格的15%计；
        开车后在当日24时之前，改签次日及以后列车时，按改签前后低票价车票票面价格的40%计。
        上述计算的尾数以5角为单位，尾数小于2.5角的舍去、2.5角（含）以上且小于7.5角的计为5角、7.5角（含）以上的进为1元。

        12306车票退票费用收取标准（不含广深港跨境列车）：
        开车前8天（含）以上退票的，不收取退票费；
        票面乘车站开车时间前48小时以上的按票价5%计，24小时以上、不足48小时的按票价10%计，不足24小时的按票价20%计；
        距票面乘车站开车前不足8天的车票，改签至开车前8天以上的列车，又在距开车前8天以上退票的，核收5%的退票费；
        办理车票改签或“变更到站”时，新车票票价低于原车票的，退还差额，对差额部分核收退票费并执行现行退票费标准；
        开车后办理车票改签产生票价差额需退还时，按开车前不足24小时标准对票价差额部分核收退票费；
        改签或者变更到站后的车票乘车日期在春运期间的，再退票时按票面价格的20%核收退票费。
        上述计算的尾数以5角为单位，尾数小于2.5角的舍去、2.5角（含）以上且小于7.5角的计为5角、7.5角（含）以上的进为1元。退票费最低按2元计收。
        `,
        en:`
        12306.cn ticket change rules (exclude Guangzhou-Shenzhen-Hongkong cross-boarder Express):
        Passengers can change the ticket once;
        No fees apply for changes made over 48 hours before departure or changes made 24 to 48 hours before departure if switching to a train departing before 24:00 of the departure date. Additionally,changes made after the train departs for switching to a same-day train are exempt from fees;
        5% of the lower fare for changes made 24 to 48 hours before departure to a train departing later than the original date;
        15% of the lower fare for changes made less than 24 hours before departure to a train departing later than the original date;
        40% of the lower fare for changes to a next-day (or later) train after the train departs;
        The above calculated change fee shall be rounded up to RMB 0.5, with the value less than RMB 0.25 rounded off, that more than RMB 0.25 (inclusive) and less than RMB 0.75 taken as RMB 0.5, and value more than RMB 0.75 (inclusive) rounded to RMB 1.
        
        12306.cn ticket refund rules (exclude Guangzhou-Shenzhen-Hongkong cross-boarder Express):
        No refund fee is charged if the ticket is refunded more than 8 days (including) before the departure date;
        5% of the ticket price is charged if the ticket is refunded more than 48hrs before the train departure; 10% is charged if less than 48hrs and more than 24hrs; 20% is charged if less than 24hrs;
        If the ticket is endorsed or if the destination station of the ticket is changed between 48 hours to 8 days before the train departure time, to another train schecduled to depart at least 8 days later ,5% refund fee shall be charged for the endorsed/changed ticket even if the ticket is refunded at least 8 days before train departure.
        When processing ticket change or "change of destination", if the price of the new ticket is lower than the original, the difference will be refunded after a refund service fee is charged to the price difference as per the existing refund service fee rules;
        The ticket changes after the departure of the train, if there is a fare difference that needs to be refunded from the original ticket, the refund fee is charged as 20% in accordance less than 24 hours before the departure;
        If the train for ticket endorsed or ticket with its destination station changed is scheduled to depart within the Spring Festival peak season, the refund service fee will be uniformly charged as 20% of the ticket price.
        The above calculated refund fee shall be rounded up to RMB 0.5, with the value less than RMB 0.25 rounded off, that more than RMB 0.25 and less than RMB 0.75 taken as RMB 0.5, and the value more than RMB 0.75 rounded to RMB 1. The minimum refund fee is RMB 2.
        `
    },
    trainOrderNoticeGSG:{
        cn:`
        12306广深港跨境列车改签费用标准：
        在车票预售期内且有运输能力的前提下，旅客仅可办理一次改签手续，不办理发到站变更；
        办理改签应不晚于车票指定的日期、车次开车前30分钟，但发站为香港西九龙站的车票应不晚于45分钟；
        办理改签时，改签后的车票票价高于原车票票价时，补收差额；低于原车票票价时，退还差额；
        旅客在车内要求变更席别时，变更后的席别票价高于原票价时，核收票价差额；低于原票价时，票价差额不予退还；

        12306广深港跨境列车退票费用标准：
        改签后的车票不得退票;
        办理退票应不晚于车票指定的日期、车次开车前30分钟，但发站为香港西九龙站的车票应不晚于45分钟;
        在车票开车时间前48小时内办理退票的，按车票票价的50%计算；
        在车票开车时间前48小时至第7天的，按车票票价的30%计算；
        在车票开车时间前8天及以上的，按车票票价的5%计算;
        退票费按元计算，不足一元的部分舍去免收;
        `,
        en:`
        12306.cn Guangzhou-Shenzhen-Hongkong cross-boarder express change rules:
        Passenger can change the ticket once with no change to the destination subject to the railway availability;
        The ticket change should be done no later than 30 minutes before departure of the train; However, for the tickets departing from Hong Kong West Kowloon the change should be done no later than 45 minutes before departure of the train;
        When ticket change, if the price of the new ticket is higher than the original, the price difference will be charged; if the price of the new ticket is lower than the original, the price difference will be refunded;
        When passenger requests a change of seat class after on-boarding, if the price of the new ticket is higher than the original, the price difference will be charged; if the price of the new ticket is lower than original, the price difference will not be refunded.

        12306.cn Guangzhou-Shenzhen-Hongkong cross-boarder express refund rules:
        The changed tickets can't be refunded;
        The ticket refund should be done no later than 30 minutes before departure of the train; However, for the tickets departing from Hong Kong West Kowloon the refund should be done no later than 45 minutes before departure of the train;
        50% of the ticket price is charged if the ticket is refunded within 48 hours before departure;
        30% of the ticket price is charged if the ticket is refunded between 48 hours and 7 days before departure;
        5% of the ticket price is charged if the ticket is refunded more than 8 days (inclusive) before departure;
        The above refund fee is calculated in RMB, with the value less than RMB 1 will be rounded off.
        `
    },
    trainChangeNotice:{//改签须知
        cn:`
        12306车票改签费用收取标准（不含广深港跨境列车）：
        车票仅允许进行一次改签；
        距票面乘车站开车前48小时以上改签时，或开车前不足48小时改签票面乘车日期及以前的列车时，以及开车后在当日24时之前改签当日其他列车时，均不收改签费；
        开车前24小时以上、不足48小时，改签票面乘车日期之后的列车时，按改签前后低票价车票票面价格的5%计；
        开车前不足24小时，改签票面乘车日期之后的列车时，按改签前后低票价车票票面价格的15%计；
        开车后在当日24时之前，改签次日及以后列车时，按改签前后低票价车票票面价格的40%计。
        上述计算的尾数以5角为单位，尾数小于2.5角的舍去、2.5角（含）以上且小于7.5角的计为5角、7.5角（含）以上的进为1元。`,
        en:`
        12306.cn ticket change rules (exclude Guangzhou-Shenzhen-Hongkong cross-boarder Express):
        Passengers can change the ticket once;
        No fees apply for changes made over 48 hours before departure or changes made 24 to 48 hours before departure if switching to a train departing before 24:00 of the departure date. Additionally,changes made after the train departs for switching to a same-day train are exempt from fees;
        5% of the lower fare for changes made 24 to 48 hours before departure to a train departing later than the original date;
        15% of the lower fare for changes made less than 24 hours before departure to a train departing later than the original date;
        40% of the lower fare for changes to a next-day (or later) train after the train departs;
        The above calculated change fee shall be rounded up to RMB 0.5, with the value less than RMB 0.25 rounded off, that more than RMB 0.25 (inclusive) and less than RMB 0.75 taken as RMB 0.5, and value more than RMB 0.75 (inclusive) rounded to RMB 1.`,
    },
    trainRefundNotice:{//退票须知
        cn:`
        12306车票退票费用收取标准（不含广深港跨境列车）：
        开车前8天（含）以上退票的，不收取退票费；
        票面乘车站开车时间前48小时以上的按票价5%计，24小时以上、不足48小时的按票价10%计，不足24小时的按票价20%计；
        距票面乘车站开车前不足8天的车票，改签至开车前8天以上的列车，又在距开车前8天以上退票的，核收5%的退票费；
        办理车票改签或“变更到站”时，新车票票价低于原车票的，退还差额，对差额部分核收退票费并执行现行退票费标准；
        开车后办理车票改签产生票价差额需退还时，按开车前不足24小时标准对票价差额部分核收退票费；
        改签或者变更到站后的车票乘车日期在春运期间的，再退票时按票面价格的20%核收退票费。
        上述计算的尾数以5角为单位，尾数小于2.5角的舍去、2.5角（含）以上且小于7.5角的计为5角、7.5角（含）以上的进为1元。退票费最低按2元计收。`,
        en:`
        12306.cn ticket refund rules (exclude Guangzhou-Shenzhen-Hongkong cross-boarder Express):
        No refund fee is charged if the ticket is refunded more than 8 days (including) before the departure date;
        5% of the ticket price is charged if the ticket is refunded more than 48hrs before the train departure; 10% is charged if less than 48hrs and more than 24hrs; 20% is charged if less than 24hrs;
        If the ticket is endorsed or if the destination station of the ticket is changed between 48 hours to 8 days before the train departure time, to another train schecduled to depart at least 8 days later ,5% refund fee shall be charged for the endorsed/changed ticket even if the ticket is refunded at least 8 days before train departure.
        When processing ticket change or "change of destination", if the price of the new ticket is lower than the original, the difference will be refunded after a refund service fee is charged to the price difference as per the existing refund service fee rules;
        The ticket changes after the departure of the train, if there is a fare difference that needs to be refunded from the original ticket, the refund fee is charged as 20% in accordance less than 24 hours before the departure;
        If the train for ticket endorsed or ticket with its destination station changed is scheduled to depart within the Spring Festival peak season, the refund service fee will be uniformly charged as 20% of the ticket price.
        The above calculated refund fee shall be rounded up to RMB 0.5, with the value less than RMB 0.25 rounded off, that more than RMB 0.25 and less than RMB 0.75 taken as RMB 0.5, and the value more than RMB 0.75 rounded to RMB 1. The minimum refund fee is RMB 2.`,
    },
    trainChangeNoticeGSG:{
        cn:`
        12306广深港跨境列车改签费用标准：
        在车票预售期内且有运输能力的前提下，旅客仅可办理一次改签手续，不办理发到站变更；
        办理改签应不晚于车票指定的日期、车次开车前30分钟，但发站为香港西九龙站的车票应不晚于45分钟；
        办理改签时，改签后的车票票价高于原车票票价时，补收差额；低于原车票票价时，退还差额；
        旅客在车内要求变更席别时，变更后的席别票价高于原票价时，核收票价差额；低于原票价时，票价差额不予退还；`,
        en:`
        12306.cn Guangzhou-Shenzhen-Hongkong cross-boarder express change rules:
        Passenger can change the ticket once with no change to the destination subject to the railway availability;
        The ticket change should be done no later than 30 minutes before departure of the train; However, for the tickets departing from Hong Kong West Kowloon the change should be done no later than 45 minutes before departure of the train;
        When ticket change, if the price of the new ticket is higher than the original, the price difference will be charged; if the price of the new ticket is lower than the original, the price difference will be refunded;
        When passenger requests a change of seat class after on-boarding, if the price of the new ticket is higher than the original, the price difference will be charged; if the price of the new ticket is lower than original, the price difference will not be refunded.`
    },
    trainRefundNoticeGSG:{
        cn:`
        12306广深港跨境列车退票费用标准：
        改签后的车票不得退票;
        办理退票应不晚于车票指定的日期、车次开车前30分钟，但发站为香港西九龙站的车票应不晚于45分钟;
        在车票开车时间前48小时内办理退票的，按车票票价的50%计算；
        在车票开车时间前48小时至第7天的，按车票票价的30%计算；
        在车票开车时间前8天及以上的，按车票票价的5%计算;
        退票费按元计算，不足一元的部分舍去免收;`,
        en:`
        12306.cn Guangzhou-Shenzhen-Hongkong cross-boarder express refund rules:
        The changed tickets can't be refunded;
        The ticket refund should be done no later than 30 minutes before departure of the train; However, for the tickets departing from Hong Kong West Kowloon the refund should be done no later than 45 minutes before departure of the train;
        50% of the ticket price is charged if the ticket is refunded within 48 hours before departure;
        30% of the ticket price is charged if the ticket is refunded between 48 hours and 7 days before departure;
        5% of the ticket price is charged if the ticket is refunded more than 8 days (inclusive) before departure;
        The above refund fee is calculated in RMB, with the value less than RMB 1 will be rounded off.`
    }
        
};
export default TrainEnum;