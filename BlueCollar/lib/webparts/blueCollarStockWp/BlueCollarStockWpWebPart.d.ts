import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
export interface IBlueCollarStockWpWebPartProps {
    description: string;
}
export interface ISPList {
    ID: number;
    Title: string;
    NumberOfItems: number;
}
export default class BlueCollarStockWpWebPart extends BaseClientSideWebPart<IBlueCollarStockWpWebPartProps> {
    render(): void;
    private getSPItems;
    private _getSPItems;
    private _renderList;
    private fillCountValue;
    private AddItemToList;
    private GetListItem;
    private AddListItem;
    private UpdateStockList;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=BlueCollarStockWpWebPart.d.ts.map