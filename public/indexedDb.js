let db;

const request = indexedDB.open("budget", 1);

// Create storage system with object store
request.onupgradeneeded = (evt) => {
  const db = evt.target.result;
  db.createObjectStore("pending", {autoIncrement: true});
};

// Successful callback to the dom
request.onsuccess = (evt) => {
  db = evt.target.result;
  if (navigator.online) {
    runDB();
  }
};

// Reports error for request
request.onerror = (evt) => {
  console.log("There was an error" + evt);
};

// Saves to transaction db
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

// Retrieves from transaction db
function runDB() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "Post",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", runDB);
