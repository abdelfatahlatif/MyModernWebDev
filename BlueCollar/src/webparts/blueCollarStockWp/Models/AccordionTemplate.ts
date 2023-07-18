import styles from "../BlueCollarStockWpWebPart.module.scss";

export default class AccordionTemplate {
  public static templateHtml: string = `<div class="${styles.blueCollarStockWp}">
  <div class="${styles.container}">
      <div class="${styles.row}">
          <div class="${styles.column}">
              <span class="${styles.title}">اداره مخزون ملابس عمال الفروع</span>
              <p class="${styles.description}"></p>
              <div class="accordion">
                  <h3> تسليم الملابس للعمال</h3>
                  <div style="height: auto !important;">
                      <ul>
                          <li> <label> رقم العامل:  </label> <input type="text" value="" id="txtEmpNO" /> <button id="btnSearch" class="button"> بحث </button> </li>
                      </ul>
                      <table id="tbEmpData" style="display:none;">
                          <thead style="width:100% !Important;">
                              <tr>
                                  <th>اسم العامل</th>
                                  <th>رقم العامل</th>
                                  <th>وظيفة العامل</th>
                                  <th>مركز التكلفه</th>
                                  <th>الفرع</th>
                              </tr>
                          </thead>
                          <tbody id="tbodyEmpData" style="width:100% !Important;">
                          </tbody>
                      </table>
                      <br />
                      <table id="tbEmpClothing" style="display:none;">
                          <thead style="width:100% !Important;">
                              <tr>
                                  <th>نوع الملابس</th>
                                  <th>نوع الوظيفه</th>
                                  <th>مقاس الملابس</th>
                                  <th>عدد الوحدات</th>
                                  <th> نوع الفتره</th>
                              </tr>
                          </thead>
                          <tbody id="tbodyEmpClothing" style="width:100% !Important;">
                          </tbody>
                      </table>
                      <br />
                      <ul id="ulAction" style="display:none;">
                          <li>
                              <label for="action">نوع الحركه: </label>
                          </li>
                          <li>
                              <select id="ddlAction">
                                  <option value="0" selected>موظف جديد/حالي </option>
                                  <option value="1">موظف مستقيل</option>
                                  <option value="2">موظف بوظيفه خاطئه</option>
                              </select>
                          </li>
                          <li id="ulRejection" style="display:none;">
                              <label for="action">تعليقات: </label>
                              <textarea id="txtComments" rows="1" cols="50" required value=""> </textarea>
                          </li>
                      </ul>
                      <br />
                      <div>
                          <button id="btnSave" class="button" style="display:none;">حفظ</button>
                      </div>
                  </div>
                  <h3>استلام الملابس من المصنع</h3>
                  <div style="height: auto !important;">
                      <table id='tbClothingTypes'>
                          <thead>
                              <tr>
                                  <th>رقم الباركود</th>
                                  <th>نوع الملابس</th>
                                  <th>المقاس</th>
                                  <th>عدد الوحدات</th>
                                  <th>الوحدات المتبقيه</th>
                              </tr>
                          </thead>
                          <tbody id="tbodyClothingTypes" style="display:none;">
                          </tbody>
                      </table>
                      <br />
                      <ul>
                          <li>
                              <label for="action">نوع الحركه: </label>
                          </li>
                          <li>
                              <label for="Receive">استلام </label>
                              <input type="radio" id="rdoReceive" name="Receivegrp" value="Receive" checked />
                          </li>
                          <li>
                              <label for="Return">مرتجع</label>
                              <input type="radio" id="rdoReturn" name="Receivegrp" value="Return" />
                          </li>
                      </ul>
                      <br/>
                      <ul>
                        <li>
                        <label for="action">تعليقات: </label>
                        <input id="txtAdminComments" type="text" value=""> </textarea>
                        </li>
                        <li>
                        <label for="action">رقم الفاتوره: </label>
                        <input  id="txtInvoiceNO" type="text" value=""> </textarea>
                        </li>
                      </ul>
                      <br />
                      <div>
                          <button id="btnSaveItems" class="button">حفظ</button>
                      </div>
                  </div>
                  <h3>ملابس سريعه التلف</h3>
                  <div style="height: auto !important;">
                      <ul id="ulConsumAction">
                          <li>
                              <label for="action">نوع الملابس: </label>
                          </li>
                          <li>
                              <select id="ddlConsumItems">
                              </select>
                          </li>
                          <li>
                              <label for="action">الفرع: </label>
                          </li>
                          <li>
                              <select id="ddlBranches">
                              </select>
                          </li>
                          <li>
                            <label for="action">عدد االوحدات : </label>
                          </li>
                          <li>
                            <input id="txtItemsCount" type="number" required value='0'/>
                          <li>
                      </ul>                    
                      <br />
                      <div>
                          <button id="btnConsumSave" class="button" style="display:none;">حفظ</button>
                      </div>
                  </div>
                  <h3>صرف ملابس استثنائيه</h3>
                  <div style="height: auto !important;">
                      <ul>
                          <li> <label> رقم العامل:  </label> <input type="text" value="" id="txtExceptEmpNO" /> <button id="btnExceptSearch" class="button"> بحث </button> </li>
                      </ul>
                      <table id="tbExceptEmpData" style="display:none;">
                          <thead style="width:100% !Important;">
                              <tr>
                                  <th>اسم العامل</th>
                                  <th>رقم العامل</th>
                                  <th>وظيفة العامل</th>
                                  <th>مركز التكلفه</th>
                                  <th>الفرع</th>
                              </tr>
                          </thead>
                          <tbody id="tbodyExceptEmpData" style="width:100% !Important;">
                          </tbody>
                      </table>
                      <br />
                      <table id="tbExceptEmpClothing" style="display:none;">
                          <thead style="width:100% !Important;">
                              <tr>
                                  <th>نوع الملابس</th>
                                  <th>نوع الوظيفه</th>
                                  <th>مقاس الملابس</th>                                 
                                  <th> نوع الفتره</th>
                              </tr>
                          </thead>
                          <tbody id="tbodyExceptEmpClothing" style="width:100% !Important;">
                          </tbody>
                      </table>
                      <br />                            
                      <br />
                      <div>
                          <button id="btnExceptSave" class="button" style="display:none;">حفظ</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>`;
}
