'use strict';
fetch('./assets/json/data.json') // HTTP-request with GET method
  .then(response => response.json()) // response.json() converts the json-response to JS object
  .then(data => {
    initAndShowTodoList(data);
    addEventListenerToList(data);
    addEventListenerToBody();
  }); // data is converted to JS object from data.json