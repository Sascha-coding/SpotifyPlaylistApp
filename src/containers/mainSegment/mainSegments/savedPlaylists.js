import React, { useState, useEffect } from "react";
import styles from "../mainSegment.module.css";

import Playlist from "./playlistContainer.js";

import SpotifyApi from "../../../eiglAufServerSeite.js";

const SavedPlaylists = (props) => {
  const [savedPlaylists, setSavedPlaylists] = useState(props.savedPlaylists);

  useEffect(() => {
    setSavedPlaylists(props.savedPlaylists);
  }, [props.savedPlaylists]);
  const syncPlaylists = async () => {
    localStorage.removeItem("savedPlaylists");
    let savedPlaylists = await SpotifyApi.getPlaylists();
    console.log("savedPlaylists = ", savedPlaylists);
    props.stateSetter({ savedPlaylists: savedPlaylists });
  };

  return (
    <div className={styles.savedPlaylistsContainer}>
      <h1 className={styles.savedPlaylistH1}>Saved Playlists</h1>
      <div className={styles.menueContainer}>
        <div className={styles.playlistList}>
          {savedPlaylists
            ? savedPlaylists.map((playlist, index) => {
                return (
                  <Playlist
                    key={playlist.playlistName + "-" + index}
                    playlist={playlist}
                    selectPlaylist={props.selectPlaylist}
                  />
                );
              })
            : null}
        </div>
        <div className={styles.btnsDiv}>
          <button className={styles.syncBtn} onClick={(e) => syncPlaylists()}>
            Get Playlists
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedPlaylists;
