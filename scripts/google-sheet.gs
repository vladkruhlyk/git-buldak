/**
 * Приймає заявки з форми на /form і дописує їх рядком у Google-таблицю.
 *
 * Як підключити (5 хвилин):
 *  1. Відкрийте свою таблицю → Розширення → Apps Script.
 *  2. Видаліть усе, що там є, вставте цей файл, збережіть.
 *  3. Розгорнути → Новий розгортання → тип «Веб-додаток»:
 *       Виконувати від імені: Я
 *       Хто має доступ:       Будь-хто
 *     Скопіюйте URL вигляду https://script.google.com/macros/s/.../exec
 *  4. У змінних оточення проєкту git-buldak на Vercel додайте:
 *       GOOGLE_SHEET_WEBHOOK_URL = цей URL
 *       GOOGLE_SHEET_SECRET      = рядок SECRET нижче
 *     і зробіть редеплой — без нього змінні не підхопляться.
 *
 * Після кожної зміни коду треба зробити НОВЕ розгортання, інакше Google
 * і далі віддаватиме стару версію за тим самим URL.
 */

// Той самий рядок, що і в GOOGLE_SHEET_SECRET на сайті. Він потрібен, бо
// веб-додаток відкритий для всіх: без нього засмітити таблицю зміг би будь-хто,
// хто дізнався URL. Щоб прибрати секрет із коду — задайте властивість скрипта
// SHEET_SECRET (Налаштування проєкту → Властивості скрипта).
const SECRET =
  PropertiesService.getScriptProperties().getProperty('SHEET_SECRET') ||
  'DQtkgiuPtKzddFLe6ICuJFW7vCPXCztGRAhskEJl';

const SHEET_NAME = 'Заявки';

const COLUMNS = [
  'Дата',
  'Імʼя',
  'Телефон',
  'Смаки',
  'Партія',
  'Коментар',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'Сторінка',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Дві заявки в одну секунду не мають перезаписати рядок одна одної.
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);

    if (SECRET && data.secret !== SECRET) {
      return reply({ ok: false, error: 'forbidden' });
    }

    getSheet().appendRow([
      data.date || new Date(),
      data.name || '',
      data.phone || '',
      data.flavors || '',
      data.batch || '',
      data.request || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.page_url || '',
    ]);

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Повертає лист із заявками, створюючи його із шапкою за потреби. */
function getSheet() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(4, 220);
    sheet.setColumnWidth(6, 280);
  }
  return sheet;
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Запустіть вручну один раз, щоб перевірити, що рядок дописується. */
function testAppend() {
  doPost({ postData: { contents: JSON.stringify({
    secret: SECRET,
    date: new Date().toISOString(),
    name: 'Тестова заявка',
    phone: '+380 63 111 22 33',
    flavors: 'Carbonara, Cheese',
    batch: '15 ящиків',
    request: 'перевірка',
  }) } });
}
