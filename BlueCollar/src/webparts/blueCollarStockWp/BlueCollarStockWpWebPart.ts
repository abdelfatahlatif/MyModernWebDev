import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";
import pnp, { ItemAddResult, ItemUpdateResult } from "sp-pnp-js";
import styles from "./BlueCollarStockWpWebPart.module.scss";
import * as strings from "BlueCollarStockWpWebPartStrings";
import { stringIsNullOrEmpty } from "@pnp/common";

export interface IBlueCollarStockWpWebPartProps {
  description: string;
}

export interface ISPList {
  ID: number;

  Title: string;

  NumberOfItems: number;
}

export default class BlueCollarStockWpWebPart extends BaseClientSideWebPart<IBlueCollarStockWpWebPartProps> {
  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.blueCollarStockWp}">
        <div class="${styles.container}">
          <div class="${styles.row}">
            <div class="${styles.column}">
              <span class="${styles.title}">Blue Collar Stock</span>
              <p class="${styles.description}">${escape(
      this.properties.description
    )}</p>             
              <div> <span class="${
                styles.label
              }"> Size </span> <select id="ddlSize"> </select> 
              <span class="${
                styles.label
              }" style="margin-left:3%;"> Amount </span> <input type="text" id="txtAmount" readonly="true" style="width:16.5%"> 
              </div>
              <br/>
              <div> <span class="${
                styles.label
              }"> Employee Name </span> <input id="txtEmpName" type="text"> 
              </div>
              <br/>
              <div> <button id="btnSave" class="button">Save</button> 
              </div>
            </div>
          </div>
        </div>
      </div>`;

    this.getSPItems();

    document.getElementById("btnSave").addEventListener("click", () => {
      this.AddItemToList();
    });

    document.getElementById("ddlSize").addEventListener("change", () => {
      this.fillCountValue();
    });
  }

  //#region Get List Items
  private getSPItems(): void {
    this._getSPItems().then((response) => {
      this._renderList(response);
    });
  }

  private async _getSPItems(): Promise<ISPList[]> {
    const response = await pnp.sp.web.lists
      .getByTitle("BlueCollarStock")
      .items.get();
    return response;
  }

  private _renderList(items: ISPList[]): void {
    if (items.length > 0) {
      let ddlSize = document.getElementById("ddlSize");

      var opt = document.createElement("option");
      opt.value = "0";
      opt.innerHTML = "Select Size";
      ddlSize.appendChild(opt);

      items.forEach((item: ISPList) => {
        // tslint:disable-next-line: no-shadowed-variable
        let opt = document.createElement("option");
        opt.value = item.NumberOfItems.toString();
        opt.innerHTML = item.Title;
        opt.title = item.ID.toString();
        ddlSize.appendChild(opt);
      });
    }
  }
  //#endregion

  //#region Add and Update Items

  private fillCountValue(): void {
    let ddlSize = <HTMLSelectElement>document.getElementById("ddlSize");
    let txtAmount = <HTMLInputElement>document.getElementById("txtAmount");
    txtAmount.value = ddlSize.value;
    if(Number(txtAmount.value) <= 0)
    alert(`Sorry but there is no more stock for ${ddlSize.options[ddlSize.selectedIndex].innerText} Size!`);
  }

  private async AddItemToList() {
    let ddlSize = <HTMLSelectElement>document.getElementById("ddlSize");
    let txtEmpName = <HTMLInputElement>document.getElementById("txtEmpName");
    let txtAmount = <HTMLInputElement>document.getElementById("txtAmount");

    if (ddlSize.selectedIndex == 0) {
      alert("Please Choose Size!");
      return;
    }

    if (stringIsNullOrEmpty(txtEmpName.value)) {
      alert("Please Enter Employee Name!");
      return;
    }

    this.GetListItem(ddlSize).then((igr: ISPList) => {
      txtAmount.value = igr.NumberOfItems.toString();
      if (igr.NumberOfItems > 0) {
        this.AddListItem(ddlSize, txtEmpName)
          .then((iar: ItemAddResult) => {
            this.UpdateStockList(ddlSize, txtAmount)
              .then((iur: ItemUpdateResult) => {
                alert(
                  "Record with Employee Name : " + txtEmpName.value + " Added !"
                );
                this.render();
              })
              .catch((e: Error) => {
                alert(`There was an error updating the item ${e.message}`);
              });
          })
          .catch((e: Error) => {
            alert(`There was an error adding the item ${e.message}`);
          });
      } else {
        alert("Sorry but there is no more stock for this Size!");
      }
    });
  }

  private async GetListItem(ddlSize: any) {
    return await pnp.sp.web.lists
      .getByTitle("BlueCollarStock")
      .items.getById(Number(ddlSize.options[ddlSize.selectedIndex].title))
      .get();
  }

  private async AddListItem(ddlSize: any, txtEmpName: any) {
    return await pnp.sp.web.lists
      .getByTitle("Blue Collar Assignment")
      .items.add({
        Title: ddlSize.options[ddlSize.selectedIndex].text,
        EmployeeName: txtEmpName.value,
      });
  }

  private async UpdateStockList(ddlSize: any, txtAmount: any) {
    let newVal = Number(txtAmount.value) - 1;
    return await pnp.sp.web.lists
      .getByTitle("BlueCollarStock")
      .items.getById(Number(ddlSize.options[ddlSize.selectedIndex].title))
      .update({
        NumberOfItems: newVal,
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
