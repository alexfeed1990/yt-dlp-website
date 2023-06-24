// form stuff

window.addEventListener("DOMContentLoaded", (event) => {
    const form = document.querySelector('#download-form');

    form.addEventListener('submit', event => {
        const formData = new FormData(event.target);
        event.preventDefault();

        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "url": formData.get("url"),
                "format": formData.get("format")
            })
        };
    
        fetch(window.location.origin + "/api/download/", options)
            .then(response => {
                response.json();
                window.location = window.location.origin + response;
            })
            .catch(err => console.error(err));
    })
});