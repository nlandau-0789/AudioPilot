let sortStack = []
let music_data;

document.getElementById("reload-btn").addEventListener("click", () => {
    reload();
});

function make_row(data, headers) {
    let e = document.createElement("tr")
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] === "filename") { e.setAttribute(headers[i], data[headers[i]][1]); continue }
        cell = document.createElement("td")
        cell.append(data[headers[i]][0])
        e.appendChild(cell)
        e.setAttribute(headers[i], data[headers[i]][1])
    }
    e.addEventListener("click", (event) => {
        const lazyAudio = document.getElementById('lazyAudio');
        lazyAudio.setAttribute("src", e.getAttribute("filename"));
        lazyAudio.play()
    })

    return e
}

async function fetchData() {
    try {
        const response = await fetch('http://localhost:8080/api/music-data');

        if (!response.ok) {
            throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        music_data = data.list;  // Assign the data to the variable
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


async function reload() {
    await fetchData()
    let table = document.getElementById("music-list-display")
    let table_body = document.querySelector("tbody")
    // console.log(data)
    // console.log(data.length)
    headers = Object.keys(music_data[0])
    {
        let e = document.createElement("tr")
        for (let i = 0; i < headers.length; i++) {
            if (headers[i] === "filename") { continue }
            cell = document.createElement("th")
            cell.append(headers[i])
            e.appendChild(cell)
        }
        table.querySelector("thead").appendChild(e)
    }
    for (let i = 0; i < music_data.length; i++) {
        let row = make_row(music_data[i], headers)
        table_body.appendChild(row)
    }

    document.querySelectorAll(".table-sortable th").forEach(headerCell => {
        headerCell.setAttribute("sortState", 0)
        headerCell.addEventListener("click", (event) => {
            // const tableElement = headerCell.parentElement.parentElement.parentElement;
            // const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            handleSorting(event, headerCell)
        });
    });
}

window.onload = reload

function stableCustomQuicksort(arr, compare, low, high) {
    if (low < high) {
        const pivotIndex = stableCustomPartition(arr, compare, low, high);
        stableCustomQuicksort(arr, compare, low, pivotIndex - 1);
        stableCustomQuicksort(arr, compare, pivotIndex + 1, high);
    }
}

function stableCustomPartition(arr, compare, low, high) {
    const pivotValue = arr[high];
    let i = low;

    for (let j = low; j < high; j++) {
        if (compare(arr[j], pivotValue) !== 1) {
            swap(arr, i, j);
            i++;
        }
    }

    swap(arr, i, high);
    return i;
}

function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function sort(arr, compare) {
    stableCustomQuicksort(arr, compare, 0, arr.length - 1);
}

function compare(a, b, attr, order) {
    aval = a.getAttribute(attr)
    bval = b.getAttribute(attr)
    aval = parseFloat(aval)
    bval = parseFloat(bval)
    if (isNaN(aval) || isNaN(bval)) {
        aval = a.getAttribute(attr).toLowerCase()
        bval = b.getAttribute(attr).toLowerCase()
    }
    // if (((aval < bval) ? -1 : ((aval > bval) ? 1 : 0)) * ((+order === 1) ? 1 : -1) != cmp(a,b)) {
    //     console.log(attr, order, ((aval < bval) ? -1 : ((aval > bval) ? 1 : 0)) * ((+order === 1) ? 1 : -1), cmp(a,b), aval, bval)
    // }
    return ((aval < bval) ? -1 : ((aval > bval) ? 1 : 0)) * ((+order === 2) ? 1 : -1)
}

function handleSorting(event, headerCell) {
    if (!event.shiftKey) {
        // console.log("noshift", headerCell)
        let cond = 0
        for (i = 0; i < headerCell.parentElement.children.length; i++) {
            if (headerCell.parentElement.children[i] != headerCell && +headerCell.parentElement.children[i].getAttribute("sortState")) {
                headerCell.parentElement.children[i].setAttribute("sortState", "0")
                // console.log(headerCell.parentElement.children[i])
                cond++
            }
        }
        if (+headerCell.getAttribute("sortState") === 0) {
            headerCell.setAttribute("sortState", "1")
            // console.log("sortstate=0", +headerCell.getAttribute("sortState"))
        } else if (!cond) {
            headerCell.setAttribute("sortState", (headerCell.getAttribute("sortState") + 1) % 3)
        }
        if (+headerCell.getAttribute("sortState")) {
            sortStack = [headerCell]
        } else {
            sortStack = [];
        }
    } else {
        if (+headerCell.getAttribute("sortState") === 0) {
            headerCell.setAttribute("sortState", "1")
            sortStack.push(headerCell)
        } else {
            headerCell.setAttribute("sortState", (headerCell.getAttribute("sortState") + 1) % 3)
        }
        if (+headerCell.getAttribute("sortState") === 0) {
            sortStack.splice(sortStack.indexOf(headerCell), 1)
        }
    }
    // console.log(sortStack)
    sortTable()
}

function sortTable() {
    console.log(sortStack)
    tableElement = document.getElementById("music-list-display")
    table = Array.from(tableElement.querySelector("tbody").children)
    // console.log(table)
    tableElement.removeChild(tableElement.querySelector("tbody"))
    body = document.createElement("tbody")
    tableElement.appendChild(body)
    for (i = sortStack.length - 1; i >= 0; i--) {
        // console.log(sortStack[i].textContent)
        sort(table, (a, b) => {
            return compare(a, b, sortStack[i].textContent.trim(), sortStack[i].getAttribute("sortState"))
        })
    }
    // sort(table, cmp)
    // console.log(table)
    for (e of table) {
        body.appendChild(e)
    }
}