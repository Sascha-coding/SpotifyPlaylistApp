import React, { useState, useEffect, useCallback } from 'react';
import styles from '../containers/navBar/navBar.module.css'

const SearchInput = (props) =>{
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
    })
    const updateMainState = async(searchQuery) => {
        const updateObj = {
            "searchInput": searchQuery
        }
        await props.stateSetter(updateObj)
        props.fetchStuff()
    }
    return(
        <div className={styles.searchBar}>
            <input className={styles.searchBarInput} type="text" onKeyDown={(e) => {if (e.key === 'Enter') {updateMainState(searchQuery)}}} onChange={(e) => {setSearchQuery(e.target.value)}} value={searchQuery}/>
            <button className={styles.searchBarButton} type="button" onClick={(e) => updateMainState(searchQuery)}><i className="fa-solid fa-magnifying-glass"></i>Search</button>
        </div>
    )
}

export default SearchInput