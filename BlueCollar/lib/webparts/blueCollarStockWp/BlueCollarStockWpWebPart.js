var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Version } from "@microsoft/sp-core-library";
import { PropertyPaneTextField, } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import pnp from "sp-pnp-js";
import * as strings from "BlueCollarStockWpWebPartStrings";
import "@pnp/sp/sputilities";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups";
import * as $ from "jquery";
import "jqueryui";
import { SPComponentLoader } from "@microsoft/sp-loader";
import "datatables.net";
import { ISPEmail, } from "./Models/ClothingModel";
import AccordionTemplate from "./Models/AccordionTemplate";
import { SPHttpClient, } from "@microsoft/sp-http";
let periodType = "";
let periodItems = 0;
let DateFromPeriod = null;
let DateToPeriod = null;
export default class BlueCollarStockWpWebPart extends BaseClientSideWebPart {
    constructor() {
        super();
        SPComponentLoader.loadCss("//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css");
        SPComponentLoader.loadCss("//cdn.datatables.net/1.11.4/css/jquery.dataTables.min.css");
    }
    onInit() {
        return super.onInit().then((_) => {
            pnp.setup({
                spfxContext: this.context,
            });
        });
    }
    render() {
        this.domElement.innerHTML = AccordionTemplate.templateHtml;
        this.DrawStockTransactionsTable();
        const accordionOptions = {
            animate: true,
            collapsible: true,
            heightStyle: "content",
            icons: {
                header: "ui-icon-circle-arrow-e",
                activeHeader: "ui-icon-circle-arrow-s",
            },
        };
        jQuery(".accordion", this.domElement).accordion(accordionOptions);
        $(".ui-accordion-header").css("font-size", "120%");
        $(".ui-accordion.ui-accordion-content").css("height", "auto !important");
        $($('.CanvasSection.CanvasSection-col.CanvasSection-sm12').parent()).css("max-width", "100%");
        document.getElementById("btnSearch").addEventListener("click", () => {
            this.GetEmpData();
        });
        document.getElementById("btnExceptSearch").addEventListener("click", () => {
            this.GetExceptEmpData();
        });
        this.LoadConsumableItems();
    }
    //#region Deliever Items
    GetEmpData() {
        return __awaiter(this, void 0, void 0, function* () {
            let empNo = $("#txtEmpNO").val();
            const resPeriods = yield this._getPeriodTypes();
            if (resPeriods.length <= 0) {
                alert("لا يوجد فترات نرجو التواصل مع الموارد البشريه");
                return;
            }
            this._getPeriodType(resPeriods);
            const resEmp = yield this._getEmpData(empNo.toString());
            if (resEmp.length <= 0) {
                alert("هذا العامل غير موجود");
                return;
            }
            if (resEmp[0].EmployeeStatus != "Active") {
                alert("هذا العامل غير مفعل نرجو التواصل مع الموارد البشريه لتفعيل العامل");
                return;
            }
            let tableBody = document.getElementById("tbodyEmpData");
            let tableRows = "";
            tableRows += "<tr>";
            tableRows += `<td align="center"><label class="empName">${resEmp[0].Title}</label></td>`;
            tableRows += `<td align="center"><label class="empNo">${resEmp[0].EmployeeNumber}</label></td>`;
            tableRows += `<td align="center"><label class="empType">${resEmp[0].EmployeeType.Title}</label></td>`;
            tableRows += `<td align="center"><label class="empCost">${resEmp[0].CostCenter}</label></td>`;
            tableRows += `<td align="center"><label class="empLocation">${resEmp[0].Location}</label></td>`;
            tableRows += "</tr>";
            tableBody.innerHTML = tableRows;
            $("#tbEmpData").css("display", "inline-table");
            $("#tbEmpData").DataTable({
                destroy: true,
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                responsive: true,
                autoWidth: true,
            });
            const resClothing = yield this._getEmpTypeClothing(resEmp[0].EmployeeType.Id);
            if (resClothing.length <= 0) {
                alert("وظيفه هذا العامل لا يوجد لها انواع ملابس نرجو التواصل مع الموارد البشريه");
                return;
            }
            const resSize = yield this._getClothingSizesItems();
            if (resSize.length <= 0) {
                alert("لا يوجد مقاسات لانواع الملابس نرجو التواصل مع الموارد البشريه");
                return;
            }
            //check here if the user has items recieved for current period or not
            tableBody = document.getElementById("tbodyEmpClothing");
            tableRows = "";
            for (let index = 0; index < resClothing.length; index++) {
                const item = resClothing[index];
                const resInStock = yield this._getItemsInStock(item.ClothingType.Id);
                let selectHTML = "";
                selectHTML += "<select class='ddlSize' style='width: 50% !Important;'>";
                resInStock.forEach((itemRemaining) => {
                    selectHTML += `<option class="ddl" value="${itemRemaining.Size.Id}">${itemRemaining.Size.Title}</option>`;
                });
                selectHTML += "</select>";
                tableRows += "<tr>";
                tableRows += `<td align="center"><label class="clothingType" title="${item.ClothingType.Id}">${item.ClothingType.Title}</label></td>`;
                tableRows += `<td align="center"><label class="empType" title="${item.EmployeeType.Id}">${item.EmployeeType.Title}</label></td>`;
                tableRows += `<td align="center">${selectHTML}</td>`;
                tableRows += `<td align="center"><label class="periodItems">${periodItems}</label></td>`;
                tableRows += `<td align="center"><label>${item.PeriodType}</label></td>`;
                tableRows += "</tr>";
            }
            tableBody.innerHTML = tableRows;
            $("#tbEmpClothing").css("display", "inline-table");
            $("#tbEmpClothing").DataTable({
                destroy: true,
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                responsive: true,
                autoWidth: true,
            });
            $("#tbEmpData").show();
            $("#tbEmpClothing").show();
            $("#ulAction").show();
            $("#btnSave").show();
            document.getElementById("btnSave").addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                $("#btnSave").hide();
                const res = yield this.AddItemsToStockLists();
            }));
            document.getElementById("ddlAction").addEventListener("change", () => {
                if ($("#ddlAction").val() == "2") {
                    $("#ulRejection").show();
                }
                else {
                    $("#ulRejection").hide();
                }
            });
        });
    }
    _getEmpData(empNo) {
        return __awaiter(this, void 0, void 0, function* () {
            // let empNo = $("#txtEmpNO").val();
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Data")
                .items.select("ID,Title,EmployeeNumber,EmployeeType/Id,EmployeeType/Title,CostCenter,Location,EmployeeStatus")
                .expand("EmployeeType")
                .filter(`EmployeeNumber eq '${empNo}'`)
                .get();
            return response;
        });
    }
    _getEmpTypeClothing(empTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Types")
                .items.select("ID,EmployeeType/Id,EmployeeType/Title,ClothingType/Title,ClothingType/Id,PeriodType")
                .expand("EmployeeType,ClothingType")
                .filter(`EmployeeType/Id eq '${empTypeId}' and substringof('${periodType}',PeriodType)`)
                .get();
            return response;
        });
    }
    _getPeriodTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Periods")
                .items.get();
            return response;
        });
    }
    _getPeriodType(resPeriods) {
        let today = new Date();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        let dateFrom = "";
        let dateTo = "";
        let dateFromdt = null;
        let dateTodt = null;
        resPeriods.forEach((item) => {
            if (item.PeriodType == "Winter") {
                dateFrom = item.DateFrom + "/" + (mm >= 10 ? yyyy : yyyy - 1);
                dateTo = item.DateTo + "/" + (mm >= 10 ? yyyy + 1 : yyyy);
                dateFromdt = new Date(dateFrom);
                dateTodt = new Date(dateTo);
                if (dateFromdt <= today && today <= dateTodt) {
                    periodType = item.PeriodType;
                    periodItems = item.NumberOfItems;
                    DateFromPeriod = dateFromdt;
                    DateToPeriod = dateTodt;
                }
            }
            else {
                dateFrom = item.DateFrom + "/" + yyyy;
                dateTo = item.DateTo + "/" + yyyy;
                dateFromdt = new Date(dateFrom);
                dateTodt = new Date(dateTo);
                if (dateFromdt <= today && today <= dateTodt) {
                    periodType = item.PeriodType;
                    periodItems = item.NumberOfItems;
                    DateFromPeriod = dateFromdt;
                    DateToPeriod = dateTodt;
                }
            }
        });
    }
    AddItemsToStockLists() {
        return __awaiter(this, void 0, void 0, function* () {
            const spfxContext = this;
            let empNo = $($("#tbEmpData> tbody > tr")[0]).find(".empNo").text();
            if ($("#ddlAction").val() == "2" &&
                $("#txtComments").val().toString().trim() == "") {
                alert("من فضلك قم بادخال تعليقات بالوظيفه الصحيحة");
                $("#btnSave").show();
                return;
            }
            if ($("#ddlAction").val() == "2" &&
                $("#txtComments").val().toString().trim() !== "") {
                //send mail to HR with wrong employee type.
                const empData = yield this._getEmpData(empNo);
                const groupName = "HR Owners";
                const grpUsers = yield pnp.sp.web.siteGroups
                    .getByName(groupName)
                    .users.get();
                if (grpUsers.length > 0) {
                    let mailProps = new ISPEmail();
                    mailProps.Subject = "Blue Collar Stock - Wrong Type Employee";
                    mailProps.Body = "";
                    mailProps.Body += "Hi HRTeam, <br/><br/>";
                    mailProps.Body +=
                        "Please find below employee data with wrong type and needs to be modified: <br/><br/>";
                    mailProps.Body +=
                        "Current data:<br/> " +
                            $("#tbEmpData").parent().html() +
                            "<br/><br/>";
                    mailProps.Body += "Commnets from Stock Admins:<br/>";
                    mailProps.Body += $("#txtComments").val();
                    mailProps.To = "";
                    for (let index = 0; index < grpUsers.length; index++) {
                        const element = grpUsers[index];
                        mailProps.To += element.Email + ",";
                    }
                    mailProps.To = mailProps.To.slice(0, -1);
                    yield this.SendMail(mailProps);
                    yield pnp.sp.web.lists
                        .getByTitle("Blue Collar Data")
                        .items.getById(empData[0].Id)
                        .update({ CorrectEmployeeType: $("#txtComments").val() });
                    //update employee item with the comments
                    $("#txtEmpNO").val("");
                    $("#tbEmpData").hide();
                    $("#tbEmpClothing").hide();
                    $("#ulAction").hide();
                    $("#btnSave").hide();
                    alert("تم حفظ البيانات بنجاح و تم ارسال بريد الكتروني لاداره الموارد البشريه لتعديل البيانات");
                }
            }
            else {
                if ($("#ddlAction").val() == "1") {
                    const empData = yield this._getEmpData(empNo);
                    $("#tbEmpClothing> tbody > tr").each(function (index) {
                        let empClothingRow = $(this);
                        let clothingTypeId = Number(empClothingRow.find(".clothingType").attr("title"));
                        let sizeId = Number($($(".ddlSize :selected")[index]).val());
                        let ReceivedItems = 0;
                        spfxContext
                            ._getRemainingItems(clothingTypeId, sizeId)
                            .then((resStock) => {
                            resStock.forEach((itemRemaining) => __awaiter(this, void 0, void 0, function* () {
                                ReceivedItems = itemRemaining.ReceivedItems - periodItems;
                                yield pnp.sp.web.lists
                                    .getByTitle("Blue Collar Stock")
                                    .items.getById(itemRemaining.Id)
                                    .update({ ReceivedItems: ReceivedItems });
                            }));
                        });
                    });
                    yield pnp.sp.web.lists
                        .getByTitle("Blue Collar Data")
                        .items.getById(empData[0].Id)
                        .update({ EmployeeStatus: "Inactive" });
                    $("#txtEmpNO").val("");
                    $("#tbEmpData").hide();
                    $("#tbEmpClothing").hide();
                    $("#btnSave").hide();
                    $("#ulAction").hide();
                    alert("تم حفظ البيانات بنجاح");
                }
                else {
                    //filter employee number with items within the period if it contains data then no more items he will get
                    const resEmpAssign = yield this._getEmployeeAssigment(empNo.toString());
                    if (resEmpAssign.length > 0) {
                        let periodTypeArabic = periodType == "Winter" ? "الشتاء" : "الصيف";
                        alert(`لقد تم تسليم العامل ملابسه عن فتره ${periodTypeArabic}`);
                        $("#btnSave").show();
                        return;
                    }
                    //else then store items as per items count for each period update stock list with ReceivedItems.
                    else {
                        const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
                        const listAssign = pnp.sp.web.lists.getByTitle("Blue Collar Stock Assignment");
                        const entityNameAssign = yield listAssign.getListItemEntityTypeFullName();
                        const batchAssign = pnp.sp.web.createBatch();
                        // tslint:disable-next-line: no-function-expression
                        let arrEmpData = $("#tbEmpData> tbody > tr");
                        // tslint:disable-next-line: no-shadowed-variable
                        let empDataRow = $(arrEmpData[0]);
                        let empName = empDataRow.find(".empName").text();
                        let empType = empDataRow.find(".empType").text();
                        let empCost = empDataRow.find(".empCost").text();
                        let empLocation = empDataRow.find(".empLocation").text();
                        // tslint:disable-next-line: no-shadowed-variable
                        let arrEmpClothing = $("#tbEmpClothing> tbody > tr");
                        // tslint:disable-next-line: no-shadowed-variable
                        for (let index = 0; index < arrEmpClothing.length; index++) {
                            let empClothingRow = $(arrEmpClothing[index]);
                            let clothingType = empClothingRow.find(".clothingType").text();
                            let clothingTypeId = Number(empClothingRow.find(".clothingType").attr("title"));
                            let size = $($(".ddlSize :selected")[index]).text();
                            let sizeId = Number($($(".ddlSize :selected")[index]).val());
                            const remainingItems = yield this._getRemainingItems(clothingTypeId, sizeId);
                            if (remainingItems.length <= 0) {
                                alert("لايوجد مقاسات متاحه لهذه الملابس");
                                return;
                            }
                            else {
                                const reminingItem = remainingItems[0];
                                if (reminingItem.Remaining_x0020_Items <= 0) {
                                    alert("لايوجد مقاسات متاحه لهذه الملابس بالمخازن");
                                    return;
                                }
                            }
                            for (let p = 0; p < periodItems; p++) {
                                listAssign.items.add({
                                    ClothingType: clothingType,
                                    Size: size,
                                    EmployeeName: empName,
                                    EmployeeNumber: empNo,
                                    EmployeeType: empType,
                                    CostCenter: empCost,
                                    Location: empLocation,
                                    PeriodType: periodType,
                                }
                                //entityNameAssign
                                );
                            }
                            let ReceivedItems = 0;
                            this._getRemainingItems(clothingTypeId, sizeId).then((resStock) => {
                                resStock.forEach((itemRemaining) => __awaiter(this, void 0, void 0, function* () {
                                    ReceivedItems = itemRemaining.ReceivedItems + periodItems;
                                    yield listStock.items
                                        .getById(itemRemaining.Id)
                                        .update({ ReceivedItems: ReceivedItems });
                                }));
                            });
                        }
                        batchAssign.execute().then(() => {
                            // $("#txtEmpNO").val("");
                            // $("#tbEmpData").hide();
                            // $("#tbEmpClothing").hide();
                            // $("#btnSave").hide();
                            // $("#ulAction").hide();
                            this.render();
                            alert("تم حفظ البيانات بنجاح");
                        });
                    }
                }
            }
        });
    }
    _getEmployeeAssigment(employeeNo) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield pnp.sp.web.lists
                .getByTitle("Blue Collar Stock Assignment")
                .items.filter(`EmployeeNumber eq '${employeeNo}' and Created ge '${DateFromPeriod.toLocaleDateString()}' and Created le '${DateToPeriod.toLocaleDateString()}'`)
                .get();
        });
    }
    //#endregion
    //#region Recieve Items
    _getClothingTypesSizesItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Clothing Types Sizes")
                .items.select("Title,ClothingType/Id,ClothingType/Title,Size/Id,Size/Title")
                .expand("ClothingType,Size")
                .getAll();
            return response;
        });
    }
    _getClothingSizesItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Clothing Sizes")
                .items.get();
            return response;
        });
    }
    DrawStockTransactionsTable() {
        let clothingTypesSizes = null;
        let ClothingRemainingItems = null;
        let remainingItems = 0;
        let currentItems = 0;
        let stockId = 0;
        let tableBody = document.getElementById("tbodyClothingTypes");
        let tableRows = "";
        this._getClothingTypesSizesItems().then((res) => __awaiter(this, void 0, void 0, function* () {
            clothingTypesSizes = res;
            if (clothingTypesSizes.length <= 0) {
                alert("لا يوجد بيانات للملابس و انواعها و مقاساتها نرجو التواصل مع اداره الموارد البشريه");
                return;
            }
            //console.table(res);
            $("#tbodyClothingTypes").show();
            for (let index = 0; index < clothingTypesSizes.length; index++) {
                const item = clothingTypesSizes[index];
                //tslint:disable-next-line: no-shadowed-variable
                const ClothingRemainingItems = yield this._getRemainingItems(item.ClothingType.Id, item.Size.Id);
                remainingItems = 0;
                currentItems = 0;
                stockId = 0;
                ClothingRemainingItems.forEach((itemRemaining) => {
                    remainingItems = Math.round(itemRemaining.Remaining_x0020_Items);
                    currentItems = itemRemaining.OpeningBalance;
                    stockId = itemRemaining.Id;
                });
                tableRows += "<tr>";
                tableRows += `<td align="center"><label class="barCode">${item.Title}</label></td>`;
                tableRows += `<td align="center"><label class="clothingType" title="${item.ClothingType.Id}">${item.ClothingType.Title}</label></td>`;
                tableRows += `<td align="center"><label class="clothingSize" title="${item.Size.Id}">${item.Size.Title}</label></td>`;
                tableRows += `<td align="center"><input class="stockId" title='${stockId}' type="number" required value='0'/></td>`;
                //tableRows += `<td align="center"><label class="itemsData"></label></td>`;
                tableRows += `<td align="center"><label class="itemsData" title='${currentItems}'>${remainingItems}</label></td>`;
                tableRows += "</tr>";
                tableBody.innerHTML = tableRows;
            }
            //setTimeout(() => {
            document
                .getElementById("btnSaveItems")
                .addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                this.AddItemsToStockTrans();
            }));
            jQuery("#tbClothingTypes").DataTable({
                destroy: true,
                searching: true,
                paging: true,
                info: false,
                language: {
                    search: "بحث: ",
                },
            });
            //}, 1500);
        }));
    }
    AddItemsToStockTrans() {
        return __awaiter(this, void 0, void 0, function* () {
            let alertTxt = "";
            if ($("#txtAdminComments").val().toString().trim() == "" ||
                $("#txtInvoiceNO").val().toString().trim() == "") {
                alert("من فضلك قم بادخال تعليقات و رقم الفاتورة");
                return;
            }
            let txtAdminComments = $("#txtAdminComments").val();
            let txtInvoiceNO = $("#txtInvoiceNO").val();
            const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
            const entityNameStock = yield listStock.getListItemEntityTypeFullName();
            const listTrans = pnp.sp.web.lists.getByTitle("Blue Collar Stock Transaction");
            const entityNameTrans = yield listTrans.getListItemEntityTypeFullName();
            const batch = pnp.sp.web.createBatch();
            // tslint:disable-next-line: no-function-expression
            let tbClothingTypes = $("#tbClothingTypes> tbody > tr");
            for (let index = 0; index < tbClothingTypes.length; index++) {
                const currentRow = $(tbClothingTypes[index]);
                let barCode = currentRow.find(".barCode").text();
                let clothingType = Number.parseInt(currentRow.find(".clothingType").attr("title"));
                let clothingSize = Number.parseInt(currentRow.find(".clothingSize").attr("title"));
                let stockId = Number.parseInt(currentRow.find(".stockId").attr("title"));
                let itemsCount = Number.parseInt(currentRow.find(".stockId").val().toString());
                let itemsData = Number.parseInt(currentRow.find(".itemsData").attr("title"));
                let remainingItems = Number.parseInt(currentRow.find(".itemsData").text());
                const ClothingRemainingItems = yield this._getRemainingItems(clothingType, clothingSize);
                if (itemsCount > 0
                //&& ClothingRemainingItems.length > 0
                //&& ClothingRemainingItems[0].Remaining_x0020_Items > 0
                ) {
                    if ($("#rdoReturn:checked").length > 0) {
                        if (ClothingRemainingItems.length > 0 &&
                            itemsCount > ClothingRemainingItems[0].Remaining_x0020_Items)
                            alertTxt += `\n لا يمكنك عمل مرتجع بعدد وحدات اكبر من الوحدات المتبقيه ل ${barCode} `;
                        else {
                            //return items
                            //add transaction item
                            listTrans.items.add({
                                BarcodeNumber: barCode,
                                ClothingTypeId: clothingType,
                                SizeId: clothingSize,
                                TransactionType: "Return",
                                ItemsCount: itemsCount,
                                StockComments: txtAdminComments,
                                InvoiceNO: txtInvoiceNO,
                            }
                            //entityNameTrans
                            );
                            //add or update items into stock list
                            itemsData -= itemsCount;
                            if (stockId > 0) {
                                listStock.items
                                    .getById(stockId)
                                    //.inBatch(batch)
                                    .update({ OpeningBalance: itemsData });
                                //, "*", entityNameStock);
                            }
                            else {
                                listStock.items.add({
                                    ClothingTypeId: clothingType,
                                    SizeId: clothingSize,
                                    OpeningBalance: itemsCount,
                                }
                                // entityNameStock
                                );
                                // all of above using batchs.
                            }
                        }
                    }
                    else {
                        //receive items
                        //add transaction item
                        listTrans.items.add({
                            BarcodeNumber: barCode,
                            ClothingTypeId: clothingType,
                            SizeId: clothingSize,
                            TransactionType: "Receive",
                            ItemsCount: itemsCount,
                            StockComments: txtAdminComments,
                            InvoiceNO: txtInvoiceNO,
                        }
                        //entityNameTrans
                        );
                        //add or update items into stock list
                        itemsCount += itemsData;
                        if (stockId > 0) {
                            listStock.items
                                .getById(stockId)
                                //.inBatch(batch)
                                .update({ OpeningBalance: itemsCount });
                            //, "*", entityNameStock);
                        }
                        else {
                            listStock.items.add({
                                ClothingTypeId: clothingType,
                                SizeId: clothingSize,
                                OpeningBalance: itemsCount,
                            }
                            //entityNameStock
                            );
                            // all of above using batchs.
                        }
                    }
                }
            }
            if (alertTxt != "") {
                alert(alertTxt);
            }
            else {
                batch.execute().then(() => {
                    // $("#tbodyClothingTypes").hide();
                    // $("#tbodyClothingTypes > tr").remove();
                    console.log(batch);
                    this.render();
                    alert("تم حفظ البيانات بنجاح");
                });
            }
        });
    }
    //#endregion
    //#region Consumable Items
    LoadConsumableItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const resConsum = yield this._getConsumableItems();
            const resBranches = yield this._getCostCenter();
            if (resConsum.length > 0 && resBranches.length > 0) {
                let ddlConsumItems = (document.getElementById("ddlConsumItems"));
                let ddlBranches = (document.getElementById("ddlBranches"));
                resBranches.forEach((item) => {
                    var opt = document.createElement("option");
                    opt.value = item.Id.toString();
                    opt.innerText = item.Location;
                    ddlBranches.appendChild(opt);
                });
                resConsum.forEach((item) => {
                    var opt = document.createElement("option");
                    opt.value = item.Items.Id.toString();
                    opt.innerText = item.Items.Title;
                    ddlConsumItems.appendChild(opt);
                });
                $("#btnConsumSave").show();
                document
                    .getElementById("btnConsumSave")
                    .addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    const res = yield this.AddItemsToConsumableItems();
                }));
            }
        });
    }
    _getConsumableItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield pnp.sp.web.lists
                .getByTitle("Blue Collar Consumable Items")
                .items.select("Id,Items/Id,Items/Title")
                .expand("Items")
                .get();
        });
    }
    _getCostCenter() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield pnp.sp.web.lists
                .getByTitle("Blue Collar Branches")
                .items.get();
        });
    }
    AddItemsToConsumableItems() {
        return __awaiter(this, void 0, void 0, function* () {
            if ($("#txtItemsCount").val() == 0 ||
                $("#txtItemsCount").val().toString().trim() == "") {
                alert("يجب ادخال عدد وحدات اكبر من صفر");
                return;
            }
            let itemsCount = Number($("#txtItemsCount").val());
            //add items into transactions list and substract items from stock list.
            let clothingId = Number($("#ddlConsumItems").val());
            let branch = $("#ddlBranches option:selected").text();
            let ReceivedItems = 0;
            const resStock = yield this._getItemsInStock(clothingId);
            if (resStock.length <= 0) {
                alert("لايوجد ملابس بالمخازن");
                return;
            }
            if (Number(resStock[0].Remaining_x0020_Items) < itemsCount) {
                alert("لايوجد ملابس بالمخازن");
                return;
            }
            yield pnp.sp.web.lists
                .getByTitle("Blue Collar Consumable Items Transactions")
                .items.add({ Title: branch, ItemId: clothingId, ItemsCount: itemsCount });
            resStock.forEach((itemRemaining) => __awaiter(this, void 0, void 0, function* () {
                ReceivedItems = itemRemaining.ReceivedItems + itemsCount;
                yield pnp.sp.web.lists
                    .getByTitle("Blue Collar Stock")
                    .items.getById(itemRemaining.Id)
                    .update({ ReceivedItems: ReceivedItems });
                alert("تم حفظ البيانات");
                $("#txtItemsCount").val("0");
                this.render();
            }));
        });
    }
    //#endregion
    //#region Exception Items
    GetExceptEmpData() {
        return __awaiter(this, void 0, void 0, function* () {
            let empNo = $("#txtExceptEmpNO").val();
            const resPeriods = yield this._getPeriodTypes();
            if (resPeriods.length <= 0) {
                alert("لا يوجد فترات نرجو التواصل مع الموارد البشريه");
                return;
            }
            this._getPeriodType(resPeriods);
            const resEmp = yield this._getExceptEmpData(empNo.toString());
            if (resEmp.length <= 0) {
                alert("هذا العامل غير موجود");
                return;
            }
            if (resEmp[0].EmployeeStatus != "Active") {
                alert("هذا العامل غير مفعل نرجو التواصل مع الموارد البشريه لتفعيل العامل");
                return;
            }
            if (!resEmp[0].ExceptionAllowed) {
                alert("هذا العامل ليس له استثناءات نرجو التواصل مع الموارد البشريه");
                return;
            }
            let tableBody = document.getElementById("tbodyExceptEmpData");
            let tableRows = "";
            tableRows += "<tr>";
            tableRows += `<td align="center"><label class="empName">${resEmp[0].Title}</label></td>`;
            tableRows += `<td align="center"><label class="empNo" title="${resEmp[0].Id}">${resEmp[0].EmployeeNumber}</label></td>`;
            tableRows += `<td align="center"><label class="empType">${resEmp[0].EmployeeType.Title}</label></td>`;
            tableRows += `<td align="center"><label class="empCost">${resEmp[0].CostCenter}</label></td>`;
            tableRows += `<td align="center"><label class="empLocation">${resEmp[0].Location}</label></td>`;
            tableRows += "</tr>";
            tableBody.innerHTML = tableRows;
            $("#tbExceptEmpData").css("display", "inline-table");
            $("#tbExceptEmpData").DataTable({
                destroy: true,
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                responsive: true,
                autoWidth: true,
            });
            const resClothing = yield this._getEmpTypeClothing(resEmp[0].EmployeeType.Id);
            if (resClothing.length <= 0) {
                alert("وظيفه هذا العامل لا يوجد لها انواع ملابس نرجو التواصل مع الموارد البشريه");
                return;
            }
            const resSize = yield this._getClothingSizesItems();
            if (resSize.length <= 0) {
                alert("لا يوجد مقاسات لانواع الملابس نرجو التواصل مع الموارد البشريه");
                return;
            }
            //check here if the user has items recieved for current period or not
            tableBody = document.getElementById("tbodyExceptEmpClothing");
            tableRows = "";
            for (let index = 0; index < resClothing.length; index++) {
                const item = resClothing[index];
                const resInStock = yield this._getItemsInStock(item.ClothingType.Id);
                let selectHTML = "";
                selectHTML += "<select class='ddlSize' style='width: 50% !Important;'>";
                resInStock.forEach((itemRemaining) => {
                    selectHTML += `<option class="ddl" value="${itemRemaining.Size.Id}">${itemRemaining.Size.Title}</option>`;
                });
                selectHTML += "</select>";
                tableRows += "<tr>";
                tableRows += `<td align="center"><label class="clothingType" title="${item.ClothingType.Id}">${item.ClothingType.Title}</label></td>`;
                tableRows += `<td align="center"><label class="empType" title="${item.EmployeeType.Id}">${item.EmployeeType.Title}</label></td>`;
                tableRows += `<td align="center">${selectHTML}</td>`;
                //tableRows += `<td align="center"><label class="periodItems">${periodItems}</label></td>`;
                tableRows += `<td align="center"><label>${item.PeriodType}</label></td>`;
                tableRows += "</tr>";
            }
            tableBody.innerHTML = tableRows;
            $("#tbExceptEmpClothing").css("display", "inline-table");
            $("#tbExceptEmpClothing").DataTable({
                destroy: true,
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                responsive: true,
                autoWidth: true,
            });
            $("#tbExceptEmpData").show();
            $("#tbExceptEmpClothing").show();
            $("#btnExceptSave").show();
            document
                .getElementById("btnExceptSave")
                .addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                $("#btnExceptSave").hide();
                const res = yield this.AddExceptItemsToStockLists();
            }));
        });
    }
    _getExceptEmpData(empNo) {
        return __awaiter(this, void 0, void 0, function* () {
            // let empNo = $("#txtEmpNO").val();
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Data")
                .items.select("ID,Title,EmployeeNumber,EmployeeType/Id,EmployeeType/Title,CostCenter,Location,EmployeeStatus,ExceptionAllowed")
                .expand("EmployeeType")
                .filter(`EmployeeNumber eq '${empNo}'`)
                .get();
            return response;
        });
    }
    AddExceptItemsToStockLists() {
        return __awaiter(this, void 0, void 0, function* () {
            const spfxContext = this;
            let empNo = $($("#tbExceptEmpData> tbody > tr")[0]).find(".empNo").text();
            let empNoId = Number($($("#tbExceptEmpData> tbody > tr")[0]).find(".empNo").attr("title"));
            const listEmp = pnp.sp.web.lists.getByTitle("Blue Collar Data");
            const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
            const listAssign = pnp.sp.web.lists.getByTitle("Blue Collar Stock Assignment");
            const entityNameAssign = yield listAssign.getListItemEntityTypeFullName();
            const batchAssign = pnp.sp.web.createBatch();
            // tslint:disable-next-line: no-function-expression
            let arrEmpData = $("#tbExceptEmpData> tbody > tr");
            // tslint:disable-next-line: no-shadowed-variable
            let empDataRow = $(arrEmpData[0]);
            let empName = empDataRow.find(".empName").text();
            let empType = empDataRow.find(".empType").text();
            let empCost = empDataRow.find(".empCost").text();
            let empLocation = empDataRow.find(".empLocation").text();
            // tslint:disable-next-line: no-shadowed-variable
            let arrEmpClothing = $("#tbExceptEmpClothing> tbody > tr");
            // tslint:disable-next-line: no-shadowed-variable
            for (let index = 0; index < arrEmpClothing.length; index++) {
                let empClothingRow = $(arrEmpClothing[index]);
                let clothingType = empClothingRow.find(".clothingType").text();
                let clothingTypeId = Number(empClothingRow.find(".clothingType").attr("title"));
                let size = $($(".ddlSize :selected")[index]).text();
                let sizeId = Number($($(".ddlSize :selected")[index]).val());
                const remainingItems = yield this._getRemainingItems(clothingTypeId, sizeId);
                if (remainingItems.length <= 0) {
                    alert("لايوجد مقاسات متاحه لهذه الملابس");
                    return;
                }
                else {
                    const reminingItem = remainingItems[0];
                    if (reminingItem.Remaining_x0020_Items <= 0) {
                        alert("لايوجد مقاسات متاحه لهذه الملابس بالمخازن");
                        return;
                    }
                }
                //for (let p = 0; p < periodItems; p++) {
                listAssign.items.add({
                    ClothingType: clothingType,
                    Size: size,
                    EmployeeName: empName,
                    EmployeeNumber: empNo,
                    EmployeeType: empType,
                    CostCenter: empCost,
                    Location: empLocation,
                    PeriodType: periodType,
                    IsException: true,
                }
                //entityNameAssign
                );
                //}
                yield listEmp.items.getById(empNoId).update({ ExceptionAllowed: false });
                let ReceivedItems = 0;
                this._getRemainingItems(clothingTypeId, sizeId).then((resStock) => {
                    resStock.forEach((itemRemaining) => __awaiter(this, void 0, void 0, function* () {
                        ReceivedItems = itemRemaining.ReceivedItems + 1;
                        yield listStock.items
                            .getById(itemRemaining.Id)
                            .update({ ReceivedItems: ReceivedItems });
                    }));
                });
            }
            batchAssign.execute().then(() => {
                $("#txtExceptEmpNO").val("");
                $("#tbExceptEmpData").hide();
                $("#tbExceptEmpClothing").hide();
                $("#btnExceptSave").hide();
                this.render();
                alert("تم حفظ البيانات بنجاح");
            });
        });
    }
    //#endregion
    //#region Helper Function
    _getRemainingItems(clothingId, sizeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Stock")
                .items.select("Remaining_x0020_Items,OpeningBalance,ReceivedItems,Id")
                .filter(`ClothingType/Id eq '${clothingId}' and Size/Id eq '${sizeId}'`)
                .get();
            return response;
        });
    }
    _getItemsInStock(clothingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield pnp.sp.web.lists
                .getByTitle("Blue Collar Stock")
                .items.select("Id,Size/Id,Size/Title,ReceivedItems,Remaining_x0020_Items,OpeningBalance")
                .expand("Size")
                .filter(`ClothingType/Id eq '${clothingId}'`)
                .get();
            return response;
        });
    }
    SendMail(mailProps) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pnp.sp.utility.sendEmail({
                To: [mailProps.To],
                Subject: mailProps.Subject,
                Body: mailProps.Body,
            });
            //console.log("Email Sent!");
        });
    }
    SendNotificationMail(mailProps) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = JSON.stringify({
                properties: {
                    __metadata: { type: "SP.Utilities.EmailProperties" },
                    From: "HRBlueCollarStock@seoudisupermarket.com",
                    Body: mailProps.Body,
                    Subject: mailProps.Subject,
                    To: { results: [mailProps.To] },
                    CC: { results: [""] },
                    BCC: { results: [""] },
                },
            });
            let spOpts = {
                headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "odata-version": "",
                },
                body: body,
            };
            var senMailURL = this.context.pageContext.web.absoluteUrl +
                "/_api/SP.Utilities.Utility.SendEmail";
            this.context.spHttpClient
                .post(senMailURL, SPHttpClient.configurations.v1, spOpts)
                .then((response) => {
                console.log(`Status code: ${response.status}`);
                console.log(`Status text: ${response.statusText}`);
                if (response.status == 200) {
                    alert("تم ارسال بريد الكتروني لاداره الموارد البشريه لتعديل البيانات");
                }
                else {
                    alert("حدث خطأ نرجو المحاوله مره اخرس او التواصل مع اداره الموارد البشريه");
                }
                response.json().then((responseJSON) => {
                    //alert("Mail Sent Sucessfully");
                    console.log(responseJSON);
                });
            });
        });
    }
    //#endregion
    //#region  system methods
    get dataVersion() {
        return Version.parse("1.0");
    }
    getPropertyPaneConfiguration() {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription,
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField("description", {
                                    label: strings.DescriptionFieldLabel,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
//# sourceMappingURL=BlueCollarStockWpWebPart.js.map