import React, { useState,useCallback } from 'react';

import styles from './navBar.module.css';

const NavBar = (props) => {
    const [toDisplay,setToDisplay] = useState("");

    const createShareLink = () => {

    }

    const updateDisplay = (display) =>{
        const updateObj = {
            toDisplay:display
        }
        props.stateSetter(updateObj);
    }
    
    return (
        <>
            <div className={styles.header}>
                <nav className={styles.navSection}>
                        <button className={styles.navLink} onClick={(e) => updateDisplay("savedPlaylists")}>saved Playlists</button>
                        <button className={styles.navLink} onClick={(e) => updateDisplay("createNewPlaylist")}>create new Playlist</button>
                        <button className={styles.navLink} onClick={(e) => updateDisplay("currentPlaylist")}>selected Playlist</button>
                </nav>
            </div>
            
        </>
    );
}

export default NavBar;