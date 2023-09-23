class GlobalFunctions {
  constructor(){
    
  }
    static nameFormatter(name){
      const formattedName = name.split(" ").reduce((accu, actu) => {
        return (
          accu +
          actu
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            
        );
      },'');
      return formattedName;  
    }    
  
    static dateFormatter(date){
      if(typeof(date)== 'object'){
       return date.toLocaleString('hu-HU',{year:'numeric',month:'numeric',day:'numeric'}).match(/\d+/g).join('-'); 
      } else if (typeof(date)== 'string'){
        return new Date(date).toLocaleString('hu-HU',{year:'numeric',month:'numeric',day:'numeric'}).match(/\d+/g).join('-')
      }
    }

    static loadFromLocalStorage(name,date){
      /* Ha nem adunk meg date-et, akkor a name-nek megfelelőt ad vissza, 
      ha megadtunk date-et, akkor a name\date-et adja vissza */
      if(!name){
        console.warn('Adat betöltése lehetetlen, mert nincs megadva a dolgozó neve!')
        return false;}
      const formattedName = this.nameFormatter(name);
      const formattedDate = date? this.dateFormatter(date) : null;

      const munyiData = localStorage['Munyi-generator']? JSON.parse(localStorage['Munyi-generator'] ) : null;  

      let existingStorage;
      if(munyiData[formattedName])
      {existingStorage = munyiData[formattedName]} else {
        console.error(`Nem létezik a localSrorage[${formattedName}]!`);
        return false;
      }
      
      
      if(date){if(existingStorage[formattedDate]){
        return existingStorage[formattedDate];
      } else {return false}
      } 
      return existingStorage;
    }

  static saveToLocalStorage(name,date,labelToUse,dataObjToStore) {
    if(!Boolean(name&&date&&labelToUse&&dataObjToStore)){
      console.warn('Adathiány!');
      return false};
    
    const formattedName = this.nameFormatter(name);
    
    const formattedDate = this.dateFormatter(date);
    
    const dateLabeledObj = { [formattedDate] : {[labelToUse]: dataObjToStore} };
    
    if(!localStorage['Munyi-generator']){localStorage.setItem('Munyi-generator','{}')}

    const munyiData = JSON.parse(localStorage['Munyi-generator']);    
    if(!munyiData[formattedName]){
      munyiData[formattedName] = dateLabeledObj;
    }
    else if(!munyiData[formattedName][formattedDate]){
      munyiData[formattedName][formattedDate] =  {[labelToUse]: dataObjToStore};
   
} else if(!munyiData[formattedName][formattedDate][labelToUse]){
  munyiData[formattedName][formattedDate][labelToUse] =  dataObjToStore;
} 
console.log('munyiData:',munyiData)
    localStorage['Munyi-generator'] = JSON.stringify(munyiData);
    return true;
}


}
