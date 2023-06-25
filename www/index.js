// form stuff

let nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");


function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

function notify(message, title = 'Error!', variant = 'danger', icon = 'exclamation-octagon') {
    const alert = Object.assign(document.createElement('sl-alert'), {
        variant: "danger",
        closable: true,
        innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        <strong>${escapeHtml(title)}</strong><br />
        ${escapeHtml(message)}
      `
    });

    document.body.append(alert);
    return alert.toast();
}

window.addEventListener("DOMContentLoaded", (event) => {
    const form = document.querySelector('#download-form');

    form.addEventListener('submit', event => {
        const formData = new FormData(event.target);
        const spinner = document.querySelector(".spinner");
        spinner.classList.remove("hidden");
        event.preventDefault();

        
        const options = {
            method: 'POST',
            url: window.location.origin + "/api/download/",
            headers: {
                'Content-Type': 'application/json'
            },
            data: { url: formData.get("url"), format: formData.get("format") }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);

            spinner.classList.add("hidden");
            if (response.data.startsWith("/downloads/")) { window.location.pathname = response.data; } else {
                notify(response.data, "Error!");
            }
        }).catch(function (error) {
            console.error(error);

            notify(error, "Error!");
        });
    });
});