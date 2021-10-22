navigator.serviceWorker.register('sw.js');

document.getElementById('export_button').addEventListener('click', download);

document.getElementById('delete_data_button').addEventListener('click', deleteAllData);

document.getElementById('show_submission_form').addEventListener('click', () => {
    document.getElementById('submission').style.display = 'block';
    document.getElementById('visitors').style.display = 'none';
});

document.getElementById('show_visitors').addEventListener('click', () => {
    document.getElementById('submission').style.display = 'none';
    document.getElementById('visitors').style.display = 'block'
    createVisitorsTable();
});

document.getElementById('submission_form').addEventListener('submit', saveNewVisit);


function saveNewVisit(event) {
    let name = document.getElementById('name').value;
    let tel = document.getElementById('telephone').value;
    let email = document.getElementById('email').value;
    let datetime = Date.now();
    if (email === '' && tel === '') {
        alert('Either telephone or email must be provided');
    } else {
        let visitor = { name, tel, email };
        // Open (or create) the database
        let open = indexedDB.open("corpDB", 1);
        // Create the schema
        open.onupgradeneeded = function () {
            let db = open.result;
            let store = db.createObjectStore("visitorsStore", { keyPath: "datetime" });
        };

        open.onsuccess = function () {
            let db = open.result;
            let tx = db.transaction("visitorsStore", "readwrite");
            let store = tx.objectStore("visitorsStore");
            store.put({ datetime, visitor });
            // Close the db when the transaction is done
            tx.oncomplete = function () {
                db.close();
                onSaveSuccess();
            };
        }

    }
    event.preventDefault();
}


function onSaveSuccess() {
    let overlay = document.getElementById('success');
    overlay.style.display = 'block';
    window.setTimeout(() => overlay.style.display = 'none', 1000);
    document.getElementById('name').value = '';
    document.getElementById('telephone').value = '';
    document.getElementById('email').value = '';
}


function getAllSavedVisits() {
    return new Promise((resolve, reject) => {
        let open = indexedDB.open("corpDB");
        open.onsuccess = function () {
            let db = open.result;
            let tx = db.transaction("visitorsStore", "readonly");
            let store = tx.objectStore("visitorsStore");
            let request = store.getAll()
            request.onsuccess = function (e) {
                let visits = e.target.result;
                resolve(visits);
            }
            tx.oncomplete = function () {
                db.close();
            };
        }
    });
}

async function createVisitorsTable() {
    let visitorsTable = document.getElementById('visitors_table');
    visitorsTable.innerHTML = '';
    let visits = await getAllSavedVisits();
    let html = '';
    visits.forEach(visit => {
        html += '<tr><td>' + new Date(visit.datetime).toLocaleString('de-DE') + '</td><td>' + visit.visitor.name + '</td><td>' + visit.visitor.tel + '</td><td>' + visit.visitor.email + '</td></tr>';
    });
    visitorsTable.innerHTML = html;
}


async function download() {
    let visits = await getAllSavedVisits();
    let CSV = '';
    visits.forEach(visit => {
        CSV += visit.datetime + ';' + visit.visitor.name + ';' + visit.visitor.tel + ';' + visit.visitor.email + ';\n';
    });

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(CSV));
    element.setAttribute('download', 'visitors.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function deleteAllData() {
    if (confirm('This deletes all saved visits. Are you sure?')) {
        let open = indexedDB.open("corpDB");
        open.onsuccess = function () {
            let db = open.result;
            let tx = db.transaction("visitorsStore", "readwrite");
            let store = tx.objectStore("visitorsStore");
            let request = store.clear()
            request.onsuccess = function (e) {
                createVisitorsTable();
            }
            tx.oncomplete = function () {
                db.close();
            };
        }
    }
}