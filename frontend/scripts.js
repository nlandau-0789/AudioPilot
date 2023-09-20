let sortStack = []
let music_data;
let playlist = []
let music_dir_path;
let mainColor;
let weightedShuffle = true;

settings = {}
lazyAudio = document.getElementById('lazyAudio');

content = document.querySelector('#table-wrapper')
wrapper = content.parentElement
shadowTop = document.querySelector('.scroll-shadows-top')
shadowBottom = document.querySelector('.scroll-shadows-bottom')

play_bar = document.getElementById("playbar")
play_btn = document.getElementById("play-btn")
shuffle_btn = document.getElementById("shuffle-btn")
prec_btn = document.getElementById("play-prec-btn")
stop_btn = document.getElementById("stop-btn")
next_btn = document.getElementById("play-next-btn")
find_btn = document.getElementById("find-btn")
lr_sep = document.querySelector(".lr-sep")

settings_btn = document.getElementById("settings-btn")
settings_modal = document.getElementById("settings-modal")
close_settings_modal_btn = document.getElementById("close-settings-btn")
cancel_settings_btn = document.getElementById("cancel-settings-btn")
save_settings_btn = document.getElementById("save-settings-btn")

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
        lazyAudio.setAttribute("src", encodeURIComponent(e.getAttribute("filename")));
        lazyAudio.play()
        document.getElementById("play-btn").setAttribute("tooltip", "Pauser")
        if (playlist.length) {
            playlist[playlist.length - 1].removeAttribute("playing")
            if (playlist[playlist.length - 1] == e) {
                playlist.pop()
            }
        }
        playlist.push(e)
        playlist[playlist.length - 1].setAttribute("playing", "")
        document.title = "AudioPilot - " + e.getAttribute("Titre")
        like_btn.removeAttribute("liked")
        dislike_btn.removeAttribute("disliked")
    })
    document.dispatchEvent(new CustomEvent('new_row', {
        detail: { row: e },
        bubbles: true,
        cancelable: true
    }))

    return e
}

async function getData() {
    try {
        const response = await fetch('/api/music-data');

        if (!response.ok) {
            throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        music_data = data.list;  // Assign the data to the variable
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getSettings() {
    try {
        const response = await fetch('/api/settings');

        if (!response.ok) {
            throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        settings = data
        music_dir_path = data["music_dir_path"];  // Assign the data to the variable
        mainColor = data["theme"];  // Assign the data to the variable
        weightedShuffle = data["weighted_shuffle"];  // Assign the data to the variable
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    document.getElementById("music-dir-path").value = music_dir_path
    document.querySelector("body").style.setProperty('--main-color', mainColor)
    document.getElementById("theme").value = mainColor
    document.getElementById("shuffle-type").checked = weightedShuffle
}

async function getModules() {
    for (module_name of settings.modules) {
        let module_component = await (await fetch("/frontend/modules/" + module_name + "/component.html")).text()
        // let module_settings = await fetch("/frontend/modules/"+module_name+"/settings.html").text()

        temp = document.createElement("div")
        if (module_component.trim() != "") {
            temp.setAttribute("class", "sep")
            play_bar.insertBefore(temp.cloneNode(), lr_sep)
        }

        temp.innerHTML = module_component
        for (e of temp.children) {
            play_bar.insertBefore(e.cloneNode(true), lr_sep)
        }

        temp = document.createElement("script")
        temp.setAttribute("src", "/frontend/modules/" + module_name + "/scripts.js")
        temp.setAttribute("defer", "")
        document.querySelector("head").appendChild(temp.cloneNode())


        // module_script = await fetch("/frontend/modules/"+module_name+"/scripts.js").text()
        // module_settings
    }
}

async function reload() {
    await getSettings()
    if (music_dir_path === "") {
        console.log("music dir path empty")
        settings_modal.showModal()
        return
        // while (settings_modal.hasAttribute("open")) {}
    }
    await getModules()
    await getData()
    let table = document.getElementById("music-list-display")
    let table_body = document.querySelector("tbody")
    let table_head = document.querySelector("thead")
    table.removeChild(table_head)
    table.removeChild(table_body)
    table.appendChild(document.createElement("thead"))
    table_body = document.createElement("tbody")
    // table_body.classList.add("scroll-shadows")
    table.appendChild(table_body)
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
    let modal_inners = document.querySelectorAll('.inner-dialog');
    modal_inners.forEach((e) => { e.addEventListener('click', (event) => { event.stopPropagation() }) });
}

async function soft_reload() {
    await getData()
    let table = document.getElementById("music-list-display")
    let table_body = document.querySelector("tbody")
    let table_head = document.querySelector("thead")
    table.removeChild(table_head)
    table.appendChild(document.createElement("thead"))
    // table_body.classList.add("scroll-shadows")
    table.appendChild(table_body)
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

    const seen = new Set();
    Array.from(table_body.children).forEach((row) => { seen.add(row.getAttribute("filename")) })

    for (let i = 0; i < music_data.length; i++) {
        if (seen.has(music_data[i]["filename"][1])) continue
        console.log(music_data[i])
        let row = make_row(music_data[i], headers)
        table_body.appendChild(row)
    }

    seen.clear()
    music_data.forEach((data) => { seen.add(data["filename"][1]) })
    to_delete = []
    Array.from(table_body.children).forEach((row) => { if (!seen.has(row.getAttribute("filename"))) { to_delete.push(row) } })
    to_delete.forEach((row) => table_body.removeChild(row))


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
    // console.log(sortStack)
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

content.addEventListener('scroll', function () {
    var currentScroll = this.scrollTop / (this.scrollHeight - this.offsetHeight);
    shadowTop.style.opacity = Math.min(currentScroll / 0.05, 1);
    shadowBottom.style.opacity = Math.min((1 - currentScroll) / 0.05, 1);
});

function getRandomElement(array) {
    if (array.length === 0) {
        return undefined; // Return undefined for empty arrays
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function shuffle_playlist() {
    table = document.querySelector("#music-list-display > tbody").children
    for (i = 0; i < table.length; i++) {
        table[i].setAttribute("shuffle-value", Math.random())
    }
    tableElement = document.getElementById("music-list-display")
    table = Array.from(tableElement.querySelector("tbody").children)
    // console.log(table)
    tableElement.removeChild(tableElement.querySelector("tbody"))
    body = document.createElement("tbody")
    tableElement.appendChild(body)
    sort(table, (a, b) => {
        return compare(a, b, "shuffle-value", 1)
    })
    // sort(table, cmp)
    // console.log(table)
    for (e of table) {
        body.appendChild(e)
    }
}

function scroll_to_playing() {
    headers_height = document.querySelector("#music-list-display > thead").clientHeight
    document.getElementById("table-wrapper").scrollTo({ top: playlist[playlist.length - 1].offsetTop - headers_height, behavior: "smooth" })
}

function isPlaying() {
    audio_element = document.querySelector("audio")
    return (audio_element.duration > 0 && !audio_element.paused)
}

function is_looping_activated() {
    return document.getElementById("loop-btn").checked
}

function stop_playing() {
    lazyAudio.pause()
    lazyAudio.removeAttribute("src")
    new_audio = lazyAudio.cloneNode(true)
    lazyAudio.parentElement.replaceChild(new_audio, lazyAudio)
    lazyAudio.addEventListener("ended", (event) => {
        play_next()
    })
    play_btn.setAttribute("tooltip", "Jouer aléatoire")
    playlist[playlist.length - 1].removeAttribute("playing")
    document.title = "AudioPilot"
}

function play_next() {
    if (playlist[playlist.length - 1] != playlist[playlist.length - 1].parentElement.lastChild) {
        playlist[playlist.length - 1].nextSibling.click()
    } else {
        if (is_looping_activated()) {
            playlist[playlist.length - 1].parentElement.firstChild.click()
        } else {
            stop_playing()
        }
    }
}

play_btn.addEventListener("click", (event) => {
    if (play_btn.getAttribute("tooltip") === "Jouer aléatoire") {
        getRandomElement(document.querySelectorAll("#music-list-display > tbody > tr")).click()
        scroll_to_playing()
    } else if (play_btn.getAttribute("tooltip") === "Jouer") {
        lazyAudio.play()
        document.getElementById("play-btn").setAttribute("tooltip", "Pauser")
    } else if (play_btn.getAttribute("tooltip") === "Pauser") {
        lazyAudio.pause()
        document.getElementById("play-btn").setAttribute("tooltip", "Jouer")
    }
})

shuffle_btn.addEventListener("click", (event) => {
    if (isPlaying()) {
        shuffle_playlist()
        document.querySelector("#music-list-display > tbody").insertBefore(playlist[playlist.length - 1], document.querySelector("#music-list-display > tbody > tr"))
        scroll_to_playing()
    } else {
        shuffle_playlist()
        document.getElementById("table-wrapper").scrollTo({ top: 0, behavior: "smooth" })
    }
})

prec_btn.addEventListener("click", (event) => {
    if (lazyAudio.currentTime < 5) {
        playlist[playlist.length - 2].click()
        playlist.pop()
        playlist.pop()
    } else {
        playlist[playlist.length - 1].click()
    }
})

stop_btn.addEventListener("click", (event) => {
    stop_playing()
})

next_btn.addEventListener("click", (event) => {
    play_next()
})

lazyAudio.addEventListener("ended", (event) => {
    play_next()
})

find_btn.addEventListener("click", (event) => {
    scroll_to_playing()
})

document.getElementById("reload-btn").addEventListener("click", () => {
    soft_reload(); // ==> il faut pas remplacer les éléments déjà existants, juste supprimer ceux qui n'existent plus, et ajouter les nouveaux
});

settings_btn.addEventListener("click", (event) => {
    settings_modal.showModal()
})

close_settings_modal_btn.addEventListener("click", (event) => {
    if (document.getElementById("music-dir-path").value) { settings_modal.close() }
})

settings_modal.addEventListener('click', () => { if (document.getElementById("music-dir-path").value) { settings_modal.close() } });




function update_color() {
    document.querySelector("body").style.setProperty("--main-color", document.getElementById("theme").value)
}

function save_settings() {
    // Create an object representing the request body
    const requestBody = {
        "music_dir_path": document.getElementById("music-dir-path").value,
        "theme": document.getElementById("theme").value,
        "weighted_shuffle": document.getElementById("shuffle-type").checked
    };

    // Make the POST request using the fetch API
    fetch("/api/save-settings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // Specify the content type as JSON
        },
        body: JSON.stringify(requestBody) // Convert the object to a JSON string
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            // Handle the response here if needed
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error("Error:", error);
        });
    if (music_dir_path != document.getElementById("music-dir-path").value) {
        fetch("api/update-cache").then((r) => {
            reload()
        })
    }
    music_dir_path = document.getElementById("music-dir-path").value
    mainColor = document.getElementById("theme").value
    document.querySelector("body").style.setProperty('--main-color', mainColor)
    weightedShuffle = document.getElementById("shuffle-type").checked
}

async function reset_scores() {
    try {
        const response = await fetch('/api/reset-scores');

        if (!response.ok) {
            throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
        }

        document.querySelectorAll("tbody > tr").forEach((row) => {
            row.setAttribute("Score", 0)
            headers = document.querySelectorAll("th")
            for (i = 0; i < headers.length; i++) {
                if (headers[i].textContent === "Score") {
                    idx = i
                }
            }
            row.querySelectorAll("td")[idx].textContent = row.getAttribute("Score")
            like_btn.removeAttribute("liked")
            dislike_btn.removeAttribute("disliked")
        })
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

cancel_settings_btn.addEventListener("click", (event) => {
    if (document.getElementById("music-dir-path").value) { settings_modal.close() }
})

save_settings_btn.addEventListener("click", (event) => {
    save_settings()
    soft_reload()
    if (document.getElementById("music-dir-path").value) { settings_modal.close() }
})
