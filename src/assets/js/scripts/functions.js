'use strict';
// ----------------------------------------------------------------------
function createHtmlElement(elemObjName, elemCssClassName, elemObjContent, attrArray) {
  if (!elemObjName) {
    return;
  }
  // else
  const newHtmlElem = document.createElement(elemObjName);
  
  if (elemCssClassName) {
    newHtmlElem.classList.add(elemCssClassName);
  }

  if (elemObjContent) {
    newHtmlElem.textContent = elemObjContent;
  }

  if (attrArray) {  // [{attrName: '', attrValue: ''}, ...] or undefined
    attrArray.forEach(elemOfArr => {
      newHtmlElem.setAttribute(elemOfArr.attrName, elemOfArr.attrValue);
    });
  }

  return newHtmlElem; // returns reference to new li-item
}

// ----------------------------------------------------------------------
function initAndShowTodoList(initialDataFromServer) {
  const listWrapper = createHtmlElement('div', 'wrapper', null);
  document.body.prepend(listWrapper);

  const title = createHtmlElement('h2', 'title', 'MK TODO LIST');
  listWrapper.before(title);

  const todoList = createHtmlElement('ul', 'list', null);
  listWrapper.append(todoList);

  const btnContainer = createHtmlElement('li', 'btn-container', null);
  todoList.append(btnContainer);
  // 'Add' BTN for adding a new 'task' to the list
  const addBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type',
        attrValue: 'button'
      },
      {
        attrName: 'value',
        attrValue: 'Add New Task'
      }
    ]
  );
  addBtn.classList.add('btn--add');
  btnContainer.append(addBtn);

  const dataTaskArr = getDataFromLocalStorage('dataTasks'); // work only with array of tasks
  if (dataTaskArr) {
    dataTaskArr.forEach(elemOfArr => {
      checkAvailableStatusAndPriorityForTask(initialDataFromServer, dataTaskArr, elemOfArr);
      addNewRowWithTask(elemOfArr, todoList);
    });
  } else {
    initialDataFromServer.defaultTasks.forEach(elemOfArr => addNewRowWithTask(elemOfArr, todoList));
    addNewInfoToLocalStorage('dataTasks', initialDataFromServer.defaultTasks);
  }
}

//______________________________________________________________________
function checkAvailableStatusAndPriorityForTask(dataFromServer, locStorageData, task) {
  let isStatus = dataFromServer.statuses.find(elemOfArr => elemOfArr === task.taskStatus);
  if (!isStatus) {
    task.taskStatus = 'No Status';
    addNewInfoToLocalStorage('dataTasks', locStorageData);
  }

  let isPriority = dataFromServer.priorities.find(elemOfArr => elemOfArr === task.taskPriority);
  if (!isPriority) {
    task.taskPriority = 'No Priority';
    addNewInfoToLocalStorage('dataTasks', locStorageData);
  }
}

/** get data from localStorage by converting JSON format to JS object or array */
function getDataFromLocalStorage(dataKeyName) {
  const dataFromLocalStorage = localStorage.getItem(dataKeyName); // returns value or null
  if (dataFromLocalStorage) {
    const dataInJs = JSON.parse(dataFromLocalStorage);

    return dataInJs;
  }
}

/** save data from JS to JSON format in localStorage */
function addNewInfoToLocalStorage(dataKeyName, dataJsValue) {
  let dataJsonStr = JSON.stringify(dataJsValue);
  localStorage.setItem(dataKeyName , dataJsonStr);
}

// ----------------------------------------------------------------------
function addNewRowWithTask(currentTaskObj, list) {
  const listItemRow = createHtmlElement('li', 'list__item-row', null, [ {attrName:'data-row-id', attrValue: currentTaskObj.id} ]); // rowId === currentTaskObj.id  (it will help to find the task index for deleting or editing)
  list.append(listItemRow);
  drawChildrenOfRow(currentTaskObj, listItemRow);
}

// ----------------------------------------------------------------------
function drawChildrenOfRow(currentTaskObj, listCurrentItemRow) {
  const listItemColId = createHtmlElement('div', 'list__item-col-id', currentTaskObj.id); // adding child div-col to _parent li-row_
  listCurrentItemRow.append(listItemColId);

  const listItemColName = createHtmlElement('div', 'list__item-col-name', currentTaskObj.taskName);
  listCurrentItemRow.append(listItemColName);

  const listItemColPriority = createHtmlElement('div', 'list__item-col-priority', currentTaskObj.taskPriority);
  listCurrentItemRow.append(listItemColPriority);

  const listItemColStatus = createHtmlElement('div', 'list__item-col-status', currentTaskObj.taskStatus);
  listCurrentItemRow.append(listItemColStatus);

  const listItemColButtons = createHtmlElement('div', 'list__item-col-buttons');  // adding div with action buttons to _parent li-row_
  listCurrentItemRow.append(listItemColButtons);

  const editBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type', 
        attrValue:'button'
      },
      {
        attrName: 'value', 
        attrValue:'Edit Task'
      },
      {
        attrName:'data-task-id', 
        attrValue: currentTaskObj.id
      }
    ]
  );
  editBtn.classList.add('btn--edit'); // additional class for btn
  listItemColButtons.append(editBtn);

  const delBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type', 
        attrValue:'button'
      },
      {
        attrName: 'value', 
        attrValue:'Delete Task'
      },
      {
        attrName:'data-task-id', 
        attrValue: currentTaskObj.id
      }
    ]
  );
  delBtn.classList.add('btn--del'); // additional class for btn
  listItemColButtons.append(delBtn);
}

/////////////////////////////////////////////////////////////////////////
function addEventListenerToList(dataFromServer) { // take data from fetch
  let confirmationMessageClosed = true; // if false, then other buttons WON't WORK except YES/NO

  document.querySelector('.list').addEventListener('click', (event) => {
    // 1) ADD button
    if (event.target.matches('.btn--add') && confirmationMessageClosed) {
      initAndShowForm(dataFromServer);

      return;
    }
    // 2) EDIT button
    if (event.target.matches('.btn--edit') && confirmationMessageClosed) {
      initAndShowTaskEditingForm(event.target.dataset.taskId, dataFromServer);

      return;
    }

    // 3) DEL button (activates CONFIRMATION MESSAGE with yes/no buttons. They are processed here too in the sub-list handler.)
    if (event.target.matches('.btn--del') && confirmationMessageClosed) {
      removeForm();

      confirmDeletionMessage(event.target.dataset.taskId);
      confirmationMessageClosed = false; // !!! block other buttons

      return;
    }

    // 3.1) if press YES
    if (event.target.matches('.btn--del-positive')) {
      const dataArr = getDataFromLocalStorage('dataTasks');
      const currentObjIndex = dataArr.findIndex(elemOfArr => elemOfArr.id === event.target.dataset.taskId);
      deleteRow(event.target.dataset.taskId, document.querySelector('.list'));
      dataArr.splice(currentObjIndex, 1); // delete current object
      addNewInfoToLocalStorage('dataTasks', dataArr);
      confirmationMessageClosed = true; // !!! unblock other buttons

      return;
    }

    // 3.2) if press NO
    if (event.target.matches('.btn--del-negative')) {
      removeConfirmationMessage(event.target.dataset.taskId);
      confirmationMessageClosed = true; // !!! unblock other buttons

      return;
    }
  });
}

/////////////////////////////////////////////////////////////////////////
function addEventListenerToBody() {
  document.body.addEventListener('click', (event) => {
    // SAVE BTN after EDIT BTN EVENT
    if (event.target.matches('.btn-input--edit-save')) {
      let validation = validateForm(); // form is a dom-obj, so document.forms.formName inside the func
      if (!validation) {
        return;
      }

      const dataArr = getDataFromLocalStorage('dataTasks');
      const taskObjOfEditForm = dataArr.find(elemOfArr => elemOfArr.id === event.target.dataset.taskId);
      if (findChanges(taskObjOfEditForm)) { // if changes were founded
        overwriteObj(taskObjOfEditForm);
        overwriteRowWithTask(taskObjOfEditForm, event.target.dataset.taskId); // pass the old row id (rowId === taskId)
        addNewInfoToLocalStorage('dataTasks', dataArr);
      } 
      removeForm(); // deleting form only after all values were copied from it

      return;
    }

    // SAVE BTN after ADD BTN EVENT
    if (event.target.matches('.btn-input--save')) {
      let validation = validateForm(); // form is a dom-obj, so document.forms.formName inside the func
      if (!validation) {
        return;
      }
      // if validation is successful then
      const dataArr = getDataFromLocalStorage('dataTasks');
      let newTaskObj = copyFormValuesToNewTaskObj(); // returns object
      addNewRowWithTask(newTaskObj, document.querySelector('.list'));
      dataArr.push(newTaskObj);
      addNewInfoToLocalStorage('dataTasks', dataArr);
      removeForm(); // deleting form only after all values were copied from it

      return;
    }
  });
}

// ----------------------------------------------------------------------
// EMPTY FORM for ADD BTN
// ----------------------------------------------------------------------
function initAndShowForm(dataFromServer) {  // take data from fetch
  removeForm(); // if ADD or EDIT buttons are pressed again

  const form = createHtmlElement('form', 'form', null, [{attrName: 'name', attrValue: 'currentForm'}]);
  document.querySelector('.wrapper').after(form);

  for (let property of Object.keys({id: '', taskName: '', taskPriority: '', taskStatus: ''})) { // need only names of object's properties
    const blockContainer = createHtmlElement('div', `form__${property}`, `${property}: `);
    form.append(blockContainer);

    if (property === 'taskPriority' || property === 'taskStatus') {
      const formSelect = createHtmlElement('select', 'form__select', null, [{attrName: 'name', attrValue: `${property}`}]);
      blockContainer.append(formSelect);

      if (property === 'taskPriority') {
        dataFromServer.priorities.forEach(elemOfArr => {
          const selectOption = createHtmlElement('option', 'form__option', elemOfArr, [{attrName: 'value', attrValue: elemOfArr}]);
          formSelect.append(selectOption);
        });
      } else if (property === 'taskStatus') {
        dataFromServer.statuses.forEach(elemOfArr => {
          const selectOption = createHtmlElement('option', 'form__option', elemOfArr, [{attrName: 'value', attrValue: elemOfArr}]);
          formSelect.append(selectOption);
        });
      }

      continue; // go to next property
    }

    const input = createHtmlElement(
      'input',
      `form__input-${property}`,
      null,
      [
        {
          attrName: 'type',
          attrValue: 'text'
        }, 
        {
          attrName: 'name',
          attrValue: `${property}`
        }, 
        {
          attrName: 'value',
          attrValue: ''
        }
      ]
    );
    blockContainer.append(input);
  }

  // add input SAVE button
  const saveBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type',
        attrValue: 'button'
      },
      {
        attrName: 'name',
        attrValue: 'saveButton'
      },
      {
        attrName: 'value',
        attrValue: 'Save'
      },
    ]
  );
  saveBtn.classList.add('btn-input--save');
  form.append(saveBtn);
}

// ----------------------------------------------------------------------
function removeForm() {
  const form = document.querySelector('.form');
  if (form) {
    form.remove();
  }
}

// ----------------------------------------------------------------------
function copyFormValuesToNewTaskObj(){
  const form = document.forms.currentForm;
  let newObj = {}; // an empty object will get new properties

  for (let formInput of form.elements) {
    if (formInput.name === 'saveButton') { // skip
      continue;
    }

    newObj[formInput.name] = formInput.value; // dynamic creation of object properties, REALLY WEIRD WAY :D ||| select.value returns chosen option value
  }

  return newObj;
}

// ----------------------------------------------------------------------
// FORM VALIDATION runs only after form's save btn
// ----------------------------------------------------------------------
function validateForm() {
  const form = document.forms.currentForm;
  let isValid = true;

  for (let formInput of form.elements) { // form.elements is a collection of inputs (dom objects)
    if (formInput.name === 'saveButton' || formInput.name === 'taskPriority' || formInput.name === 'taskStatus') { // skip 'Save' button and both selects
      continue;
    }

    if (form.querySelector(`.form__span-${formInput.name}`)) { // remove old span on current iteration
      form.querySelector(`.form__span-${formInput.name}`).remove();
    }

    if ( !(regExpPatterns[formInput.name].test(formInput.value)) ) { // input's |name attribute| returns 'property of object'
      showFormInputErrorMessage(formInput, ` Incorrect ${formInput.name}! Requirement: ${correctExamples[formInput.name]}`);

      isValid = false;
    }

    if (formInput.name === 'id' && regExpPatterns[formInput.name].test(formInput.value)) {
      const dataTaskArr = getDataFromLocalStorage('dataTasks');
      const idSearchResult = dataTaskArr.find(taskOfArr => taskOfArr.id === formInput.value);
      if (idSearchResult && idSearchResult.id !== form.elements.saveButton.dataset.taskId) { // if formInput id value is changed in EDIT FORM and !== to it's previous taskId from EDITING FORM's saveButton (UNDEFINED For EMPTY FORM's saveButton)
        showFormInputErrorMessage(formInput, ` ${formInput.name}#${formInput.value} already exists!`);

        isValid = false;
      }
    }
  }

  return isValid; // true if all inputs have value
}

// ----------------------------------------------------------------------
function showFormInputErrorMessage(formInput, addedSpanText) {
  let errorMessage = createHtmlElement('span', 'form__span', addedSpanText);
  errorMessage.classList.add(`form__span-${formInput.name}`);
  formInput.after(errorMessage);
}

// ----------------------------------------------------------------------
// EDIT BTN + EDITING FORM
// ----------------------------------------------------------------------
function initAndShowTaskEditingForm(objId, serverData) { // getting userId from EDIT btn
  const dataArr = getDataFromLocalStorage('dataTasks');
  const currentTaskObj = dataArr.find(elemOfArr => elemOfArr.id === objId);
  initAndShowForm(serverData); // init clean form

  const form = document.forms.currentForm; 
  for (let property of Object.keys(currentTaskObj)) { // getting default values of form's inputs from user object
    form.elements[property].value = currentTaskObj[property]; // input prop VALUE is not SYNCHRONIZED with html attribute VALUE, it's good if user doesn't save changes
  }

  form.elements.saveButton.setAttribute('data-task-id', currentTaskObj.id); // for validation of the same id in EDITING FORM, if taskId wasn't change
  form.elements.saveButton.classList.remove('btn-input--save'); // to make a not required order of event handlers if it's important
  form.elements.saveButton.classList.add('btn-input--edit-save'); // is needed for event handler
}

// ----------------------------------------------------------------------
function findChanges(currentObj) {
  const form = document.forms.currentForm;

  for (let property of Object.keys(currentObj)) { // getting default values from user object
    if (form.elements[property].value !== currentObj[property]) {
      return true; // if there is difference (data was changed)
    }
  }
}

// ----------------------------------------------------------------------
function overwriteObj(currentObj) {
  const form = document.forms.currentForm;

  for (let property of Object.keys(currentObj)) {
    currentObj[property] = form.elements[property].value;
  }
}

// ----------------------------------------------------------------------
function overwriteRowWithTask(currentTaskObj, oldRowId) {
  removePreviousRowChildren(oldRowId);
  const listCurrentItemRow = document.querySelector('.list').querySelector(`[data-row-id="${oldRowId}"]`);
  listCurrentItemRow.setAttribute('data-row-id', currentTaskObj.id); // overwriting new id into the old row
  drawChildrenOfRow(currentTaskObj, listCurrentItemRow);
}

// ----------------------------------------------------------------------
function removePreviousRowChildren(oldRowId) {
  const listCurrentItemRow = document.querySelector('.list').querySelector(`[data-row-id="${oldRowId}"]`);
  if (listCurrentItemRow) {
    listCurrentItemRow.innerHTML = ''; // clean only inner child nodes, but now
  }
}

// ----------------------------------------------------------------------
// DELETE BTN + YES/NO BUTTONS
// ----------------------------------------------------------------------
function confirmDeletionMessage(objId) { // objId and rowId are equal
  removeConfirmationMessage(objId);

  const delConfirmationBlock = createHtmlElement('div', 'del-confirmation', 'Are you sure that you want to make deletion?'); // create div with yes/no inputs
  document.querySelector(`[data-row-id="${objId}"]`).append(delConfirmationBlock);

  // adding YES/NO buttons to confirmation message --> event handler for these buttons will be in the menu's EventListener
  const yesBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type', 
        attrValue: 'button'
      },
      {
        attrName: 'value', 
        attrValue: 'yes'
      },
      {
        attrName: 'data-task-id',
        attrValue: objId
      }
    ]
  ); // copy data-attribute value from btn--del for further work (deleting obj from data)
  yesBtn.classList.add('btn--del-positive');
  delConfirmationBlock.append(yesBtn);

  const noBtn = createHtmlElement(
    'input',
    'btn',
    null,
    [
      {
        attrName: 'type', 
        attrValue: 'button'
      },
      {
        attrName: 'value', 
        attrValue: 'no'
      },
      {
        attrName: 'data-task-id',
        attrValue: objId
      }
    ]
  );
  noBtn.classList.add('btn--del-negative');
  delConfirmationBlock.append(noBtn);
}

// ----------------------------------------------------------------------
function removeConfirmationMessage(objId) {
  const delConfirmation = document.querySelector(`[data-row-id="${objId}"]`).querySelector('.del-confirmation');
  if (delConfirmation) {
    delConfirmation.remove();
  }
}

// ----------------------------------------------------------------------
function deleteRow(objId, list) {
  const listCurrentItemRow = list.querySelector(`[data-row-id="${objId}"]`); // rowId === objId
  if (listCurrentItemRow) {
    listCurrentItemRow.remove();
  }
}