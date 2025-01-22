import React from "react";
import styles from "../mainSegment.module.css";

const Playlist = (props) => {
  const playlistObj = props.playlist;
  return (
    <div
      className={styles.playlistContainer}
      onClick={(e) => props.selectPlaylist(playlistObj)}
    >
      <img
        className={styles.playlistImg}
        alt="Empty"
        src={playlistObj.playlistImage}
      ></img>
      <h3 className={styles.playlistName}>{playlistObj.playlistName}</h3>
      <div className={styles.playlistInfo}>
        <div className={styles.playlistData}>
          <label>Created: </label>
          <span>{playlistObj.playlistCreation}</span>
        </div>
        <div className={styles.playlistData}>
          <label>Genre: </label>
          <span>{playlistObj.playlistGenre}</span>
        </div>
        <div className={styles.playlistData}>
          <label>Tracks: </label>
          <span>{playlistObj.playlistLength}</span>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
