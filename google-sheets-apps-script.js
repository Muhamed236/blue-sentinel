function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('BlueSentinel') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('BlueSentinel');
  var data = JSON.parse(e.postData.contents || '{}');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['وقت الإرسال','النوع','الوقت','بواسطة','النقطة','الطلب/الحالة','ملاحظات']);
  }
  sheet.appendRow([new Date(), data.kind || '', data.time || '', data.by || '', data.point || '', data.type || '', data.note || '']);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
