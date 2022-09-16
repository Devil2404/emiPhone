let emails = [], phone = [], domains = [];
let dummyEmail, dummyPhone;
chrome.storage.sync.get(['record'], (data) => {
    emails = data.record.emails;
    phone = data.record.phone;
})

Array.prototype.first = function () {
    return this[0];
}
let empty = value => {
    return value === undefined || value === null || value === '' || ['Null', 'NULL', '', 'null'].indexOf(value) > -1
        ? true
        : false;
}
let emptyArray = array => {
    return array !== undefined || array instanceof Array || array.length > 0
        ? true
        : false;
}
function findPhone(text) {
    let regex = /\+\d{1,4}\s?\(?\d{1,2}\)?(?:\s?\-?\d{1,3}){3,5}/gim;
    return empty(text)
        ? []
        : text
            .match(regex);
}
function findEmails(text) {

    const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
    return empty(text)
        ? []
        : text
            .toLowerCase()
            .match(reg);
}
function getEmailDomain() {

    emails.length === 0 ? [] :
        emails.forEach((email) => {
            atindex = email.lastIndexOf("@");
            domains.push(email.substr(atindex + 1, email.length));
        })

}
function download(content, filename) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(content);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.click();
}
function Execl() {
    var csv = '', emailArray = [];
    for (let email of emails) {
        emailArray.push([email])
    }
    csv += "Emails\n"
    emailArray.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    csv += "Phone Numbers\n"
    emailArray = [];
    for (let number of phone) {
        emailArray.push([number])
    }
    emailArray.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    download(csv, 'Data' + '.csv')

}
const copyToClipboard = str => {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document
        .body
        .appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    alert("Data are copied to clipboard");
    document
        .body
        .removeChild(textarea);
};
const refresh = (onlyBadge = false) => {
    chrome
        .tabs
        .query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            chrome
                .tabs
                .sendMessage(tabs[0].id, {
                    tab: tabs[0],
                    data: {
                        onlyBadge: onlyBadge
                    }
                }, showResults);
        });
}
const showResults = res => {
    if (res && res.content) {
        dummyEmail = [...new Set(findEmails(res.content))];
        dummyPhone = [...new Set(findPhone(res.content))];
        emails = emails.length > 0 ? [...dummyEmail, ...emails] : [...dummyEmail];
        phone = phone.length > 0 ? [...dummyPhone, ...phone] : [...dummyPhone];
        emails = [...new Set(emails)];
        phone = [...new Set(phone)];
        updateBadge(emails.length + phone.length);
        if (res.options && res.options.data && res.options.data.onlyBadge === true) {
            return false;
        }
        getEmailDomain()
        domains = [...new Set(domains)];
        let data = {
            emails, phone
        }
        chrome.storage.sync.set({ 'record': data }, () => {
            console.log("Success")
        });
        updateResultInfoView(emails.length, phone.length);
    }
}
const showDomains = () => {
    const RES = document.getElementById("showResults");
    RES.innerHTML = ""
    if (domains.length > 0) {
        domains.forEach(e => {
            RES.innerHTML += `<li>${e}</li>`
        })
    }
    else {
        RES.innerHTML = `<li>No Match Found</li>`
    }
}
const showEmails = () => {
    const RES = document.getElementById("showResults");
    RES.innerHTML = ""
    if (emails.length > 0) {
        emails.forEach(e => {
            RES.innerHTML += `<li>
            <a href="mailto:${e}">${e}</a>
            </li>`
        })
    }
    else {
        RES.innerHTML = `<li>No Match Found</li>`
    }
}
const showNumbers = () => {
    const RES = document.getElementById("showResults");
    RES.innerHTML = ""
    if (phone.length > 0) {
        phone.forEach(e => {
            RES.innerHTML += `<li>${e}</li>`
        })
    }
    else {
        RES.innerHTML = `<li>No Match Found</li>`
    }
}
const updateResultInfoView = (emailsUniqueCount = 0, phoneUniqueCount = 0) => {
    const emailsUniqueCountEl = document.getElementById('email');
    const phoneUniqueCountEl = document.getElementById('Phone');
    emailsUniqueCountEl.textContent = emailsUniqueCount;
    phoneUniqueCountEl.textContent = phoneUniqueCount;
}
const updateBadge = text => {
    chrome
        .browserAction
        .setBadgeBackgroundColor({
            color: [0, 0, 0, 1]
        });
    chrome
        .browserAction
        .setBadgeText({
            text: text.toString()
        });
}
const copy = () => {
    chrome
        .tabs
        .query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            chrome
                .tabs
                .sendMessage(tabs[0].id, {
                    tab: tabs[0],
                    data: {}
                }, (res) => {
                    if (res && res.content) {
                        copyToClipboard(emails.join(' ').concat(phone.join(' ')));
                    }
                })
        })
}
const toEmail = () => {
    chrome
        .tabs
        .query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            chrome
                .tabs
                .sendMessage(tabs[0].id, {
                    tab: tabs[0],
                    data: {}
                }, (res) => {
                    if (res && res.content) {
                        const emailsText = emails.join(';');
                        if (!empty(emailsText)) {
                            var emailUrl = 'mailto:' + escape(emailsText);
                            chrome
                                .tabs
                                .create({
                                    url: emailUrl
                                }, function (tab) {
                                    setTimeout(function () {
                                        chrome
                                            .tabs
                                            .remove(tab.id);
                                    }, 500);
                                });
                        }

                    }
                })
        })
}
const downloadCsv = () => {
    chrome
        .tabs
        .query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            chrome
                .tabs
                .sendMessage(tabs[0].id, {
                    tab: tabs[0],
                    data: {}
                }, (res) => {
                    if (res && res.content) {
                        if (emails.length > 0 || phone.length > 0) {
                            Execl();
                        }
                    }
                })
        })
}
const downloadTxt = () => {
    chrome
        .tabs
        .query({
            currentWindow: true,
            active: true
        }, function (tabs) {
            chrome
                .tabs
                .sendMessage(tabs[0].id, {
                    tab: tabs[0],
                    data: {}
                }, (res) => {
                    if (res && res.content) {
                        if (emails.length > 0 || phone.length > 0) {
                            download(emails.join(', ').concat(phone.join(', ')), "data.txt");
                        }
                    }
                })
        })
}
