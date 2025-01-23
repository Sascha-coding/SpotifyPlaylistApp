import React, { useState, useEffect } from "react";
import styles from "../mainSegment.module.css";
import Track from "../../searchResults/Track";
import SpotifyApi from "../../../eiglAufServerSeite";

const CurrentPlaylist = (props) => {
  const [playlist, setPlaylist] = useState(props.playlist);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setPlaylist(props.playlist);
  }, [props.playlist]);

  const handleEditClick = (value, e) => {
    if (isEditing) {
      setPlaylist(props.playlist);
    }
    setIsEditing(value);
  };

  const handleSaveClick = async (event) => {
    let updateObj;

    updateObj = {
      name: playlist.playlistName,
      description: playlist.playlistGenre,
      tracks: playlist.playlistTracks,
      id: playlist.spotifyId,
    };
    const spotifyId = playlist.spotifyId;
    await SpotifyApi.updatePlaylistDetails(spotifyId, updateObj);
    props.updateSavedPlaylists("update", playlist);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const prop = e.target.id;
    const updatedPlaylist = { ...playlist };
    updatedPlaylist[prop] = e.target.value;
    setPlaylist(updatedPlaylist);
  };

  const updatePlaylistTracks = async (direction, track) => {
    const newPlaylist = { ...playlist };
    console.log("remove track from playlist");
    console.log("track = ", track);
    newPlaylist.playlistTracks = newPlaylist.playlistTracks.filter(
      (entry) => entry.id !== track.id
    );
    await SpotifyApi.removeTracksFromPlaylist(playlist.spotifyId, [track.uri]);
    props.stateSetter({ currentPlaylist: newPlaylist });
  };
  console.log("playlist length = ", playlist.playlistTracks.length);
  return (
    <div className={styles.currentPlaylistContainer}>
      <div className={styles.h1div}>
        {isEditing ? (
          <input
            id="playlistName"
            type="text"
            value={playlist.playlistName}
            onChange={(e) => handleInputChange(e)}
            className={styles.currentPlaylistH1 + " inputToggle2"}
          />
        ) : (
          <h1
            id="playlistName"
            className={styles.currentPlaylistH1 + " inputToggle2"}
          >
            {playlist.playlistName}
          </h1>
        )}
        <div className={styles.buttonDiv}>
          <button
            onClick={(e) => {
              handleEditClick(isEditing ? false : true, e);
            }}
            id="editBtn"
            className={styles.button}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>

          <button
            onClick={(e) => handleSaveClick(e)}
            className={styles.button}
            title={isEditing ? "Save Changes" : "Update on Spotify"}
          >
            {isEditing ? "Save" : "Update"}
          </button>
        </div>
      </div>
      <div className={styles.currentPlaylistInfo}>
        <div className={styles.currentPlaylistData}>
          <label className={styles.currentPlaylistLabel}>Created: </label>
          <input
            className={styles.currentPlaylistInput}
            value={playlist.playlistCreation}
            readOnly
          />
        </div>
        <div className={styles.currentPlaylistData}>
          <label className={styles.currentPlaylistLabel}>Genre: </label>
          <input
            maxLength="30"
            onChange={(e) => handleInputChange(e)}
            id="playlistGenre"
            className={styles.currentPlaylistInput + " inputToggle"}
            value={playlist.playlistGenre}
          />
        </div>
        <div className={styles.currentPlaylistData}>
          <label className={styles.currentPlaylistLabel}>Tracks: </label>
          <input
            onChange={(e) => handleInputChange(e)}
            className={styles.currentPlaylistInput}
            value={playlist.playlistLength}
          />
        </div>
      </div>
      <div className={styles.currentPlaylistDescription}>
        <label className={styles.descrLabel}>Description: </label>
        <textarea
          maxLength="250"
          onChange={(e) => handleInputChange(e)}
          id="playlistDescription"
          className={styles.descr + " inputToggle"}
          value={playlist.playlistDescription}
        ></textarea>
      </div>
      <div className={styles.currentPlaylistTracks}>
        {playlist
          ? playlist.playlistTracks.map((track, index) => {
              return (
                <Track
                  index={index + 1}
                  key={track.name + "-" + index}
                  track={track}
                  updatePlaylistTracks={updatePlaylistTracks}
                  search={false}
                />
              );
            })
          : null}
      </div>
      <div>
        <audio
          src="https://www.youtube.com/watch?v=vXYVfk7agqU&t=4973s"
          controls
        ></audio>
      </div>
    </div>
  );
};

export default CurrentPlaylist;
