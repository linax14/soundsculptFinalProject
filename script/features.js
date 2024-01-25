
// generate acess token
let accessToken = '';

async function token() {
    const clientId = '52c06719fe3a4d6abc442eb6e68ace91';
    const clientSecret = '11555b937c8a459799c646a255113de7';
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';

    try {
        let tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
        });
        const tokenData = await tokenResponse.json();

        accessToken = tokenData.access_token;
        // console.log(accessToken);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// get the details of each featured playlist including artist names, tracks...
async function playlistDetailsTracks(playlistId) {
    let limit = 10
    let dataTracks

    try {
        const playlistTracks = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`;

        const response = await fetch(playlistTracks, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching playlist tracks: ${response.statusText}`);
        }

        dataTracks = await response.json();
        // console.log(dataTracks);
        return dataTracks

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// get all of spotifys available markets and with that choose a country
// to listen to the featured playlists from that country
// default pt 
let selectedCountry = 'PT'
async function market() {
    try {
        const markets = `https://api.spotify.com/v1/markets`
        const response = await fetch(markets, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!accessToken) {
            console.error('Access token not available');
            return;
        }

        if (!response.ok) {
            throw new Error(`Error fetching markets: ${response.statusText}`);
        }
        const dataMarket = await response.json();
        availableMarkets = dataMarket.markets;
        console.log(dataMarket.markets);

        availableMarkets.forEach(market => {
            let option = document.createElement('option')
            option.value = market
            option.text = market
            countrySelect.add(option)
        });

        featurePlaylist()
    }
    catch (error) {
        console.error('Error:', error.message);
    }
}
// get featured playlists from spotify
async function featurePlaylist() {
    let limit = 12

    try {
        // const featurePlaylist = `https://api.spotify.com/v1/browse/featured-playlists?limit=${limit}`;
        const featurePlaylist = `https://api.spotify.com/v1/browse/featured-playlists?limit=${limit}&country=${selectedCountry}`;

        const response = await fetch(featurePlaylist, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!accessToken) {
            console.error('Access token not available');
            return;
        }

        if (!response.ok) {
            throw new Error(`Error fetching featured playlist: ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data);

        let counter = 0
        for (const playlist of data.playlists.items) {
            counter++
            let counterName = `num${counter}`

            const playlistId = playlist.id;

            const dataTracks = await playlistDetailsTracks(playlistId);

            let playlistBox = document.querySelector('#playlist-box')

            let playlistDetails = document.createElement('div')
            playlistDetails.classList.add('playlist-details')
            playlistDetails.classList.add('accordion')
            playlistDetails.id = 'accordion'
            playlistBox.appendChild(playlistDetails)

            let playlistInfo = document.createElement('div')
            playlistInfo.classList.add('playlist-info')
            playlistInfo.classList.add('accordion-item')
            playlistDetails.appendChild(playlistInfo);

            let playlistImgDiv = document.createElement('div')
            playlistImgDiv.classList.add('accordion-header')
            playlistInfo.appendChild(playlistImgDiv)

            let playlistImgBtn = document.createElement('button')
            playlistImgBtn.classList.add('accordion-button')
            playlistImgBtn.type = 'button'

            playlistImgBtn.setAttribute('data-bs-toggle', 'collapse')
            playlistImgBtn.setAttribute('data-bs-target', `#${counterName}`);
            playlistImgBtn.setAttribute('aria-expanded', false)

            let playlistImg = document.createElement('img')
            playlistImg.src = playlist.images[0].url

            let playlistImgBtnTextContent = document.createElement('div')
            playlistImgBtnTextContent.classList.add('img-btn-text-content')

            let playlistName = document.createElement('p')
            playlistName.textContent = playlist.name
            playlistName.classList.add('playlist-name');

            let playlistDescription = document.createElement('p')
            playlistDescription.textContent = playlist.description
            playlistDescription.classList.add('playlist-description')

            playlistImgDiv.appendChild(playlistImgBtn)
            playlistImgBtn.appendChild(playlistImg)
            playlistImgBtn.appendChild(playlistImgBtnTextContent)

            playlistImgBtnTextContent.appendChild(playlistName)
            playlistImgBtnTextContent.appendChild(playlistDescription)

            let playlistTableDiv = document.createElement('div')
            playlistTableDiv.id = counterName
            playlistTableDiv.classList.add('table-div')
            playlistTableDiv.classList.add('accordion-collapse')
            playlistTableDiv.classList.add('collapse')
            playlistTableDiv.classList.add('hide')

            playlistDetails.appendChild(playlistTableDiv)

            let playlistTable = document.createElement('table')
            playlistTable.id = `${playlistId}`
            playlistTable.classList.add('accordion-body')
            playlistTable.classList.add('playlist-table')
            playlistTableDiv.appendChild(playlistTable);

            playlistTableHeader(dataTracks.items[0].track, playlistTable)
            // show the number of tracks
            for (let i = 0; i < 10; i++) {
                playlistDetailsTracksElement(dataTracks.items[i].track, playlistTable)
            }
        }
    }
    catch (error) {
        console.error('Error:', error.message);
    }
}

// create the header for the table of the tracks in each playlist
function playlistTableHeader(dataTracks, playlistTable) {
    let row = playlistTable.insertRow()
    row.classList.add('table-header')
    let trackName = row.insertCell()
    trackName.textContent = 'Track'

    let artistName = row.insertCell()
    artistName.textContent = 'Artist'

    let audio = row.insertCell()
    audio.textContent = 'Audio'
}

// add the data from each track within the featured playlist to the table
function playlistDetailsTracksElement(dataTracks, playlistTable) {
    let row = playlistTable.insertRow();

    let trackName = row.insertCell()
    trackName.textContent = dataTracks.name

    let artistName = row.insertCell()
    artistName.textContent = dataTracks.artists.map(artists => artists.name).join(', ')

    let audio = row.insertCell()
    if (dataTracks.preview_url) {
        let audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = dataTracks.preview_url;
        audio.appendChild(audioElement)
    } else {
        audio.textContent = 'Not available'
    }
}

// select a new country and stop showing the playlists from the previous country selected
function changeCountry() {
    let countrySelect = document.querySelector('#countrySelect')
    selectedCountry = countrySelect.value

    let playlistBox = document.querySelector('#playlist-box');
    playlistBox.innerHTML = '';

    featurePlaylist()
}

// generate token when the page loads
// load the playlists with the default country
async function onPageLoad() {
    try {
        await token()
        await market()

    } catch (error) {
        console.error('Error:', error.message);
    }
}

window.addEventListener('load', onPageLoad)