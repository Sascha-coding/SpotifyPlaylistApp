import React,{useState} from "react"
import styles from "../mainSegment.module.css"

const CreateNewPlaylist = (props) => {
    const [playlists, setPlaylists] = useState(props.savedPlaylists);
    
    const [newPlaylist, setNewPlaylist] = useState({
        playlistId: playlists.length + 1,
        playlistName: "",
        playlistGenre: "",
        playlistTracks: [],
        playlistLength: null,
        playlistDescription: "",
        playlistCreation:"",
    });

    
    const createPlaylist = () => {
        
        let nextPlaylist = {
            playlistId: playlists.length + 1,
            playlistName: "",
            playlistGenre: "",
            playlistTracks: [],
            playlistLength: null,
            playlistDescription: "",
            playlistCreation:"",
        }
        
        setNewPlaylist(nextPlaylist);
        playlists.push(nextPlaylist)
        setPlaylists(playlists)
        localStorage.setItem("savedPlaylists",JSON.stringify(playlists));
    }

    const resetPlaylist = () => {
        let nextPlaylist = {
            playlistId: playlists.length + 2,
            playlistName: "",
            playlistGenre: "",
            playlistTracks: [],
            playlistLength: null,
            playlistDescription: "",
            playlistCreation:"",
        }
        setNewPlaylist(nextPlaylist)
    }
    const updateValue = (event) => {
        const value = event.target.value;
        const prop = event.target.id;
        setNewPlaylist({...newPlaylist, ["playlist"+prop]: value})
    }

    return(
        <div className={styles.createNewPlaylist}>
            <h1 className={styles.h1}>{newPlaylist.playlistName}</h1>
            <form className={styles.form} onSubmit={(e) =>{
                setPlaylists([...playlists,newPlaylist]);
                props.updateSavedPlaylists("add", newPlaylist,e);
                resetPlaylist();
                }}>
                <div className={styles.formLayout}>
                    <label className={styles.formLabel} htmlFor="Name">Name:</label>
                    <input required maxLength="25" className={styles.formInput} onChange={(e) => updateValue(e)} id="Name" name="Name" value={newPlaylist.playlistName} type="text"></input>
                    <label className={styles.formLabel} htmlFor="Genre">Genre:</label>
                    <input className={styles.formInput} onChange={(e) => updateValue(e)} id="Genre" name="Genre" value={newPlaylist.playlistGenre} type="text"></input>
                    <label className={styles.formLabel} htmlFor="Description">Description</label>
                    <textarea maxLength="250" className={styles.formInput+ " "+styles.textArea} onChange={(e) => updateValue(e)} id="Description" name="Description" value={newPlaylist.playlistDescription} type="text"></textarea>
                </div>
                <button className={styles.formButton+" "+styles.formSubmit} type="submit">Create</button>
                <button className={styles.formButton+" "+styles.formReset} type="button" id="formReset" onClick={createPlaylist}>Reset</button>
            </form>
        </div>
    )
}

export default CreateNewPlaylist