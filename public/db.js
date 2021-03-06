let db;

// create a new db request for a "BudgetDB" database.
const request = window.indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  db = event.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', {
      keyPath: 'BudgetID',
      autoIncrement: true
    });
  }
};



request.onerror = function (event) {
  console.log(event.target.errorCode);
  // log error here
};


const saveRecord = (record) => {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(['BudgetStore'], 'readwrite');
  const budgetStore = transaction.objectStore('BudgetStore');

  budgetStore.add(record);

}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(['BudgetStore'], 'readwrite');
  // access your pending object store
  const budgetStore = transaction.objectStore('BudgetStore');
  // get all records from store and set to a variable

  const getAll = budgetStore.getAll()

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // if successful, open a transaction on your pending db
          if (res.length !== 0) {
            const transaction = db.transaction(['BudgetStore'], 'readwrite');
            // access your pending object store
            const budgetStore = transaction.objectStore("BudgetStore");
            // clear all items in your store
            budgetStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (event) {
  db = event.target.result;

  //verifies app is online before trying to read db
  if (navigator.onLine) {
    checkDatabase();
  }
};

// listen for app coming back online
window.addEventListener('online', checkDatabase);
