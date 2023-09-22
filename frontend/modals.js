function add_subsections(e, o){
    let subSections;
    if (Array.isArray(o)) {
        subSections = o
    } else {
        subSections = o.subsections
        e.classList.add("dialog-section")
        let title = document.createElement("summary")
        title.textContent = o.title
        e.appendChild(title)
    }

    for (const subSection of subSections){
        if (subSection.type == "section") {
            let temp = document.createElement("details")
            add_subsections(temp, subSection)
            e.appendChild(temp.cloneNode(deep=true))
        } else if (subSection.type == "text-input") {

        } else if (subSection.type == "color-input") {

        } else if (subSection.type == "checkbox-input") {

        } else if (subSection.type == "text") {
            let temp = document.createElement("span")
            temp.textContent = subSection.text
            e.appendChild(temp.cloneNode(deep=true))
        } else {
            console.error(`unexpected subsection type for [${subSection.title}] : ${subSection.type}`)
        }
    }

}


function make_modal(title, body, footer, verification_locked=false){
    let dialog = document.createElement("dialog")
    let inner_div = document.createElement("div")
    inner_div.classList.add("inner-dialog")
    dialog.appendChild(inner_div)

    // Header
    let header_div = document.createElement("div")
    header_div.classList.add("dialog-header")
    header_div.innerHTML = 
    `
    <h1>${title}</h1>
    <button class="close-dialog" role="button" tooltip="Fermer">
        <i class="fa-solid fa-xmark"></i>
    </button>
    `
    header_div.querySelector("button").addEventListener("click", (event) => {dialog.close()})
    inner_div.appendChild(header_div)
    
    // Body
    let dialog_body = document.createElement("div")
    dialog_body.classList.add("dialog-body")
    add_subsections(dialog_body, body)
    inner_div.appendChild(dialog_body.cloneNode(deep=true))

    // Footer
    let footer_div = document.createElement("div")
    footer_div.classList.add("dialog-footer")
    for (const footer_button of footer) {
        let temp = document.createElement("button")
        temp.innerHTML = `<i class="${footer_button.icon}"></i>`
        temp.setAttribute("role", "button")
        temp.setAttribute("tooltip", footer_button.tooltip)
        if (footer_button.hasOwnProperty("accented")) {
            if (footer_button.accented){
                temp.setAttribute("accented","")
            }
        }
        // temp.addEventListener("click", footer_button.onclick)
        temp.setAttribute("onclick", footer_button.onclick)
        footer_div.appendChild(temp.cloneNode(deep=true))
    }
    inner_div.appendChild(footer_div)
    document.querySelector("body").appendChild(dialog)
    return dialog
}


test = 
[
    {
        type: "section",
        title: "section 1",
        subsections: [
            {
                type: "section",
                title: "section 1.1",
                subsections: [
                    {
                        type: "text",
                        text: "wow amazing text"
                    }
                ]
            },
            {
                type: "section",
                title: "section 1.2",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
    {
        type: "section",
        title: "section 2",
        subsections: [
            {
                type: "section",
                title: "section 2.1",
                subsections: []
            }
        ]
    },
]

let test_modal = document.createElement("dialog")

test_footer = [
    {
        icon: "fa-solid fa-ban",
        tooltip: "fermer",
        onclick: "test_modal.close()"
    }, 
    {
        icon: "fa-regular fa-floppy-disk",
        tooltip: "fermer",
        onclick: "test_modal.close()",
        accented: true
    }, 
]

test_modal = make_modal("Test", test, test_footer)
test_modal.showModal()

/*
<dialog id="settings-modal">
    <div class="inner-dialog">
        <div class="dialog-header">
            <h1>Paramètres</h1>
            <button id="close-settings-btn" role="button" tooltip="Fermer">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <ul class="settings">
            <li>
                <label for="music-dir-path">Chemin du répèrtoire de musique : </label>
                <input type="text" id="music-dir-path" placeholder="Chemin vers un répertoire">
            </li>
            <li>
                <label for="theme">Couleur d'accent : </label>
                <input type="color" id="theme" placeholder="Couleur d'accent">
            </li>
            <li>
                <label for="shuffle-type">Mélange pondéré : </label>
                <input type="checkbox" id="shuffle-type" placeholder="Couleur d'accent" hidden checked>
                <label for="shuffle-type" id="shuffle-type-btn" role="button">
                    <i class="fa-solid fa-check"></i>
                    <i class="fa-solid fa-xmark"></i>
                </label>
            </li>
        </ul>
        <div class="dialog-footer">
            <button id="cancel-settings-btn" role="button" tooltip="Fermer">
                <i class="fa-solid fa-ban"></i>
            </button>
            <button id="save-settings-btn" role="button" tooltip="Fermer">
                <i class="fa-regular fa-floppy-disk"></i>
            </button>
        </div>
    </div>
</dialog>
*/