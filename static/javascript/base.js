window.onload = function(){
    let forms_loc = document.querySelectorAll(".auth-from-location");
    for (let location of forms_loc) {
        location.value = window.location.href.split('?')[0];
        //location.setAttribute('value', window.location.toString());
    }
}

window.onclick = function(event) {
    let login_form = this.document.querySelector('#login-form-container');
    if (event.target.closest('#login-btn-wrap')) {
        login_form.style.display = 'block'
    } else if (!event.target.closest('#login-form-container') && login_form) {
        login_form.style.display = 'none'
    }
}