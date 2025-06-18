// ==UserScript==
// @name         Tamper Napster
// @namespace    http://tampermonkey.net/
// @version      2025-06-17
// @description  Scrape web details from Napster streaming page (my playlist) and compile it
// @author       Berkan
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// Adds a song to the playlist
function AddSong() {

}

// Retrieves list of song names from playlist
function RetrievePlaylistSongs() {
    let songs = [];
    let tbodyParent = document.getElementsByClassName('ant-table-tbody')[0];
    let trChildren = tbodyParent.getElementsByTagName('tr');

    for (let i = 0; i < trChildren.length; i++) {
        let tdChildren = trChildren[i].getElementsByTagName('td');
        if (tdChildren.length > 0) {
            let songName = tdChildren[0].getElementsByTagName('div')[0].querySelector('p').innerText;
            let artistName = tdChildren[0].getElementsByTagName('div')[0].querySelectorAll('p')[1].innerText;
            if (songName) {
                songs.push({
                    "song_name" : songName,
                    "artist_name" : artistName
                });
            }
        }
    }
    alert(JSON.stringify(songs));
    return songs;
}

(function() {
    'use strict';

    // the idea with observer is to observe the WHJOLE document body, and only disconnect once the target element is detected within the calback
    let targetFlags = ".ant-table-tbody";
    let targetFeatures = { childList: true, subTree: true };

    let mutationTracker = new MutationObserver((mutationList, observer) => {
        if (document.querySelector(targetFlags)) {
            mutationTracker.disconnect();
            performNapsterScraping();
        }
    });

    mutationTracker.observe(document.body, targetFeatures);

    function performNapsterScraping() {
        alert("Initiated");
        let pageText = document.body.innerText;
        if (pageText.includes("Napster")) {
            RetrievePlaylistSongs();
        }
    }
})();