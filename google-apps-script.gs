const SPREADSHEET_ID = '1T8WZzBQa3YxocQV681-gBkn41Kph5celi4ZxO8wuGkE';
const TARGET_SHEET_ID = 0;
const HEADERS = [
  'Submitted At',
  'Email Address',
  'School',
  'T-Shirt Size',
  'Program Choice 1',
  'Program Choice 2',
  'Program Choice 3',
  'EVSC Student',
  'Saw Us at Options Fair',
  'Full Name'
];
const PROGRAMS = new Set([
  'Automotive',
  'Diesel',
  'Cosmotology',
  'Welding',
  'Advance Manufacturing',
  'Precision Machine',
  'Comp Sci',
  'Cybersecurity',
  'Engineering',
  'Health Careers',
  'Construction',
  'Electrical',
  'Graphic Media',
  'Media Broadcasting'
]);
const SHIRT_SIZES = new Set(['S', 'M', 'L', 'XL']);

function initializeSheet() {
  const sheet = getTargetSheet();
  prepareSheet(sheet);
}

function doPost(event) {
  try {
    const submission = event.parameter;
    validateSubmission(submission);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getTargetSheet();
      prepareSheet(sheet);

      const row = [
        new Date(),
        safeText(submission.email),
        safeText(submission.school),
        safeText(submission.shirt_size),
        safeText(submission.program_1),
        safeText(submission.program_2),
        safeText(submission.program_3),
        submission.evsc_student === 'yes' ? 'Yes' : 'No',
        submission.evsc_student === 'yes' ? submission.options_fair : 'N/A',
        safeText(submission.full_name)
      ];
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setNumberFormat('@');
      sheet.getRange(nextRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([row]);
      sheet.getRange(nextRow, 1, 1, HEADERS.length)
        .setVerticalAlignment('top')
        .setWrap(true);
    } finally {
      lock.releaseLock();
    }

    return ContentService.createTextOutput('OK');
  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput('Unable to save submission');
  }
}

function validateSubmission(submission) {
  const requiredFields = [
    'full_name', 'email', 'school', 'shirt_size', 'program_1', 'program_2', 'program_3', 'evsc_student'
  ];
  if (!submission || requiredFields.some((field) => !submission[field])) {
    throw new Error('Missing required form fields.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    throw new Error('Invalid email address.');
  }
  if (!SHIRT_SIZES.has(submission.shirt_size)) {
    throw new Error('Invalid shirt size.');
  }
  const selectedPrograms = [submission.program_1, submission.program_2, submission.program_3];
  if (!selectedPrograms.every((program) => PROGRAMS.has(program))) {
    throw new Error('Invalid program choice.');
  }
  if (new Set(selectedPrograms).size !== selectedPrograms.length) {
    throw new Error('Program choices must be unique.');
  }
  if (!['yes', 'no'].includes(submission.evsc_student)) {
    throw new Error('Invalid EVSC response.');
  }
  if (submission.evsc_student === 'yes' && !['yes', 'no', 'not_sure'].includes(submission.options_fair)) {
    throw new Error('Invalid Options Fair response.');
  }
  if (submission.evsc_student === 'no' && submission.options_fair) {
    throw new Error('Options Fair response is only valid for EVSC students.');
  }
}

function getTargetSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets().find((candidate) => candidate.getSheetId() === TARGET_SHEET_ID);
  if (!sheet) throw new Error('Could not find the spreadsheet tab with ID 0.');
  return sheet;
}

function prepareSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    const matchesCurrentHeaders = HEADERS.every((header, index) => existingHeaders[index] === header);
    const matchesPreviousHeaders = HEADERS.slice(0, -1)
      .every((header, index) => existingHeaders[index] === header);
    const newHeaderIsEmpty = !existingHeaders[HEADERS.length - 1];
    const headersWithoutFullName = existingHeaders.filter((header) => header && header !== 'Full Name');
    const expectedHeadersWithoutFullName = HEADERS.slice(0, -1);
    const fullNameIsOutOfPlace = existingHeaders.indexOf('Full Name') !== -1
      && existingHeaders.indexOf('Full Name') !== HEADERS.length - 1
      && headersWithoutFullName.length === expectedHeadersWithoutFullName.length
      && expectedHeadersWithoutFullName.every((header, index) => headersWithoutFullName[index] === header);

    if (fullNameIsOutOfPlace) {
      const rows = sheet.getRange(1, 1, lastRow, HEADERS.length).getValues();
      const reorderedRows = rows.map((row) => HEADERS.map((header) => {
        const columnIndex = existingHeaders.indexOf(header);
        return columnIndex === -1 ? '' : row[columnIndex];
      }));
      sheet.getRange(1, 1, lastRow, HEADERS.length).setValues(reorderedRows);
    } else if (matchesPreviousHeaders && newHeaderIsEmpty) {
      sheet.getRange(1, HEADERS.length).setValue(HEADERS[HEADERS.length - 1]);
    } else if (!matchesCurrentHeaders) {
      throw new Error('The target sheet already has different headers.');
    }
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#17324d')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setWrap(true)
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  [170, 230, 180, 125, 260, 260, 260, 125, 190, 200].forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), HEADERS.length).createFilter();
  }
}

function safeText(value) {
  const text = String(value).trim().slice(0, 500);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}