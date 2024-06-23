const fileInput = document.getElementById("file-input");
const secondFileInput = document.getElementById("second-file-input");
const secondFileInputFieldset = document.getElementById("second-file-fieldset");
const firstFileInputFieldset = document.getElementById("first-file-fieldset");
const output = document.getElementById("output");
const reloadPageBtn = document.getElementById("reload-page-btn");
const scanBtn = document.getElementById("scan-btn");
const startSelect = document.getElementById("start");
const endSelect = document.getElementById("end");
const nameOfCenterInput = document.getElementById("center-name");
const nameOfCenterFieldset = document.getElementById("name-of-center-fieldset");
const startDateInputFieldset = document.getElementById(
  "start-date-input-fieldset"
);
const endDateInputFieldset = document.getElementById("end-date-input-fieldset");
const allFieldsets = document.querySelectorAll("fieldset");
const openDrawer = document.getElementById("open-drawer");
const dialog = document.getElementById("dialog");
const dialogCloseBtn = document.getElementById("close-dialog");
let startDate = "";
let endDate = "";
let students = [];
let file1RawText = "";
let file2RawText = "";
let nameOfCenter = "";

// Read first file input
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  firstFileInputFieldset.style.borderColor = "green";
  reader.onload = () => {
    file1RawText = reader.result;
  };
  reader.onerror = () => {
    console.log("There was an error reading your file.");
  };
  reader.readAsText(file, "utf-8");
});

// Read second file input
secondFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  secondFileInputFieldset.style.borderColor = "green";
  reader.onload = () => {
    file2RawText = reader.result;
  };
  reader.onerror = () => {
    console.log("There was an error reading your file.");
  };
  reader.readAsText(file, "utf-8");
});

nameOfCenterInput.addEventListener("change", () => {
  nameOfCenter = nameOfCenterInput.value;
  if (nameOfCenterInput.value !== "") {
    nameOfCenterFieldset.style.borderColor = "green";
  } else {
    nameOfCenterFieldset.style.borderColor = "gray";
  }
});

startSelect.addEventListener("change", () => {
  startDate = startSelect.value;
  if (startSelect.value !== "") {
    startDateInputFieldset.style.borderColor = "green";
  } else {
    startDateInputFieldset.style.borderColor = "gray";
  }
});

endSelect.addEventListener("change", () => {
  endDate = endSelect.value;
  if (endSelect.value !== "") {
    endDateInputFieldset.style.borderColor = "green";
  } else {
    endDateInputFieldset.style.borderColor = "gray";
  }
});

openDrawer.addEventListener("click", () => {
  secondFileInputFieldset.style.display = "block";
});

scanBtn.addEventListener("click", () => {
  if (validateForm() === false) {
    dialog.showModal();
  } else {
    if (file2RawText !== "") {
      cleanRawText2Files(file1RawText, file2RawText, startDate, endDate);
    } else {
      cleanRawText1File(file1RawText, startDate);
    }
    resetForm();
    displayReport();
    hideCard();
    displayCenterNameInTitle();
  }
});

reloadPageBtn.addEventListener("click", () => {
  resetForm();
  location.reload();
});

const cleanRawText2Files = (file1, file2, startDate, endDate) => {
  let rawTextArr1 = file1.split("\n");
  rawTextArr1.pop();
  let rawTextArr2 = file2.split("\n");
  rawTextArr2.pop();
  rawTextArr1.forEach((el) => {
    let studentInfo = el.replaceAll('"', "").split(",");
    studentInfo.splice(1, 3);
    studentInfo.pop();

    const noScanDates = findNoScans(studentInfo, startDate);
    const incompleteScanDates = findIncompleteScans(studentInfo, startDate);
    students.push({
      name: cleanName(studentInfo[0]),
      noScanDates: noScanDates,
      incompleteScanDates: incompleteScanDates,
    });
  });
  if (rawTextArr2.length === students.length) {
    rawTextArr2.forEach((el, index) => {
      let studentInfo = el.replaceAll('"', "").split(",");
      studentInfo.splice(1, 3);
      studentInfo.pop();

      const noScanDates = findNoScans(studentInfo, endDate);
      const incompleteScanDates = findIncompleteScans(studentInfo, endDate);

      students[index].noScanDates = [
        ...students[index].noScanDates,
        ...noScanDates,
      ];
      students[index].incompleteScanDates = [
        ...students[index].incompleteScanDates,
        incompleteScanDates,
      ];
    });
  } else {
    alert(
      "Your second file has a diffrent number of kids from the first file."
    );
  }
};

const cleanRawText1File = (file, fileDate) => {
  let rawTextArr = file.split("\n");
  rawTextArr.pop();
  rawTextArr.forEach((el) => {
    let studentInfo = el.replaceAll('"', "").split(",");
    studentInfo.splice(1, 3);
    studentInfo.pop();

    const noScanDates = findNoScans(studentInfo, fileDate);
    const incompleteScanDates = findIncompleteScans(studentInfo, fileDate);
    students.push({
      name: cleanName(studentInfo[0]),
      noScanDates: noScanDates,
      incompleteScanDates: incompleteScanDates,
    });
  });
};

const findNoScans = (studentInfo, fileDate) => {
  const noScan = "";
  const noScanDates = [];
  const year = fileDate.split("-")[0];
  const month = fileDate.split("-")[1];
  const startDateFormated = new Date(startDate);
  const endDateFormated = new Date(endDate + "T12:00:00Z");
  let index = studentInfo.indexOf(noScan);
  let numOfDaysInMonth = new Date(year, month, 0).getDate();
  while (index !== -1) {
    if (index <= numOfDaysInMonth) {
      let indexDate = new Date(`${year}, ${month}, ${index}`);
      // If date is not weekend
      if (indexDate.getDay() !== 0 && indexDate.getDay() !== 6) {
        // If date is in scan range
        if (indexDate >= startDateFormated && indexDate <= endDateFormated) {
          noScanDates.push(indexDate.toDateString());
        }
      }
    }
    index = studentInfo.indexOf(noScan, index + 1);
  }
  return noScanDates;
};

const findIncompleteScans = (studentInfo, fileDate) => {
  const incompleteScan = "I";
  const incompleteScanDates = [];
  const year = fileDate.split("-")[0];
  const month = fileDate.split("-")[1];
  const startDateFormated = new Date(startDate);
  const endDateFormated = new Date(endDate);

  let index = studentInfo.indexOf(incompleteScan);
  let numOfDaysInMonth = new Date(year, month, 0).getDate();
  while (index !== -1) {
    if (index <= numOfDaysInMonth) {
      let indexDate = new Date(`${year}, ${month}, ${index}`);
      // If date is not weekend
      if (indexDate.getDay() !== 0 && indexDate.getDay() !== 6) {
        // If date is in scan range
        if (indexDate >= startDateFormated && indexDate <= endDateFormated) {
          incompleteScanDates.push(indexDate.toDateString());
        }
      }
    }
    index = studentInfo.indexOf(incompleteScan, index + 1);
  }
  return incompleteScanDates;
};

const resetForm = () => {
  fileInput.value = "";
  secondFileInput.value = "";
  startSelect.value = "";
  endSelect.value = "";
  nameOfCenterInput.value = "";
  secondFileInputFieldset.style.display = "none";

  allFieldsets.forEach((el) => {
    el.style.borderColor = "gray";
  });
};

const displayReport = () => {
  const tbl = document.createElement("table");
  const tblHead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const headCell1 = document.createElement("th");
  const headCell2 = document.createElement("th");
  const headCell3 = document.createElement("th");
  const headCell1Text = document.createTextNode("Name");
  const headCell2Text = document.createTextNode("No Scan Dates");
  const headCell3Text = document.createTextNode("Incomplete Scan Dates");
  headCell1.appendChild(headCell1Text);
  headCell2.appendChild(headCell2Text);
  headCell3.appendChild(headCell3Text);
  headRow.appendChild(headCell1);
  headRow.appendChild(headCell2);
  headRow.appendChild(headCell3);
  tblHead.appendChild(headRow);

  const tblBody = document.createElement("tbody");
  for (let i = 0; i < students.length; i++) {
    const row = document.createElement("tr");

    const cell1 = document.createElement("td");
    const cell1Text = document.createTextNode(students[i].name);
    cell1.appendChild(cell1Text);
    row.appendChild(cell1);

    const cell2 = document.createElement("td");
    for (let j = 0; j < students[i].noScanDates.length; j++) {
      cell2.appendChild(document.createTextNode(students[i].noScanDates[j]));
      cell2.appendChild(document.createElement("br"));
    }

    row.appendChild(cell2);

    const cell3 = document.createElement("td");
    for (let k = 0; k < students[i].incompleteScanDates.length; k++) {
      cell3.appendChild(
        document.createTextNode(students[i].incompleteScanDates[k])
      );
      cell3.appendChild(document.createElement("br"));
    }
    row.appendChild(cell3);

    tblBody.appendChild(row);
  }
  tbl.appendChild(tblHead);
  tbl.appendChild(tblBody);
  document.body.appendChild(tbl);
};

const hideCard = () => {
  const formCard = document.getElementById("form-card");
  formCard.style.display = "none";
};

const displayCenterNameInTitle = () => {
  const title = document.getElementById("title");
  title.innerText = `${nameOfCenter} Swipe Report`;
};

const cleanName = (dirtyName) => {
  return dirtyName
    .toLowerCase()
    .split(" ")
    .map((n) => n[0].toUpperCase() + n.slice(1))
    .join(", ");
};

const validateForm = () => {
  if (
    nameOfCenterInput.value === "" ||
    startSelect.value === "" ||
    endSelect.value === "" ||
    fileInput.value === ""
  ) {
    return false;
  }
};

dialogCloseBtn.addEventListener("click", () => {
  dialog.close();
});
