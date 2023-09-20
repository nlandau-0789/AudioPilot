search_bar = document.getElementById("search-bar")

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

temp = soft_reload
async function soft_reload() {
    await temp()
    make_search()
}

search_bar.addEventListener("keydown", (event) => {
    make_search()
})

window.addEventListener("keydown", (event) => {
    if (event.key === " " && event.target !== search_bar) {
        event.preventDefault();
    }
})