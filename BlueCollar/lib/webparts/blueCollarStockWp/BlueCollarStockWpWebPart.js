var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Version } from "@microsoft/sp-core-library";
import { PropertyPaneTextField, } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";
import pnp from "sp-pnp-js";
import styles from "./BlueCollarStockWpWebPart.module.scss";
import * as strings from "BlueCollarStockWpWebPartStrings";
import { stringIsNullOrEmpty } from "@pnp/common";
var BlueCollarStockWpWebPart = /** @class */ (function (_super) {
    __extends(BlueCollarStockWpWebPart, _super);
    function BlueCollarStockWpWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlueCollarStockWpWebPart.prototype.render = function () {
        var _this = this;
        this.domElement.innerHTML = "\n      <div class=\"" + styles.blueCollarStockWp + "\">\n        <div class=\"" + styles.container + "\">\n          <div class=\"" + styles.row + "\">\n            <div class=\"" + styles.column + "\">\n              <span class=\"" + styles.title + "\">Blue Collar Stock</span>\n              <p class=\"" + styles.description + "\">" + escape(this.properties.description) + "</p>             \n              <div> <span class=\"" + styles.label + "\"> Size </span> <select id=\"ddlSize\"> </select> \n              <span class=\"" + styles.label + "\" style=\"margin-left:3%;\"> Amount </span> <input type=\"text\" id=\"txtAmount\" readonly=\"true\" style=\"width:16.5%\"> \n              </div>\n              <br/>\n              <div> <span class=\"" + styles.label + "\"> Employee Name </span> <input id=\"txtEmpName\" type=\"text\"> \n              </div>\n              <br/>\n              <div> <button id=\"btnSave\" class=\"button\">Save</button> \n              </div>\n            </div>\n          </div>\n        </div>\n      </div>";
        this.getSPItems();
        document.getElementById("btnSave").addEventListener("click", function () {
            _this.AddItemToList();
        });
        document.getElementById("ddlSize").addEventListener("change", function () {
            _this.fillCountValue();
        });
    };
    //#region Get List Items
    BlueCollarStockWpWebPart.prototype.getSPItems = function () {
        var _this = this;
        this._getSPItems().then(function (response) {
            _this._renderList(response);
        });
    };
    BlueCollarStockWpWebPart.prototype._getSPItems = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pnp.sp.web.lists
                            .getByTitle("BlueCollarStock")
                            .items.get()];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BlueCollarStockWpWebPart.prototype._renderList = function (items) {
        if (items.length > 0) {
            var ddlSize_1 = document.getElementById("ddlSize");
            var opt = document.createElement("option");
            opt.value = "0";
            opt.innerHTML = "Select Size";
            ddlSize_1.appendChild(opt);
            items.forEach(function (item) {
                // tslint:disable-next-line: no-shadowed-variable
                var opt = document.createElement("option");
                opt.value = item.NumberOfItems.toString();
                opt.innerHTML = item.Title;
                opt.title = item.ID.toString();
                ddlSize_1.appendChild(opt);
            });
        }
    };
    //#endregion
    //#region Add and Update Items
    BlueCollarStockWpWebPart.prototype.fillCountValue = function () {
        var ddlSize = document.getElementById("ddlSize");
        var txtAmount = document.getElementById("txtAmount");
        txtAmount.value = ddlSize.value;
        if (Number(txtAmount.value) <= 0)
            alert("Sorry but there is no more stock for " + ddlSize.options[ddlSize.selectedIndex].innerText + " Size!");
    };
    BlueCollarStockWpWebPart.prototype.AddItemToList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ddlSize, txtEmpName, txtAmount;
            var _this = this;
            return __generator(this, function (_a) {
                ddlSize = document.getElementById("ddlSize");
                txtEmpName = document.getElementById("txtEmpName");
                txtAmount = document.getElementById("txtAmount");
                if (ddlSize.selectedIndex == 0) {
                    alert("Please Choose Size!");
                    return [2 /*return*/];
                }
                if (stringIsNullOrEmpty(txtEmpName.value)) {
                    alert("Please Enter Employee Name!");
                    return [2 /*return*/];
                }
                this.GetListItem(ddlSize).then(function (igr) {
                    txtAmount.value = igr.NumberOfItems.toString();
                    if (igr.NumberOfItems > 0) {
                        _this.AddListItem(ddlSize, txtEmpName)
                            .then(function (iar) {
                            _this.UpdateStockList(ddlSize, txtAmount)
                                .then(function (iur) {
                                alert("Record with Employee Name : " + txtEmpName.value + " Added !");
                                _this.render();
                            })
                                .catch(function (e) {
                                alert("There was an error updating the item " + e.message);
                            });
                        })
                            .catch(function (e) {
                            alert("There was an error adding the item " + e.message);
                        });
                    }
                    else {
                        alert("Sorry but there is no more stock for this Size!");
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    BlueCollarStockWpWebPart.prototype.GetListItem = function (ddlSize) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pnp.sp.web.lists
                            .getByTitle("BlueCollarStock")
                            .items.getById(Number(ddlSize.options[ddlSize.selectedIndex].title))
                            .get()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlueCollarStockWpWebPart.prototype.AddListItem = function (ddlSize, txtEmpName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pnp.sp.web.lists
                            .getByTitle("Blue Collar Assignment")
                            .items.add({
                            Title: ddlSize.options[ddlSize.selectedIndex].text,
                            EmployeeName: txtEmpName.value,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    BlueCollarStockWpWebPart.prototype.UpdateStockList = function (ddlSize, txtAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var newVal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newVal = Number(txtAmount.value) - 1;
                        return [4 /*yield*/, pnp.sp.web.lists
                                .getByTitle("BlueCollarStock")
                                .items.getById(Number(ddlSize.options[ddlSize.selectedIndex].title))
                                .update({
                                NumberOfItems: newVal,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Object.defineProperty(BlueCollarStockWpWebPart.prototype, "dataVersion", {
        //#endregion
        //#region  system methods
        get: function () {
            return Version.parse("1.0");
        },
        enumerable: false,
        configurable: true
    });
    BlueCollarStockWpWebPart.prototype.getPropertyPaneConfiguration = function () {
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
    };
    return BlueCollarStockWpWebPart;
}(BaseClientSideWebPart));
export default BlueCollarStockWpWebPart;
//# sourceMappingURL=BlueCollarStockWpWebPart.js.map