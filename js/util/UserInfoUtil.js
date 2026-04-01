

export default class UserInfoUtil {
    /**
     * 
     * @param 用户信息 response 
     */
    static getUser(response,type) {
        if (!response || !response.CertificateList) return {};
        let CertificateList = null;
        if (response.CertificateList && Array.isArray(response.CertificateList) && response.CertificateList.length > 0) {
            if(type&&type==='intlFlight'){
                response.CertificateList.map((item)=>{
                   if(item.Type === 2){
                    CertificateList = item;
                   }
                })
            }else{
                CertificateList = response.CertificateList[0];
            }
        }
        let user = {
            Name: response.Name,
            Mobile: response.Mobile,
            // Company: response.Customer && response.Customer.Name,
            Company: response?.Customer?.Name ?? '',
            CertificateType: CertificateList ? CertificateList.TypeDesc : '身份证',
            CertificateNumber: CertificateList ? CertificateList.SerialNumber : '',
            Certificate: response.Certificate,
            Birthday: response.Birthday ? response.Birthday : '',
            SexDesc: response.SexDesc ? response.SexDesc : '男',
            Id: response.Id,
            IsVip: response.IsVip,
            Email: response.Email,
            DepartmentId: response.DepartmentId,
            DepartmentName: response.DepartmentName,
            Sex: response.Sex ? response.Sex : 1,
            Status: response.Status,
            StatusDesc: response.StatusDesc,
            CustomerName: response.CustomerName,
            CustomerId: response.CustomerId,
            LastName: response.LastName,
            FirstName: response.FirstName,
            Nationality: response.Nationality,
            NationalityCode: response.NationalityCode,
            NationalCode: response && response.NationalCode,
            NationalName: response && response.NationalName,
            IssueNationName: CertificateList && CertificateList.IssueNationName,
            IssueNationCode: CertificateList && CertificateList.IssueNationCode,
            Expire: CertificateList && CertificateList.Expire,
            CertificateExpire: CertificateList && CertificateList.Expire,
            AdditionInfo:response.Addition,
            CardTravellerList:response.CardTravellerList
        }
        return user;
    }
    /**
     * 
     * @param 获取综合订单出差人信息 response 
     */
     static getCompUser(response,type) {
        if (!response || !response.Certificates) return {};
        let Certificates = null;
        if (response.Certificates && Array.isArray(response.Certificates) && response.Certificates.length > 0) {
            if(type&&type==='intlFlight'){
                response.Certificates.map((item)=>{
                   if(item.Type === 2){
                    Certificates = item;
                   }
                })
            }else{
                // Certificates = response.Certificates[0];
                Certificates = Array.isArray(response.Certificates) && response.Certificates.length > 0 ? response.Certificates[0] : null;
            }
        }
        let user = {
            Name: response.Name,
            Mobile: response.Mobile,
            CertificateType: Certificates ? Certificates.TypeDesc : '身份证',
            CertificateNumber: Certificates ? Certificates.SerialNumber : '',
            Certificates: response.Certificates,
            Birthday: response.Birthday ? response.Birthday : '',
            SexDesc: response.Gender===2 ? '女' : '男',
            Id: response.Id,
            GivenName: response.GivenName,
            Surname: response.Surname,
            IsVip: response.IsVip,
            Email: response.Email,
            Sex: response.Gender ? response.Gender : 1,
            Gender: response.Gender ? response.Gender : 1,
            Status: response.Status,
            StatusDesc: response.StatusDesc,
            CostCenter:response.CostCenter,
            NationalCode: Certificates && Certificates.NationalCode,
            NationalName: Certificates && Certificates.NationalName,
            IssueNationName: Certificates && Certificates.IssueNationName,
            IssueNationCode: Certificates && Certificates.IssueNationCode,
            Expire: Certificates && Certificates.Expire,
            CertificateExpire: Certificates && Certificates.Expire,
            AdditionInfo:response.Addition,
            PassengerOrigin:response.PassengerOrigin,
            PassengerType:response.PassengerType,
            SeqNo:response.SeqNo,
            CardTravellerList:response.CardTravellerList,
        }
        return user;
    }

    static ApproveOrigin(response) {
        if (!response || !response.Department) return {};
        return {
            OriginType: 2, //默认是部门出差
            DepartmentId: response.Department.Id,
            DepartmentName: response.Department&&response.Department.Name,
            ProjectId: '0',
            ProjectName: '',
            ApproverId: '0',
            ApproverName: ''
        }
    }

    static Addition(response) {
        if (!response || !response.Setting || !response.Setting || !response.Setting.OrderPageConfig) return [];
        let additionArr = [];
        let obj = response.Setting.OrderPageConfig;
        if (obj.IsShowApproveNo) {
            additionArr.push({
                name: '审批单号',
                en: 'ApproveNo',  // TravelResult  CostCenter  Remark
                value: '',
                state: obj.IsApproveNoRequired
            })
        }
        if (obj.IsShowTravelReason) {
            additionArr.push({
                name: '出差原因',
                en: 'TravelResult',
                value: '',
                state: obj.IsTravelReasonRequired
            })
        }
        if (obj.IsShowCostCenter) {
            additionArr.push({
                name: '成本中心',
                en: 'CostCenter',
                value: '',
                state: obj.IsCostCenterRequired
            })
        }
        if (obj.IsShowRemark) {
            additionArr.push({
                name: '备注',
                en: 'Remark',
                value: '',
                state: obj.IsRemarkRequired
            })
        }
        return additionArr;
    }


    static DeliveryItems(customerInfo) {
        if (!customerInfo || !customerInfo.Setting) return [];
        let arr = [];
        if (customerInfo.Setting.InvoiceRequestSetting && customerInfo.Setting.InvoiceRequestSetting.DeliveryItems) {
            customerInfo.Setting.InvoiceRequestSetting.DeliveryItems.forEach(item => {
                item.Remark?
                arr.push(item.DisplayName + '(' + item.Remark + ')')
                :
                arr.push(item.DisplayName )
            })
        }
        return arr;
    }

    static ApplyEmployee(apply, list) {
        if (!apply || !apply.TravellerList) return [];
        apply.TravellerList.forEach(item => {
            if (item.EmployeeId) {
                item.Certificate = item.Certificate || {};
                let obj = {
                    Name: item.Name,
                    Mobile: item.Mobile,
                    CertificateType: item.Certificate.TypeDesc,
                    CertificateNumber: item.Certificate.SerialNumber,
                    Certificate: item.Certificate,
                    Birthday: item.Certificate.Birthday ? item.Certificate.Birthday : item.Birthday,
                    SexDesc: item.Sex === 1 ? '男' : (item.Sex === 2 ? '女' : ''),
                    Id: item.EmployeeId,
                    IsVip: item.IsVip,
                    Email: item.Email,
                }
                list.push(obj);
            }
        })
    }
    static ApplyTravller(apply, list) {
        if (!apply || !apply.TravellerList) return [];

        apply.TravellerList.forEach(item => {
            if (!item.EmployeeId) {
                item.Certificate = item.Certificate || {};
                let obj = {
                    Name: item.Name,
                    Mobile: item.Mobile,
                    CertificateType: item.Certificate.TypeDesc,
                    CertificateNumber: item.Certificate.SerialNumber,
                    Certificate: item.Certificate,
                    Birthday: item.Certificate.Birthday ? item.Certificate.Birthday : item.Birthday,
                    SexDesc: item.Sex === 1 ? '男' : (item.Sex === 2 ? '女' : ''),
                    Id: item.EmployeeId,
                    IsVip: item.IsVip,
                    Email: item.Email
                }
                list.push(obj);
            }
        })
    }
    static filterEmployee(employees,filterEmployeeList) {
        employees.map((item)=>{
            if(item.PassengerOrigin.Type==1){
                filterEmployeeList.push(item);
            }
        })
    }
}