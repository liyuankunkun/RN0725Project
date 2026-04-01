import ApprovalListScreen from './ApprovalListScreen';
const approvalConfig = {

    ApprovalList: {
        screen: ApprovalListScreen
    }
}




for (const key in approvalConfig) {
    if (approvalConfig.hasOwnProperty(key)) {
        const element = approvalConfig[key];
        element.navigationOptions = {
            header: null
        }
    }
}

export default approvalConfig;