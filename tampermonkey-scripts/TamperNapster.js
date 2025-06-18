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

function typeIntoElement(element, inputString) {
  // Default options are now hardcoded as requested
  const charDelayMs = 50;
  const pressEnterAtEnd = false; // Set to true if 'Enter' key simulation is always desired

  return new Promise((resolve, reject) => {
    const targetElement = element; // Now directly use the passed element

    if (!targetElement || !(targetElement instanceof HTMLElement)) {
      console.error(`Error: Invalid element provided. Expected an HTMLElement.`);
      return reject(new Error(`Invalid element provided.`));
    }

    if (!('value' in targetElement)) {
      console.warn(`Warning: Provided element does not have a 'value' property. ` +
                   `Attempting to set anyway, but it might not have the desired effect.`);
    }

    // Ensure the element is focused before typing
    targetElement.focus();
    targetElement.value = ''; // Clear existing value before typing

    let charIndex = 0;

    const simulateKey = (key, keyCode, code) => {
        // keydown event
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: key,
            code: code,
            keyCode: keyCode,
            bubbles: true,
            cancelable: true,
            isComposing: false,
        });
        targetElement.dispatchEvent(keyDownEvent);

        // keypress event (for character-generating keys)
        if (key.length === 1 && key !== ' ') {
             const keyPressEvent = new KeyboardEvent('keypress', {
                key: key,
                code: code,
                keyCode: keyCode,
                charCode: key.charCodeAt(0),
                bubbles: true,
                cancelable: true,
                isComposing: false,
            });
            targetElement.dispatchEvent(keyPressEvent);
        }

        // keyup event
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: key,
            code: code,
            keyCode: keyCode,
            bubbles: true,
            cancelable: true,
            isComposing: false,
        });
        targetElement.dispatchEvent(keyUpEvent);
    };


    const typeCharacter = () => {
      if (charIndex < inputString.length) {
        const char = inputString.charAt(charIndex);

        let key = char;
        let keyCode = char.charCodeAt(0);
        let code = '';

        if (char >= 'a' && char <= 'z') {
            code = `Key${char.toUpperCase()}`;
        } else if (char >= 'A' && char <= 'Z') {
            code = `Key${char}`;
        } else if (char >= '0' && char <= '9') {
            code = `Digit${char}`;
        } else if (char === ' ') {
            code = 'Space';
            keyCode = 32;
        }

        simulateKey(key, keyCode, code);

        targetElement.value += char;

        const inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true
        });
        targetElement.dispatchEvent(inputEvent);

        charIndex++;
        setTimeout(typeCharacter, charDelayMs);
      } else {
        const changeEvent = new Event('change', {
          bubbles: true,
          cancelable: true
        });
        targetElement.dispatchEvent(changeEvent);

        // Optionally simulate 'Enter' key press based on the now-hardcoded option
        if (pressEnterAtEnd) {
          console.log(`Simulating 'Enter' key press for element...`);
          simulateKey('Enter', 13, 'Enter');
        }

        console.log(`Typing complete. Final Value: "${targetElement.value}"`);
        resolve();
      }
    };

    typeCharacter();
  });
}


/* Simulates button clicks and interactions to manually add a song */
function InsertSong(track) {
    let quickSearchSpace = document.getElementsByClassName("ant-input")[0];
    quickSearchSpace.click();

    let searchValue = track.song_name + " " + track.artist_name;
    searchValue = searchValue.toLowerCase();

    let targetFeatures = { attributes: true };

    let extendedSearchTracker = new MutationObserver((mutationList, observer) => {
        let extendedTarget = ".sc-iGculD.clmYuu";
        // If extended search options appear, mutation has occurred
        if (document.querySelector(".ant-input")) {
            extendedSearchTracker.disconnect();
            quickSearchSpace.click();
            //quickSearchSpace.value = searchValue;

            typeIntoElement(quickSearchSpace, searchValue);
        }
    });

    extendedSearchTracker.observe(document.querySelector(".ant-input"), targetFeatures);
}

/* Adds a song to the playlist
* @param {Array<object>} trackList - array of song data objects, name of song and artist included.
*/
function AddSongs(trackList) {
    trackList.forEach((track) => {

    });
}

// Retrieves list of song names from playlist
// Returns in JSON format with following schema:
/*

{
    "song_name" : "Name of Song",
    "artist_name" : "Name of Artist
}

*/
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
    InsertSong(songs[0]);
    return songs;
}

function performNapsterScraping() {
    let pageText = document.body.innerText;
    if (pageText.includes("My music")) {
        RetrievePlaylistSongs();
    }
}

(function() {
    'use strict';
    let targetFlags = ".ant-table-tbody";
    let targetFeatures = { childList: true, subTree: true };

    let mutationTracker = new MutationObserver((mutationList, observer) => {
        if (document.querySelector(targetFlags)) {
            mutationTracker.disconnect();
            performNapsterScraping();
        }
    });

    mutationTracker.observe(document.body, targetFeatures);
})();