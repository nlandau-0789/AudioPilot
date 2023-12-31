let sortStack = []
let music_data;
let playlist = []
let music_dir_path;
let mainColor;
let weightedShuffle = true;

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

    return e
}

async function fetchData() {
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

async function reload() {
    await getSettings()
    if (music_dir_path === "") {
        console.log("music dir path empty")
        settings_modal.showModal()
        return
        // while (settings_modal.hasAttribute("open")) {}
    }
    await fetchData()
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
}

async function soft_reload() {
    await fetchData()
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
    Array.from(table_body.children).forEach((row) => {seen.add(row.getAttribute("filename"))})

    for (let i = 0; i < music_data.length; i++) {
        if (seen.has(music_data[i]["filename"][1])) continue
        console.log(music_data[i])
        let row = make_row(music_data[i], headers)
        table_body.appendChild(row)
    }

    seen.clear()
    music_data.forEach((data) => {seen.add(data["filename"][1])})
    to_delete = []
    Array.from(table_body.children).forEach((row) => {if(!seen.has(row.getAttribute("filename"))){to_delete.push(row)}})
    to_delete.forEach((row) => table_body.removeChild(row))
    

    document.querySelectorAll(".table-sortable th").forEach(headerCell => {
        headerCell.setAttribute("sortState", 0)
        headerCell.addEventListener("click", (event) => {
            // const tableElement = headerCell.parentElement.parentElement.parentElement;
            // const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            handleSorting(event, headerCell)
        });
    });

    make_search()
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

content = document.querySelector('#table-wrapper')
wrapper = content.parentElement
shadowTop = document.querySelector('.scroll-shadows-top')
shadowBottom = document.querySelector('.scroll-shadows-bottom')

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

function random_shuffle_playlist() {
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

function softmax(scores) {
    scores = scores.map((score) => parseInt(score))
    const maxScore = Math.max(...scores)
    const expScores = scores.map((score) => Math.exp(parseInt(score) - maxScore));
    const sumExpScores = expScores.reduce((acc, expScore) => acc + expScore, 0);
    const res = expScores.map((expScore) => expScore / sumExpScores);
    // console.log(maxScore, expScores, sumExpScores, res)
    return res
}

function weighted_shuffle_playlist() {
    tableElement = document.getElementById("music-list-display")
    table = Array.from(tableElement.querySelector("tbody").children)
    // console.log(table)
    tableElement.removeChild(tableElement.querySelector("tbody"))
    body = document.createElement("tbody")
    tableElement.appendChild(body)
    sort(table, (a, b) => {
        return compare(a, b, "Score", 1)
    })

    const splitIndex = Math.floor(table.length * 0.75);
    const his = table.slice(0, splitIndex);
    const los = table.slice(splitIndex);

    scoresHi = softmax(his.map((e) => e.getAttribute("Score")))
    for (i = 0; i < his.length; i++) {
        his[i].setAttribute("custom-shuffle-score", scoresHi[i])
    }

    scoresLo = softmax(los.map((e) => e.getAttribute("Score")))
    for (i = 0; i < los.length; i++) {
        los[i].setAttribute("custom-shuffle-score", scoresLo[i])
    }

    hiMax = 1
    loMax = 1

    // sort(table, cmp)
    // console.log(table)
    // console.log(his)
    // console.log(los)
    for (i = 0; i < table.length; i++) {
        if ((Math.random() <= 0.8 && his.length > 0) || los.length === 0) {
            t = Math.random() * hiMax
            idx = 0
            while (t - his[idx].getAttribute("custom-shuffle-score") > 0 && idx <= his.length) {
                t -= his[idx].getAttribute("custom-shuffle-score")
                idx++
            }
            if (idx === his.length) {
                idx--
            }
            e = his[idx]
            his.splice(idx, 1)
            hiMax -= e.getAttribute("custom-shuffle-score")
        } else {
            t = Math.random() * loMax
            idx = 0
            while (t - los[idx].getAttribute("custom-shuffle-score") > 0 && idx <= los.length) {
                t -= los[idx].getAttribute("custom-shuffle-score")
                idx++
            }
            if (idx === los.length) {
                idx--
            }
            e = los[idx]
            los.splice(idx, 1)
            loMax -= e.getAttribute("custom-shuffle-score")
        }
        // console.log(e, hiMax, loMax)
        body.appendChild(e)
    }
}

function shuffle_playlist() {
    if (weightedShuffle) {
        weighted_shuffle_playlist()
    } else {
        random_shuffle_playlist()
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

async function updateScore(row) {
    headers = document.querySelectorAll("th")
    for (i = 0; i < headers.length; i++) {
        if (headers[i].textContent === "Score") {
            idx = i
        }
    }
    row.querySelectorAll("td")[idx].textContent = row.getAttribute("Score")
    const postData = {
        new_score: row.getAttribute("Score"),
        filename: row.getAttribute("filename")
    };

    // Make a POST request to the server
    fetch("/api/set-score", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        })
        .then(data => {
            // console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function stringDistance(str1, str2) {
    const matchScore = 2;
    const mismatchScore = -1;
    const gapPenalty = -2;
    const rows = str1.length + 1;
    const cols = str2.length + 1;

    if (str1.toLowerCase().includes(str2.toLowerCase())) {
        return 10000;
    }

    // Convert both sequences to lowercase
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    // Initialize the score matrix with zeros
    const scoreMatrix = Array.from(Array(rows), () => Array(cols).fill(0));

    // Initialize variables to keep track of the maximum score
    let maxScore = 0;

    // Fill in the score matrix
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            // Calculate scores for match, mismatch, insertion, and deletion
            const match = scoreMatrix[i - 1][j - 1] + (str1[i - 1] === str2[j - 1] ? matchScore : mismatchScore);
            const insert = scoreMatrix[i - 1][j] + gapPenalty;
            const deleteScore = scoreMatrix[i][j - 1] + gapPenalty;

            // Update the current cell with the maximum score
            scoreMatrix[i][j] = Math.max(0, match, insert, deleteScore);

            // Update the maximum score
            if (scoreMatrix[i][j] > maxScore) {
                maxScore = scoreMatrix[i][j];
            }
        }
    }

    return maxScore;
}

play_btn = document.getElementById("play-btn")
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



window.addEventListener("keydown", (event) => {
    if (event.key === " " && event.target !== search_bar) {
        event.preventDefault();
    }
    if (lazyAudio.hasAttribute("src")) {
        if (event.key === "l" && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.key === "j" && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.code === 'ArrowRight' && event.target !== search_bar) {
            event.preventDefault();
        }
        if (event.code === 'ArrowLeft' && event.target !== search_bar) {
            event.preventDefault();
        }
    }
})

window.addEventListener("keyup", (event) => {
    if (event.key === " " && event.target !== search_bar) {
        play_btn.click();
    }
    if (lazyAudio.hasAttribute("src")) {
        if (event.key === "l" && event.target !== search_bar) {
            lazyAudio.currentTime += 10
        }
        if (event.key === "j" && event.target !== search_bar) {
            lazyAudio.currentTime = Math.max(0, lazyAudio.currentTime - 10)
        }
        if (event.code === 'ArrowRight' && event.target !== search_bar) {
            lazyAudio.currentTime += 5
        }
        if (event.code === 'ArrowLeft' && event.target !== search_bar) {
            lazyAudio.currentTime = Math.max(0, lazyAudio.currentTime - 5)
        }
    }
})

shuffle_btn = document.getElementById("shuffle-btn")
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

prec_btn = document.getElementById("play-prec-btn")
prec_btn.addEventListener("click", (event) => {
    if (lazyAudio.currentTime < 5) {
        playlist[playlist.length - 2].click()
        playlist.pop()
        playlist.pop()
    } else {
        playlist[playlist.length - 1].click()
    }
})

stop_btn = document.getElementById("stop-btn")
stop_btn.addEventListener("click", (event) => {
    stop_playing()
})

next_btn = document.getElementById("play-next-btn")
next_btn.addEventListener("click", (event) => {
    play_next()
})

lazyAudio.addEventListener("ended", (event) => {
    play_next()
})

find_btn = document.getElementById("find-btn")
find_btn.addEventListener("click", (event) => {
    scroll_to_playing()
})

like_btn = document.getElementById("like-btn")
dislike_btn = document.getElementById("dislike-btn")

like_btn.addEventListener("click", (event) => {
    if (lazyAudio.getAttribute("src")) {
        if (like_btn.hasAttribute("liked")) {
            playlist[playlist.length - 1].setAttribute("Score", -1 + parseInt(playlist[playlist.length - 1].getAttribute("Score")))
            updateScore(playlist[playlist.length - 1])
            like_btn.removeAttribute("liked")
            return
        }
        playlist[playlist.length - 1].setAttribute("Score", 1 + parseInt(playlist[playlist.length - 1].getAttribute("Score")))
        if (dislike_btn.hasAttribute("disliked")) {
            playlist[playlist.length - 1].setAttribute("Score", 1 + parseInt(playlist[playlist.length - 1].getAttribute("Score")))
            dislike_btn.removeAttribute("disliked")
        }
        // console.log(playlist[playlist.length - 1].getAttribute("Score"))
        updateScore(playlist[playlist.length - 1])
        like_btn.setAttribute("liked", "")
    }
})

dislike_btn.addEventListener("click", (event) => {
    if (lazyAudio.getAttribute("src")) {
        if (dislike_btn.hasAttribute("disliked")) {
            playlist[playlist.length - 1].setAttribute("Score", 1 + parseInt(playlist[playlist.length - 1].getAttribute("Score")))
            updateScore(playlist[playlist.length - 1])
            dislike_btn.removeAttribute("disliked")
            return
        }
        playlist[playlist.length - 1].setAttribute("Score", parseInt(playlist[playlist.length - 1].getAttribute("Score")) - 1)
        if (like_btn.hasAttribute("liked")) {
            playlist[playlist.length - 1].setAttribute("Score", parseInt(playlist[playlist.length - 1].getAttribute("Score")) - 1)
            like_btn.removeAttribute("liked")
        }
        // console.log(playlist[playlist.length - 1].getAttribute("Score"))
        updateScore(playlist[playlist.length - 1])
        dislike_btn.setAttribute("disliked", "")
    }
})

reset_scores_btn = document.getElementById("reset-scores-btn")
reset_scores_btn.addEventListener("click", (event) => {
    document.getElementById("confirm-modal").showModal()
})



document.getElementById("reload-btn").addEventListener("click", () => {
    soft_reload(); // ==> il faut pas remplacer les éléments déjà existants, juste supprimer ceux qui n'existent plus, et ajouter les nouveaux
});

function make_search() {
    table = document.querySelector("#music-list-display > tbody").children
    for (i = 0; i < table.length; i++) {
        table[i].setAttribute("search-value", stringDistance(table[i].getAttribute("Titre"), search_bar.value))
    }
    tableElement = document.getElementById("music-list-display")
    table = Array.from(tableElement.querySelector("tbody").children)
    // console.log(table)
    tableElement.removeChild(tableElement.querySelector("tbody"))
    body = document.createElement("tbody")
    tableElement.appendChild(body)
    sort(table, (a, b) => {
        return compare(a, b, "search-value", 1)
    })
    // sort(table, cmp)
    // console.log(table)
    for (e of table) {
        body.appendChild(e)
    }
    document.getElementById("table-wrapper").scrollTo({ top: 0, behavior: "smooth" })
    document.querySelectorAll("th").forEach((e) => {
        e.setAttribute("sortState", 0)
    })
}

search_bar = document.getElementById("search-bar")
search_bar.addEventListener("keydown", (event) => {
    make_search()
})

settings_btn = document.getElementById("settings-btn")
settings_modal = document.getElementById("settings-modal")
settings_btn.addEventListener("click", (event) => {
    settings_modal.showModal()
})

close_settings_modal_btn = document.getElementById("close-settings-btn")
close_settings_modal_btn.addEventListener("click", (event) => {
    if (document.getElementById("music-dir-path").value) {settings_modal.close()}
})

settings_modal.addEventListener('click', () => { if (document.getElementById("music-dir-path").value) {settings_modal.close()} });

reset_scores_btn = document.getElementById("reset-scores-btn")
confirm_modal = document.getElementById("confirm-modal")
reset_scores_btn.addEventListener("click", (event) => {
    confirm_modal.showModal()
})

close_confirm_modal_btn = document.getElementById("close-confirm-btn")
close_confirm_modal_btn.addEventListener("click", (event) => {
    confirm_modal.close()
})

confirm_modal.addEventListener('click', () => { confirm_modal.close() });

modal_inners = document.querySelectorAll('.inner-dialog');
modal_inners.forEach((e) => { e.addEventListener('click', (event) => { event.stopPropagation() }) });

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

cancel_settings_btn = document.getElementById("cancel-settings-btn")
save_settings_btn = document.getElementById("save-settings-btn")

cancel_settings_btn.addEventListener("click", (event) => {
    if (document.getElementById("music-dir-path").value) {settings_modal.close()}
})

save_settings_btn.addEventListener("click", (event) => {
    save_settings()
    soft_reload()
    if (document.getElementById("music-dir-path").value) {settings_modal.close()}
})

cancel_confirm_btn = document.getElementById("cancel-confirm-btn")
confirm_btn = document.getElementById("confirm-btn")

cancel_confirm_btn.addEventListener("click", (event) => {
    confirm_modal.close()
})

confirm_btn.addEventListener("click", (event) => {
    reset_scores()
    confirm_modal.close()
})