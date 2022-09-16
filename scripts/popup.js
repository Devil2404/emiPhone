
document
    .addEventListener('DOMContentLoaded', function () {
        document
            .getElementById('copy')
            .addEventListener('click', copy)
        document
            .getElementById('showDomains')
            .addEventListener('click', showDomains)
        document
            .getElementById('showEmails')
            .addEventListener('click', showEmails)
        document
            .getElementById('showNumbers')
            .addEventListener('click', showNumbers)
        document
            .getElementById('emailAll')
            .addEventListener('click', toEmail)
        document
            .getElementById('downloadCsv')
            .addEventListener('click', downloadCsv)
        document
            .getElementById('downloadTxt')
            .addEventListener('click', downloadTxt)

        refresh(false)
    }, false);



     