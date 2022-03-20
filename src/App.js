import axios from 'axios';
import { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import getClientId from './spotifyClientId';


import './App.css';

const CLIENT_ID = getClientId()

const App = () => {
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = "ugc-image-upload user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private user-read-email user-follow-modify user-follow-read user-library-modify user-library-read streaming app-remote-control user-read-playback-position user-top-read user-read-recently-played playlist-modify-private playlist-read-collaborative playlist-read-private playlist-modify-public"

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  const [playerIsPlaying, setPlayerIsPlaying] = useState(false)


  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const searchArtists = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist"
      }
    })

    setArtists(data.artists.items)
  }

  const handlePlay = async () => {
    const { data } = await axios.put("https://api.spotify.com/v1/me/player/play", {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
    console.log(data);
  }

  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
        {artist.name}
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login
            to Spotify</a>
          : <button onClick={logout}>Logout</button>}
        {playerIsPlaying ?
          <button>Stop</button>
          : <button onClick={handlePlay}>Play</button>}
        <form onSubmit={searchArtists}>
          <input type="text" onChange={e => setSearchKey(e.target.value)} />
          <button type={"submit"}>Search</button>
        </form>
        <button id='togglePlay'>toggle play</button>
        {renderArtists()}
      </header>
      <Helmet>
        <script src="https://sdk.scdn.co/spotify-player.js"></script>
        <script>{`
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = '${token}';
          const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: cb => {cb(token); },
          volume: 0.5
            });

          // Ready
          player.addListener('ready', ({device_id}) => {
            console.log('Ready with Device ID', device_id);
            });

          // Not Ready
          player.addListener('not_ready', ({device_id}) => {
            console.log('Device ID has gone offline', device_id);
            });

          player.addListener('initialization_error', ({message}) => {
            console.error(message);
            });

          player.addListener('authentication_error', ({message}) => {
            console.error(message);
            });

          player.addListener('account_error', ({message}) => {
            console.error(message);
            });

          document.getElementById('togglePlay').onclick = function() {
            player.togglePlay();
            };

          player.connect();
        }
        `}</script>
      </Helmet>
    </div>
  );
}

export default App;
