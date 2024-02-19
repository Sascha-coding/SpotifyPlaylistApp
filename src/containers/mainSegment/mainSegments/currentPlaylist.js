import React, {useState, useEffect} from "react"   
import styles from "../mainSegment.module.css"

import Track from "../../searchResults/Track"

const CurrentPlaylist = (props) => {
   
    const [playlist, setPlaylist] = useState(props.playlist);
    useEffect(() => {
        const h1 = document.querySelector(".inputToggle2");
        if(h1){
            h1.textContent = props.playlist.playlistName;
            setPlaylist(props.playlist)
        }
    },[props.playlist])

    const editInfo = (event) => {
        let h1 = document.querySelector(".inputToggle2");
        let inputs = document.querySelectorAll(".inputToggle");
        let editBtn = document.getElementById("editBtn");

        if(event.target.textContent === "Edit"){
            h1.contentEditable = "true";
            h1.style = "pointer-events:all; background-color:#4f4f4f; border:1px solid silver;"
            editBtn.textContent = "Done";
            for(let input of inputs){
                input.style = "pointer-events:all; background-color:#4f4f4f; border:1px solid silver;"
            }
        }else{
            h1.contentEditable = "false";
            h1.style = "pointer-events:none; background-color:#2f2f2f; border:none;"
            editBtn.textContent = "Edit";
            for(let input of inputs){
                input.style = "pointer-events:none; background-color:#2f2f2f; border:none;"
            }
            props.stateSetter({"updateSavedPlaylists":true});
            props.stateSetter({"currentPlaylist":playlist});
        }
    }

    const handleChange = (event) => {
        const prop = event.target.id;
        let value;
        if(prop === "playlistName"){
            
            if(event.target.textContent.length > 30){
                event.target.textContent = playlist.playlistName
                return;
            }else{
                
                let h1 = document.querySelector(".inputToggle2");
                value = h1.textContent;
                h1.innerHtml = "";
            }
        }else{
            value = event.target.value;
        }
        playlist[prop] = value;
        setPlaylist({...playlist})
    }
    return(
        <div className={styles.currentPlaylistContainer}>
            <div className={styles.h1div}>
                <h1 contentEditable="false" id="playlistName" onInput={(e) => handleChange(e)} className={styles.currentPlaylistH1 + " inputToggle2"} textContent={playlist.playlistName}> </h1>
                <div className={styles.buttonDiv}>
                    <button onClick={(e) => editInfo(e)} id="editBtn" className={styles.button}>Edit</button>
                    <button onClick={(e) => props.addToSpotify(playlist)} className={styles.button}>add to Spotify</button>
                </div>
                
            </div>
            <div className={styles.currentPlaylistInfo}>
                <div className={styles.currentPlaylistData}>
                    <label className={styles.currentPlaylistLabel}>Created: </label>
                    <input className={styles.currentPlaylistInput} value={playlist.playlistCreation}></input>
                </div>
                <div className={styles.currentPlaylistData}>
                    <label className={styles.currentPlaylistLabel}>Genre: </label>
                    <input maxLength="30" onChange = {(e) => handleChange(e)} id="playlistGenre" className={styles.currentPlaylistInput+ " inputToggle"} value={playlist.playlistGenre}></input>
                </div>
                <div className={styles.currentPlaylistData}>
                    <label className={styles.currentPlaylistLabel}>Tracks: </label>
                    <input onChange = {(e) => handleChange(e)} className={styles.currentPlaylistInput} value={playlist.playlistLength}></input>
                </div>
            </div>
            <div className={styles.currentPlaylistDescription}>
                <label className={styles.descrLabel}>Description: </label>
                <textarea maxLength="250" onChange = {(e) => handleChange(e)} id="playlistDescription" className={styles.descr + " inputToggle"} value={playlist.playlistDescription}></textarea>
            </div>
            <div className = {styles.currentPlaylistTracks}>
                {playlist ? playlist.playlistTracks.map((track,index) => {
                    return <Track index={index+1}key={track.name+"-"+index} track={track} updatePlaylist={props.updatePlaylist} search={false}/>
                }):null}
            </div>
            <div>
                <audio src="https://www.youtube.com/watch?v=vXYVfk7agqU&t=4973s" controls></audio>
            </div>
        </div>
    )
}

export default CurrentPlaylist