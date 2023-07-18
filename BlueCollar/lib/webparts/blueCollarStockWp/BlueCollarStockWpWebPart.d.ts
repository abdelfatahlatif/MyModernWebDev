import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import "@pnp/sp/sputilities";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups";
import "jqueryui";
import "datatables.net";
export interface IBlueCollarStockWpWebPartProps {
    description: string;
}
export default class BlueCollarStockWpWebPart extends BaseClientSideWebPart<IBlueCollarStockWpWebPartProps> {
    constructor();
    onInit(): Promise<void>;
    render(): void;
    private GetEmpData;
    private _getEmpData;
    private _getEmpTypeClothing;
    private _getPeriodTypes;
    private _getPeriodType;
    private AddItemsToStockLists;
    private _getEmployeeAssigment;
    private _getClothingTypesSizesItems;
    private _getClothingSizesItems;
    private DrawStockTransactionsTable;
    private AddItemsToStockTrans;
    private LoadConsumableItems;
    private _getConsumableItems;
    private _getCostCenter;
    private AddItemsToConsumableItems;
    private GetExceptEmpData;
    private _getExceptEmpData;
    private AddExceptItemsToStockLists;
    private _getRemainingItems;
    private _getItemsInStock;
    private SendMail;
    private SendNotificationMail;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=BlueCollarStockWpWebPart.d.ts.map