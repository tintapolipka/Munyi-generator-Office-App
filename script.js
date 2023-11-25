///////TELJESITESI SELECTOR/////////////////
class BelsoTeljesitesi {
  constructor(datesArray, index, place) {
    this.active = false;

    this.index = index;
    this.name = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["name"];
    this.job = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])[
      "munkakor"
    ];
    this.dates = datesArray;
    this.place = place?.split(/\d{4}/)[1]
      ? place.split(/\d{4}/)[1].trim().split(" ")[0]
      : "Makó, ";
    this.location = place;

    /* datesArray felépítése:
    [
        { date: "2022.10.11", hours: 10 },
        { date: "2022.10.18", hours: 11 },
      ]
    */
      console.error('datesArray:',datesArray)

    this.date =
      typeof(datesArray[0].date) == "object"
        ? date
        : new Date(datesArray[0].date);
    this.node = document.createElement("div");
  }

  get printable() {
    return this.name && this.dates && this.place;
  }

  get template() {
    const templateNode = document.createElement("div");
    templateNode.innerHTML = "";

    templateNode.id = "belso-teljesites-igazolas-" + this.index;
    templateNode.classList.add("teljesitesIgazolas-sablon");
    templateNode.innerHTML = `<h1 class="teljesitesigazolas-h1">Teljesítésigazolás</h1>
    <p>${this.name}, ${
      this.job
    } ${this.date.getFullYear()}. ${this.date.toLocaleString("hu-HU", {
      month: "long",
    })} hónapban,<br/>
    <span class="undrin-bold">CSCSVPSZ Makói Tagintézményében megvalósuló óráihoz: </span></p>`;

    templateNode.append(document.createElement("br"));

    const teljesitettDatumok = document.createElement("div");
    teljesitettDatumok.id = "teljesitett-datumok";
    teljesitettDatumok.innerHTML = this.everyWeek();
    templateNode.append(teljesitettDatumok);

    templateNode.append(document.createElement("br"));

    const keltezes = document.createElement("p");
    keltezes.innerText = `Dátum: Makó, ${new Date(
      this.dates[this.dates.length - 1].date
    ).toLocaleDateString()}`;
    templateNode.append(keltezes);

    const alairasBlokk = document.createElement("div");
    alairasBlokk.id = "belso-teljesitesi-alairas-container";
    alairasBlokk.classList.add("kozepre-zart");

    alairasBlokk.innerHTML = `<p >_______________________<br />
    Koczkás Anikó<br/>
    igazgató</p>`;

    templateNode.append(alairasBlokk);

    const oldalTores = document.createElement("p");
    oldalTores.classList.add("oldal-tores");
    oldalTores.textContent = "";

    templateNode.append(oldalTores);

    return templateNode;
  }

  get render() {
    this.node.innerHTML = "";
    this.node.id = `teljesitesIgazolas-${this.index}`;
    this.node.append(this.template);
    return this.node;
  }

  everyWeek() {
    let toReturn = "";
    let lastWeekDay = -1;
    this.dates.forEach((dateObj, index) => {
      const currentDate = new Date(dateObj["date"]);
      const currentDateStr = currentDate.toLocaleDateString("hu-HU");
      //üres sor hozzáadása ha új hét kezdődött
      if (currentDate.getDay() <= lastWeekDay && this.dates.length > 5) {
        toReturn += "<br/>";
      }
      lastWeekDay = currentDate.getDay();

      // innen a munkaközösségi értekezlet implementálása
      if(/munkaközösségi értekezlet/.test(dateObj.string)){
              
        toReturn += `<p><span id="datum-${this.index}-${index}">${currentDateStr} </span>munkaközösségi értekezlet</p>`
      // idáig munkaközösségi értekezlet implementálása
      } else {
      
      toReturn += `<p><span id="datum-${this.index}-${index}">${currentDateStr} </span>${dateObj["hours"]} óra`;

      if (dateObj.string.match(/\d óra/g)) {
        const hoursInSring = dateObj.string
          .match(/\d óra/g)
          .reduce((accu, actu) => {
            return accu + +actu.match(/\d/);
          }, 0);

        toReturn += ` (${+dateObj["hours"] - hoursInSring} óra ${
          dateObj["string"]
        })`;
      } else {
        toReturn += ` (${dateObj["string"]})`;
      }

      toReturn += `</p>`;
    }
  
    
    });

    return toReturn;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class TeljesitesiLink {
  constructor(text, index) {
    this.text = text;
    this.index = `teljesitesIgazolas-${index}`;
    this.node = document.createElement("li");
  }
  get render() {
    this.node.innerHTML = "";
    const link = document.createElement("a");
    link.innerText = this.text;
    link.href = location.href.split("#")[0] + "#" + this.index;
    this.node.append(link);

    return this.node;
  }
  append() {
    document.getElementById("root").append(this.render);
  }
}

class TeljesitesSelectMenu {
  constructor(helyszinEsDatumFn) {
    this.rawData = helyszinEsDatumFn;
    this.active = false;
    this.node = document.createElement("ul");
    this.teljesitesiLista = [];
  }

  get linkek() {
    const lista = Object.keys(this.rawData()).map((key, index) => {
      return new TeljesitesiLink(key, index);
    });
    return lista;
  }
  get listaGenerator() {
    const nodeToReturn = document.createElement("div");
    nodeToReturn.id = "teljesitesi-igazolasok";

    const currentrawData = this.rawData();
    this.teljesitesiLista = [];
    Object.keys(currentrawData).forEach((key, index) => {
      const title = document.createElement("h3");
      title.innerText = key + ":";
      nodeToReturn.append(title);

      let templateXXX;
      if (key === "CSCSVPSZ") {
        function dateMerger(array) {
          let prevDate;
          let arrToReturn = [];
          for (let i = 0; i < array.length; i++) {
            let currentDate = array[i].date;
            if (prevDate === currentDate) {
              const toPush = {
                date: currentDate,
                hours:
                  +arrToReturn[arrToReturn.length - 1].hours + +array[i].hours,
                string:
                  arrToReturn[arrToReturn.length - 1].string +
                  ", " +
                  array[i].hours +
                  " óra " +
                  array[i].string,
              };
              arrToReturn[arrToReturn.length - 1] = toPush;
            } else {
              arrToReturn.push(array[i]);
        
            }
            prevDate = currentDate;
          }
          return arrToReturn;
        }
        templateXXX = new BelsoTeljesitesi(
          dateMerger(currentrawData[key]),
          index,
          key
        );
        this.teljesitesiLista.push(templateXXX);
      } else {
        

        function mergeSameDates(array) {
          let prevDate;
        const collectionObj = {};
          for (let i = 0; i < array.length; i++) {
            const currentDate = array[i]["date"];
            if (prevDate == currentDate) {
              if(collectionObj[currentDate])
              { collectionObj[currentDate]= {
               date: currentDate, 
                hours: +collectionObj[currentDate].hours + +array[i].hours, string: collectionObj[currentDate].string + ''+ array[i].string, tulora : null,
              }}
                else {collectionObj[currentDate]= array[i];}
            } else {collectionObj[currentDate]= array[i];}
            prevDate = currentDate;
          }
          const toReturn = Object.keys(collectionObj).map(key =>{
              return collectionObj[key]
          })
    console.log(toReturn)
	return toReturn;
        }

        templateXXX = new teljesitesiTemplate(
          currentrawData[key],
          index,
          key
        );
        this.teljesitesiLista.push(templateXXX);
      }
      nodeToReturn.append(templateXXX.render);
    });

    return nodeToReturn;
  }

  get render() {
    this.node.id = "teljesitesi-linkek";
    this.node.innerHTML = "";
    if (this.linkek.length === 0) {
      this.node.innerHTML =
        "<p>Nincs legenerálható teljesítésigazolás. Ennek legvalószínűbb oka, hogy az órarendbe nem vittél fel kötelező órákat.</p>";
    }
    this.linkek.forEach((link) => {
      this.node.append(link.render);
    });

    this.node.append(this.listaGenerator);

    return this.node;
  }
  append() {
    document.getElementById("root").append(this.render);
  }
}

// teljesitésIgazolás

class teljesitesiTemplate {
  constructor(datesArray, index, place) {
    this.active = false;

    this.name = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["name"];
    this.job = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])[
      "munkakor"
    ];
    this.dates = this.mergeSameDates(datesArray);
    this.place = place?.split(/\d{4}/)[1]
      ? place.split(/\d{4}/)[1].trim().split(" ")[0].match(/.+[^,;]/)
      : "Makó, ";
    this.location = place;

    /* datesArray felépítése:
  [
    {date: '2023-11-07', hours: '1', string: 'Vörösbegy dezső intézményi óra'},
    {date: '2023-11-07', hours: '3', string: '', tulora: false}, 
    {date: '2023-11-14', hours: '1', string: '', tulora: '04:00'}
  ]
    */

    this.monthSrting = new Date(this.dates[0]["date"]).toLocaleString("hu-HU", {
      month: "long",
    });

    this.index = index;
    this.node = document.createElement("div");
  }

  convertExceptionHours(datesArray) {
    return datesArray.map(dateObj => {
        if(dateObj.string){
          dateObj.string = `munkarend átrendezés miatt ${dateObj.hours} óra intézményben ledolgozott óra` 
          dateObj.hours = -1*(+dateObj.hours);
          dateObj.tulora = dateObj.tulora? dateObj.tulora : 0;
      }
        return dateObj;
    })
  }
  
  mergeSameDates(datesArray) {
    let prevDate;
  const collectionObj = {};
  const array = this.convertExceptionHours(datesArray);

    for (let i = 0; i < array.length; i++) {
      const currentDate = array[i]["date"];
      if (prevDate == currentDate) {
        console.log(collectionObj[currentDate]);
        if(collectionObj[currentDate])
        { const hoursConst = collectionObj[currentDate]?
           +collectionObj[currentDate].hours + +array[i].hours:
           +array[i].hours;

           console.log(Boolean(collectionObj[currentDate].tulora))

           const tuloraConst = collectionObj[currentDate].tulora?
            +collectionObj[currentDate].tulora + +array[i].hours:
            array[i].tulora? +array[i].hours: 0;
  
          // Ha a van írva a .stringbe, kivonjuk az eddigi értékből a mostani értéket, ha ez
          // éri el a 0-t csak akkor tesszük be az adatsort
          collectionObj[currentDate]= {
         date: currentDate, 
          hours: hoursConst, 
          string: collectionObj[currentDate].string + ''+ array[i].string, 
          tulora : tuloraConst,
        }}
          else { 
            // ez elvileg sose fut le, mert már létezik eddigre collectionObj[currentDate]
            collectionObj[currentDate]= {...array[i]};
                collectionObj[currentDate].tulora = 0;
                console.log("else ág fut le",collectionObj[currentDate])
            }
      } else {
        const arrayElemMasolat = {...array[i]}
        arrayElemMasolat.tulora= arrayElemMasolat.tulora?
        +arrayElemMasolat.hours:
        0;
        collectionObj[currentDate]= arrayElemMasolat;
    
      }
      console.log("collectionObj[currentDate].tulora: ",collectionObj[currentDate].tulora);
      
      prevDate = currentDate;
    
    }
    const toReturn = Object.keys(collectionObj).map(key =>{
        return collectionObj[key]
    })
console.log(toReturn)
return toReturn;
  }

  get printable() {
    return this.name && this.dates && this.place;
  }

  get render() {
    this.node.id = `teljesitesIgazolas-${this.index}`;
    this.node.classList.add(`teljesitesIgazolas-sablon`);

    this.node.innerHTML = `<h1 class="teljesitesigazolas-h1">Teljesítésigazolás</h1>
  <h2 class="teljesitesigazolas-h2">${this.dates[0]["date"].match(/\d+/)[0]}. ${
      this.monthSrting
    } hónapra vonatkozóan</h2>

  <p class="sorkizart">
    Igazolom, hogy ${this.name} (${this.job}) ${this.monthSrting} hónapban, az
    alábbi napokon óráit megtartotta:
  </p>
  <br />
  <div id="teljesitett-datumok">
    ${this.everyWeek()}
  </div>
  <br />
  <table class="intezmeny-altal-kitoltendo">
    <tbody>
      <tr>
        <td>Intézmény neve, címe (hosszú bélyegző)</td>
        <td>intézményi bélyegző</td>
        <td>intézményvezető aláírása</td>
      </tr>
      <td class="intezmeny-altal-kitoltendo-ures-td"></td>
      <td class="intezmeny-altal-kitoltendo-ures-td"></td>
      <td class="intezmeny-altal-kitoltendo-ures-td">……………………….</td>
    </tbody>
  </table>
  <br />
  <br />
  <p class="jobbra-zart ">Dátum: ${this.place}, ${new Date(
      this.dates[this.dates.length - 1]["date"]
    ).toLocaleString("hu-HU", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })}
  </p>
</div>`;

    return this.node;
  }

  everyWeek() {
    let toReturn = "";
    let lastWeekDay = -1;
    this.dates.forEach((dateObj, index) => {
      const currentDate = new Date(dateObj["date"]);
      const currentDateStr = currentDate.toLocaleString("hu-HU", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
      //üres sor hozzáadása ha új hét kezdődött
      if (currentDate.getDay() <= lastWeekDay && this.dates.length > 5) {
        toReturn += "<br/>";
      }
      lastWeekDay = currentDate.getDay();

      toReturn += `<p><span id="datum-${this.index}-${index}">${currentDateStr} </span>`;
      
      if(dateObj["string"]){
        toReturn += +dateObj["hours"]>0?
        `(${dateObj["hours"]} óra helyben megtartott és ${dateObj["string"]})`: 
        ` munkarend átrendezés miatt intézményi óra`;
      } 
       //Ide else if()-be az a feltétel, hogy van-e túlóra?
      else if(dateObj["tulora"]){ 
        toReturn += `(${+dateObj["hours"]- +dateObj["tulora"]} óra és ${dateObj["tulora"]} túlóra)`;
        } else {toReturn +=`(${dateObj["hours"]} óra)`;}
      
      toReturn += `</p>`;
    });

    return toReturn;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

//////////////////////////Órarend//////////////////////
class OrarendFoglalkozas {
  constructor(
    parentObj,
    foglalkozasIdeje,
    foglalkozasHelye ='',
    tulora = false,
    alapfeladat = "",
    index,
    kikuldetes = false,
    tuloraJellege
  ) {
    this.id = Math.trunc(Math.random() * 10000) + "-foglalkozas";
    this.parentObj = parentObj;

    this.foglalkozasHelye = foglalkozasHelye;
    this.foglalkozasIdeje = foglalkozasIdeje;
    this.foglalkozasTulora = tulora;
    this.foglalkozasKikuldetes = kikuldetes;
    this.intezmenyiOraLesz = false;
    this.alapfeladat = alapfeladat;
    this.index = index;
    this.renderHeight;

    this.tuloraKezdete = tulora;
    this.tulmunkaJellege = tuloraJellege;

    this.modalOraInput = this.createInput(
      `${this.id}-tulora-kezdo-ora`,
      "number",
      "",
      4,
      20
    );
    this.modalPercInput = this.createInput(
      `${this.id}-tulora-kezdo-perc`,
      "number",
      "",
      0,
      60
    );
    this.idopontInput = this.createInput(
      `${this.id}-idopont`,
      "number",
      "",
      1,
      8
    );
    this.helyszinInput = this.createInput(
      `${this.id}-helyszin`,
      "text",
      "Helyszín"
    ); this.helyszinInput.pattern ="/.+\d{4}.+/";
    this.tuloraCheckBox = this.createInput(`${this.id}-tulora`, "checkbox");
    this.tuloraCheckBox.addEventListener("change", () => {
      if (
        !this.foglalkozasHelye &&
        !this.foglalkozasIdeje &&
        this.tuloraCheckBox.checked
      ) {
        document.getElementById(`${this.id}-dialog`).showModal();
      }
    });

    this.kikuldetesCheckbox = this.createInput(
      `${this.id}-kikuldetes`,
      "checkbox"
    );
    this.intezmenyiOraCheckBox = this.createInput(
      `${this.id}-intezmenyiOra`,
      "checkbox"
    );
    this.intezmenyiOraCheckBox.addEventListener("change", () => {
      this.intezmenyiOraLesz = this.intezmenyiOraCheckBox.checked;
      this.render;
    });
    this.alapfeladatSelect = this.alapfeladatSelectGenerator();
    this.tulorFeladatSelect = this.alapfeladatSelectGenerator();

    this.container = document.createElement("div");
  }

  alapfeladatSelectGenerator() {
    const selectElement = document.createElement("select");
    selectElement.id = this.id + "-alapfeladat-select";
    selectElement.classList.add("szabad-ora-select");
    selectElement.innerHTML = `
    <option value="">Válassz szakfeladatot...</option>
    <option value="szakértői bizottsági tevékenység">szakértői bizottsági tevékenység</option>
    <option value="nevelési tanácsadás">nevelési tanácsadás</option>
    <option value="logopédiai ellátás">logopédiai ellátás</option>
    <option value="korai fejlesztés">korai fejlesztés</option>
    <option value="gyógytestnevelés">gyógytestnevelés</option>
    <option value="iskolapszichológia koordináció">iskolapszichológia koordináció</option>
    <option value="tehetség gondozás">tehetség gondozás</option>
    <option value="konduktív pedagógiai ellátás">konduktív pedagógiai ellátás</option>
    <option value="pályaválasztási tanácsadás">pályaválasztási tanácsadás</option>
    <option value="fejlesztő nevelés">fejlesztő nevelés</option>
    `;

    return selectElement;
  }

  dataCollector() {
    if (this.helyszinInput.value) {
      this.foglalkozasHelye = this.helyszinInput.value;
      this.tulmunkaJellege = this.tulorFeladatSelect.value;
      this.alapfeladat = "";
    } else if (
      this.intezmenyiOraCheckBox.checked &&
      this.alapfeladatSelect.value
    ) {
      this.foglalkozasHelye = "CSCSVPSZ";
      this.alapfeladat = this.alapfeladatSelect.value;
    } else if (
      this.intezmenyiOraCheckBox.checked &&
      !this.alapfeladatSelect.value
    ) {
      this.alapfeladatSelect.classList.add("adatHiany");
    } else {
      this.helyszinInput.classList.add("adatHiany");
    }
    if (this.idopontInput.value) {
      this.foglalkozasIdeje = this.idopontInput.value;
    } else {
      this.idopontInput.classList.add("adatHiany");
    }
    this.foglalkozasTulora =
      this.tuloraCheckBox.checked && this.tuloraKezdete
        ? this.tuloraKezdete
        : false;
    this.foglalkozasKikuldetes = this.kikuldetesCheckbox.checked;
    this.render;
  }

  createInput = (id, type, placeHolder, min, max) => {
    let input = document.createElement("input");
    input.setAttribute("type", type);
    input.setAttribute("id", id);
    input.classList.add("notToPrint");
    if (input.type === "text") {
      input.placeholder = placeHolder;
    }
    if (input.type === "number") {
      input.min = min;
      input.max = max;
    }
    return input;
  };
  okButton = () => {
    let okButton = document.createElement("button");
    okButton.innerText = "ok";
    okButton.classList.add("notToPrint");
    return okButton;
  };

  get idoTemplate() {
    return `<div class="orarend-adat idopont-oszlop">
    <span>${this.foglalkozasIdeje}</span>${
      this.foglalkozasTulora ? "<br /> túlóra" : ""
    }
    ${
      this.foglalkozasKikuldetes
        ? `<br /> <span class="notToPrint">kiküldetés</span>`
        : ""
    }
    </div>`;
  }

  tuloraModal() {
    const modal = document.createElement("dialog");
    modal.id = `${this.id}-dialog`;
    modal.classList.add("tulora-modal");
    modal.innerHTML = `<h3>Túlóra beállításai</h3><h4>Kezdő időpont (óra:perc):</h4>`;

    const szakfeledatH4 = document.createElement("h4");
    szakfeledatH4.innerText = "Elvégzett szakfeladat:";

    const closeModalBtn = document.createElement("button");
    closeModalBtn.innerText = `💾 Mentés`;
    closeModalBtn.id = `${this.id}-tulora-modal-close`;
    closeModalBtn.addEventListener("click", () => {
      //TODO itt kell az adatok kezelését megcsinálni
      if (!this.modalOraInput.value) {
        this.modalOraInput.classList.add("adatHiany");
      } else {
        this.modalOraInput.classList.remove("adatHiany");
      }
      if (!this.modalPercInput.value) {
        this.modalPercInput.classList.add("adatHiany");
      } else {
        this.modalPercInput.classList.remove("adatHiany");
      }
      if (!this.tulorFeladatSelect.value) {
        this.tulorFeladatSelect.classList.add("adatHiany");
      } else {
        this.tulorFeladatSelect.classList.remove("adatHiany");
      }

      if (
        this.modalOraInput.value &&
        this.modalPercInput.value &&
        this.tulorFeladatSelect.value
      ) {
        this.tuloraKezdete =
          (+this.modalOraInput.value < 10
            ? "0" + this.modalOraInput.value
            : this.modalOraInput.value) +
          ":" +
          (+this.modalPercInput.value < 10
            ? "0" + this.modalPercInput.value
            : this.modalPercInput.value);
        this.tulmunkaJellege = this.tulorFeladatSelect.value;

        document.getElementById(`${this.id}-dialog`).close();
      } else {
        console.log("ADATHIÁNY!");
      }
    });

    modal.append(
      this.modalOraInput,
      ":",
      this.modalPercInput,
      document.createElement("br"),
      szakfeledatH4,
      this.tulorFeladatSelect,
      document.createElement("br"),
      document.createElement("br"),
      closeModalBtn
    );

    return modal;
  }

  get render() {
    this.container.classList.add("sor");
    if (this.foglalkozasTulora) {
      this.container.classList.add("grey-background");
    }
    this.container.classList.add(`sor-${this.index}`);
    this.container.id = this.id;
    this.container.innerHTML = "";

    if (this.foglalkozasIdeje) {
      this.container.innerHTML = this.idoTemplate;
    } else {
      const idopontOszlop = document.createElement("div");
      idopontOszlop.classList = "orarend-adat idopont-oszlop";
      idopontOszlop.innerText = "Óraszám: ";

      idopontOszlop.append(
        this.idopontInput,
        document.createElement("br"),
        "túlóra-e?",
        this.tuloraCheckBox,
        "kiküldetés?",
        document.createElement("br"),
        this.kikuldetesCheckbox
      );

      this.container.appendChild(idopontOszlop);
      this.container.appendChild(this.tuloraModal());
    }

    const helyszinOszlop = document.createElement("div");
    helyszinOszlop.classList = "orarend-adat helyszin-oszlop";
    if (this.foglalkozasHelye && !this.alapfeladat) {
      helyszinOszlop.innerHTML = `<span>${this.foglalkozasHelye}</span>`;
    } else if (this.foglalkozasHelye && this.alapfeladat) {
      helyszinOszlop.innerHTML = `<span>${this.foglalkozasHelye}</span><span class="onlyToPrint"> 6900 Makó, Vásárhelyi u. 1-3.</span><span class="notToPrint">${this.alapfeladat}</span>`;
    } else {
      helyszinOszlop.append(this.intezmenyiOraCheckBox, "benti óra");
      helyszinOszlop.append(document.createElement("br"));
      if (this.intezmenyiOraLesz) {
        helyszinOszlop.append(this.alapfeladatSelect);
      } else {
        helyszinOszlop.append(this.helyszinInput);
      }

      const okHely = this.okButton();
      okHely.addEventListener("click", this.dataCollector.bind(this));
      helyszinOszlop.append(okHely);
    }
    this.container.appendChild(helyszinOszlop);

    return this.container;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class OrarendNap {
  constructor(foglalkozasAdatArray = [], nap, parentObj) {
    this.nap = nap;
    this.parentObj = parentObj;
    this.node = document.createElement("div");
    this.foglalkozasCollection = {};
    foglalkozasAdatArray.forEach((foglalkozas, index) => {
      const newNode = new OrarendFoglalkozas(
        this,
        foglalkozas[0],
        foglalkozas[1],
        foglalkozas[2],
        foglalkozas[3],
        index,
        foglalkozas[4],
        foglalkozas[5]
      );
      this.foglalkozasCollection[newNode.id] = newNode;
    });
    this.szababOraSelect = this.szabadOraSelectGenerator();
    this.szababOraNumberInput = this.createSzabadOraNumberInput();
    this.szabadOraBtn = this.createSzabadOraBtn();
    this.munkabaJarasSelect = this.munkabaJarasSelectGenerator();
    this.szabadOraList = this.szabadOraListFromLocalStorage();
  }

  get textContentLengthSum(){
    const dayColumnTextLength = [];
    Object.keys(this.foglalkozasCollection).forEach(key => {
      const length = this.foglalkozasCollection[key].foglalkozasHelye == "CSCSVPSZ" ? 38 : this.foglalkozasCollection[key].foglalkozasHelye.length;
      dayColumnTextLength.push(length);
    });
    return dayColumnTextLength.reduce((accu,actu)=>accu+actu,0);
  }

  get kikuldetesSum() {
    const thisWeekday = GlobalFunctions.nameFormatter(this.nap);
    const dataArr =
      GlobalFunctions.loadFromLocalStorage()[
        "Munyi-Generator-heti-foglalkozasok"
      ][thisWeekday].kotelezoOra;
    if (dataArr.length > 0) {
      return dataArr.reduce((accu, foglalkozas) => {
        if (foglalkozas[4]) {
          return accu + +foglalkozas[0];
        } else {
          return accu;
        }
      }, 0);
    }
  }

  get tuloraSum() {
    const thisWeekday = GlobalFunctions.nameFormatter(this.nap);
    const dataArr =
      GlobalFunctions.loadFromLocalStorage()[
        "Munyi-Generator-heti-foglalkozasok"
      ][thisWeekday].kotelezoOra;

    if (dataArr.length > 0) {
      return dataArr.reduce((accu, foglalkozas) => {
        if (foglalkozas[2]) {
          return accu + +foglalkozas[0];
        } else {
          //Nem volt túlóra.
          return accu;
        }
      }, 0);
    }
    return 0;
  }

  get foglalkozasutazas() {
    return this.munkabaJarasSelect.value;
  }

  munkabaJarasSelectGenerator() {
    const select = document.createElement("select");
    select.id =
      "utazas-select-" +
      this.nap
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    select.classList.add("orarend-utazas-select");
    select.classList.add("notToPrint");
    select.innerHTML = `
    <option value="">utazás: nincs</option>
    <option value="M">M - munkába járás</option>
    <option value="K">K - kiküldetés</option>
    <option value="M/K">M/K - munkába járás és kiküldetés</option>
    `;
    select.value = this.munkabaJarasFromLocalStorage();
    select.addEventListener("change", (e) => {
      e.preventDefault();
      console.log(
        "TODO: szabad órák utazás a feladatvégzési helyek közöttel összevetni"
      );
    });
    return select;
  }

  szabadOraListFromLocalStorage() {
    const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);

    return GlobalFunctions.loadFromLocalStorage(
      basicData["name"],
      basicData["date"]
    )["Munyi-Generator-heti-foglalkozasok"][
      this.nap
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    ].szabadOra;
  }

  munkabaJarasFromLocalStorage() {
    const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);

    return GlobalFunctions.loadFromLocalStorage(
      basicData["name"],
      basicData["date"]
    )["Munyi-Generator-heti-foglalkozasok"][
      this.nap
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    ].munkabaJaras;
  }

  get szabadOraListNode() {
    const listNode = document.createElement("div");
    listNode.classList = "szabad-ora-lista";
    Object.keys(this.szabadOraList).forEach((key) => {
      const sor = document.createElement("div");
      sor.classList = "sor";
      const listItem1 = document.createElement("div");
      listItem1.classList = "szabad-ora-lista-item-tartalom";
      listItem1.innerHTML = `${this.szabadOraLehetosegek[key]}: `;
      sor.append(listItem1);
      const listItem2 = document.createElement("div");
      listItem2.innerHTML = `<span>${this.szabadOraList[key]} óra </span>`;
      sor.append(listItem2);
      listNode.append(sor);
      const deleteSzabadOra = document.createElement("button");
      deleteSzabadOra.classList = "delete-x-button";
      deleteSzabadOra.innerText = "x";
      deleteSzabadOra.title = "Óra törlése.";
      deleteSzabadOra.addEventListener("click", () => {
        delete this.szabadOraList[key];
        this.kesz();
      });
      listNode.append(deleteSzabadOra);
    });
    return listNode;
  }

  szabadOraLehetosegek = {
    "1.": "foglalkozások, vizsgálatok, szűrések, egyéb közvetlen foglalkozások előkészítése",
    "3.": "szakértői, továbbá a pedagógiai szakszolgálati tevékenység során keletkező vizsgálati és egyéb vélemények készítése",
    "4.": "fejlesztési tervek készítése",
    "6.": "eseti helyettesítés",
    "8.": "az intézményi dokumentumok készítése, vezetése",
    "10.": "pedagógusjelölt, gyakornok szakmai segítése, mentorálása",
    "11.":
      "a szakalkalmazotti értekezlet, a szakmai munkaközösség munkájában történő részvétel",
    "14.": "feladatvégzési helyek közötti utazás",
  };

  createSzabadOraNumberInput() {
    const input = document.createElement("input");
    input.classList = "szabad-ora-szama-input";
    input.id = "szabad-ora-szama-input-" + Math.trunc(Math.random() * 10000);
    input.type = "number";
    input.min = "1";
    input.max = "8";
    input.addEventListener("change", () => {
      this.szababOraNumberInput.classList.remove("adatHiany");
    });
    return input;
  }

  szabadOraSelectGenerator() {
    const szabadOra = document.createElement("select");
    szabadOra.classList = "szabad-ora-select";
    szabadOra.name = "szabad-ora-select";
    szabadOra.addEventListener("change", () => {
      this.szababOraSelect.classList.remove("adatHiany");
    });
    szabadOra.innerHTML = `<option value="">Válassz...</option>`;
    Object.keys(this.szabadOraLehetosegek).forEach((key) => {
      szabadOra.innerHTML += `<option value="${key}">${this.szabadOraLehetosegek[key]}</option>`;
    });
    return szabadOra;
  }

  createSzabadOraBtn() {
    const btn = document.createElement("button");
    btn.innerText = "felvétel";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!this.szababOraNumberInput.value) {
        this.szababOraNumberInput.classList.add("adatHiany");
      }
      if (!this.szababOraSelect.value) {
        this.szababOraSelect.classList.add("adatHiany");
      }
      if (this.szababOraNumberInput.value && this.szababOraSelect.value) {
        this.szabadOraList[this.szababOraSelect.value] =
          this.szababOraNumberInput.value;
        this.kesz();
      }
      this.napiOraszamEllenorzo();
    });
    return btn;
  }

  napEllenorzese() {
    let hibaUzenet = "";
    hibaUzenet += this.napiOraszamEllenorzo()
      ? `¤ a kötelező órák és az egyéb dokumentálandó tevékenységek ideje összesen nem haladhatja meg a 8 órát! Kivételt csak az engedélyezett túlórák jelentenek.\n`
      : "";
    hibaUzenet +=
      this.napiOraszam < 3
        ? `¤ a kötelező órák száma nem lehet kevesebb 3 óránál! Kivétel: fél álláshely esetén (11 heti kötelező óra), vagy vezetői pozíció lehet.\n`
        : "";

    if (
      this.kikuldetesSum &&
      this.foglalkozasutazas != "K" &&
      this.foglalkozasutazas != "M/K"
    ) {
      hibaUzenet += `¤ Van kiküldetésként megjelölt kötelező óra, de az utazás típusa mégsem "K", vagy "M/K"!\n`;
    }

    if (
      (this.foglalkozasutazas == "K" ||
        this.foglalkozasutazas == "M/K" ||
        this.kikuldetesSum) &&
      !this.szabadOraList["14."]
    ) {
      hibaUzenet +=
        '¤ Van kiküldetés, de nincs utazással eltöltött óra! Adj hozzá legalább egy óra "feladatvégzési helyek közötti utazás"-t\n';
    }

    if (hibaUzenet) {
      hibaUzenet =
        `A következő hibákat találtuk a ${this.nap.toUpperCase()}I napon: \n` +
        hibaUzenet;
      alert(hibaUzenet + "\nKérlek a fentiek szerint javítsd!");
    }
    return hibaUzenet;
  }

  get szabadOraSum() {
    return Object.keys(this.szabadOraList).reduce((accu, ora) => {
      return accu + +this.szabadOraList[ora];
    }, 0);
  }

  napiOraszamEllenorzo() {
    const summaOrak = this.szabadOraSum + this.napiOraszam;

    if (summaOrak > 8 || this.napiOraszam < 3) {
      this.node.classList.add("adatHiany");
    } else {
      this.node.classList.remove("adatHiany");
    }
    return summaOrak > 8;
  }

  get napiOraszam() {
    let summa = 0;
    Object.keys(this.foglalkozasCollection).forEach((key) => {
      summa += this.foglalkozasCollection[key].foglalkozasIdeje
        ? +this.foglalkozasCollection[key].foglalkozasIdeje
        : 0;
    });
    return summa;
  }

  get render() {
    this.node.classList.add("het-napja");
    this.node.id = `het-napja-${GlobalFunctions.nameFormatter(this.nap)}`
    this.node.innerHTML = `<div class="het-napja-fejlec">${this.nap}</div>
    <div class="sor">
      <div class="idopont-fejlec idopont-oszlop">Óraszám</div>
      <div class="helyszin-fejlec helyszin-oszlop">Hely</div>
    </div>`;

    Object.keys(this.foglalkozasCollection).forEach((key, index) => {
      if (index == 4 && this.parentObj.heighestColumnTextLength >350) {
          
        const oldalToresDiv = document.createElement("div");
        oldalToresDiv.classList.add("orarend-oldal-tores-alkalom");
        oldalToresDiv.innerText = " ";
        this.node.append(oldalToresDiv);
      }

      if (index == 5 && this.parentObj.maxColumnHeight > 5 && !(this.parentObj.heighestColumnTextLength >350)) {
          
        const oldalToresDiv = document.createElement("div");
        oldalToresDiv.classList.add("orarend-oldal-tores-alkalom");
        oldalToresDiv.innerText = " ";
        this.node.append(oldalToresDiv);
      }

      this.node.append(this.foglalkozasCollection[key].render);

      const deleteFoglalkozas = document.createElement("div");
      deleteFoglalkozas.classList.add("sor");
      deleteFoglalkozas.classList.add("notToPrint");
      deleteFoglalkozas.id = this.foglalkozasCollection[key].id + "-btn";
      deleteFoglalkozas.innerHTML = `<button class="notToPrint delete-x-button">↑ óra törlése↑</button>`;
      deleteFoglalkozas.addEventListener(
        "click",
        this.removeFoglalkozas.bind(this, this.foglalkozasCollection[key].id)
      );
      this.node.append(deleteFoglalkozas);
    });
    //mennyi sor kell még az 5-höz?
    const maxColumnHeight = this.parentObj.maxColumnHeight;
    let emptyRows =
      maxColumnHeight - Object.keys(this.foglalkozasCollection).length;
    let emptyIndex = maxColumnHeight - emptyRows;
    while (emptyRows > 0) {
      const sor = document.createElement("div");
      sor.classList.add("sor");
      sor.classList.add(`sor-${emptyIndex}`);
      emptyIndex++;
      sor.classList.add("onlyToPrint");
      const idopontOszlop = document.createElement("div");
      idopontOszlop.classList = "orarend-adat idopont-oszlop";
      sor.append(idopontOszlop);
      const helyszinOszlop = document.createElement("div");
      helyszinOszlop.classList = "orarend-adat helyszin-oszlop";

      sor.append(helyszinOszlop);

   //   console.warn('this.parentObj.heighestColumnTextLength >350: ',this.parentObj.heighestColumnTextLength >350,this.parentObj.heighestColumnTextLength)
  
      if (this.parentObj.heighestColumnTextLength >350 && emptyIndex == 5) {
        const oldalToresDiv = document.createElement("div");
        oldalToresDiv.classList.add("orarend-oldal-tores-alkalom");
        oldalToresDiv.innerText = " ";
        this.node.append(oldalToresDiv);
      }
      if (maxColumnHeight > 5 && emptyIndex == 6 && !(this.parentObj.heighestColumnTextLength >350)) {
        const oldalToresDiv = document.createElement("div");
        oldalToresDiv.classList.add("orarend-oldal-tores-alkalom");
        oldalToresDiv.innerText = " ";
        this.node.append(oldalToresDiv);
      }
      this.node.append(sor);

      //to next iteration
      emptyRows--;
    }

    const oraSzamSummaSor = document.createElement("div");
    oraSzamSummaSor.classList = "sor onlyToPrint";
    oraSzamSummaSor.innerHTML = `<div class="orarend-adat idopont-oszlop">${this.napiOraszam}</div>
    <div class="orarend-adat helyszin-oszlop"></div>`;
    this.node.append(oraSzamSummaSor);

    // Új foglalkozás hozzáadása;
    const addFoglalkozas = document.createElement("div");
    addFoglalkozas.classList = "sor notToPrint";
    const ujOraBtn = document.createElement("button");
    ujOraBtn.innerText = "Kötelező óra hozzáadása";
    ujOraBtn.addEventListener("click", this.addNeWFoglalkozas.bind(this));
    addFoglalkozas.append(ujOraBtn);

    this.node.append(addFoglalkozas);

    const szabadOraForm = document.createElement("div");
    szabadOraForm.id = "szabad-ora-form";
    szabadOraForm.classList.add("notToPrint");
    szabadOraForm.innerHTML = `<p>Egyéb tevékenység<br /> típus, óraszám:</p>`;
    szabadOraForm.append(this.szababOraSelect);
    szabadOraForm.append(this.szababOraNumberInput);
    szabadOraForm.append(this.szabadOraBtn);
    szabadOraForm.append(this.szabadOraListNode);
    this.node.append(szabadOraForm);

    this.node.append(this.munkabaJarasSelect);
    return this.node;
  }



  kesz() {
    this.render;
  }

  removeFoglalkozas(id) {
    document.getElementById(id).remove();
    document.getElementById(id + "-btn").remove();
    delete this.foglalkozasCollection[id];
    this.render;
  }

  addNeWFoglalkozas() {
    const newNode = new OrarendFoglalkozas(this);
    this.foglalkozasCollection[newNode.id] = newNode;
    this.render;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}
/*TODO: Az órarendhetet dátum szerint változathatóvá kell tenni, 
hogy az OrarendSablon-ban váltva korábbi órarend legyen betölthető
*/
class OrarendHet {
  constructor() {
    this.hetfo = new OrarendNap(
      this.loadFromLocaleStorage().hetfo.kotelezoOra,
      "hétfő",
      this
    );
    this.kedd = new OrarendNap(
      this.loadFromLocaleStorage().kedd.kotelezoOra,
      "kedd",
      this
    );
    this.szerda = new OrarendNap(
      this.loadFromLocaleStorage().szerda.kotelezoOra,
      "szerda",
      this
    );
    this.csutortok = new OrarendNap(
      this.loadFromLocaleStorage().csutortok.kotelezoOra,
      "csütörtök",
      this
    );
    this.pentek = new OrarendNap(
      this.loadFromLocaleStorage().pentek.kotelezoOra,
      "péntek",
      this
    );

    this.teljeshet = document.createElement("div");
  }

 get heighestColumnTextLength(){
  let maxNum = 0;
  if(this.hetfo.textContentLengthSum>maxNum){
    maxNum = this.hetfo.textContentLengthSum;
}
if(this.kedd.textContentLengthSum>maxNum){
  maxNum = this.kedd.textContentLengthSum;
}
if(this.szerda.textContentLengthSum>maxNum){
  maxNum = this.szerda.textContentLengthSum;
}
if(this.csutortok.textContentLengthSum>maxNum){
  maxNum = this.csutortok.textContentLengthSum;
}
if(this.pentek.textContentLengthSum>maxNum){
  maxNum = this.pentek.textContentLengthSum;
}
 return maxNum;
 
 }

  get maxColumnHeight() {
    return Math.max(
      Object.keys(this.hetfo.foglalkozasCollection).length,
      Object.keys(this.kedd.foglalkozasCollection).length,
      Object.keys(this.szerda.foglalkozasCollection).length,
      Object.keys(this.csutortok.foglalkozasCollection).length,
      Object.keys(this.pentek.foglalkozasCollection).length
    );
  }

  putToLocalStorage() {
    function napAdatToStore(napObj) {
      const arrayToStore = [];
      const napiFoglalkozasok = Object.values(napObj.foglalkozasCollection);
      for (let i = 0; i < napiFoglalkozasok.length; i++) {
        arrayToStore.push([
          napiFoglalkozasok[i].foglalkozasIdeje,
          napiFoglalkozasok[i].foglalkozasHelye,
          napiFoglalkozasok[i].foglalkozasTulora,
          napiFoglalkozasok[i].alapfeladat,
          napiFoglalkozasok[i].foglalkozasKikuldetes,
          napiFoglalkozasok[i].tulmunkaJellege,
        ]);
      }

      return {
        kotelezoOra: arrayToStore,
        szabadOra: napObj.szabadOraList,
        munkabaJaras: napObj.foglalkozasutazas,
      };
    }

    let allDays = {
      hetfo: napAdatToStore(this.hetfo),
      kedd: napAdatToStore(this.kedd),
      szerda: napAdatToStore(this.szerda),
      csutortok: napAdatToStore(this.csutortok),
      pentek: napAdatToStore(this.pentek),
    };

    const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);
    GlobalFunctions.saveToLocalStorage(
      basicData.name,
      basicData.date,
      "Munyi-Generator-heti-foglalkozasok",
      allDays
    );
  }

  loadFromLocaleStorage() {
    const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);
    const localStorageData = GlobalFunctions.loadFromLocalStorage(
      basicData.name,
      basicData.date
    );

    if (!localStorageData["Munyi-Generator-heti-foglalkozasok"]) {
      const emptyWeek = {
        hetfo: { kotelezoOra: [], szabadOra: {} },
        kedd: { kotelezoOra: [], szabadOra: {} },
        szerda: { kotelezoOra: [], szabadOra: {} },
        csutortok: { kotelezoOra: [], szabadOra: {} },
        pentek: { kotelezoOra: [], szabadOra: {} },
      };
      GlobalFunctions.saveToLocalStorage(
        basicData.name,
        basicData.date,
        "Munyi-Generator-heti-foglalkozasok",
        emptyWeek
      );
    }

    return GlobalFunctions.loadFromLocalStorage(basicData.name, basicData.date)[
      "Munyi-Generator-heti-foglalkozasok"
    ];
  }

  get render() {
    this.teljeshet.id = "teljes-het";

    this.teljeshet.append(this.hetfo.render);
    this.teljeshet.append(this.kedd.render);
    this.teljeshet.append(this.szerda.render);
    this.teljeshet.append(this.csutortok.render);
    this.teljeshet.append(this.pentek.render);
    return this.teljeshet;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class OrarendSablon {
  constructor(name, date, parentObj) {
    this.parentObject = parentObj;
    this.active = false;

    this.workerName = name;
    this.dateObj = new Date(date);
    this.teljeshet = new OrarendHet(
      this.parentObject.BasicDataForm.name,
      this.parentObject.BasicDataForm.date
    );

    this.tuloraMegjegyzes = GlobalFunctions.loadFromLocalStorage()[
      "Munyi-Generator-alapAdatok"
    ]?.tuloraJellege
      ? GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-alapAdatok"]
          .tuloraJellege
      : "";

    this.node = document.createElement("div");

    this.tuloraMegjegyzesSelect = this.tuloraMegjegyzesSelectGenerator();
    this.dateSelect = this.dateSelectGenerator();
    this.hetiHibaUzenet = document.createElement("p");
  }

  get hetiTuloraszamCollector() {
    return (
      this.teljeshet.hetfo.tuloraSum +
      this.teljeshet.kedd.tuloraSum +
      this.teljeshet.szerda.tuloraSum +
      this.teljeshet.csutortok.tuloraSum +
      this.teljeshet.pentek.tuloraSum
    );
  }

  tuloraMegjegyzesSelectGenerator() {
    const selectElement = document.createElement("select");
    selectElement.innerHTML = `
    <option value="">Válaszd ki a túlóra jogcímét</option>
    <option value="Üres álláshely terhére">Üres álláshely terhére</option>
    <option value="Értelmetlen baromság">Értelmetlen baromság</option>
    <option value="">Nincs</option>
    `;
    selectElement.addEventListener("change", () => {
      this.tuloraMegjegyzes = selectElement.value;
      console.warn(this.tuloraMegjegyzes);
    });
    return selectElement;
  }

  elsoMunkanapok2023 = [
    "2023.01.02.",
    "2023.02.01.",
    "2023.03.01.",
    "2023.04.03.",
    "2023.05.02.",
    "2023.06.01.",
    "2023.07.03.",
    "2023.08.01.",
    "2023.09.01.",
    "2023.10.02.",
    "2023.11.02.",
    "2023.12.01.",
  ];

  dateSelectGenerator() {
    const selectElement = document.createElement("select");
    const allDatesArr = Object.keys(
      JSON.parse(localStorage["Munyi-generator"])[
        GlobalFunctions.nameFormatter(this.parentObject.BasicDataForm.name)
      ]
    );
    selectElement.innerHTML = `<option value="">Válassz...</option>`;
    allDatesArr.forEach((date) => {
      selectElement.innerHTML += `<option value="${date}">${date}</option>`;
    });

    selectElement.addEventListener("change", () => {
      if (this.dateSelect.value) {
        const dataToUse = GlobalFunctions.loadFromLocalStorage(
          this.parentObject.BasicDataForm.name,
          this.dateSelect.value
        )["Munyi-Generator-heti-foglalkozasok"];
        console.log("dataToUse:", dataToUse);
        GlobalFunctions.saveToLocalStorage(
          this.parentObject.BasicDataForm.name,
          this.parentObject.BasicDataForm.date,
          "Munyi-Generator-heti-foglalkozasok",
          dataToUse
        );
        delete this;
        this.parentObject.OrarendSablon = new OrarendSablon(
          this.parentObject.BasicDataForm.name,
          this.parentObject.BasicDataForm.date,
          this.parentObject
        );
        this.parentObject.OrarendSablon.active = true;
        this.parentObject.render;
      }
    });
    return selectElement;
  }

  get printable() {
    const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);
    return (
      this.workerName &&
      this.dateObj != "Invalid Date" &&
      Object.keys(
        GlobalFunctions.loadFromLocalStorage(basicData.name, basicData.date)[
          "Munyi-Generator-heti-foglalkozasok"
        ]
      ).filter((nap) => {
        return (
          GlobalFunctions.loadFromLocalStorage(basicData.name, basicData.date)[
            "Munyi-Generator-heti-foglalkozasok"
          ][nap].kotelezoOra.length != 0
        );
      }).length > 0
    );
  }

  get tanev() {
    let year = this.dateObj.getFullYear();
    let month = this.dateObj.getMonth();
    return month < 8
      ? `${year - 1}/${year}. tanév`
      : `${year}/${year + 1}. tanév`;
  }

  get hetiOraszam() {
    return (
      this.teljeshet.hetfo.napiOraszam +
      this.teljeshet.kedd.napiOraszam +
      this.teljeshet.szerda.napiOraszam +
      this.teljeshet.csutortok.napiOraszam +
      this.teljeshet.pentek.napiOraszam
    );
  }

  get render() {
    this.node.classList.add("orarend-print");
    this.node.innerHTML = "";
    if (!this.hetiOraszam) {
      const selectSection = document.createElement("section");
      selectSection.innerText = "Más keltezésű órarend használata:";
      selectSection.classList.add("notToPrint");
      selectSection.append(this.dateSelect);
      this.node.append(selectSection);
    }

    const orarendStatisztikaval = document.createElement("div");
    orarendStatisztikaval.id = "orarend-het-statisztikaval";

    const napiOraszam = document.createElement("div");
    napiOraszam.classList.add("orarend-statisztikak");
    napiOraszam.classList.add("onlyToPrint");
    napiOraszam.id = "napi-oraszam";
    napiOraszam.innerText = "napi óraszám: ";
    orarendStatisztikaval.append(napiOraszam);

    const kozepresz = document.createElement("div");

    const fejlec = document.createElement("header");
    fejlec.classList.add("orarend-header");
    fejlec.innerHTML = `    <h1 id="orarend-header-h1" class="orarend-header-h1">Csongrád Vármegyei Pedagógiai Szakszolgálat Makói Tagintézménye <br/> 6900 Makó, Vásárhelyi u. 1-3.</h1>
    <div class="orarend-tanev">${this.tanev}
      <div class="orarend-honapnev">${this.dateObj
        .toLocaleString("hu-HU", { month: "long" })
        .toLocaleUpperCase()}</div>
    </div>
    <h1 id="orarend-dolgozo-nev" class="orarend-header-h1">Név: <span>${this.workerName.toUpperCase()}<span></h1>`;
    kozepresz.append(fejlec);

    kozepresz.append(this.teljeshet.render);
    orarendStatisztikaval.append(kozepresz);

    const hetiOraszam = document.createElement("div");
    hetiOraszam.classList.add("orarend-statisztikak");
    hetiOraszam.id = "heti-oraszam";
    hetiOraszam.innerText = `heti óraszám: ${this.hetiOraszam}`;
    orarendStatisztikaval.append(hetiOraszam);

    this.node.append(orarendStatisztikaval);

    const footer = document.createElement("footer");
    footer.classList.add("orarend-lablec");
    footer.classList.add("oldal-tores");
    footer.innerHTML = `<div class="orarend-keltezes">Makó, ${
      this.elsoMunkanapok2023[this.dateObj.getMonth()]
    }</div>
    <div class="alairasok">
        <div id="orarend-alairas-igazgato" class="orarend-alairas">igazgató</div>
        <div class="orarend-pecset-helye">P.H</div>
        <div class="orarend-alairas">dolgozó</div>
    </div>`;
    this.node.append(footer);

    if (this.hetiTuloraszamCollector) {
      const tuloraJogcimeSection = document.createElement("div");
      tuloraJogcimeSection.classList.add('notToPrint')
      tuloraJogcimeSection.innerText = "A túlóra jogcíme:";
      tuloraJogcimeSection.append(document.createElement("br"));
      tuloraJogcimeSection.append(this.tuloraMegjegyzesSelect);
      tuloraJogcimeSection.append(document.createElement("p"));
      this.node.append(tuloraJogcimeSection);
    }

    const valtozasMentes = document.createElement("button");
    valtozasMentes.innerText = "💾 Órarend változásainak mentése";
    valtozasMentes.id = "orarend-valtozasainak-mentese";
    valtozasMentes.classList.add("notToPrint");
    valtozasMentes.addEventListener("click", (e) => {
      this.teljeshet.putToLocalStorage();
      const hetiOraszamEllenorzo = () => {
        const hetiSzabadOra =
          this.teljeshet.hetfo.szabadOraSum +
          this.teljeshet.kedd.szabadOraSum +
          this.teljeshet.szerda.szabadOraSum +
          this.teljeshet.csutortok.szabadOraSum +
          this.teljeshet.pentek.szabadOraSum;

        let popUp = ``;

        if (hetiSzabadOra != 11) {
          popUp += `\n¤ A heti 32 órához 11 óra nem kötelező órát kell kiválasztani, de jelenleg ${hetiSzabadOra} van összesen!`;
        }

        if (this.hetiOraszam > 21) {
          popUp += `\n¤ a heti kötelező óraszám nem haladhatja meg a 21 órát! (Jelenleg ${this.hetiOraszam} van, túlóra nélkül ${this.hetiOraszam-this.hetiTuloraszamCollector}.)`;
        } else if (this.hetiOraszam < 21) {
          popUp += `\n¤ a heti kötelező óraszám nem lehet kevesebb mint 21 óra! (Jelenleg ${this.hetiOraszam} van.) Kivételt csak félállás (11 kötelező óra) jelenthet!`;
        }

        if (popUp) {
          popUp = "A TELJES HÉTEN a következő problémát találtuk:" + popUp;
          alert(popUp);
        }
        return popUp;
      };
      this.hetiHibaUzenet.innerText =
        this.teljeshet.hetfo.napEllenorzese() +
        this.teljeshet.kedd.napEllenorzese() +
        this.teljeshet.szerda.napEllenorzese() +
        this.teljeshet.csutortok.napEllenorzese() +
        this.teljeshet.pentek.napEllenorzese() +
        hetiOraszamEllenorzo();

      alert("Órarend változásai a gépre mentve.");

      // túlóramegjegyzés mentése
      const prevData =
        GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-alapAdatok"];
      prevData.tuloraJellege = this.tuloraMegjegyzes;
      GlobalFunctions.saveToLocalStorage(
        prevData.name,
        prevData.date,
        "Munyi-Generator-alapAdatok",
        prevData
      );

      this.parentObject.isObsolate = true;
      this.parentObject.render;
    });
    this.node.append(valtozasMentes);

    this.node.append(this.hetiHibaUzenet);

    return this.node;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

//FORM ////////////////////////////////////
class BasicDataForm {
  constructor() {
    this.active = true;

    this.node = document.createElement("form");
    this.nameInput = this.createInput("form-dolgozoneve");
    this.munkakorInput = this.createInput("ervenyesseg-datum", "munkakor");
    this.dateInput = this.createInput("ervenyesseg-datum", "date");

    this.confirmBtn = this.confirmBtnRender();
    this.changeDataBtn = this.changeDataBtnRender();

    this.name = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["name"]
      ? JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["name"]
      : "";
    this.munkakor = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])[
      "munkakor"
    ]
      ? JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["munkakor"]
      : "";
    this.date = JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["date"]
      ? JSON.parse(localStorage["Munyi-Generator-alapAdatok"])["date"]
      : "";

    this.allDataAvailable =
      this.name != "dolgozó neve" && this.munkakor != "munkakör" && this.date;
  }

  putToLocalStorage() {
    localStorage.setItem(
      "Munyi-Generator-alapAdatok",
      JSON.stringify({
        name: this.name,
        munkakor: this.munkakor,
        date: this.date,
      })
    );
    GlobalFunctions.saveToLocalStorage(
      this.name,
      this.date,
      "Munyi-Generator-alapAdatok",
      {
        name: this.name,
        munkakor: this.munkakor,
        date: this.date,
      }
    );
  }

  confirmBtnRender() {
    const confirm = document.createElement("button");
    confirm.innerText = "Adatbevitel kész";
    confirm.addEventListener("click", (e) => {
      e.preventDefault();

      if (!this.getName()) {
        this.nameInput.classList.add("adatHiany");
      } else {
        this.nameInput.classList.remove("adatHiany");
      }
      if (!this.getMunkakor()) {
        this.munkakorInput.classList.add("adatHiany");
      } else {
        this.munkakorInput.classList.remove("adatHiany");
      }
      if (!this.getDate()) {
        this.dateInput.classList.add("adatHiany");
      } else {
        this.dateInput.classList.remove("adatHiany");
      }

      this.allDataAvailable = Boolean(
        this.getName() && this.getMunkakor() && this.getDate()
      );
      if (this.allDataAvailable) {
        this.putToLocalStorage();
        /////////TODO - A RESETET MEGCSINÁLNI!//// (Addig location.reload())
        location.reload();
        /////////TODO - A RESETET MEGCSINÁLNI!//// (Addig location.reload())
      }

      this.render;
    });
    return confirm;
  }

  changeDataBtnRender() {
    const changeData = document.createElement("button");
    changeData.innerText = "Név, munkakör, kezdő dátum szerkesztése";
    changeData.addEventListener(
      "click",
      function (e) {
        e.preventDefault();

        this.allDataAvailable = false;
        this.render;
      }.bind(this)
    );
    return changeData;
  }

  getName() {
    this.name = this.nameInput.value;
    return this.nameInput.value;
  }

  getMunkakor() {
    this.munkakor = this.munkakorInput.value;
    return this.munkakorInput.value;
  }

  getDate() {
    this.date = this.dateInput.value;
    return this.dateInput.value;
  }

  createInput(id, type = "text") {
    let input = document.createElement("input");
    input.setAttribute("type", type);
    input.setAttribute("id", id);
    return input;
  }

  get render() {
    this.node.innerHTML = "";

    this.node.id = "basic-date-form";

    this.node.innerHTML += this.name ? `<p>Név: ${this.name}</p>` : "";
    this.node.innerHTML += this.munkakor
      ? `<p>Munkakör: ${this.munkakor}</p>`
      : "";
    this.node.innerHTML += this.date
      ? `<p>Dokumentumok kezdő dátuma: ${this.date}</p>`
      : "";

    if (!this.allDataAvailable) {
      const labelForName = document.createElement("label");
      labelForName.innerText = "Dolgozó neve: ";
      this.nameInput.value = this.name;
      labelForName.append(this.nameInput);
      this.node.append(labelForName);

      const labelForMunkakor = document.createElement("label");
      labelForMunkakor.innerText = "Munkakör: ";
      this.munkakorInput.value = this.munkakor;
      labelForMunkakor.append(this.munkakorInput);
      this.node.append(labelForMunkakor);

      const labelForDate = document.createElement("label");
      labelForDate.innerText = "Dokumentumok érvényességének kezdete: ";
      labelForDate.append(this.dateInput);
      this.node.append(labelForDate);

      this.node.append(this.confirmBtn);
    }

    if (this.allDataAvailable) {
      this.node.append(this.changeDataBtn);
    }

    return this.node;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}
///////MUNYI/////////////////////////
class MunyiKivetel {
  constructor(kivetelArr = false) {
    this.date = kivetelArr[0];
    this.indok = //this.indokExtractor(kivetelArr[1]);
      /~TÚLÓRA/.test(kivetelArr[1])
       ? kivetelArr[1].match(/.+[^ ~TÚLÓRA]/)[0]
       : kivetelArr[1];  
    this.tipus = kivetelArr[2];
    this.tulora = /~TÚLÓRA/.test(kivetelArr[1]);

    this.valid = true;

    this.node = document.createElement("p");
    this.deleteBtn = this.createDeleteBtn();
  }
  indokExtractor(kivetelArr_1){
    let toReturn = "egyedi kivétel";
      toReturn += kivetelArr_1.tavolletIndoka? '_'+ kivetelArr_1.tavolletIndoka: '';
      toReturn += kivetelArr_1.kotelezoOra? '_kötelező óra: ' + kivetelArr_1.kotelezoOra : '';
      toReturn += kivetelArr_1.munkabaJaras? '_munkába járás: '+ kivetelArr_1.munkabaJaras: '';
      toReturn += kivetelArr_1.tulora? '_túlóra: '+ kivetelArr_1.tulora: '';
      
      let isAnySzabadOra =""; 
      Object.keys(kivetelArr_1.szabadOra).forEach(key =>{
        if(kivetelArr_1.szabadOra[key])
        {isAnySzabadOra +=  `_${key}: ${kivetelArr_1.szabadOra[key]}`;}
      })
      toReturn += isAnySzabadOra;
    return toReturn;
  }

  createDeleteBtn() {
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "kivétel törlése";
    deleteBtn.addEventListener("click", () => {
      this.valid = false;
      this.render;
    });
    return deleteBtn;
  }

  get render() {
    if (this.valid) {
      if(typeof(this.indok) == 'object'){
        this.node.innerText = `${this.date}: ${this.indokExtractor(this.indok)} `;
        
      } else {this.node.innerText = `${this.date}: ${this.indok} `;}

      this.node.append(this.deleteBtn);
    
    } else this.node.innerHTML = "";
    return this.node;
  }
  append() {
    document.getElementById("root").append(this.render);
  }
}
///////////////////////////////////////
class MunyiDataForm {
  constructor(parentObject) {
    this.active = true;

    this.parentObject = parentObject;

    this.node = document.createElement("div");
    this.kivetelListaNode = document.createElement("div");
    this.allMunyiKivetel = this.kivetelObjGenerator(this.getFromLocalStorage());

    this.kivetelForm = document.createElement("form");

    this.tavolletInput = this.inputGenerator("tavollet", "radio", true);
    this.tavolletTipusSelect = this.selectGenetator(this.tavolletOkaListaArr);

    this.intezmenyiOraInput = this.inputGenerator("intezmenyi", "radio", false);
    this.intezmenyiOraIndex;

    this.customKivetelInput = this.customInputGenerator();

    this.munkanapInput = this.inputGenerator("szombat", "radio", false);
    this.munkanapSelect = this.selectGenetator(this.hetnapjai);
    this.idopontInput = this.inputGenerator("datum", "date");


    this.dialogNodes.kotelezoOraInputElement= this.dialogNodes.createInput('kotelezoOra',"number",'',1,8);
    this.dialogNodes.tavolletIndokaInputElement= this.dialogNodes.createInput("tavollet-indoka","text","távollét indoka");
    this.dialogNodes.tuloraInputElement= this.dialogNodes.createInput('tulora',"number",'',1,8);
    this.dialogNodes.szakertoiNapInputElement= this.dialogNodes.createInput('szakertoi-nap',"number",'',1,8);
    this.dialogNodes.utazasiKoltsegSelectElement= this.dialogNodes.utazasiKoltsegSelectElementCreator();
    this.dialogNodes.kozvetlenFoglalkozasInputElement= this.dialogNodes.createInput('foglalkozasok-elokeszotese',"number",'',1,8);
    this.dialogNodes.velemenyKeszitesInputElement= this.dialogNodes.createInput('velemeny-iras',"number",'',1,8);
    this.dialogNodes.fejlesztesiTervInputElement= this.dialogNodes.createInput('fejlesztesi-terv',"number",'',1,8);
    this.dialogNodes.helyettesitesInputElement= this.dialogNodes.createInput('helyettesites',"number",'',1,8);
    this.dialogNodes.intezmenyiDokumentumokInputElement= this.dialogNodes.createInput('intezmenyi-dokumentumok',"number",'',1,8);
    this.dialogNodes.mentoralasInputElement= this.dialogNodes.createInput('mentoralas',"number",'',1,8);
    this.dialogNodes.ertekezletInputElement= this.dialogNodes.createInput('ertekezlet',"number",'',1,8);
    this.dialogNodes.feladathelyekUtazasInputElement= this.dialogNodes.createInput('feladathelyek-utazas',"number",'',1,8);
    this.dialogNodes.button = document.createElement('button');
    this.dialogNodes.button.addEventListener('click',()=>{
      document.getElementById('custom-kivetel-dialog').close();
      //TODO vegye be az adatot!
    })
  }

  customInputGenerator(){
    const inputElement = document.createElement('input');
    inputElement.type = "radio";
    inputElement.name= "kivetel-tipusa";
    inputElement.addEventListener('change',()=>{console.log("KATT");
    document.getElementById('custom-kivetel-dialog').showModal();
  
    })
    return inputElement;
  }

  saveToLocalStorage() {
    const munyiKivetelArr = this.allMunyiKivetel.map((exception) => {
      return [
        exception.date,
        exception.indok,
        exception.tipus,
        exception.tulora,
      ];
    });
    GlobalFunctions.saveToLocalStorage(
      this.parentObject.BasicDataForm.name,
      this.parentObject.BasicDataForm.date,
      "Munyi-Generator-kivetelek",
      munyiKivetelArr
    );
    localStorage.setItem(
      "Munyi-Generator-kivetelek",
      JSON.stringify(
        this.allMunyiKivetel.map((exception) => {
          return [
            exception.date,
            exception.indok,
            exception.tipus,
            exception.tulora,
          ];
        })
      )
    );
  }

  getFromLocalStorage() {
    const allData = GlobalFunctions.loadFromLocalStorage();
    const currentDate = new Date(this.parentObject.BasicDataForm.date);
    const relevantExc = exceptions.filter((exception) => {
      const exceptionDateObj = new Date(exception[0]);
      if (
        exceptionDateObj.getFullYear() == currentDate.getFullYear() &&
        exceptionDateObj.getMonth() == currentDate.getMonth()
      ) {
        return true;
      }
    });

    if (!allData["Munyi-Generator-kivetelek"]) {
      GlobalFunctions.saveToLocalStorage(
        this.parentObject.BasicDataForm.name,
        this.parentObject.BasicDataForm.date,
        "Munyi-Generator-kivetelek",
        relevantExc
      );
    }

    return GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-kivetelek"];
  }

  hetnapjai = ["hétfő", "kedd", "szerda", "csütörök", "péntek"];
  tavolletOkaListaArr = [
    "szabadság",
    "táppénz",
    "tanítás nélküli munkanap",
    "munkaközösségi értekezlet",
    "fizetés nélküli szabadság",
    "munkaszüneti nap",
    "szabadnap",
    "szülési szabadság (a távollét 31. napjáig)",
    "szakértői nap",
    "ünnepnap",
  ];
  get ledolgozhatoOrak() {
    const dateString = GlobalFunctions.weekDayString(this.idopontInput.value);
    return GlobalFunctions.loadFromLocalStorage()[
      "Munyi-Generator-heti-foglalkozasok"
    ][dateString]["kotelezoOra"].map((ora) => {
      return (
        ora[0] +
        " óra " +
        ora[1] +
        (ora[3] ? " " + ora[3] : "") +
        (ora[2] ? " ~TÚLÓRA" : "")
      );
    });
  }

  //['1', 'CSCSVPSZ', false, 'tehetség gondozás', false]

  get kiveteldatuma() {
    return this.idopontInput.value;
  }

  get tavolletTipusa() {
    return this.tavolletOkaListaArr[this.tavolletTipusSelect.value];
  }

  get kiveteltipusa() {
      if(this.tavolletInput.checked){return "tavollét"
      } else if(this.intezmenyiOraInput.checked){return "kinti óra ledolgozása"
      } else if(this.customKivetelInput.checked){return "custom kivétel"
      } else {return "munkanap áthelyezés"}; 
  }

  get ledolgozottNap() {
    return this.munkanapSelect.value;
  }

  get ujKivetelAdatai() {
    let datum, hetnapja, indok;
    const tipus = this.kiveteltipusa;
    if (this.kiveteldatuma) {
      datum = this.kiveteldatuma;
    } else {
      alert("A dátum megadása kötelező!");
      this.idopontInput.classList.add("adatHiany");
    }
    if (this.ledolgozottNap) {
      hetnapja = this.ledolgozottNap;
    } else if (tipus == "munkanap áthelyezés") {
      alert("A ledolgozott nap megadása kötelező!");
      this.munkanapSelect.classList.add("adatHiany");
    }
    if (this.tavolletTipusa) {
      indok = this.tavolletTipusa;
    } else if (tipus == "tavollét") {
      alert("A távollét típusát ki kell választani!");
      this.tavolletTipusSelect.classList.add("adatHiany");
    }

    if (
      (tipus == "tavollét" && indok && datum) ||
      (tipus == "munkanap áthelyezés" && hetnapja && datum)
    ) {
      const toReturn =
        tipus == "tavollét"
          ? [datum, indok, tipus]
          : [datum, this.hetnapjai[hetnapja] + "i munkanap pótlása", tipus];
      this.kivetelObjGenerator([toReturn]);
    } else if (tipus == "kinti óra ledolgozása") {
      this.kivetelObjGenerator([[datum, this.intezmenyiOraIndex, tipus]]);
      console.warn("Intézményi óra ledolgozása");
    } else if(tipus == "custom kivétel"){
      this.kivetelObjGenerator([[datum,this.dialogData,tipus]])
    } 
    else{
      console.log("Adathiány TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
  }

  get intezmenyiOraSelect() {
    const selectElement = this.selectGenetator(this.ledolgozhatoOrak);
    selectElement.addEventListener("change", (e) => {
      this.intezmenyiOraIndex = this.ledolgozhatoOrak[e.target.value];
    });
    return selectElement;
  }

  get hozzaadasBtn() {
    const button = document.createElement("button");
    button.innerText = "Hozzáadás";
    button.addEventListener("click", (e) => {
      e.preventDefault();
      this.ujKivetelAdatai;
      this.validKivetel();
      this.setObsolate();
      this.render;
      this.saveToLocalStorage();
    });
    return button;
  }

  inputGenerator(text, type, checked = false) {
    const input = document.createElement("input");
    input.type = type;
    input.name = "kivetel-tipusa";
    input.id = "kivetel-" + text;
    input.checked = checked;

    if (input.type == "radio" || input.type == "date") {
      input.addEventListener("change", () => {
        this.render;
      });
    } else
      input.addEventListener("change", function () {
        this.classList.remove("adatHiany");
      });

    return input;
  }

  selectGenetator(optionsArr) {
    const toReturn = document.createElement("select");
    toReturn.innerHTML = '<option value="">Válassz egyet!</option>';
    optionsArr.forEach((option, index) => {
      const node = document.createElement("option");
      node.value = index;
      node.innerText = option;
      toReturn.append(node);
    });
    toReturn.addEventListener("change", function () {
      this.classList.remove("adatHiany");
    });
    return toReturn;
  }

  setObsolate() {
    this.parentObject.isObsolate = true;
    //alert("Menu is obsolate!");
  }

  dialogNodes = {
    createInput : (id, type, placeHolder, min, max) => {
      let input = document.createElement("input");
      input.setAttribute("type", type);
      input.setAttribute("id", `custom-kivetel-dialog-${id}`);
      input.classList.add("notToPrint");
      if (input.type === "text") {
        input.placeholder = placeHolder;
      }
      if (input.type === "number") {
        input.min = min;
        input.max = max;
      }
      return input;
    },

    utazasiKoltsegSelectElementCreator: ()=>{const selectElement = document.createElement('select');
      selectElement.id="custom-kivetel-dialog-utazasi-koltseg-select";
      selectElement.innerHTML = `<option value="">nincs utazás</option>
      <option value="M">M</option>
      <option value="M/K">M/K</option>
      <option value="K">K</option>`;
      return selectElement;
    },

    buttonCreator: ()=>{ const btn = document.createElement('button');
    btn.innerText = "Kész";
    btn.addEventListener('click',()=>{
      alert('Ez még TODO!')
    })
  }, 
    
  }

  get dialogRender(){
    const dialogElement = document.createElement('dialog');
    dialogElement.open = false;
    dialogElement.id="custom-kivetel-dialog";
    dialogElement.innerHTML = `<h3>🃏 Egyedi kivétel:</h3>
    <p>
      FIGYELEM! Ezzel a kivétellel a MuNyi bármelyik sorát egyénire szabhatod.\n
      Csak azokat az adatokat változtatod meg, amiket itt kitöltesz, a többi a\n
      szabályoknak megfelelő marad. Alkalmas arra, hogy kiegészítsd pl.\n
      kiküldetéssel az aznapi munkádat. Ha csak lehet, INKÁBB HASZNÁLJUK A\n
      BEÉPÍTETT LEHETŐSÉGEKET!
    </p>`;
    const table = document.createElement('table');
      const tbody = document.createElement('tbody');
      dialogElement.append(table);
      table.append(tbody);
      const firstrow = document.createElement('tr');
        tbody.append(firstrow);
        const td1 = document.createElement('td');
          td1.append('Kötelező óra: ',this.dialogNodes.kotelezoOraInputElement);
        const td2 = document.createElement('td');
          td2.append(
            'Távollét indoka: ',this.dialogNodes.tavolletIndokaInputElement
          );
        const td3 = document.createElement('td');
          td3.append(
            'Túlóra: ',this.dialogNodes.tuloraInputElement
          );
        const td4 = document.createElement('td');  
          td4.append(
            'Szakértői nap: ',this.dialogNodes.szakertoiNapInputElement
          );
        const td5 = document.createElement('td');
          td5.append(
            'Utazási költségtérítés: ',this.dialogNodes.utazasiKoltsegSelectElement
          )
          firstrow.append(td1,td2,td3,td4,td5);
          
    const secondrow = document.createElement('tr');
    secondrow.id="custom-kivetel-dialog-kotelezo-oran-tuli";
    secondrow.classList.add('grey-background');
    secondrow.innerHTML = `<td colspan="6">
    Nem közvetlen foglalkozással töltött órák
  </td>`;
    tbody.append(secondrow);
    
    const thirdrow = document.createElement('tr');
    tbody.append(thirdrow);
    const td7 = document.createElement('td');
    td7.append(
      'közvetlen foglalkozások előkészítése: ',this.dialogNodes.kozvetlenFoglalkozasInputElement
    )
    const td8 = document.createElement('td');
    td8.append(
      'vélemények készítése: ',this.dialogNodes.velemenyKeszitesInputElement
    )
    const td9 = document.createElement('td');
    td9.append(
      'fejlesztési tervek készítése: ',this.dialogNodes.fejlesztesiTervInputElement
    )
    const td10 = document.createElement('td');
    td10.append(
      'eseti helyettesítés:',this.dialogNodes.helyettesitesInputElement
    )
    thirdrow.append(td7,td8,td9,td10);

    const fourthrow = document.createElement('tr');
    tbody.append(fourthrow);
    const td11 = document.createElement('td');
    td11.append(
      'intézményi dokumentumok vezetése: ',this.dialogNodes.intezmenyiDokumentumokInputElement
    )
    const td12 = document.createElement('td');
    td12.append(
      'gyakornok mentorálása: ',this.dialogNodes.mentoralasInputElement
    )
    const td13 = document.createElement('td');
    td13.append(
      'szakalkalmazotti, szakmai munkaközösségi értekezlet: ',this.dialogNodes.ertekezletInputElement
    )
    const td14 = document.createElement('td');
    td14.append(
      'feladatvégzési helyek közötti utazás: ',this.dialogNodes.feladathelyekUtazasInputElement
    )
    fourthrow.append(td11,td12,td13,td14);
    this.dialogNodes.button.innerText = "Kész"
    dialogElement.append(document.createElement('br'),this.dialogNodes.button)
  
    return dialogElement;
  }
  
  get dialogData(){
    const customKivetelObj = {
      munkabaJaras: this.dialogNodes.utazasiKoltsegSelectElement.value,
      szabadOra: {
          '1.': this.dialogNodes.kozvetlenFoglalkozasInputElement.value,
          '3.': this.dialogNodes.velemenyKeszitesInputElement.value,
          '4.': this.dialogNodes.fejlesztesiTervInputElement.value,
          '6.': this.dialogNodes.helyettesitesInputElement.value,
          '8.': this.dialogNodes.intezmenyiDokumentumokInputElement.value,
          '10.': this.dialogNodes.mentoralasInputElement.value,
          '11.': this.dialogNodes.ertekezletInputElement.value,
          '14.': this.dialogNodes.feladathelyekUtazasInputElement.value, 
                 },
          kotelezoOra: this.dialogNodes.kotelezoOraInputElement.value,
          tavolletIndoka: this.dialogNodes.tavolletIndokaInputElement.value,
          tulora: this.dialogNodes.tuloraInputElement.value,
          szakertoiNap: this.dialogNodes.szakertoiNapInputElement.value,
            
      }
      return customKivetelObj;
    }


  kivetelObjGenerator(datum_indokArr = []) {
    const kivetelArrToReturn = this.allMunyiKivetel ? this.allMunyiKivetel : [];
    datum_indokArr.forEach((kivetel) => {
      const kivetelObj = new MunyiKivetel([kivetel[0], kivetel[1], kivetel[2],kivetel[3]]);
      kivetelObj.deleteBtn.addEventListener("click", () => {
        this.validKivetel();
        this.saveToLocalStorage();
        this.setObsolate();
      });
      kivetelArrToReturn.push(kivetelObj);
    });
    return kivetelArrToReturn;
  }

  get kivetelListazo() {
    this.kivetelListaNode.innerHTML = "";
    this.kivetelListaNode.id = "kivetel-lista";
    this.kivetelListaNode.innerHTML =
      "<h2>Órarendtől eltérő napok:</h2><p> Itt választhatod ki azokat a napokat, amelyek nem órarend szerint zajlottak.</p><h3>Kivételek:</h3>";
    this.allMunyiKivetel.forEach((kivetel) => {
      this.kivetelListaNode.append(kivetel.render);
    });

    return this.kivetelListaNode;
  }

  get render() {
    this.node.id = "kivetelek-container";

    this.node.innerHTML = "";

    this.node.append(this.kivetelListazo);
    this.kivetelForm.innerHTML = `<h3>kivétel hozzáadása:</h3>`;

    const kivetelTipusaFieldset = document.createElement("fieldset");

    kivetelTipusaFieldset.innerHTML = "<legend>Kivétel típusa:</legend>";
    const tavolletP = document.createElement("p");
    tavolletP.append(this.tavolletInput);
    tavolletP.append("Távollét ");
    kivetelTipusaFieldset.append(tavolletP);

    if (this.kiveteltipusa == "tavollét") {
      const tavolletTipusaFieldset = document.createElement("fieldset");
      tavolletTipusaFieldset.innerHTML = "<legend>Távollét típusa</legend>";
      tavolletTipusaFieldset.append(this.tavolletTipusSelect);
      kivetelTipusaFieldset.append(tavolletTipusaFieldset);
    }

    const intezmenyiP = document.createElement("p");
    intezmenyiP.append(this.intezmenyiOraInput);
    intezmenyiP.append("Kinti óra intézményi ledolgozása");
    kivetelTipusaFieldset.append(intezmenyiP);

    if (this.kiveteltipusa == "kinti óra ledolgozása") {
      const kintiOraFieldset = document.createElement("fieldset");
      kintiOraFieldset.innerHTML =
        "<legend>Melyik órát dolgoztad le bent?</legend>";
      kintiOraFieldset.append(this.intezmenyiOraSelect);
      kivetelTipusaFieldset.append(kintiOraFieldset);
    }

    const customKivetelP = document.createElement("p");
    customKivetelP.append(this.customKivetelInput);
    customKivetelP.append("Egyedi kivétel hozzáadása");
    kivetelTipusaFieldset.append(customKivetelP);

    const munkanapP = document.createElement("p");
    munkanapP.append(this.munkanapInput);
    munkanapP.append("Munkanap áthelyezés (szombati munkavégzés)");
    kivetelTipusaFieldset.append(munkanapP);

    if (this.kiveteltipusa == "munkanap áthelyezés") {
      const ledolgozottMunkanapFieldset = document.createElement("fieldset");
      ledolgozottMunkanapFieldset.innerHTML =
        "<legend>Ledolgozott nap:</legend>";
      ledolgozottMunkanapFieldset.append(this.munkanapSelect);
      kivetelTipusaFieldset.append(ledolgozottMunkanapFieldset);
    }

    const datumFieldset = document.createElement("fieldset");
    datumFieldset.innerHTML = "<legend>Kivétel ideje:</legend>";
    datumFieldset.append(this.idopontInput);

    this.kivetelForm.append(datumFieldset);
    if (this.idopontInput.value) {
      this.kivetelForm.append(kivetelTipusaFieldset);
      this.kivetelForm.append(this.hozzaadasBtn);
    }
    this.node.append(this.kivetelForm);

    this.node.append(this.dialogRender)

    return this.node;
  }

  validKivetel() {
    function callback(a) {
      let array = a.date.match(/\d+/g);
      return +(array[0] + array[1] + array[2]);
    }

    let toReturn = this.allMunyiKivetel.filter((kivetel) => kivetel.valid);
    toReturn.sort(function (a, b) {
      return callback(a) - callback(b);
    });

    this.allMunyiKivetel = toReturn;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

/////////MENU//////////////////////

class Menu {
  constructor() {
    this.firstRun();

    this.node = document.createElement("div");
    this.navBar = document.createElement("nav");
    this.mainMenu = document.createElement("ul");

    this.BasicDataForm = new BasicDataForm();
    this.MunyiDataForm = new MunyiDataForm(this);
    this.OrarendSablon = new OrarendSablon(
      this.BasicDataForm.name,
      this.BasicDataForm.date,
      this
    );
    this.MuNyiTemplate = new MuNyiTemplate(
      this.BasicDataForm.name,
      this.BasicDataForm.date,
      this
    );
    this.TeljesitesSelectMenu = this.teljesitesSelectMenuGenerator();
    this.RenderTeljesiteigazolas = false; //TODO beépíteni a TeljesitesSelectMenu-be!

    this.PrintLister = new PrintLister(this);

    this.orarendLink = this.linkGenerators.orarendLinkRender();
    this.teljesitesLink = this.linkGenerators.teljesitLinkGenerator();
    this.munyiLink = this.linkGenerators.munyiLinkGenerator();

    this.isObsolate = false;
  }

  firstRun() {
    if (!localStorage["Munyi-Generator-alapAdatok"]) {
      localStorage["Munyi-Generator-alapAdatok"] =
        '{"name":"dolgozó neve","munkakor":"munkakör","date":"2023-09-01","tuloraJellege":""}';
    }
    ///TODO a localStorage['Munyi-generator']-t helyesen beállítani
    if (!localStorage["Munyi-generator"]) {
      localStorage["Munyi-generator"] =
        '{"Munyi-Generator-kivetelek":[],"Munyi-Generator-heti-foglalkozasok":{"hetfo":{"kotelezoOra":[],"szabadOra":{}},"kedd":{"kotelezoOra":[],"szabadOra":{}},"szerda":{"kotelezoOra":[],"szabadOra":{}},"csutortok":{"kotelezoOra":[],"szabadOra":{}},"pentek":{"kotelezoOra":[],"szabadOra":{}}},"Munyi-Generator-alapAdatok":{"name":"dolgozó neve","munkakor":"munkakör","date":"2023-09-01","tuloraJellege":""}}';
    }
  }

  collapseAll() {
    Object.keys(this).forEach((key) => {
      if (this[key].hasOwnProperty("active")) {
        this[key]["active"] = false;
      }
    });
  }

  teljesitesiData() {
    this.sortingFunctions.teljesitesiData = {};
    this.sortingFunctions.iterateDates();
    return this.sortingFunctions.teljesitesiData;
  }

  tulMunkaData() {
    this.sortingFunctions.tulMunkaData = [];
    this.sortingFunctions.iterateDates();
    return this.sortingFunctions.tulMunkaData;
  }

  teljesitesSelectMenuGenerator() {
    return new TeljesitesSelectMenu(this.teljesitesiData.bind(this));
  }

  get renderMenu() {
    this.mainMenu.innerHTML = "";
    this.mainMenu.id = "main-menu";
    const adatokBevitele = document.createElement("li");
    adatokBevitele.id = "nav-adatok-bevitele";
    adatokBevitele.title = "adatok bevitele";
    adatokBevitele.innerHTML = "<span>📝</span> Adatok bevitele";
    adatokBevitele.addEventListener("click", (e) => {
      this.collapseAll();
      this.BasicDataForm.active = !this.BasicDataForm.active;
      this.MunyiDataForm.active = !this.MunyiDataForm.active;
      this.render;
    });
    this.mainMenu.append(adatokBevitele);

    const dokumentumLista = document.createElement("ul");
    dokumentumLista.id = "nav-dokumentum-lista";
    dokumentumLista.classList = !this.BasicDataForm.allDataAvailable
      ? "inactive"
      : "";

    dokumentumLista.append(this.orarendLink);

    dokumentumLista.append(this.teljesitesLink);
    dokumentumLista.append(this.munyiLink);

    this.mainMenu.append(dokumentumLista);

    const navNyomtatas = document.createElement("li");
    navNyomtatas.id = "nav-nyomtatas";
    navNyomtatas.title = "nyomtatás";
    /*TODO: meghatározni, hogy mikor lehet nyomtatni!*/

    navNyomtatas.classList =
      this.PrintLister.allDocumentsToPrint.length === 0 ? "inactive" : "";

    if (!this.BasicDataForm.allDataAvailable) {
      navNyomtatas.classList.add("inactive");
    }

    navNyomtatas.innerHTML = `<span>🖨️</span>Nyomtatás`;
    navNyomtatas.addEventListener("click", () => {
      // A printlister-t rendereltetem, hogy kiszámolja hány teljesítési áll rendelkezésre
      this.PrintLister.render;
      if (
        this.BasicDataForm.allDataAvailable &&
        this.PrintLister.allTeljesitesiToPrint.length > 0 &&
        this.PrintLister.allDocumentsToPrint.length > 0
      ) {
        this.collapseAll();
        this.PrintLister.active = true;
        this.render;
      } else {
        alert("Nincs nyomtatható dokumentum!");
      }
    });
    this.mainMenu.append(navNyomtatas);

    return this.mainMenu;
  }

  get render() {
    this.setNotObsolate();
    console.log("Render Menu.");
    this.node.innerHTML = "";

    const bejelentkezve = document.createElement("p");
    bejelentkezve.classList.add("notToPrint");
    bejelentkezve.innerText =
      this.BasicDataForm.name != "dolgozó neve"
        ? `bejelentkezve: ${this.BasicDataForm.name}`
        : "";
    this.node.append(bejelentkezve);

    this.navBar.classList.add("notToPrint");
    this.node.append(this.navBar);

    this.navBar.append(this.renderMenu);

    if (this.BasicDataForm.active) {
      this.node.append(this.BasicDataForm.render);

      this.BasicDataForm.confirmBtn.addEventListener(
        "click",
        function (e) {
          this.renderMenu;
        }.bind(this)
      );
    }
    if (this.MunyiDataForm.active) {
      this.node.append(this.MunyiDataForm.render);
    }

    if (this.MuNyiTemplate.active) {
      this.node.append(this.MuNyiTemplate.render);
    }

    if (this.OrarendSablon.active) {
      this.node.append(this.OrarendSablon.render);
    }

    if (this.TeljesitesSelectMenu.active) {
      this.node.append(this.TeljesitesSelectMenu.render);
    }

    if (this.PrintLister.active) {
      this.node.append(this.PrintLister.render);
    }

    return this.node;
  }

  setNotObsolate() {
    if (this.isObsolate) {
      delete this.MuNyiTemplate;
      this.MuNyiTemplate = new MuNyiTemplate(
        this.BasicDataForm.name,
        this.BasicDataForm.date,
        this
      );
      this.MuNyiTemplate.render;
    }
    this.isObsolate = false;
  }

  linkGenerators = {
    orarendLinkRender: () => {
      const orarendLink = document.createElement("li");
      orarendLink.id = "menu-orarend-link";
      orarendLink.innerText = "📅 Órarend";
      orarendLink.addEventListener("click", () => {
        this.collapseAll();
        if (this.BasicDataForm.allDataAvailable) {
          this.OrarendSablon.active = !this.OrarendSablon.active;
          this.render;
        } else {
          this.OrarendSablon.active = false;
        }
      });
      return orarendLink;
    },

    teljesitLinkGenerator: () => {
      const link = document.createElement("li");
      link.innerText = "📄 Teljesítésigazolás";

      link.addEventListener("click", (e) => {
        this.collapseAll();
        if (this.BasicDataForm.allDataAvailable) {
          this.TeljesitesSelectMenu.active = true;
          this.render;
        } else {
          this.TeljesitesSelectMenu.active = false;
        }
      });

      return link;
    },

    munyiLinkGenerator: () => {
      const link = document.createElement("li");
      link.innerText = "📰 Munyi";
      link.addEventListener("click", () => {
        if (this.BasicDataForm.allDataAvailable) {
          this.collapseAll();
          this.MuNyiTemplate.active = !this.MuNyiTemplate.active;
          this.render;
        }
      });
      return link;
    },
  };

  sortingFunctions = {
    teljesitesiData: {},
    tulMunkaData: [],

    iterateDates: () => {
      this.sortingFunctions.tulMunkaData = [];
      this.sortingFunctions.teljesitesiData = {};
      
      const startDate = new Date(this.BasicDataForm.date);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      let currentDate = startDate;

      let currentDay = startDay;
      while (currentDate.getMonth() == startMonth && currentDay < 32) {
        //kivételek kezelése
        let dateString =
          startYear +
          "-" +
          (startMonth + 1 < 10 ? "0" + (startMonth + 1) : startMonth + 1) +
          "-" +
          (currentDay < 10 ? "0" + currentDay : currentDay);

        const kivetel = this.sortingFunctions.kivetelTartalma(dateString);

        if (kivetel && kivetel[2] == "kinti óra ledolgozása") {
          this.sortingFunctions.helyszinListazo(dateString, true);
        }
        //szortírozás órarend szerint
        else if(kivetel && kivetel[2] == "custom kivétel" && kivetel[1].tavolletIndoka != "munkaközösségi értekezlet"){
       
          this.sortingFunctions.helyszinListazo(dateString);
        }
        else if (kivetel && kivetel[1] == "munkaközösségi értekezlet" ||
                (kivetel && kivetel[1]?.tavolletIndoka == "munkaközösségi értekezlet")
        ) {
          this.sortingFunctions.helyszinListazo(dateString);
          
        }
        else if (kivetel) {
          //console.log("Kihagytam a kövi dátumot: ",dateString)
          
        } else if(!kivetel) {
          //console.log("szortírozás órarend szerint:", currentDate);
          this.sortingFunctions.helyszinListazo(dateString);
        }


        //következő iterációhoz:
        currentDate = new Date(
          startYear + "-" + (startMonth + 1) + "-" + currentDay
        );
        
        currentDay++;
        
        // biztosíték, hogy 30 napos hónapban ne fussunk a következő hónapra át:
        const dateToTest =  new Date(
          startYear + "-" + (startMonth + 1) + "-" + currentDay
        );
        if(dateToTest.getMonth() != startMonth){
          currentDay = 100;
        }
      }
    },
    kivetelTartalma: (dateString) => {
      const kivetelLista =
        GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-kivetelek"];
      let toReturn = "";
      kivetelLista.forEach((kivetel) => {
        if (kivetel[0] == dateString) {
          // Itt lehet csinálni valamit a találattal
          // innen a munkaközösségi kivétel
          if(kivetel[1] == "munkaközösségi értekezlet" ||
              typeof(kivetel[1]) == 'object' && kivetel[1]?.tavolletIndoka == "munkaközösségi értekezlet"
          ){
            if (!this.sortingFunctions.teljesitesiData["CSCSVPSZ"]) {
            this.sortingFunctions.teljesitesiData["CSCSVPSZ"] = [];
          } else {
            //alert('LEFUT');
              this.sortingFunctions.teljesitesiData["CSCSVPSZ"].push({
                date: kivetel[0],
                hours: 100,
                string: "munkaközösségi értekezlet",
                tulora: 0,
              });
             
          }
        } else
        // idáig a munkaközösségi kivétel 
        
          if (kivetel[2] == "kinti óra ledolgozása") {
            if (!this.sortingFunctions.teljesitesiData["CSCSVPSZ"]) {
              this.sortingFunctions.teljesitesiData["CSCSVPSZ"] = [];
            }
            if (!kivetel[3]) {
              this.sortingFunctions.teljesitesiData["CSCSVPSZ"].push({
                date: kivetel[0],
                hours: kivetel[1].match(/\d+/)[0],
                string:
                  kivetel[1]
                    .split(" óra ")[1]
                    .split(/\d{4}/)[0]
                    .trim()
                    .match(/.+[^,;]/)[0] + " intézményi óra",
                tulora: kivetel[3],
              });
            }

            const helyszin = kivetel[1].split(" óra ")[1];

            if (!this.sortingFunctions.teljesitesiData[helyszin]) {
              this.sortingFunctions.teljesitesiData[helyszin] = [];
            }

            if (!kivetel[3]) {
              this.sortingFunctions.teljesitesiData[helyszin].push({
                date: kivetel[0],
                hours: kivetel[1].match(/\d+/)[0],
                string:
                  kivetel[1]
                    .split(" óra ")[1]
                    .split(/\d{4}/)[0]
                    .trim()
                    .match(/.+[^,;]/)[0] + " intézményi óra",
              });
            }
          }

          toReturn = kivetel;
        }
      });
      return toReturn;
    },

    helyszinListazo: (datum_str, tuloraKivetel = false) => {
      let nap = GlobalFunctions.weekDayString(datum_str);

      if (nap == "szombat" || nap == "vasarnap") {
        return;
      }

      const orarendTartalom =
        GlobalFunctions.loadFromLocalStorage()[
          "Munyi-Generator-heti-foglalkozasok"
        ];
      const objToReturn = this.sortingFunctions.teljesitesiData;
      const tulMunkaList = this.sortingFunctions.tulMunkaData;

      let potoltOrak;
      // ha túlóra lehet, hogy túlóra volt ami elmaradt:
      if (tuloraKivetel) {
        potoltOrak = GlobalFunctions.potoltOraCollector(new Date(datum_str));
      }

      orarendTartalom[nap].kotelezoOra.forEach((foglalkozas) => {
        if (tuloraKivetel) {
          let potoltOraToSkip;
          potoltOrak.forEach((potoltOra) => {
            if (
              JSON.stringify(potoltOra) == JSON.stringify(foglalkozas) &&
              potoltOra[2]
            ) {
              potoltOraToSkip = true;
            }
          });
          if (potoltOraToSkip) {
            return;
          }
        }

        objToReturn[foglalkozas[1]]
          ? objToReturn[foglalkozas[1]].push({
              date: datum_str,
              hours: foglalkozas[0],
              string: foglalkozas[3],
              tulora: foglalkozas[2],
            })
          : (objToReturn[foglalkozas[1]] = [
              {
                date: datum_str,
                hours: foglalkozas[0],
                string: foglalkozas[3],
                tulora: foglalkozas[2],
              },
            ]);
        //Túlmunka listázása:
        if (foglalkozas[2]) {
          tulMunkaList.push({
            date: new Date(datum_str),
            arrival: foglalkozas[2],
            hours: foglalkozas[0],
            location: GlobalFunctions.instituteExtractor(foglalkozas[1]),
            foglalkozaJellege: foglalkozas[5],
          });
        }
      });

      return objToReturn;
    },
  };

  append() {
    document.getElementById("root").append(this.render);
  }
}

//////MUNYI //////////////////////////////

class DinamikusMunyiSor {
  constructor(
    date,
    kotelezoOra,
    szabadOraObj,
    kivetel = false,
    kivetelOk,
    kivetelTipus,
    tulora,
    utazasiKoltseg
  ) {

 
  // console.warn(
  //       "beérkező: ",
  //       "date: ",date,
  //       "kotelezoOra: ",kotelezoOra,
  //       "szabadOraObj: ",szabadOraObj,
  //   "kivetel: ", kivetel,
  //   "kivetelOk: ",kivetelOk,
  //   "kivetelTipus: ",kivetelTipus,
  //   "tulora: ",tulora,
  //   "utazasiKoltseg: ",utazasiKoltseg
  //     )
    

    this.date = new Date(date); //date obj
    this.kotelezoOra = kotelezoOra; //num
    this.kotelezoOraToCount = this.kotelezoOra;
    this.kivetel = kivetel; //boolean
    this.kivetelOk = kivetelOk; //string
    this.tulora = tulora; //num
    this.szabadOraObj = {...szabadOraObj}; //{'1.':1,'3.':3,'4.':4,'6.':6, '8.':8, '10.':10, '11.':11, '14.':14, 'szakértői nap':100}
    this.utazasiKoltseg = utazasiKoltseg; // 'M' | 'K' | 'M/K'
    this.szakertoiNapOra;

    this.node = document.createElement("div");

    if (
      kivetelOk == "szabadság" ||
      kivetelOk == "fizetés nélküli szabadság" ||
      kivetelOk == "táppénz" ||
      kivetelOk == "tanítás nélküli munkanap" ||
      kivetelOk == "munkaszüneti nap" ||
      kivetelOk == "szabadnap" ||
      kivetelOk == "szülési szabadság (a távollét 31. napjáig)" ||
      kivetelOk == "ünnepnap"
    ) {
      this.kotelezoOra = 0;
      this.tulora = 0;
      this.szabadOraObj = {};
      this.utazasiKoltseg = "";
    }
    if (this.tulora) {
      this.kotelezoOra = this.kotelezoOra - this.tulora;
    }

    if (kivetelOk == "tanítás nélküli munkanap") {
      this.szabadOraObj = { "11.": this.kotelezoOra };
      this.kotelezoOra = 0;
      this.tulora = 0;
    }

    if (kivetelOk == "munkaközösségi értekezlet") {
    this.munkaKozossegiDataTransform();
    switch (this.utazasiKoltseg) {
      case "K":
        this.utazasiKoltseg = ""
        break;
      case "M/K":
        this.utazasiKoltseg = "M"
        break;
  
    }
  }
   
  if (kivetelOk == "szakértői nap") {
      this.szakertoiNapOra = this.kotelezoOra;
      this.kotelezoOra = 0;
      this.tulora = 0;
      this.szabadOraObj = {};
      this.utazasiKoltseg = "";
    }
    if (kivetelTipus == "kinti óra ledolgozása") {
      this.kivetelOk = "";
    }
    if (this.kivetelOk == "ünnepnap") {
      this.kivetelOk = "hetvege";
    }

    if(kivetelTipus == "custom kivétel")
      {
        /*
        console.warn(
        "Számított:",
        "this.date: ", this.date, //nem kell
    "this.kotelezoOra: ", this.kotelezoOra, // kész
    "this.szabadOraObj: ", this.szabadOraObj, // kész
    "this.kivetel: ", this.kivetel,
    "this.kivetelOk: ", this.kivetelOk,
    "this.kivetelTipus: ",this.kivetelTipus,
    "this.tulora: ", this.tulora, // kész
    "this.utazasiKoltseg: ",this.utazasiKoltseg //kész
      )
      */
    const customKivetelObj = this.kivetelOk;
    console.error(customKivetelObj)
    if(customKivetelObj.kotelezoOra){this.kotelezoOra = +customKivetelObj.kotelezoOra};
    if(customKivetelObj.tulora){this.tulora = +customKivetelObj.tulora};
    if(customKivetelObj.munkabaJaras){this.utazasiKoltseg = customKivetelObj.munkabaJaras};
    if(customKivetelObj.tavolletIndoka){this.kivetelOk = customKivetelObj.tavolletIndoka}
      else {this.kivetelOk =''};
    if(customKivetelObj.szakertoiNap){this.szakertoiNapOra = +customKivetelObj.szakertoiNap};

    Object.keys(customKivetelObj.szabadOra).forEach(oraTipus=>{
      if(customKivetelObj.szabadOra[oraTipus]){this.szabadOraObj[oraTipus] = customKivetelObj.szabadOra[oraTipus]}
    })
    if (this.kivetelOk == "munkaközösségi értekezlet") {
      this.munkaKozossegiDataTransform();
      if(customKivetelObj.szabadOra['14.']){this.szabadOraObj['14.'] = customKivetelObj.szabadOra['14.']}
      if(customKivetelObj.munkabaJaras){this.utazasiKoltseg = customKivetelObj.munkabaJaras}

      let outputMinusInput = (this.szabadOraSumma - +kotelezoOra) - this.beerkezoSzabadora(szabadOraObj); 
      console.log(this.szabadOraSumma,+kotelezoOra,this.beerkezoSzabadora(szabadOraObj),"outputMinusInput: ",outputMinusInput)
      if(outputMinusInput != 0)
      {
          Object.keys(this.szabadOraObj).forEach(key =>{
              if(outputMinusInput>0){
                console.log("outputMinusInput>0");
              while(this.szabadOraObj[key] && outputMinusInput){
                console.log("this.szabadOraObj[key]: ",this.szabadOraObj[key])
                  this.szabadOraObj[key] = +this.szabadOraObj[key]++;
                  outputMinusInput--;
              }}
              else if(outputMinusInput<0){
              while(this.szabadOraObj[key] && outputMinusInput){
                  this.szabadOraObj[key] = +this.szabadOraObj[key]--;
                  outputMinusInput++;
              }}
              console.log("outputMinusInput: ",outputMinusInput)
          })
      }


      }
    }
  
  }

beerkezoSzabadora(szabadOraObj){
    return Object.values(szabadOraObj).reduce((a, b) => {
      return a + +b;
    }, 0);
  }  


munkaKozossegiDataTransform(){
    this.szabadOraObj["8."] = (this.szabadOraObj["8."]? +this.szabadOraObj["8."] : 0) + (this.szabadOraObj["11."]? +this.szabadOraObj["11."]: 0);
    this.szabadOraObj["11."] = 0;
    this.szabadOraObj["11."] = this.kotelezoOra;
    this.szabadOraObj["8."] = (this.szabadOraObj["8."]? +this.szabadOraObj["8."] : 0) + (this.szabadOraObj["14."]? +this.szabadOraObj["14."]: 0);
    this.szabadOraObj["14."] = 0;
    this.szabadOraObj["6."] = 0;
    this.szabadOraObj["14."] = 0;
    this.kotelezoOra = 0;
    this.utazasiKoltseg ="";
    this.tulora = 0;
  }



  get szabadOraSumma() {
    return Object.values(this.szabadOraObj).reduce((a, b) => {
      return a + +b;
    }, 0);
  }

  get render() {
    this.node.innerHTML = this.htmlTemplate;

    return this.node;
  }
  get htmlTemplate() {
    this.kotelezoOraToCount = this.kotelezoOra;
    return `<div class="munyi-sor-dinamikus ${
      this.kivetelOk == "hetvege" ? "grey-background" : ""
    } ${this.oldalTores ? "oldal-tores" : ""}">
  <div class="dinamikus-sor-eleje">
    <div class="kis-cellak cella-1">${this.date.getDate()}.</div>
    <div class="kis-cellak cella-2">8:00</div>
    <div class="kis-cellak cella-3">16:00</div>
    <div class="kis-cellak cella-4">${this.date.toLocaleString("hu-HU", {
      weekday: "long",
    })}</div>
    <div class="kis-cellak cella-5">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-6">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-7">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-8">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-9">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-10">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-11">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-12">${this.kotelezoOraCounter()}</div>
    <div class="kis-cellak cella-13">${
      this.kivetelOk && this.kivetelOk != "hetvege" ? this.kivetelOk : ""
    }</div>
    <div class="kis-cellak cella-14">${this.tulora ? this.tulora : ""}</div>
    <div class="kis-cellak cella-15">${
      this.szabadOraObj["1."] ? this.szabadOraObj["1."] : ""
    }</div>
    <div class="kis-cellak cella-16">${
      this.szabadOraObj["3."] ? this.szabadOraObj["3."] : ""
    }</div>
    <div class="kis-cellak cella-17">${
      this.szabadOraObj["4."] ? this.szabadOraObj["4."] : ""
    }</div>
    <div class="kis-cellak cella-18">${
      this.szabadOraObj["6."] ? this.szabadOraObj["6."] : ""
    }</div>
    <div class="kis-cellak cella-19">${
      this.szabadOraObj["8."] ? this.szabadOraObj["8."] : ""
    }</div>
    <div class="kis-cellak cella-20">${
      this.szabadOraObj["10."] ? this.szabadOraObj["10."] : ""
    }</div>
    <div class="kis-cellak cella-21">${
      this.szabadOraObj["11."] ? this.szabadOraObj["11."] : ""
    }</div>
    <div class="kis-cellak cella-22">${
      this.szabadOraObj["14."] ? this.szabadOraObj["14."] : ""
    }</div>
  </div>
  <div class="dinamikus-sor-vege">
    <div class="munyi-fejlec-vege-cella-1 centered right-border">
      ${this.szakertoiNapOra ? this.szakertoiNapOra : ""}
    </div>
    <div class="munyi-fejlec-vege-cella-2 centered right-border">
      ${this.utazasiKoltseg}
    </div>
    <div class="munyi-fejlec-vege-cella-3 centered"></div>
  </div>
</div>
`;
  }

  kotelezoOraCounter() {
    const toReturn = this.kotelezoOraToCount > 0 ? 1 : "";
    this.kotelezoOraToCount--;
    return toReturn;
  }
  append() {
    document.getElementById("root").append(this.render);
  }
}

class MuNyiTemplate {
  constructor(name, date, parentObj) {
    this.active = false;
    this.parentObject = parentObj;
    this.name = name ? name : parentObj.BasicDataForm.name;
    this.date = date ? new Date(date) : new Date(parentObj.BasicDataForm.date);

    this.node = document.createElement("div");

    this.sortingFunctions.iterateDates();
  }

  munkanapPotlas(kivetelArr_2) {
    const munkanap = GlobalFunctions.nameFormatter(
      kivetelArr_2.replace(/i munkanap pótlása/, "")
    );
    const utazas =
      this.parentObject.OrarendSablon.teljeshet[munkanap].foglalkozasutazas;
    const kotelezoOra =
      this.parentObject.OrarendSablon.teljeshet[munkanap].napiOraszam;
    const szabadOraObj =
      this.parentObject.OrarendSablon.teljeshet[munkanap].szabadOraList;
    const tulora =
      this.parentObject.OrarendSablon.teljeshet[munkanap].tuloraSum;
    return [kotelezoOra, szabadOraObj, tulora, utazas];
  }

  get printable() {
    return this.name && this.date != "Invalid Date";
  }

  get koviHonapElsoMunkanap() {
    const elsoMunkanapok2023 = {
      january: "2023.02.01.",
      february: "2023.03.01.",
      march: "2023.04.03.",
      april: "2023.05.02.",
      may: "2023.06.01.",
      june: "2023.07.03.",
      july: "2023.08.01.",
      august: "2023.09.01.",
      september: "2023.10.02.",
      october: "2023.11.02.",
      november: "2023.12.01.",
      december: "2024.01.03.",
    };
    const thisDateObj = new Date(this.date);

    return new Date(
      elsoMunkanapok2023[
        thisDateObj.toLocaleString("en-US", { month: "long" }).toLowerCase()
      ]
    );
  }

  get koviHonapElsoMunkanap_eredeti() {
    const jovoHonapElsoNapja = (thisDotDate) => {
      return (
        thisDotDate.getFullYear() +
        "." +
        (thisDotDate.getMonth() + 2 > 11 ? 1 : thisDotDate.getMonth() + 2) +
        "." +
        "1"
      );
    };

    let dayToTry = new Date(jovoHonapElsoNapja(this.date));

    const okDay = (day) => {
      if (!this.sortingFunctions.kivetelTalalo(day, true)) {
        return;
      } else {
        dayToTry = new Date(
          day.getFullYear() +
            "." +
            (day.getMonth() + 1) +
            "." +
            (day.getDate() + 1)
        );
        okDay(dayToTry);
      }
    };
    okDay(dayToTry);
    return dayToTry;
  }

  sortingFunctions = {
    dinamikusMunyiSorList: [],

    kivetelTalalo(dateObj, isNextMonth = false) {
      const currentDate = dateObj;
      let toReturn = false;
      const savedExceptions =
        GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-kivetelek"];
      let exceptionsToTest = isNextMonth
        ? savedExceptions.concat(exceptions)
        : savedExceptions;
      console.error(exceptionsToTest);

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
          console.log("Kivételt találtunk: " + currentDate);
          toReturn = true;
        }
      });
      if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
        toReturn = true;
      }
      return toReturn;
    },

    kikuldetesTester(dateObj) {
      const arrayToReduce = GlobalFunctions.potoltOraCollector(dateObj);
      return arrayToReduce.reduce((accu, actu) => {
        let toReturn = actu[4] ? accu + +actu[0] : accu;
        return toReturn;
      }, 0);
    },

    iterateDates: () => {
      const startDate = new Date(this.date);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      let currentDate = startDate;

      let currentDay = startDay + 1;
      while (currentDate.getMonth() == startMonth && currentDay < 33) {
        const dateString = currentDate.toLocaleString("hu-HU", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        const weekdayStr = currentDate
          .toLocaleString("hu-HU", { weekday: "long" })
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        let kivetel, kivetelOk, kivetelTipus;
        // annak ellenőrzése, hogy van-e kivétel?

        GlobalFunctions.loadFromLocalStorage()[
          "Munyi-Generator-kivetelek"
        ].forEach((kivetelArr) => {
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
            kivetel = true;
            kivetelOk = kivetelArr[1];
            kivetelTipus = kivetelArr[2];
          }
        });
        if (
          !kivetel &&
          (weekdayStr == "vasarnap" || weekdayStr == "szombat") &&
          kivetelTipus != "munkanap áthelyezés"
        ) {
          kivetel = true;
          kivetelOk = "hetvege";
          kivetelTipus = "hetvege";
        }

        let szabadOraObj, tulora, utazas, kotelezoOra;

        if (/munkanap pótlása/.test(kivetelOk)) {
          [kotelezoOra, szabadOraObj, tulora, utazas] =
            this.munkanapPotlas(kivetelOk);
          kivetelOk = "";
        } else {
          const adat =
            GlobalFunctions.loadFromLocalStorage()[
              "Munyi-Generator-heti-foglalkozasok"
            ][weekdayStr];

          kotelezoOra = adat?.kotelezoOra.reduce((accu, ora) => {
            return accu + +ora[0];
          }, 0);
          // Az elmaradtTuloraSum visszadja az elmaradt túlórák számát aznap
          function elmaradtTuloraSum(datumObj, relevansFoglalkozasArr) {
            const potoltOrak = GlobalFunctions.potoltOraCollector(datumObj);
            let potoltOraToSkip = 0;

            if (relevansFoglalkozasArr) {
              relevansFoglalkozasArr.forEach((foglalkozas) => {
                potoltOrak.forEach((potoltOra) => {
                  if (
                    JSON.stringify(potoltOra) == JSON.stringify(foglalkozas) &&
                    potoltOra[2]
                  ) {
                    potoltOraToSkip = +foglalkozas[0];
                  }
                });
                if (potoltOraToSkip) {
                  return;
                }
              });
            }
            return potoltOraToSkip;
          }
          const elmaradtTulora = elmaradtTuloraSum(
            currentDate,
            adat?.kotelezoOra
          );
          kotelezoOra = kotelezoOra - elmaradtTulora;
          szabadOraObj = adat ? adat.szabadOra : {};
          tulora =
            this.sortingFunctions.tuloraAznap(currentDate) - elmaradtTulora;
          utazas = adat ? adat.munkabaJaras : "";
          if (utazas == "K" || utazas == "M/K") {
            const thisWeekday = GlobalFunctions.weekDayString(currentDate);
            const allKikuldetesOra =
              this.parentObject.OrarendSablon.teljeshet[thisWeekday]
                .kikuldetesSum;
            const kikuldetesLeft =
              this.sortingFunctions.kikuldetesTester(currentDate);
            if (!(allKikuldetesOra - kikuldetesLeft)) {
              utazas = utazas == "M/K" ? "M" : "";
              console.error("MOst csak:", utazas);
            }
          }
        }

        this.sortingFunctions.dinamikusMunyiSorList.push(
          new DinamikusMunyiSor(
            currentDate,
            kotelezoOra,
            szabadOraObj,
            kivetel,
            kivetelOk,
            kivetelTipus,
            tulora,
            utazas
          )
        );
        if (this.sortingFunctions.dinamikusMunyiSorList.length > 17) {
          this.sortingFunctions.dinamikusMunyiSorList[17].oldalTores = true;
        }
        //következő iterációhoz:
        currentDate = new Date(
          startYear + "-" + (startMonth + 1) + "-" + currentDay
        );
        currentDay++;
      }
    },

    tuloraAznap(date) {
      // az aznapi túlórákat számolja össze az órarend alapján, de kihagyja az elmaradt órákat
      const datumObj = new Date(date);
      const datumString = GlobalFunctions.nameFormatter(
        datumObj.toLocaleString("hu-HU", { weekday: "long" })
      );

      const relevansFoglalkozasArr =
        datumObj.getDay() > 0 && datumObj.getDay() < 6
          ? GlobalFunctions.loadFromLocalStorage()[
              "Munyi-Generator-heti-foglalkozasok"
            ][datumString].kotelezoOra
          : null;

      // // ha elmaradt aznap óra, volt-e közte túlóra?
      // const potoltOrak = GlobalFunctions.potoltOraCollector(datumObj);
      // let potoltOraToSkip;

      // if(relevansFoglalkozasArr)
      // {relevansFoglalkozasArr.forEach((foglalkozas) => {
      //     potoltOrak.forEach((potoltOra) => {
      //       if (
      //         JSON.stringify(potoltOra) == JSON.stringify(foglalkozas) &&
      //         potoltOra[2]
      //       ) {
      //         potoltOraToSkip = true;

      //       }
      //     });
      //     if (potoltOraToSkip) {
      //       return;
      //     }
      //   })}

      if (relevansFoglalkozasArr) {
        return relevansFoglalkozasArr.reduce((accu, foglalkozas) => {
          if (foglalkozas[2]) {
            return accu + +foglalkozas[0];
          } else {
            //Nem volt túlóra.
            return accu;
          }
        }, 0);
      }
    },
  };

  get render() {
    this.node.innerHTML = "";
    this.node.id = "munyi-container-nyomtatni";
    const munyiContainer = document.createElement("div");
    munyiContainer.id = "munyi-container";

    const munyi1_18 = document.createElement("div");
    munyi1_18.append(this.statikusFejlec);
    munyi1_18.id = "fejlec-plusz-munyi-1-18-sor";
    munyi1_18.classList.add("border-1pt-solid-black");
    const munyi19_31 = document.createElement("div");
    munyi19_31.id = "munyi-19-31-sor";
    munyi19_31.classList.add("border-1pt-solid-black");

    this.sortingFunctions.dinamikusMunyiSorList.forEach((sor, index) => {
      if (index < 18) {
        munyi1_18.append(sor.render);
      } else {
        munyi19_31.append(sor.render);
      }
    });

    const upperMargin = document.createElement("div");
    upperMargin.classList.add("upper-margin");
    munyiContainer.append(munyi1_18, upperMargin, munyi19_31);

    this.node.append(munyiContainer);

    //this.node.append(this.dinamikusSzakasz);
    this.node.append(this.statikusLablec);

    return this.node;
    ///////////////////////////
  }
  get dinamikusSzakasz() {
    const dinamikusSzakasz = document.createElement("div");
    dinamikusSzakasz.id = "munyi-dinamikus-szakasz";

    return dinamikusSzakasz;
  }
  get statikusLablec() {
    const lablec = document.createElement("div");
    lablec.classList.add("oldal-tores");
    lablec.innerHTML = `        <div id="kozepes-feher-zaro-sor">
    <div class="kozepes-feher-zaro-sor-cella-1"></div>
    <div
      id="munyi-osszes-kotelezo-ora"
      class="kozepes-feher-zaro-sor-cella-2">
      ${this.sortingFunctions.dinamikusMunyiSorList.reduce((accu, actu) => {
        return accu + (actu["kotelezoOra"] ? actu["kotelezoOra"] : 0);
      }, 0)} óra
    </div>
    <div class="kozepes-feher-zaro-sor-cella-3"></div>
    <div id="munyi-osszes-tulora" class="kozepes-feher-zaro-sor-cella-4">
    ${this.tuloraHaviSumma} óra
    </div>
    <div
      id="munyi-osszes-szabadon-felhasznalhato-ora"
      class="kozepes-feher-zaro-sor-cella-5">
      ${this.szabadOraHaviSumma} óra
    </div>
    <div
      id="munyi-osszes-szakertoi-ora"
      class="kozepes-feher-zaro-sor-cella-6">
      ${this.sortingFunctions.dinamikusMunyiSorList.reduce((accu, actu) => {
        return accu + (actu.szakertoiNapOra ? actu.szakertoiNapOra : 0);
      }, 0)} óra
    </div>
  </div>
  <div id="osszesen-sor">
    <div class="kozepes-feher-zaro-sor-cella-1">Összesen</div>
    <div id="munyi-vegso-osszesites">${
      this.kotelezoOraHaviSumma + this.tuloraHaviSumma
    }
    </div>
  </div>
  <div id="munyi-kelt">Makó, ${this.koviHonapElsoMunkanap.toLocaleDateString(
    "hu-HU",
    { year: "numeric", month: "numeric", day: "numeric" }
  )}</div>
  <p id="munyi-telejsiteset-igazolom" class="munyi-vegi-aprobetus">
    A havi munkaidő teljesítését a heti megvalósított kötelező óraszám és
    a feltüntetett eltérések alapján igazolom.
  </p>
  <div id="munyi-vegi-alairasok" class="munyi-vegi-aprobetus">
    <div>
      …..………………………………….<br />
      tagintézmény-igazgató
    </div>
    <div>
      …………………………………….<br />
      dolgozó
    </div>
  </div>
  <div id="munyi-zaro-jelmagyarazat">
    <div id="Nevelessel-oktatassal" class="munyi-vegi-aprobetus bolder">
      * Neveléssel-oktatással le nem kötött órán felüli feladatok 32 óráig
      {326/2013. (VIII.30.) Korm. rendelet 17.§
    </div>

    <p class="munyi-vegi-aprobetus">
      <span> 1.</span> foglalkozások, vizsgálatok, szűrések, egyéb
      közvetlen foglalkozások előkészítése
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>3.</span> szakértői, továbbá a pedagógiai szakszolgálati
      tevékenység során keletkező vizsgálati és egyéb vélemények készítése
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>4.</span> fejlesztési tervek készítése
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>6.</span> eseti helyettesítés
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>8.</span> az intézményi dokumentumok készítése, vezetése
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>10.</span> pedagógusjelölt, gyakornok szakmai segítése,
      mentorálása
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>11.</span> a szakalkalmazotti értekezlet, a szakmai
      munkaközösség munkájában történő részvétel
    </p>
    <p class="munyi-vegi-aprobetus">
      <span>14.</span> feladatvégzési helyek közötti utazás
    </p>
  </div>`;
    return lablec;
  }
  get statikusFejlec() {
    const statikusFejlec = document.createElement("div");
    statikusFejlec.id = "statikus-fejlec";
    statikusFejlec.innerHTML = `<div id="statikus-fejlec">
    <header class="centered">
      Csongrád-Csanád Vármegyei Pedagógiai Szakszolgálat<br />Makói
      Tagintézménye
    </header>
    <div id="nev-honap-nap-3sor">
      <div id="nevek-honap-leNemKotott">
        <div id="sargasor-nagyobb-resze" class="narancsfejlec">
          <div id="nev-box" class="centered">Név:</div>
          <div id="nev-sor" class="">${this.name}</div>
        </div>
        <div id="feher-sor-nagyobb-resze" class="bolder">
          <div id="nevek-honap-leNemKotott-Evhonap" class="centered">
            ${this.date.toLocaleString("hu-HU", {
              year: "numeric",
              month: "long",
            })}
          </div>
          <div id="nevek-honap-leNemKotott-leNemKotott" class="centered">
            Neveléssel-oktatással le nem kötött órán felül 32 óráig<br />326/2013.
            (VIII.30.) Korm. rendelet 17.§ (2a) *
          </div>
        </div>
        <div id="sokAproCellas-fejlec-nagyobb-resze">
          <div class="kis-cellak cella-1 kis-cellak">nap</div>
          <div id="munkaido-kezd-veg" class="kis-cellak">
            <div class="width-100 undrin">munkaidő</div>
            <div class="width-42 right-border">kezd.</div>
            <div class="width-50">vége</div>
          </div>
          <div class="kis-cellak cella-4">a hét napja</div>
          <div class="kis-cellak cella-5">1</div>
          <div class="kis-cellak cella-6">2</div>
          <div class="kis-cellak cella-7">3</div>
          <div class="kis-cellak cella-8">4</div>
          <div class="kis-cellak cella-9">5</div>
          <div class="kis-cellak cella-10">6</div>
          <div class="kis-cellak cella-11">7</div>
          <div class="kis-cellak cella-12">8</div>
          <div class="kis-cellak cella-13">Távollét indoka</div>
          <div class="kis-cellak cella-14">eng.<br />túlóra</div>
          <div class="kis-cellak cella-15">1.</div>
          <div class="kis-cellak cella-16">3.</div>
          <div class="kis-cellak cella-17">4.</div>
          <div class="kis-cellak cella-18">6.</div>
          <div class="kis-cellak cella-19">8.</div>
          <div class="kis-cellak cella-20">10.</div>
          <div class="kis-cellak cella-21">11.</div>
          <div class="kis-cellak cella-22">14.</div>
        </div>
      </div>
      <div id="szakertoiNap-alairas" class="left-border">
        <div id="munyi-fejlec-sarga-sor">
          <div
            class="munyi-fejlec-vege-cella-1 narancsfejlec centered right-border"
          ></div>
          <div
            class="munyi-fejlec-vege-cella-2 narancsfejlec centered right-border"
          ></div>
          <div
            class="munyi-fejlec-vege-cella-3 narancsfejlec centered"
            id="negyven-ora-per-21"
          >
            40 óra/<br />
            21 kötelező óra
          </div>
        </div>
        <div id="munyi-fejlec-feher-sor">
          <div
            id="szakertoi-nap"
            class="munyi-fejlec-vege-cella-1 centered right-border"
          >
            szakértői nap
          </div>
          <div
            id="utazasi-koltsegterites"
            class="munyi-fejlec-vege-cella-2 centered right-border"
          >
            utazási
            <u>költségtérítés</u>
            (M vagy K vagy M/K *)
          </div>
          <div
            id="munyi-fejlec-feher-sor-alairas"
            class="munyi-fejlec-vege-cella-3 centered"
          >
            Aláírás
          </div>
        </div>
      </div>
    </div>
  </div>`;
    return statikusFejlec;
  }
  get kotelezoOraHaviSumma() {
    return this.sortingFunctions.dinamikusMunyiSorList.reduce((accu, actu) => {
      return accu + (actu["kotelezoOra"] ? actu["kotelezoOra"] : 0);
    }, 0);
  }

  get tuloraHaviSumma() {
    return this.sortingFunctions.dinamikusMunyiSorList.reduce((accu, actu) => {
      return accu + (actu["tulora"] ? actu["tulora"] : 0);
    }, 0);
  }
  get szabadOraHaviSumma() {
    return this.sortingFunctions.dinamikusMunyiSorList.reduce(
      (accu, actu) => accu + +actu.szabadOraSumma,
      0
    );
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class PrintListItem {
  constructor(name, date, type, location) {
    this.name = name;
    this.date = date;
    this.type = type;
    this.location = location;
    this.index = Math.trunc(Math.random() * 10000);

    this.active = true;
    this.node = this.listItemGenerator();
  }

  listItemGenerator() {
    const listItem = document.createElement("li");
    listItem.classList.add("document-to-print-li");
    if (this.type === "órarend") {
      listItem.classList.add("rose-background");
    } else if (this.type === "MuNyi") {
      listItem.classList.add("cyan-background");
    } else if (this.type === "túlmunka igazolás") {
      listItem.classList.add("orange-background");
    } else if (this.type === "túlmunka órarend") {
      listItem.classList.add("green-background");
    }
    listItem.append(
      ` ${this.name}_${this.date}_${this.type}${
        this.location ? "_" + this.location : ""
      }`
    );
    listItem.addEventListener("click", (e) => {
      console.log(this);
      this.active = !this.active;
      this.active
        ? listItem.classList.remove("deAcivated")
        : listItem.classList.add("deAcivated");
      this.render;
    });

    return listItem;
  }

  get render() {
    return this.node;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class PrintLister {
  constructor(parentObjectAdress) {
    this.parentObject = parentObjectAdress;
    this.node = document.createElement("div");

    this.dateSelect = this.generatorFunctions.dateSelectGenerator();
    this.printBtn = this.printBtnGenerator(this.documentPreview.bind(this));

    this.printTeljesitesiBtn = this.printBtnGenerator(
      this.teljesitesiPreview.bind(this)
    );
    this.allTeljesitesiToPrint = [];
    this.allTeljesitesiCollector();

    this.allDocumentsToPrint = [];
    this.allDocumentCollector();
    this.active = false;
  }

  get allAvailableTeljesitesiList() {
    this.allTeljesitesiCollector();

    const unOrderedList = document.createElement("ul");
    unOrderedList.id = "list-of-teljesitesi-to-print-ul";
    unOrderedList.classList.add("list-of-documents-to-print-ul");

    this.allTeljesitesiToPrint.forEach((docu, index) => {
      const listItem = new PrintListItem(
        docu.name,
        docu.date,
        docu.type,
        docu.location
      );
      unOrderedList.append(listItem.render);
      this.allTeljesitesiToPrint[index].listItem = listItem;
    });
    unOrderedList.append(this.printTeljesitesiBtn);
    return unOrderedList;
  }

  allTeljesitesiCollector() {
    const arrToReturn = [];
    // teljesítésik legyártatása a TeljesitesiSelectMenu-vel
    this.parentObject.TeljesitesSelectMenu.render;

    this.parentObject.TeljesitesSelectMenu.teljesitesiLista.forEach(
      (teljesitesiObj) => {
        arrToReturn.push({
          name: this.parentObject.BasicDataForm.name,
          date: this.dateSelect.value,
          type: "teljesitesIgazolas",

          object: teljesitesiObj,
          location: teljesitesiObj.location,
        });
      }
    );

    this.allTeljesitesiToPrint = arrToReturn.filter((item) => {
      return item.object.printable;
    });
    /// TODO ide szúrható be a Túlmunka órarend!
    //(Esetleg külön funkcióba is írható, de this.allTeljesitesiToPrint elejére érdemes)
    
    this.allTeljesitesiToPrint.unshift({
      name: this.parentObject.BasicDataForm.name,
      date: this.dateSelect.value,
      type: "túlmunka órarend",
      object: new TulmunkaOrarend(this.parentObject),
      location: "",
    });
  }

  teljesitesiPreview() {
    const preview = document.createElement("div");
    preview.id = "teljesitesi-to-print";
    preview.classList.add("onlyToPrint");
    preview.innerHTML = `<style>
    @page {
      margin:0;
      size: A4 portrait;
 
  }
    </style>`;
    this.allTeljesitesiToPrint.forEach((document) => {
      if (document.listItem.active) {
        preview.append(document["object"].render);
      }
    });
    document.getElementById("documents-to-print").innerHTML = "";
    document.getElementById("documents-to-print").append(preview);
    return preview;
  }
  //// INNEN PRÓBA ////////////////////

  printBtnGenerator(previewFn) {
    const printBtn = document.createElement("button");
    printBtn.innerHTML = "Nyomtatás<br/>🖨️";
    printBtn.addEventListener("click", () => {
      previewFn();

      window.print();
    });
    return printBtn;
  }

  teljesitesiData() {
    this.parentObject.sortingFunctions.teljesitesiData = {};
    this.parentObject.sortingFunctions.iterateDates();
    return this.parentObject.sortingFunctions.teljesitesiData;
  }

  get allAvailableDocumentList() {
    this.allDocumentCollector();

    const unOrderedList = document.createElement("ul");
    unOrderedList.id = "list-of-documents-to-print-ul";

    this.allDocumentsToPrint.forEach((docu, index) => {
      const listItem = new PrintListItem(
        docu.name,
        docu.date,
        docu.type,
        docu.location
      );
      unOrderedList.append(listItem.render);
      this.allDocumentsToPrint[index].listItem = listItem;
    });

    unOrderedList.append(this.printBtn);

    return unOrderedList;
  }

  allDocumentCollector() {
    const arrToReturn = [];

    //órarend hozzáadása:
    arrToReturn.push({
      name: this.parentObject.BasicDataForm.name,
      date: this.dateSelect.value,
      type: "órarend",
      location: "",
      object: new OrarendSablon(
        this.parentObject.BasicDataForm.name,
        this.dateSelect.value,
        this.parentObject
      ),
    });
    //Munyi hozzáadása:
    arrToReturn.unshift({
      name: this.parentObject.BasicDataForm.name,
      date: this.dateSelect.value,
      type: "MuNyi",
      location: "",
      object: new MuNyiTemplate(
        this.parentObject.BasicDataForm.name,
        this.dateSelect.value,
        this.parentObject
      ),
    });
    // Túlmunka igazolás hozzáadása (.unshift push-ra cserélve)
    
        arrToReturn.push({
      name: this.parentObject.BasicDataForm.name,
      date: this.dateSelect.value,
      type: "túlmunka igazolás",
      object: new TulMunkaSablon(this.parentObject),
      location: "",
    });
  
    /* IDIÓTA PRÓBLKOZÁS
    const probacucc = this.allTeljesitesiToPrint.filter(obj => obj.type == "túlmunka igazolás")[0]
    arrToReturn.push( probacucc
    )*/

    this.allDocumentsToPrint = arrToReturn.filter((item) => {
      return item.object.printable;
    });
    
  }

  generatorFunctions = {
    dateSelectGenerator: () => {
      const selectElement = document.createElement("select");
      const allDatesArr = Object.keys(
        JSON.parse(localStorage["Munyi-generator"])[
          GlobalFunctions.nameFormatter(this.parentObject.BasicDataForm.name)
        ]
      );

      allDatesArr.forEach((date) => {
        let selectedFlag = "";
        if (date == this.parentObject.BasicDataForm.date) {
          selectedFlag = "selected";
        }
        selectElement.innerHTML += `<option value="${date}" ${selectedFlag}>${date}</option>`;
      });

      selectElement.addEventListener("change", () => {
        this.allDocumentCollector();
        this.render;
      });
      return selectElement;
    },
  };
  get listRender() {
    const documentList = document.createElement("div");
    documentList.id = "list-of-documents-to-print-container";
    documentList.classList.add("notToPrint");

    documentList.innerHTML = `<h3 class="notToPrint">Nyomtatható dokumentumok:</h3>
    <p class="notToPrint">Jelöld ki azokat a dokumentumokat, amelyeket nyomtatni szeretnél!</p>`;

    documentList.append(this.allAvailableDocumentList);
    documentList.append(this.allAvailableTeljesitesiList);

    //documentList.append(this.printBtn);

    //documentList.append(this.documentPreview);
    return documentList;
  }

  sortingFunctions = {
    teljesitesiData: {},

    iterateDates: () => {
      const startDate = new Date(this.dateSelect.value);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      let currentDate = startDate;

      let currentDay = startDay + 1;
      while (currentDate.getMonth() == startMonth && currentDay < 32) {
        //kivételek kezelése
        const dateString =
          startYear +
          "-" +
          (startMonth + 1 < 10 ? "0" + (startMonth + 1) : startMonth + 1) +
          "-" +
          currentDay;

        const kivetel = this.sortingFunctions.kivetelTartalma(dateString);

        if (!kivetel) {
          this.sortingFunctions.helyszinListazo(
            dateString,
            new Date(dateString).getDay()
          );
        }

        //következő iterációhoz:
        currentDate = new Date(
          startYear + "-" + (startMonth + 1) + "-" + currentDay
        );
        currentDay++;
      }

      /////////TODO///////////////////////////////////////////////////////////////////
    },
    kivetelTartalma: (dateString) => {
      const kivetelLista = GlobalFunctions.loadFromLocalStorage(
        this.parentObject.BasicDataForm.name,
        this.dateSelect.value
      )["Munyi-Generator-kivetelek"];
      let toReturn = "";
      kivetelLista.forEach((kivetel) => {
        if (kivetel[0] == dateString) {
          // Itt lehet csinálni valamit a találattal
          console.log("Találtunk egy egyezést:" + kivetel[0]);
          toReturn = kivetel;
        }
      });
      return toReturn;
    },

    helyszinListazo: (datum_str, getDay) => {
      let nap;
      switch (getDay) {
        case 1:
          nap = "hetfo";
          break;

        case 2:
          nap = "kedd";
          break;
        case 3:
          nap = "szerda";
          break;
        case 4:
          nap = "csutortok";
          break;
        case 5:
          nap = "pentek";
          break;

        default:
          return;
      }

      const orarendTartalom =
        GlobalFunctions.loadFromLocalStorage()[
          "Munyi-Generator-heti-foglalkozasok"
        ];

      const objToReturn = this.sortingFunctions.teljesitesiData;

      orarendTartalom[nap].kotelezoOra.forEach((foglalkozas) => {
        objToReturn[foglalkozas[1]]
          ? objToReturn[foglalkozas[1]].push({
              date: datum_str,
              hours: foglalkozas[0],
            })
          : (objToReturn[foglalkozas[1]] = [
              { date: datum_str, hours: foglalkozas[0] },
            ]);

        /* datesArray felépítése:
    [
        { date: "2022.10.11", hours: 10 },
        { date: "2022.10.18", hours: 11 },
      ]
    */
      });

      return objToReturn;
    },
  };

  documentPreview() {
    const preview = document.createElement("div");
    preview.id = "documents-to-print";
    preview.classList.add("onlyToPrint");

    this.allDocumentsToPrint.forEach((document) => {
      if (document.listItem.active) {
        preview.append(document["object"].render);
      }
    });

    document.getElementById("documents-to-print").innerHTML = "";
    document.getElementById("documents-to-print").append(preview);
    this.orarendRowEqualizer();
  }

  orarendRowEqualizer() {
    let allRowsHeight = 330;

    let x = 0;
    while (document.getElementsByClassName(`sor-${x}`)[0]) {
      let maxHeight = 0;
      for (
        let i = 0;
        i < document.getElementsByClassName(`sor-${x}`).length;
        i++
      ) {
        if (
          document.getElementsByClassName(`sor-${x}`)[i].clientHeight >
          maxHeight
        ) {
          maxHeight = document.getElementsByClassName(`sor-${x}`)[i]
            .clientHeight;
        }
        console.log(
          "clientHight " +
            x +
            ". sor, " +
            i +
            ".dik eleme: " +
            document.getElementsByClassName(`sor-${x}`)[i].clientHeight
        );
      }

      if (maxHeight) {
        const CSSrule = document.createElement("style");
        CSSrule.innerHTML = `.sor-${x}{height:${maxHeight + 1}px;}`;
        document.getElementById("documents-to-print").append(CSSrule);
        console.log(
          "VOLT SOR AMIT átméreteztünk: " + x + " erre: " + maxHeight
        );
      }
      x++;
    }
    //return maxHeight;
  }

  get render() {
    this.node.id = "print-menu";
    this.node.classList.add("notToPrint");
    this.node.innerHTML = "";

    const workerSelectP = document.createElement("p");
    workerSelectP.innerText = "Dokumentum érvényességének kezdete: ";
    workerSelectP.append(this.dateSelect);
    this.node.append(workerSelectP);

    this.node.append(this.listRender);
    return this.node;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class TulMunkaSablon {
  constructor(parentObj) {
    this.parentObj = parentObj;
    this.printable = true;
    this.tulMunkaList = parentObj.tulMunkaData();
    this.node = document.createElement("div");
  }

  get template() {
    const htmlTemplate = ` <div class="tulmunka-elszamolas-fejlec">
    <p class="tulmunka-elszamolas">Túlmunka elszámolás</p>

    <p class="CSCSVPSZ">
      Csongrád-Csanád Vármegyei Pedagógiai Szakszolgálat<br />

      Makói Tagintézménye
    </p>
    <div class="dolgozoneve-NEV-evHonap">
      <p class="tulmunka-dolgozoNeve">Dolgozó neve:</p>

      <p class="tulmunka-NEV">${this.parentObj.BasicDataForm.name.toUpperCase()}</p>

      <p class="tulmunka-evHonap">${new Date(
        this.parentObj.BasicDataForm.date
      ).toLocaleString("hu-HU", { month: "long", year: "numeric" })}</p>
    </div>
  </div>`;

    return htmlTemplate;
  }

  everyTulora(node) {
    this.tulMunkaList.forEach((tulmunkaObj,index) => {
      let nodeToReturn = new TmunkaSor(
        tulmunkaObj.date,
        tulmunkaObj.arrival,
        tulmunkaObj.hours,
        tulmunkaObj.location
      );
      if(this.tulMunkaList.length>13 && index == 13){
        const dokumentumErvenyesTr = document.createElement('tr'); 
        dokumentumErvenyesTr.classList.add('no-border');
        dokumentumErvenyesTr.innerHTML= `<td id="tulmunka-lista-ervenyesseg-td" class="munyi-vegi-aprobetus" colspan="4" >Érvényes: 2021.02.09-től</td>`;

        node.append(document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),
        dokumentumErvenyesTr,
        document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),
        document.createElement('br'),);
      }
      node.append(nodeToReturn.render);
      
    });
  }

  get render() {
    this.node.innerHTML = "";
    this.node.id = "tulmunka-elszamolas-container";
    this.node.innerHTML = this.template;

    const tablazat = document.createElement("table");
    tablazat.classList.add("tulmunka-elszamolas-tablazat");
    const tbody = document.createElement("tbody");
    tbody.innerHTML = `<tr class="tulmunka-elszamolas-tablazat-fejlec">
        <td class="datum-oszlop">Dátum</td>
        <td class="erkezes-oszlop">Érkezés</td>
        <td class="tavozas-oszolp">Távozás</td>
        <td class="megtartott-orak-szama-oszlop">Megtartott órák száma</td>
        <td class="feladatellatasi-hely-oszlop">Feladatellátási hely</td>
        <td class="dolgozo-es-igazolo-alairasa-oszlop">Dolgozó aláírása</td>
        <td class="dolgozo-es-igazolo-alairasa-oszlop">
          Jelenlétet igazoló aláírása
        </td>
      </tr>`;
    tablazat.append(tbody);

    this.everyTulora(tbody);

    const dokumentumErvenyesTr = document.createElement('tr'); 
        dokumentumErvenyesTr.classList.add('no-border');
        dokumentumErvenyesTr.innerHTML= `<td id="tulmunka-lista-ervenyesseg-td" class="munyi-vegi-aprobetus" colspan="4" >Érvényes: 2021.02.09-től</td>`;

    const oldalTores = document.createElement("p");
    oldalTores.classList.add("oldal-tores");

    this.node.append(tablazat,
      document.createElement('br'),
      document.createElement('br'),
      document.createElement('br'),
      dokumentumErvenyesTr,
      oldalTores);

    return this.node;
  }

  append() {
    document.getElementById("documents-to-print").append(this.render);
  }
}

class TmunkaSor {
  constructor(date, arrival, hours, location) {
    this.date = new Date(date).toLocaleDateString();
    this.arrival = arrival; //'10:15'
    this.hours = hours; // number
    this.departure = GlobalFunctions.departureString(this.arrival, +this.hours);
    this.location = location;

    this.node = document.createElement("tr");
  }

  get render() {
    this.node.innerHTML = "";
    this.node.innerHTML = `
    <td class="datum-oszlop">${this.date}</td>
          <td class="erkezes-oszlop">${this.arrival}</td>
          <td class="tavozas-oszolp">${this.departure}</td>
          <td class="megtartott-orak-szama-oszlop">${this.hours}</td>
          <td class="feladatellatasi-hely-oszlop">
            ${this.location}
          </td>
          <td class="dolgozo-es-igazolo-alairasa-oszlop"></td>
          <td class="dolgozo-es-igazolo-alairasa-oszlop"></td>
    `;

    return this.node;
  }

  append() {
    document.getElementById("root").append(this.render);
  }
}

class TulmunkaOrarend {
  constructor(
    parentObj
  ) {
    this.parentObj = parentObj;
    this.name = this.parentObj.BasicDataForm.name.toUpperCase();
    
    this.megjegyzes = parentObj.OrarendSablon.tuloraMegjegyzes;
    this.tanev = GlobalFunctions.tanev(this.parentObj.BasicDataForm.date);
    this.ev = this.parentObj.BasicDataForm.date.split("-")[0];
    this.honap = this.parentObj.BasicDataForm.date.split("-")[1];
    this.hetiOraszam = this.parentObj.OrarendSablon.hetiTuloraszamCollector;

    this.hetnapjaSorok = this.hetnapjaSorCollector();

    this.feladatEllatas =  this.ellatasLister(this.parentObj.tulMunkaData());

    this.node = document.createElement("div");
  }

  ellatasLister(dataArr){
    const collectedDataToReturn = [];
    dataArr.forEach(data=>{
    if(!collectedDataToReturn.includes(data.foglalkozaJellege)){
        collectedDataToReturn.push(data.foglalkozaJellege)
    }
})
    return collectedDataToReturn;
}
  
  hetnapjaSorCollector() {
    const sorData = {};
    const tulMunkaData = this.parentObj.tulMunkaData();
    function napCollector(weekdayStr) {
      let sortedArray = [];
       sortedArray = tulMunkaData.filter((data) => {
        return GlobalFunctions.weekDayString(data.date) == weekdayStr;
      });
      // a heti adatokat napi szintre lebonjuk a arrivalSortedObj -ba.
      const arrivalSortedObj = {};
      sortedArray.forEach(itemObj =>{
        arrivalSortedObj[itemObj.arrival]?
        arrivalSortedObj[itemObj.arrival].push(itemObj):
        arrivalSortedObj[itemObj.arrival] = [itemObj];
      })

      sorData[weekdayStr] = arrivalSortedObj;
    }
    napCollector("hetfo");
    napCollector("kedd");
    napCollector("szerda");
    napCollector("csutortok");
    napCollector("pentek");
    
    const arrayOfObjToReturn = [];

    Object.keys(sorData).forEach((key) => {
      if (Object.keys(sorData[key]).length) {
        Object.keys(sorData[key]).forEach(tulora=>{
        // a napon belüli objektumok iterációja :
        const dateList = sorData[key][tulora].map((item) =>
          item.date.toLocaleDateString().replaceAll(" ", "")
        );
        const arrival = sorData[key][tulora][0].arrival; // ez még nem teljes!
        // TODO itt, ha több különböző kezdetű óra van, akkor azt külön sorba kell gyűjteni!
        const departure = GlobalFunctions.departureString(
          sorData[key][tulora][0].arrival,
          +sorData[key][tulora][0].hours
        );
        const ellatasjellege = sorData[key][tulora][0].foglalkozaJellege
        //console.log(dateList, arrival, departure,ellatasjellege);
        const finalListItem = new TulmunkaDinamikusSor(
          dateList,
          arrival,
          departure,
          key,
          ellatasjellege,
        );
        arrayOfObjToReturn.push(finalListItem);
      })
    }
    });
    arrayOfObjToReturn.sort((a,b)=>{
      return +a.arrival.replace(':','') - +b.arrival.replace(':','')
  })
    
    return arrayOfObjToReturn
  }

  get render() {
    this.node.id = "tulmunka-orarend";
    this.node.innerHTML = "";
    this.node.innerHTML = `<p class="text-align-center bold">${this.tanev}</p>
    <p class="text-align-center bold">Túlmunka órarend ${this.ev}. év ${this.honap}. hónap</p>`;

    const adatokTablazat = document.createElement("table");
    adatokTablazat.id = "tulmunka-orarend-adatok-tablazat";
    adatokTablazat.innerHTML = `<tbody>
      <tr class="lightgrey-background bold"><td>A tagintézmény neve</td>
        <td>Pedagógus neve</td>
        <td>Feladatellátás</td>
        <td>Elrendelt többletórák száma</td>
        <td>Megjegyzés</td>
      <tr>
        <td class="width-20-percent">
              Csongrád-Csanád Vármegyei Pedagógiai Szakszolgálat Makói Tagintézménye
        </td>
        <td>${this.name}</td>
        <td>${this.feladatEllatas.join(', ')}</td>
        <td>heti ${this.hetiOraszam} óra</td>
        <td>${this.megjegyzes}</td>
      </tr>
    </tbody>
`;
    const orarend = document.createElement("table");
    orarend.classList.add("tulmunka-orarend-tablazat");
    const tbody = document.createElement("tbody");
    tbody.innerHTML = `<tr class="lightgrey-background text-align-center bold">
      <td class="tulmunka-orarend-datum-idopont-oszlop">Dátum: időpont:</td>
      <td id="tulmunka-sor-hetfo" class="tulmunka-orarend-hetnapja">Hétfő</td>
      <td id="tulmunka-sor-kedd" class="tulmunka-orarend-hetnapja">Kedd</td>
      <td class="tulmunka-orarend-hetnapja">Szerda</td>
      <td class="tulmunka-orarend-hetnapja">Csütörtök</td>
      <td class="tulmunka-orarend-hetnapja">Péntek</td>
    </tr>`;

    this.hetnapjaSorok.forEach(sor=>tbody.append(sor.render));

    orarend.append(tbody);

    const lablec = document.createElement("div");
    lablec.id = "tulmunka-orarend-igazgato-munkavallalo-foigazgato";
    lablec.innerHTML = `<div class="tulmunka-orarend-igazgato">igazgató</div>
    <div class="tulmunka-orarend-munkavallalo">munkavállaló</div>
    <div class="tulmunka-orarend-foigazgato">igazgató</div>`;

    const oldalTores = document.createElement("p");
    oldalTores.classList.add("oldal-tores");

    this.node.append(
      adatokTablazat,
      document.createElement("br"),
      orarend,
      lablec,
      oldalTores
    );
    return this.node;
  }

  append() {
    document.getElementById("documents-to-print").append(this.render);
  }
}

class TulmunkaDinamikusSor {
  constructor(dateList, arrival, departure, weekday, feladatEllatas) {
    this.dateList = dateList; //['2023.10.10.','2023.10.14.','2023.10.17.','2023.10.24.']
    this.arrival = arrival; //'09:30'
    this.departure = departure; //'11:30'
    this.weekday = weekday; //'csutortok'
    this.feladatEllatas = feladatEllatas; //'gyógytestnevelési ellátás'

    this.node = document.createElement("tr");
  }

  dateLister() {
    return this.dateList.reduce((accu, item) => {
      return accu + item + "\n";
    }, "");
  }

  get render() {
    this.node.classList.add("dinamikus-tulmunka-orarend-sor");
    this.node.innerHTML = `<td class="tulmunka-orarend-datum-idopont-oszlop">
    ${this.dateLister()}
    ${this.arrival.split(":")[0]}:<sup>${this.arrival.split(":")[1]}</sup>-
    ${this.departure.split(":")[0]}:<sup>${
      this.departure.split(":")[1]
    }<sup></td>
<td class="tulmunka-sor-hetfo">${
      this.weekday == "hetfo"
        ? `Túlmunka<br>tevékenység:<br>(${this.feladatEllatas}i<br>ellátás)`
        : ""
    }</td>
<td class="tulmunka-sor-kedd">${
      this.weekday == "kedd"
        ? `Túlmunka<br>tevékenység:<br>(${this.feladatEllatas}i<br>ellátás)`
        : ""
    }</td>
<td class="tulmunka-sor-szerda">${
      this.weekday == "szerda"
        ? `Túlmunka<br>tevékenység:<br>(${this.feladatEllatas}i<br>ellátás)`
        : ""
    }</td>
<td class="tulmunka-sor-csutortok">${
      this.weekday == "csutortok"
        ? `Túlmunka<br>tevékenység:<br>(${this.feladatEllatas}i<br>ellátás)`
        : ""
    }</td>
<td class="tulmunka-sor-pentek">${
      this.weekday == "pentek"
        ? `Túlmunka<br>tevékenység:<br>(${this.feladatEllatas}i<br>ellátás)`
        : ""
    }</td>`;

    return this.node;
  }

  append() {
    document.getElementById("documents-to-print").append(this.render);
  }
}

//////////////////TESZTELÉS:
let m = new Menu();
m.append();
