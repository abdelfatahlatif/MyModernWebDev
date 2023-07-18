import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import pnp from "sp-pnp-js";
import styles from "./BlueCollarStockWpWebPart.module.scss";
import * as strings from "BlueCollarStockWpWebPartStrings";
import "@pnp/sp/sputilities";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups";
import * as $ from "jquery";
import "jqueryui";
import { SPComponentLoader } from "@microsoft/sp-loader";
import "datatables.net";
import {
  ISPBlueCollarTypes,
  ISPClothingSize,
  ISPClothingTypesSizes,
  ISPConsumableItems,
  ISPBranch,
  ISPEmail,
  ISPEmpDataItems,
  ISPPeriodType,
  ISPRemainingItems,
} from "./Models/ClothingModel";

import AccordionTemplate from "./Models/AccordionTemplate";
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
} from "@microsoft/sp-http";

export interface IBlueCollarStockWpWebPartProps {
  description: string;
}

let periodType: string = "";
let periodItems: number = 0;
let DateFromPeriod: Date = null;
let DateToPeriod: Date = null;

export default class BlueCollarStockWpWebPart extends BaseClientSideWebPart<IBlueCollarStockWpWebPartProps> {
  public constructor() {
    super();

    SPComponentLoader.loadCss(
      "//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"
    );
    SPComponentLoader.loadCss(
      "//cdn.datatables.net/1.11.4/css/jquery.dataTables.min.css"
    );
  }

  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      pnp.setup({
        spfxContext: this.context,
      });
    });
  }

  public render(): void {
    this.domElement.innerHTML = AccordionTemplate.templateHtml;

    this.DrawStockTransactionsTable();

    const accordionOptions: JQueryUI.AccordionOptions = {
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
    $($('.CanvasSection.CanvasSection-col.CanvasSection-sm12').parent()).css("max-width","100%");
    document.getElementById("btnSearch").addEventListener("click", () => {
      this.GetEmpData();
    });

    document.getElementById("btnExceptSearch").addEventListener("click", () => {
      this.GetExceptEmpData();
    });

    this.LoadConsumableItems();
  }

  //#region Deliever Items
  private async GetEmpData() {
    let empNo = $("#txtEmpNO").val();
    const resPeriods = await this._getPeriodTypes();
    if (resPeriods.length <= 0) {
      alert("لا يوجد فترات نرجو التواصل مع الموارد البشريه");
      return;
    }
    this._getPeriodType(resPeriods);
    const resEmp = await this._getEmpData(empNo.toString());
    if (resEmp.length <= 0) {
      alert("هذا العامل غير موجود");
      return;
    }
    if (resEmp[0].EmployeeStatus != "Active") {
      alert(
        "هذا العامل غير مفعل نرجو التواصل مع الموارد البشريه لتفعيل العامل"
      );
      return;
    }
    let tableBody = document.getElementById("tbodyEmpData");
    let tableRows: string = "";
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
    const resClothing = await this._getEmpTypeClothing(
      resEmp[0].EmployeeType.Id
    );
    if (resClothing.length <= 0) {
      alert(
        "وظيفه هذا العامل لا يوجد لها انواع ملابس نرجو التواصل مع الموارد البشريه"
      );
      return;
    }
    const resSize = await this._getClothingSizesItems();
    if (resSize.length <= 0) {
      alert("لا يوجد مقاسات لانواع الملابس نرجو التواصل مع الموارد البشريه");
      return;
    }
    //check here if the user has items recieved for current period or not
    tableBody = document.getElementById("tbodyEmpClothing");
    tableRows = "";
    for (let index = 0; index < resClothing.length; index++) {
      const item = resClothing[index] as ISPBlueCollarTypes;
      const resInStock = await this._getItemsInStock(item.ClothingType.Id);
      let selectHTML: string = "";
      selectHTML += "<select class='ddlSize' style='width: 50% !Important;'>";
      resInStock.forEach((itemRemaining: ISPRemainingItems) => {
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
    document.getElementById("btnSave").addEventListener("click", async () => {
      $("#btnSave").hide();
      const res = await this.AddItemsToStockLists();
    });
    document.getElementById("ddlAction").addEventListener("change", () => {
      if ($("#ddlAction").val() == "2") {
        $("#ulRejection").show();
      } else {
        $("#ulRejection").hide();
      }
    });
  }
  private async _getEmpData(empNo: string): Promise<ISPEmpDataItems[]> {
    // let empNo = $("#txtEmpNO").val();
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Data")
      .items.select(
        "ID,Title,EmployeeNumber,EmployeeType/Id,EmployeeType/Title,CostCenter,Location,EmployeeStatus"
      )
      .expand("EmployeeType")
      .filter(`EmployeeNumber eq '${empNo}'`)
      .get();
    return response;
  }
  private async _getEmpTypeClothing(
    empTypeId: number
  ): Promise<ISPBlueCollarTypes[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Types")
      .items.select(
        "ID,EmployeeType/Id,EmployeeType/Title,ClothingType/Title,ClothingType/Id,PeriodType"
      )
      .expand("EmployeeType,ClothingType")
      .filter(
        `EmployeeType/Id eq '${empTypeId}' and substringof('${periodType}',PeriodType)`
      )
      .get();
    return response;
  }
  private async _getPeriodTypes(): Promise<ISPPeriodType[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Periods")
      .items.get();
    return response;
  }
  private _getPeriodType(resPeriods: ISPPeriodType[]) {
    let today = new Date();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    let dateFrom: string = "";
    let dateTo: string = "";
    let dateFromdt: Date = null;
    let dateTodt: Date = null;
    resPeriods.forEach((item: ISPPeriodType) => {
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
      } else {
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
  private async AddItemsToStockLists() {
    const spfxContext = this;
    let empNo = $($("#tbEmpData> tbody > tr")[0]).find(".empNo").text();
    if (
      $("#ddlAction").val() == "2" &&
      $("#txtComments").val().toString().trim() == ""
    ) {
      alert("من فضلك قم بادخال تعليقات بالوظيفه الصحيحة");
      $("#btnSave").show();
      return;
    }
    if (
      $("#ddlAction").val() == "2" &&
      $("#txtComments").val().toString().trim() !== ""
    ) {
      //send mail to HR with wrong employee type.
      const empData = await this._getEmpData(empNo);
      const groupName = "HR Owners";
      const grpUsers = await pnp.sp.web.siteGroups
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
        await this.SendMail(mailProps);
        await pnp.sp.web.lists
          .getByTitle("Blue Collar Data")
          .items.getById(empData[0].Id)
          .update({ CorrectEmployeeType: $("#txtComments").val() });
        //update employee item with the comments
        $("#txtEmpNO").val("");
        $("#tbEmpData").hide();
        $("#tbEmpClothing").hide();
        $("#ulAction").hide();
        $("#btnSave").hide();
        alert(
          "تم حفظ البيانات بنجاح و تم ارسال بريد الكتروني لاداره الموارد البشريه لتعديل البيانات"
        );
      }
    } else {
      if ($("#ddlAction").val() == "1") {
        const empData = await this._getEmpData(empNo);
        $("#tbEmpClothing> tbody > tr").each(function (index) {
          let empClothingRow = $(this);
          let clothingTypeId = Number(
            empClothingRow.find(".clothingType").attr("title")
          );
          let sizeId = Number($($(".ddlSize :selected")[index]).val());
          let ReceivedItems = 0;
          spfxContext
            ._getRemainingItems(clothingTypeId, sizeId)
            .then((resStock) => {
              resStock.forEach(async (itemRemaining: ISPRemainingItems) => {
                ReceivedItems = itemRemaining.ReceivedItems - periodItems;
                await pnp.sp.web.lists
                  .getByTitle("Blue Collar Stock")
                  .items.getById(itemRemaining.Id)
                  .update({ ReceivedItems: ReceivedItems });
              });
            });
        });
        await pnp.sp.web.lists
          .getByTitle("Blue Collar Data")
          .items.getById(empData[0].Id)
          .update({ EmployeeStatus: "Inactive" });
        $("#txtEmpNO").val("");
        $("#tbEmpData").hide();
        $("#tbEmpClothing").hide();
        $("#btnSave").hide();
        $("#ulAction").hide();
        alert("تم حفظ البيانات بنجاح");
      } else {
        //filter employee number with items within the period if it contains data then no more items he will get
        const resEmpAssign = await this._getEmployeeAssigment(empNo.toString());
        if (resEmpAssign.length > 0) {
          let periodTypeArabic = periodType == "Winter" ? "الشتاء" : "الصيف";
          alert(`لقد تم تسليم العامل ملابسه عن فتره ${periodTypeArabic}`);
          $("#btnSave").show();
          return;
        }
        //else then store items as per items count for each period update stock list with ReceivedItems.
        else {
          const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
          const listAssign = pnp.sp.web.lists.getByTitle(
            "Blue Collar Stock Assignment"
          );
          const entityNameAssign =
            await listAssign.getListItemEntityTypeFullName();
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
            let clothingTypeId = Number(
              empClothingRow.find(".clothingType").attr("title")
            );
            let size = $($(".ddlSize :selected")[index]).text();
            let sizeId = Number($($(".ddlSize :selected")[index]).val());
            const remainingItems = await this._getRemainingItems(
              clothingTypeId,
              sizeId
            );
            if (remainingItems.length <= 0) {
              alert("لايوجد مقاسات متاحه لهذه الملابس");
              return;
            } else {
              const reminingItem = remainingItems[0] as ISPRemainingItems;
              if (reminingItem.Remaining_x0020_Items <= 0) {
                alert("لايوجد مقاسات متاحه لهذه الملابس بالمخازن");
                return;
              }
            }
            for (let p = 0; p < periodItems; p++) {
              listAssign.items.add(
                {
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
              resStock.forEach(async (itemRemaining: ISPRemainingItems) => {
                ReceivedItems = itemRemaining.ReceivedItems + periodItems;
                await listStock.items
                  .getById(itemRemaining.Id)
                  .update({ ReceivedItems: ReceivedItems });
              });
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
  }
  private async _getEmployeeAssigment(employeeNo: string) {
    return await pnp.sp.web.lists
      .getByTitle("Blue Collar Stock Assignment")
      .items.filter(
        `EmployeeNumber eq '${employeeNo}' and Created ge '${DateFromPeriod.toLocaleDateString()}' and Created le '${DateToPeriod.toLocaleDateString()}'`
      )
      .get();
  }
  //#endregion

  //#region Recieve Items
  private async _getClothingTypesSizesItems(): Promise<
    ISPClothingTypesSizes[]
  > {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Clothing Types Sizes")
      .items.select(
        "Title,ClothingType/Id,ClothingType/Title,Size/Id,Size/Title"
      )
      .expand("ClothingType,Size")
      .getAll();
    return response;
  }
  private async _getClothingSizesItems(): Promise<ISPClothingSize[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Clothing Sizes")
      .items.get();
    return response;
  }
  private DrawStockTransactionsTable() {
    let clothingTypesSizes = null;
    let ClothingRemainingItems = null;
    let remainingItems = 0;
    let currentItems = 0;
    let stockId = 0;
    let tableBody = document.getElementById("tbodyClothingTypes");
    let tableRows: string = "";

    this._getClothingTypesSizesItems().then(async (res) => {
      clothingTypesSizes = res;
      if (clothingTypesSizes.length <= 0) {
        alert(
          "لا يوجد بيانات للملابس و انواعها و مقاساتها نرجو التواصل مع اداره الموارد البشريه"
        );
        return;
      }
      //console.table(res);
      $("#tbodyClothingTypes").show();
      for (let index = 0; index < clothingTypesSizes.length; index++) {
        const item = clothingTypesSizes[index] as ISPClothingTypesSizes;
        //tslint:disable-next-line: no-shadowed-variable
        const ClothingRemainingItems = await this._getRemainingItems(
          item.ClothingType.Id,
          item.Size.Id
        );
        remainingItems = 0;
        currentItems = 0;
        stockId = 0;
        ClothingRemainingItems.forEach((itemRemaining: ISPRemainingItems) => {
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
        .addEventListener("click", async () => {
          this.AddItemsToStockTrans();
        });
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
    });
  }
  private async AddItemsToStockTrans() {
    let alertTxt = "";
    if (
      $("#txtAdminComments").val().toString().trim() == "" ||
      $("#txtInvoiceNO").val().toString().trim() == ""
    ) {
      alert("من فضلك قم بادخال تعليقات و رقم الفاتورة");
      return;
    }
    let txtAdminComments = $("#txtAdminComments").val();
    let txtInvoiceNO = $("#txtInvoiceNO").val();
    const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
    const entityNameStock = await listStock.getListItemEntityTypeFullName();
    const listTrans = pnp.sp.web.lists.getByTitle(
      "Blue Collar Stock Transaction"
    );
    const entityNameTrans = await listTrans.getListItemEntityTypeFullName();
    const batch = pnp.sp.web.createBatch();
    // tslint:disable-next-line: no-function-expression
    let tbClothingTypes = $("#tbClothingTypes> tbody > tr");
    for (let index = 0; index < tbClothingTypes.length; index++) {
      const currentRow = $(tbClothingTypes[index]);
      let barCode = currentRow.find(".barCode").text();
      let clothingType = Number.parseInt(
        currentRow.find(".clothingType").attr("title")
      );
      let clothingSize = Number.parseInt(
        currentRow.find(".clothingSize").attr("title")
      );
      let stockId = Number.parseInt(currentRow.find(".stockId").attr("title"));
      let itemsCount = Number.parseInt(
        currentRow.find(".stockId").val().toString()
      );
      let itemsData = Number.parseInt(
        currentRow.find(".itemsData").attr("title")
      );
      let remainingItems = Number.parseInt(
        currentRow.find(".itemsData").text()
      );
      const ClothingRemainingItems = await this._getRemainingItems(
        clothingType,
        clothingSize
      );
      if (
        itemsCount > 0
        //&& ClothingRemainingItems.length > 0
        //&& ClothingRemainingItems[0].Remaining_x0020_Items > 0
      ) {
        if ($("#rdoReturn:checked").length > 0) {
          if (
            ClothingRemainingItems.length > 0 &&
            itemsCount > ClothingRemainingItems[0].Remaining_x0020_Items
          )
            alertTxt += `\n لا يمكنك عمل مرتجع بعدد وحدات اكبر من الوحدات المتبقيه ل ${barCode} `;
          else {
            //return items
            //add transaction item
            listTrans.items.add(
              {
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
            } else {
              listStock.items.add(
                {
                  ClothingTypeId: clothingType,
                  SizeId: clothingSize,
                  OpeningBalance: itemsCount,
                }
                // entityNameStock
              );
              // all of above using batchs.
            }
          }
        } else {
          //receive items
          //add transaction item
          listTrans.items.add(
            {
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
          } else {
            listStock.items.add(
              {
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
    } else {
      batch.execute().then(() => {
        // $("#tbodyClothingTypes").hide();
        // $("#tbodyClothingTypes > tr").remove();
        console.log(batch);
        this.render();
        alert("تم حفظ البيانات بنجاح");
      });
    }
  }
  //#endregion

  //#region Consumable Items
  private async LoadConsumableItems() {
    const resConsum = await this._getConsumableItems();
    const resBranches = await this._getCostCenter();
    if (resConsum.length > 0 && resBranches.length > 0) {
      let ddlConsumItems = <HTMLSelectElement>(
        document.getElementById("ddlConsumItems")
      );
      let ddlBranches = <HTMLSelectElement>(
        document.getElementById("ddlBranches")
      );
      resBranches.forEach((item: ISPBranch) => {
        var opt = document.createElement("option");
        opt.value = item.Id.toString();
        opt.innerText = item.Location;
        ddlBranches.appendChild(opt);
      });
      resConsum.forEach((item: ISPConsumableItems) => {
        var opt = document.createElement("option");
        opt.value = item.Items.Id.toString();
        opt.innerText = item.Items.Title;
        ddlConsumItems.appendChild(opt);
      });

      $("#btnConsumSave").show();
      document
        .getElementById("btnConsumSave")
        .addEventListener("click", async () => {
          const res = await this.AddItemsToConsumableItems();
        });
    }
  }
  private async _getConsumableItems(): Promise<ISPConsumableItems[]> {
    return await pnp.sp.web.lists
      .getByTitle("Blue Collar Consumable Items")
      .items.select("Id,Items/Id,Items/Title")
      .expand("Items")
      .get();
  }
  private async _getCostCenter(): Promise<ISPBranch[]> {
    return await pnp.sp.web.lists
      .getByTitle("Blue Collar Branches")
      .items.get();
  }
  private async AddItemsToConsumableItems() {
    if (
      $("#txtItemsCount").val() == 0 ||
      $("#txtItemsCount").val().toString().trim() == ""
    ) {
      alert("يجب ادخال عدد وحدات اكبر من صفر");
      return;
    }
    let itemsCount = Number($("#txtItemsCount").val());
    //add items into transactions list and substract items from stock list.
    let clothingId = Number($("#ddlConsumItems").val());
    let branch = $("#ddlBranches option:selected").text();
    let ReceivedItems: number = 0;

    const resStock = await this._getItemsInStock(clothingId);
    if (resStock.length <= 0) {
      alert("لايوجد ملابس بالمخازن");
      return;
    }
    if (Number(resStock[0].Remaining_x0020_Items) < itemsCount) {
      alert("لايوجد ملابس بالمخازن");
      return;
    }
    await pnp.sp.web.lists
      .getByTitle("Blue Collar Consumable Items Transactions")
      .items.add({ Title: branch, ItemId: clothingId, ItemsCount: itemsCount });

    resStock.forEach(async (itemRemaining: ISPRemainingItems) => {
      ReceivedItems = itemRemaining.ReceivedItems + itemsCount;
      await pnp.sp.web.lists
        .getByTitle("Blue Collar Stock")
        .items.getById(itemRemaining.Id)
        .update({ ReceivedItems: ReceivedItems });
      alert("تم حفظ البيانات");
      $("#txtItemsCount").val("0");
      this.render();
    });
  }
  //#endregion

  //#region Exception Items
  private async GetExceptEmpData() {
    let empNo = $("#txtExceptEmpNO").val();
    const resPeriods = await this._getPeriodTypes();
    if (resPeriods.length <= 0) {
      alert("لا يوجد فترات نرجو التواصل مع الموارد البشريه");
      return;
    }
    this._getPeriodType(resPeriods);
    const resEmp = await this._getExceptEmpData(empNo.toString());
    if (resEmp.length <= 0) {
      alert("هذا العامل غير موجود");
      return;
    }
    if (resEmp[0].EmployeeStatus != "Active") {
      alert(
        "هذا العامل غير مفعل نرجو التواصل مع الموارد البشريه لتفعيل العامل"
      );
      return;
    }
    if (!resEmp[0].ExceptionAllowed) {
      alert("هذا العامل ليس له استثناءات نرجو التواصل مع الموارد البشريه");
      return;
    }
    let tableBody = document.getElementById("tbodyExceptEmpData");
    let tableRows: string = "";
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
    const resClothing = await this._getEmpTypeClothing(
      resEmp[0].EmployeeType.Id
    );
    if (resClothing.length <= 0) {
      alert(
        "وظيفه هذا العامل لا يوجد لها انواع ملابس نرجو التواصل مع الموارد البشريه"
      );
      return;
    }
    const resSize = await this._getClothingSizesItems();
    if (resSize.length <= 0) {
      alert("لا يوجد مقاسات لانواع الملابس نرجو التواصل مع الموارد البشريه");
      return;
    }
    //check here if the user has items recieved for current period or not
    tableBody = document.getElementById("tbodyExceptEmpClothing");
    tableRows = "";
    for (let index = 0; index < resClothing.length; index++) {
      const item = resClothing[index] as ISPBlueCollarTypes;
      const resInStock = await this._getItemsInStock(item.ClothingType.Id);
      let selectHTML: string = "";
      selectHTML += "<select class='ddlSize' style='width: 50% !Important;'>";
      resInStock.forEach((itemRemaining: ISPRemainingItems) => {
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
      .addEventListener("click", async () => {
        $("#btnExceptSave").hide();
        const res = await this.AddExceptItemsToStockLists();
      });
  }
  private async _getExceptEmpData(empNo: string): Promise<ISPEmpDataItems[]> {
    // let empNo = $("#txtEmpNO").val();
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Data")
      .items.select(
        "ID,Title,EmployeeNumber,EmployeeType/Id,EmployeeType/Title,CostCenter,Location,EmployeeStatus,ExceptionAllowed"
      )
      .expand("EmployeeType")
      .filter(`EmployeeNumber eq '${empNo}'`)
      .get();
    return response;
  }
  private async AddExceptItemsToStockLists() {
    const spfxContext = this;
    let empNo = $($("#tbExceptEmpData> tbody > tr")[0]).find(".empNo").text();
    let empNoId = Number(
      $($("#tbExceptEmpData> tbody > tr")[0]).find(".empNo").attr("title")
    );
    const listEmp = pnp.sp.web.lists.getByTitle("Blue Collar Data");
    const listStock = pnp.sp.web.lists.getByTitle("Blue Collar Stock");
    const listAssign = pnp.sp.web.lists.getByTitle(
      "Blue Collar Stock Assignment"
    );
    const entityNameAssign = await listAssign.getListItemEntityTypeFullName();
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
      let clothingTypeId = Number(
        empClothingRow.find(".clothingType").attr("title")
      );
      let size = $($(".ddlSize :selected")[index]).text();
      let sizeId = Number($($(".ddlSize :selected")[index]).val());
      const remainingItems = await this._getRemainingItems(
        clothingTypeId,
        sizeId
      );
      if (remainingItems.length <= 0) {
        alert("لايوجد مقاسات متاحه لهذه الملابس");
        return;
      } else {
        const reminingItem = remainingItems[0] as ISPRemainingItems;
        if (reminingItem.Remaining_x0020_Items <= 0) {
          alert("لايوجد مقاسات متاحه لهذه الملابس بالمخازن");
          return;
        }
      }
      //for (let p = 0; p < periodItems; p++) {
      listAssign.items.add(
        {
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
      await listEmp.items.getById(empNoId).update({ ExceptionAllowed: false });

      let ReceivedItems = 0;
      this._getRemainingItems(clothingTypeId, sizeId).then((resStock) => {
        resStock.forEach(async (itemRemaining: ISPRemainingItems) => {
          ReceivedItems = itemRemaining.ReceivedItems + 1;
          await listStock.items
            .getById(itemRemaining.Id)
            .update({ ReceivedItems: ReceivedItems });
        });
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
  }
  //#endregion

  //#region Helper Function
  private async _getRemainingItems(
    clothingId: number,
    sizeId: number
  ): Promise<ISPRemainingItems[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Stock")
      .items.select("Remaining_x0020_Items,OpeningBalance,ReceivedItems,Id")
      .filter(`ClothingType/Id eq '${clothingId}' and Size/Id eq '${sizeId}'`)
      .get();
    return response;
  }
  private async _getItemsInStock(
    clothingId: number
  ): Promise<ISPRemainingItems[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("Blue Collar Stock")
      .items.select(
        "Id,Size/Id,Size/Title,ReceivedItems,Remaining_x0020_Items,OpeningBalance"
      )
      .expand("Size")
      .filter(`ClothingType/Id eq '${clothingId}'`)
      .get();
    return response;
  }
  private async SendMail(mailProps: ISPEmail) {
    await pnp.sp.utility.sendEmail({
      To: [mailProps.To],
      Subject: mailProps.Subject,
      Body: mailProps.Body,
    });
    //console.log("Email Sent!");
  }
  private async SendNotificationMail(mailProps: ISPEmail): Promise<void> {
    const body: string = JSON.stringify({
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

    let spOpts: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "odata-version": "",
      },
      body: body,
    };

    var senMailURL =
      this.context.pageContext.web.absoluteUrl +
      "/_api/SP.Utilities.Utility.SendEmail";

    this.context.spHttpClient
      .post(senMailURL, SPHttpClient.configurations.v1, spOpts)
      .then((response: SPHttpClientResponse) => {
        console.log(`Status code: ${response.status}`);
        console.log(`Status text: ${response.statusText}`);
        if (response.status == 200) {
          alert(
            "تم ارسال بريد الكتروني لاداره الموارد البشريه لتعديل البيانات"
          );
        } else {
          alert(
            "حدث خطأ نرجو المحاوله مره اخرس او التواصل مع اداره الموارد البشريه"
          );
        }
        response.json().then((responseJSON: JSON) => {
          //alert("Mail Sent Sucessfully");
          console.log(responseJSON);
        });
      });
  }
  //#endregion

  //#region  system methods
  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
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
  //#endregion
}
