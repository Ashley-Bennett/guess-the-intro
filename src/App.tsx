import axios from "axios";
import { useEffect, useState } from "react";
import getClientId from "./spotifyClientId";

import "./App.css";
import { guessTimes } from "./guessTimes";

const CLIENT_ID: string = getClientId;

const App = () => {
  const REDIRECT_URI: string = "http://localhost:3000";
  const AUTH_ENDPOINT: string = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE: string = "token";
  const SCOPE: string =
    "ugc-image-upload user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private user-read-email user-follow-modify user-follow-read user-library-modify user-library-read streaming app-remote-control user-read-playback-position user-top-read user-read-recently-played playlist-modify-private playlist-read-collaborative playlist-read-private playlist-modify-public";

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        ?.substring(1)
        ?.split("&")
        ?.find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1]!;

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const [token, setToken] = useState<string | null>("");
  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [totalGuesses, setTotalGuesses] = useState(0);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const handlePlay = async () => {
    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPlayerIsPlaying(true);
    stopIntro();
  };

  const handleStop = async () => {
    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    handleSetToStart();
  };

  const handleSetToStart = async () => {
    await axios.put(
      "https://api.spotify.com/v1/me/player/seek",
      {},
      {
        params: {
          position_ms: 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPlayerIsPlaying(false);
  };

  const stopIntro = () => {
    setTimeout(() => {
      handleStop();
    }, guessTimes[totalGuesses]);
  };

  const handleAddGuess = () => {
    setTotalGuesses(totalGuesses + 1);
  };

  const handleSkipSong = async () => {
    await axios.post(
      "https://api.spotify.com/v1/me/player/next",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    handleStop();
    setTotalGuesses(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
          >
            Login to Spotify
          </a>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
        {playerIsPlaying ? (
          <button onClick={handleStop}>Stop</button>
        ) : (
          <button onClick={handlePlay}>Play</button>
        )}
        <button onClick={handleAddGuess}>Give me more</button>
        <button onClick={handleSkipSong}>Another One!</button>
      </header>
    </div>
  );
};

export default App;
