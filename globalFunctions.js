class GlobalFunctions {
  constructor() {}
  static get basicData() {
    return JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);
  }

  static instituteExtractor(institute_str){
    return institute_str.split(/\d{4}/)[0].trim().match(/.+[^,;]/)[0];
  }

  static weekDayString(date){
    let dayName;
    if(typeof(date)=='object'){dayName= date.toLocaleString('hu-HU',{weekday:'long'}).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")} else
    {dayName = new Date(date).toLocaleString('hu-HU',{weekday:'long'}).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")};
    return dayName;
  }
  
  static nameFormatter(name) {
    let formattedName = "";  
    if(!name){return formattedName;}
    else if(!/ /.test(name)){formattedName = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  } else {
  formattedName = name.split(" ").reduce((accu, actu) => {
      return (
        accu +
        actu
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      );
    }, "");}
    return formattedName;
  }

  static dateFormatter(date) {
    if (typeof date == "object") {
      return date
        .toLocaleString("hu-HU", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
        .match(/\d+/g)
        .join("-");
    } else if (typeof date == "string") {
      return new Date(date)
        .toLocaleString("hu-HU", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })
        .match(/\d+/g)
        .join("-");
    }
  }

  static weekDayString(date) {
    if (!date) {
      console.error("Nem adtál meg argumentumot a weekDayString fn-nak!");
      return false;
    }

    let dateStrToReturn;

    if (typeof date == "object") {
      dateStrToReturn = date;
    } else if (typeof date == "string") {
      dateStrToReturn = new Date(date);
    }

    return dateStrToReturn
      .toLocaleString("hu-HU", { weekday: "long" })
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  static loadFromLocalStorage(name, date) {
    /*Ha nem adunk meg name-et, akkor a 
      localstorage['Munyi-generator-Alapadatok']-ból veszi ki a name és date értékeket. 
      Ha nem adunk meg date-et, akkor a name-nek megfelelőt ad vissza, 
      ha megadtunk date-et, akkor a name\date-et adja vissza */
    if (!name) {
      name = this.basicData.name;
      date = this.basicData.date;
    }
    const formattedName = this.nameFormatter(name);
    const formattedDate = date ? this.dateFormatter(date) : null;

    const munyiData = localStorage["Munyi-generator"]
      ? JSON.parse(localStorage["Munyi-generator"])
      : null;

    let existingStorage;
    if (munyiData[formattedName]) {
      existingStorage = munyiData[formattedName];
    } else {
      console.error(`Nem létezik a localSrorage[${formattedName}]!`);
      return false;
    }

    if (date) {
      if (existingStorage[formattedDate]) {
        return existingStorage[formattedDate];
      } else {
        return false;
      }
    }
    return existingStorage;
  }

  static saveToLocalStorage(name, date, labelToUse, dataObjToStore) {
    if (!Boolean(name && date && labelToUse && dataObjToStore)) {
      console.warn("Adathiány!");
      return false;
    }

    const formattedName = this.nameFormatter(name);

    const formattedDate = this.dateFormatter(date);

    const dateLabeledObj = {
      [formattedDate]: { [labelToUse]: dataObjToStore },
    };

    if (!localStorage["Munyi-generator"]) {
      localStorage.setItem("Munyi-generator", "{}");
    }

    const munyiData = JSON.parse(localStorage["Munyi-generator"]);
    if (!munyiData[formattedName]) {
      munyiData[formattedName] = dateLabeledObj;
      console.log(
        "SIKERES MENTÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉS!: név => dátum > címke > adat"
      );
    } else if (!munyiData[formattedName][formattedDate]) {
      munyiData[formattedName][formattedDate] = {
        [labelToUse]: dataObjToStore,
      };
      console.log(
        "SIKERES MENTÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉS!: név > dátum => címke > adat"
      );
    } else if (!munyiData[formattedName][formattedDate][labelToUse]) {
      munyiData[formattedName][formattedDate][labelToUse] = dataObjToStore;
      console.log(
        "SIKERES MENTÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉÉS!: név > dátum> címke => adat"
      );
    } else {
      munyiData[formattedName][formattedDate][labelToUse] = dataObjToStore;
      console.log("LÉtEZŐ CÍMKE TARTALMÁNAK FELÜLÍRASA SIKERES!");
    }

    localStorage["Munyi-generator"] = JSON.stringify(munyiData);
    return true;
  }

  static potoltOraCollector(dateObj){
    const currentDate = dateObj;
    const exceptionsToTest =
      this.loadFromLocalStorage()["Munyi-Generator-kivetelek"];
    let arrayToReduce =[];
      
      exceptionsToTest.forEach((kivetelArr) => {
        
        if (
          currentDate.toLocaleString("hu-HU", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          }) ==
          new Date(kivetelArr[0]).toLocaleString("hu-HU", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        ) {
          //Megtaláltuk az aktuális dátumot a kivételek között
          if(kivetelArr[2]=="kinti óra ledolgozása"){
            const weekdayStr = this.nameFormatter(currentDate.toLocaleString('hu-HU',{weekday:'long'}));
            const helyszin = kivetelArr[1].split(' óra ')[1];
            
            const arrayToSearch = this.loadFromLocalStorage()["Munyi-Generator-heti-foglalkozasok"][weekdayStr].kotelezoOra;
            arrayToSearch.forEach((item)=>{
              if(item[1] == helyszin){
                arrayToReduce.push(item);
              }
            })
          }
        }
      });
      
      return arrayToReduce;
      
    }
    
}
