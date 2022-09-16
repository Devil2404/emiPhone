chrome
    .tabs
    .onUpdated
    .addListener(function (changeInfo, tab) {
        if (changeInfo.status == 'complete' && tab.active) {

            refresh(true);
        }
    })