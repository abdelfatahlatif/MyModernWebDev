export interface ISPClothingType {
  Id: number;
  Title: string;
}

export interface ISPClothingTypesSizes {
  Title: string;
  ClothingType: ISPClothingType;
  Size: ISPClothingSize;
}

export interface ISPClothingSize {
  Id: number;
  Title: string;
}

export interface ISPEmployeeType {
  Id: number;
  Title: string;
}

export interface ISPBranch {
  Id: number;
  //Title: string;
  Location: string;
}

export interface ISPBlueCollarTypes {
  EmployeeType: ISPEmployeeType;
  ClothingType: ISPClothingType;
  PeriodType: string;
}

export interface ISPRemainingItems {
  Id: number;
  OpeningBalance: number;
  ReceivedItems: number;
  Remaining_x0020_Items: number;
  Size: ISPClothingSize;
}

export interface ISPEmpDataItems {
  Id: number;
  Title: string;
  EmployeeNumber: string;
  EmployeeType: ISPEmployeeType;
  CostCenter: string;
  Location:string;
  EmployeeStatus: string;
  ExceptionAllowed: boolean;
}

export interface ISPPeriodType {
  PeriodType: string;
  DateFrom: string;
  DateTo: string;
  NumberOfItems: number;
}

export interface ISPConsumableItems
{
  Id:number;
  Items:ISPClothingType;
}

export class ISPEmail {
  public To: string;
  public CC: string;
  public Body: string;
  public Subject: string;
}
