like_btn = document.getElementById("like-btn")
dislike_btn = document.getElementById("dislike-btn")
reset_scores_btn = document.getElementById("reset-scores-btn")

reset_scores_btn = document.getElementById("reset-scores-btn")
close_confirm_modal_btn = document.getElementById("close-confirm-btn")
confirm_modal = document.getElementById("confirm-modal")
confirm_btn = document.getElementById("confirm-btn")
cancel_confirm_btn = document.getElementById("cancel-confirm-btn")

function shuffle_playlist() {
    if (weightedShuffle) {
        weighted_shuffle_playlist()
    } else {
        random_shuffle_playlist()
    }
}

reset_scores_btn.addEventListener("click", (event) => {
    document.getElementById("confirm-modal").showModal()
})

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

document.addEventListener("new_row", (event) => {
    row = event.detail.row

    row.addEventListener("click", (event) => {
        like_btn.removeAttribute("liked")
        dislike_btn.removeAttribute("disliked")
    }) 
})

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

function softmax(scores) {
    scores = scores.map((score) => parseInt(score))
    const maxScore = Math.max(...scores)
    const expScores = scores.map((score) => Math.exp(parseInt(score) - maxScore));
    const sumExpScores = expScores.reduce((acc, expScore) => acc + expScore, 0);
    const res = expScores.map((expScore) => expScore / sumExpScores);
    // console.log(maxScore, expScores, sumExpScores, res)
    return res
}

function shuffle_playlist() {
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

reset_scores_btn.addEventListener("click", (event) => {
    confirm_modal.showModal()
})

close_confirm_modal_btn.addEventListener("click", (event) => {
    confirm_modal.close()
})

confirm_modal.addEventListener('click', () => { confirm_modal.close() });

cancel_confirm_btn.addEventListener("click", (event) => {
    confirm_modal.close()
})

confirm_btn.addEventListener("click", (event) => {
    reset_scores()
    confirm_modal.close()
})