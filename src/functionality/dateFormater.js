const dateFormater = () => {
    let date = new Date();
    let day = String(date.getDate()).padStart(2, '0'); 
    let month = String(date.getMonth() + 1).padStart(2, '0'); 
    let year = date.getFullYear(); 

    let formattedDate = `${day}-${month}-${year}`; 
    return formattedDate 
}

export default dateFormater;