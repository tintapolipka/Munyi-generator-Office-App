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

    this.date =
      typeof datesArray[0].date == "object"
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

      toReturn += `<p><span id="datum-${this.index}-${index}">${currentDateStr} </span>${dateObj["hours"]} óra`;

      if (dateObj.string.match(/\d/g)) {
        const hoursInSring = dateObj.string
          .match(/\d/g)
          .reduce((accu, actu) => {
            return accu + +actu;
          }, 0);

        toReturn += ` (${+dateObj["hours"] - hoursInSring} óra ${
          dateObj["string"]
        })`;
      } else {
        toReturn += ` (${dateObj["string"]})`;
      }

      toReturn += `</p>`;
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
      // TODO: Ha a key  CSCSVPSZ,
      //akkor ugyanabba template-be kell beküldeni (.concat-olni a két array-t)
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
              console.log();
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
        templateXXX = new teljesitesiTemplate(currentrawData[key], index, key);
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

    this.monthSrting = new Date(this.dates[0]["date"]).toLocaleString("hu-HU", {
      month: "long",
    });

    this.index = index;
    this.node = document.createElement("div");
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
  <p class="jobbra-zart ">Dátum: ${this.place} ${new Date(
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
      toReturn += dateObj["string"]
        ? ` munkarend átrendezés miatt intézményi óra`
        : `(${dateObj["hours"]} óra)`;
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
    foglalkozasIdeje,
    foglalkozasHelye,
    tulora = false,
    alapfeladat = ""
  ) {
    this.id = Math.trunc(Math.random() * 10000) + "-foglalkozas";

    this.foglalkozasHelye = foglalkozasHelye;
    this.foglalkozasIdeje = foglalkozasIdeje;
    this.foglalkozasTulora = tulora;
    this.intezmenyiOraLesz = false;
    this.alapfeladat = alapfeladat;

    this.idopontInput = this.createInput(`${this.id}-idopont`, "number");
    this.helyszinInput = this.createInput(
      `${this.id}-helyszin`,
      "text",
      "Helyszín"
    );
    this.tuloraCheckBox = this.createInput(`${this.id}-tulora`, "checkbox");
    this.intezmenyiOraCheckBox = this.createInput(
      `${this.id}-intezmenyiOra`,
      "checkbox"
    );
    this.intezmenyiOraCheckBox.addEventListener("change", () => {
      this.intezmenyiOraLesz = this.intezmenyiOraCheckBox.checked;
      this.render;
    });
    this.alapfeladatSelect = this.alapfeladatSelectGenerator();

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
    this.foglalkozasTulora = this.tuloraCheckBox.checked;
    this.render;
  }

  createInput = (id, type, placeHolder) => {
    let input = document.createElement("input");
    input.setAttribute("type", type);
    input.setAttribute("id", id);
    input.classList.add("notToPrint");
    if (input.type === "text") {
      input.placeholder = placeHolder;
    }
    if (input.type === "number") {
      input.min = 1;
      input.max = 8;
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
    }</div>`;
  }

  get render() {
    this.container.classList.add("sor");
    this.container.id = this.id;
    this.container.innerHTML = "";

    if (this.foglalkozasIdeje) {
      this.container.innerHTML = this.idoTemplate;
    } else {
      const idopontOszlop = document.createElement("div");
      idopontOszlop.classList = "orarend-adat idopont-oszlop";
      idopontOszlop.innerText = "Óraszám: ";
      idopontOszlop.append(this.idopontInput);
      idopontOszlop.append(document.createElement("br"));
      idopontOszlop.append("túlóra-e?", this.tuloraCheckBox);

      this.container.appendChild(idopontOszlop);
    }

    const helyszinOszlop = document.createElement("div");
    helyszinOszlop.classList = "orarend-adat helyszin-oszlop";
    if (this.foglalkozasHelye && !this.alapfeladat) {
      helyszinOszlop.innerHTML = `<span>${this.foglalkozasHelye}</span>`;
    } else if (this.foglalkozasHelye && this.alapfeladat) {
      helyszinOszlop.innerHTML = `<span>${this.foglalkozasHelye} - ${this.alapfeladat}</span>`;
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
  constructor(foglalkozasAdatArray = [], nap) {
    this.nap = nap;
    this.node = document.createElement("div");
    this.foglalkozasCollection = {};
    foglalkozasAdatArray.forEach((foglalkozas) => {
      const newNode = new OrarendFoglalkozas(
        foglalkozas[0],
        foglalkozas[1],
        foglalkozas[2],
        foglalkozas[3]
      );
      this.foglalkozasCollection[newNode.id] = newNode;
    });
    this.szababOraSelect = this.szabadOraSelectGenerator();
    this.szababOraNumberInput = this.createSzabadOraNumberInput();
    this.szabadOraBtn = this.createSzabadOraBtn();
    this.munkabaJarasSelect = this.munkabaJarasSelectGenerator();
    this.szabadOraList = this.szabadOraListFromLocalStorage();
  }

  get tuloraSum(){
    const thisWeekday = GlobalFunctions.nameFormatter(this.nap);
    const dataArr = GlobalFunctions.loadFromLocalStorage()['Munyi-Generator-heti-foglalkozasok'][thisWeekday].kotelezoOra;
    if (dataArr.length>0){
         return dataArr.reduce((accu, foglalkozas) => {
          if (foglalkozas[2]) {
            return accu + +foglalkozas[0];
          } else {
            //Nem volt túlóra.
            return 0;
          }
        }, 0);
    }
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
      (this.foglalkozasutazas == "K" || this.foglalkozasutazas == "M/K") &&
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

    ///////////////TODO ////////////////

    return hibaUzenet;
  }

  get szabadOraSum(){
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
    this.node.innerHTML = `<div class="het-napja-fejlec">${this.nap}</div>
    <div class="sor">
      <div class="idopont-fejlec idopont-oszlop">Óraszám</div>
      <div class="helyszin-fejlec helyszin-oszlop">Hely</div>
    </div>`;

    Object.keys(this.foglalkozasCollection).forEach((key, index) => {
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
    let emptyRows = 5 - Object.keys(this.foglalkozasCollection).length;
    while (emptyRows > 0) {
      const sor = document.createElement("div");
      sor.classList.add("sor");
      sor.classList.add("onlyToPrint");
      const idopontOszlop = document.createElement("div");
      idopontOszlop.classList = "orarend-adat idopont-oszlop";
      sor.append(idopontOszlop);
      const helyszinOszlop = document.createElement("div");
      helyszinOszlop.classList = "orarend-adat helyszin-oszlop";
      sor.append(helyszinOszlop);
      this.node.append(sor);

      //console.log("Hozzáadok 1 sort: " + this.nap);
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
    const newNode = new OrarendFoglalkozas();
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
      "hétfő"
    );
    this.kedd = new OrarendNap(
      this.loadFromLocaleStorage().kedd.kotelezoOra,
      "kedd"
    );
    this.szerda = new OrarendNap(
      this.loadFromLocaleStorage().szerda.kotelezoOra,
      "szerda"
    );
    this.csutortok = new OrarendNap(
      this.loadFromLocaleStorage().csutortok.kotelezoOra,
      "csütörtök"
    );
    this.pentek = new OrarendNap(
      this.loadFromLocaleStorage().pentek.kotelezoOra,
      "péntek"
    );
    
    this.teljeshet = document.createElement("div");
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
    )

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
    this.teljeshet = new OrarendHet(this.parentObject.BasicDataForm.name,this.parentObject.BasicDataForm.date);
    this.node = document.createElement("div");

    this.dateSelect = this.dateSelectGenerator();
    this.hetiHibaUzenet = document.createElement("p");
  }

  dateSelectGenerator(){
    const selectElement = document.createElement("select");
    const allDatesArr = Object.keys(
      JSON.parse(localStorage["Munyi-generator"])[
        GlobalFunctions.nameFormatter(this.parentObject.BasicDataForm.name)
      ]
    );
    selectElement.innerHTML = `<option value="">Válassz...</option>`
    allDatesArr.forEach((date) => {
      selectElement.innerHTML += `<option value="${date}">${date}</option>`;
    });

    selectElement.addEventListener("change", () => {
      if(this.dateSelect.value){
      const dataToUse = GlobalFunctions.loadFromLocalStorage(this.parentObject.BasicDataForm.name,this.dateSelect.value)["Munyi-Generator-heti-foglalkozasok"];
      console.log("dataToUse:", dataToUse)
      GlobalFunctions.saveToLocalStorage(
        this.parentObject.BasicDataForm.name,
        this.parentObject.BasicDataForm.date,
        "Munyi-Generator-heti-foglalkozasok",
        dataToUse
      )
      delete this;
      this.parentObject.OrarendSablon = new OrarendSablon(this.parentObject.BasicDataForm.name,this.parentObject.BasicDataForm.date, this.parentObject);
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
    if(!this.hetiOraszam)
    {const selectSection = document.createElement('section');
   selectSection.innerText = "Más keltezésű órarend használata:"
   selectSection.classList.add('notToPrint');
   selectSection.append(this.dateSelect);
   this.node.append(selectSection)}

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
    fejlec.innerHTML = `    <h1 id="orarend-header-h1" class="orarend-header-h1">Csongrád Megyei Pedagógiai Szakszolgálat Makói Tagintézménye <br/> 6900 Makó, Vásárhelyi u. 1-3.</h1>
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
    footer.innerHTML = `<div class="orarend-keltezes">Makó, ${this.dateObj.toLocaleString(
      "hu-HU",
      { month: "numeric", year: "numeric", day: "numeric" }
    )}</div>
    <div class="alairasok">
        <div id="orarend-alairas-igazgato" class="orarend-alairas">igazgató</div>
        <div class="orarend-pecset-helye">P.H</div>
        <div class="orarend-alairas">dolgozó</div>
    </div>`;
    this.node.append(footer);

    const valtozasMentes = document.createElement("button");
    valtozasMentes.innerText = "Órarend változásainak mentése";
    valtozasMentes.id = "orarend-valtozasainak-mentese";
    valtozasMentes.classList.add("notToPrint");
    valtozasMentes.addEventListener("click", (e) => {
      this.teljeshet.putToLocalStorage();
      const hetiOraszamEllenorzo = () => {
        const hetiSzabadOra = this.teljeshet.hetfo.szabadOraSum+
        this.teljeshet.kedd.szabadOraSum+
        this.teljeshet.szerda.szabadOraSum+
        this.teljeshet.csutortok.szabadOraSum+
        this.teljeshet.pentek.szabadOraSum;
        
        let popUp = ``;

        if(hetiSzabadOra != 11
          ){popUp += `\n¤ A heti 32 órához 11 óra nem kötelező órát is ki kell választani, de jelenleg csak ${hetiSzabadOra} van összesen!`}

        if (this.hetiOraszam > 21) {
          popUp += `\n¤ a heti kötelező óraszám nem haladhatja meg a 21 órát!`;
        } else if (this.hetiOraszam < 21) {
          popUp += `\n¤ a heti kötelező óraszám nem lehet kevesebb mint 21 óra! Kivételt csak félállás (11 kötelező óra) jelenthet!`;
        }
        
        if(popUp){popUp ='A TELJES HÉTEN a következő problémát találtuk:'+popUp;
        alert(popUp);
      };
        return popUp;
      };
      this.hetiHibaUzenet.innerText =
        this.teljeshet.hetfo.napEllenorzese() +
        this.teljeshet.kedd.napEllenorzese() +
        this.teljeshet.szerda.napEllenorzese() +
        this.teljeshet.csutortok.napEllenorzese() +
        this.teljeshet.pentek.napEllenorzese() +
        hetiOraszamEllenorzo();
      this.render;

      alert("Órarend változásai a gépre mentve.");
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
    // if (!localStorage["Munyi-Generator-alapAdatok"]) {
    //   localStorage.setItem("Munyi-Generator-alapAdatok", "{}");
    // }
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

    this.allDataAvailable = this.name !='dolgozó neve' && this.munkakor !='munkakör' && this.date;
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
    this.indok = kivetelArr[1];
    this.tipus = kivetelArr[2];

    this.valid = true;

    this.node = document.createElement("p");
    this.deleteBtn = this.createDeleteBtn();
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
      this.node.innerText = `${this.date}: ${this.indok} `;

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
    this.munkanapInput = this.inputGenerator("szombat", "radio", false);
    this.munkanapSelect = this.selectGenetator(this.hetnapjai);
    this.idopontInput = this.inputGenerator("datum", "date");
  }

  saveToLocalStorage() {
    const munyiKivetelArr = this.allMunyiKivetel.map((exception) => {
      return [exception.date, exception.indok, exception.tipus];
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
          return [exception.date, exception.indok, exception.tipus];
        })
      )
    );
  }

  getFromLocalStorage() {
    const allData = GlobalFunctions.loadFromLocalStorage();
    const currentDate = new Date(this.parentObject.BasicDataForm.date);
    const relevantExc = exceptions.filter((exception)=>{
      const exceptionDateObj = new Date(exception[0]);
      if(exceptionDateObj.getFullYear()==currentDate.getFullYear() && exceptionDateObj.getMonth() == currentDate.getMonth()){
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
    "fizetés nélküli szabadság",
    "munkaszüneti nap",
    "szabadnap",
    "szülési szabadság (a távollét 31. napjáig)",
    "szakértői nap",
    "ünnepnap"
  ];
  get ledolgozhatoOrak() {
    const dateString = GlobalFunctions.weekDayString(this.idopontInput.value);
    return GlobalFunctions.loadFromLocalStorage()[
      "Munyi-Generator-heti-foglalkozasok"
    ][dateString]["kotelezoOra"].map((ora) => ora[0] + " óra " + ora[1]);
  }

  get kiveteldatuma() {
    return this.idopontInput.value;
  }

  get tavolletTipusa() {
    return this.tavolletOkaListaArr[this.tavolletTipusSelect.value];
  }

  get kiveteltipusa() {
    return this.tavolletInput.checked
      ? "tavollét"
      : this.intezmenyiOraInput.checked
      ? "kinti óra ledolgozása"
      : "munkanap áthelyezés";
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
    } else {
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

  setObsolate(){
    this.parentObject.isObsolate = true;
    //alert("Menu is obsolate!");
  }

  kivetelObjGenerator(datum_indokArr = []) {
    const kivetelArrToReturn = this.allMunyiKivetel ? this.allMunyiKivetel : [];
    datum_indokArr.forEach((kivetel) => {
      const kivetelObj = new MunyiKivetel([kivetel[0], kivetel[1], kivetel[2]]);
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

  firstRun(){
    if(!localStorage['Munyi-Generator-alapAdatok']){
       localStorage['Munyi-Generator-alapAdatok'] = '{"name":"dolgozó neve","munkakor":"munkakör","date":"2023-09-01"}';
    }
    if(!localStorage['Munyi-generator']){
      localStorage['Munyi-generator'] = '{"Munyi-Generator-kivetelek":[],"Munyi-Generator-heti-foglalkozasok":{"hetfo":{"kotelezoOra":[],"szabadOra":{}},"kedd":{"kotelezoOra":[],"szabadOra":{}},"szerda":{"kotelezoOra":[],"szabadOra":{}},"csutortok":{"kotelezoOra":[],"szabadOra":{}},"pentek":{"kotelezoOra":[],"szabadOra":{}}},"Munyi-Generator-alapAdatok":{"name":"dolgozó neve","munkakor":"munkakör","date":"2023-09-01"}}';
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
    
    if(!this.BasicDataForm.allDataAvailable)
        {navNyomtatas.classList.add("inactive");}
     

    navNyomtatas.innerHTML = `<span>🖨️</span>Nyomtatás`;
    navNyomtatas.addEventListener("click", () => {
      // A printlister-t rendereltetem, hogy kiszámolja hány teljesítés áll rendelkezésre
      this.PrintLister.render;
      if(this.BasicDataForm.allDataAvailable && this.PrintLister.allTeljesitesiToPrint.length>0 && this.PrintLister.allDocumentsToPrint.length>0){
      this.collapseAll();
      this.PrintLister.active = true;
      this.render;} else {
        alert('Nincs nyomtatható dokumentum!')
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
    bejelentkezve.innerText = this.BasicDataForm.name !="dolgozó neve"
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

  setNotObsolate(){
    if(this.isObsolate){
      delete this.MuNyiTemplate;
      this.MuNyiTemplate = new MuNyiTemplate(this.BasicDataForm.name,this.BasicDataForm.date,this);
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
        if(this.BasicDataForm.allDataAvailable){
        this.collapseAll();
        this.MuNyiTemplate.active = !this.MuNyiTemplate.active;
        this.render;}
      });
      return link;
    },
  };

  sortingFunctions = {
    teljesitesiData: {},

    iterateDates: () => {
      const startDate = new Date(this.BasicDataForm.date);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      let currentDate = startDate;

      let currentDay = startDay;
      while (currentDate.getMonth() == startMonth && currentDay < 32) {
        //kivételek kezelése
        const dateString =
          startYear +
          "-" +
          (startMonth + 1 < 10 ? "0" + (startMonth + 1) : startMonth + 1) +
          "-" +
          (currentDay < 10 ? "0" + currentDay : currentDay);

        const kivetel = this.sortingFunctions.kivetelTartalma(dateString);

        if (kivetel) {
          console.log("Kivétel kezelése: ", currentDate);
        }
        //szortírozás órarend szerint
        else {
          //console.log("szortírozás órarend szerint:", currentDate);
          this.sortingFunctions.helyszinListazo(dateString);
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
      const kivetelLista =
        GlobalFunctions.loadFromLocalStorage()["Munyi-Generator-kivetelek"];
      let toReturn = "";
      kivetelLista.forEach((kivetel) => {
        if (kivetel[0] == dateString) {
          // Itt lehet csinálni valamit a találattal
          if (kivetel[2] == "kinti óra ledolgozása") {
            if (!this.sortingFunctions.teljesitesiData["CSCSVPSZ"]) {
              this.sortingFunctions.teljesitesiData["CSCSVPSZ"] = [];
            }
            this.sortingFunctions.teljesitesiData["CSCSVPSZ"].push({
              date: kivetel[0],
              hours: kivetel[1].match(/\d+/)[0],
              string:
                kivetel[1]
                  .split(" óra ")[1]
                  .split(/\d{4}/)[0]
                  .trim()
                  .match(/.+[^,;]/)[0] + " intézményi óra",
            });
            const helyszin = kivetel[1].split(" óra ")[1];

            if (!this.sortingFunctions.teljesitesiData[helyszin]) {
              this.sortingFunctions.teljesitesiData[helyszin] = [];
            }
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

          toReturn = kivetel;
        }
      });
      return toReturn;
    },

    helyszinListazo: (datum_str) => {
      let nap = GlobalFunctions.weekDayString(datum_str);

      if (nap == "szombat" || nap == "vasarnap") {
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
              string: foglalkozas[3],
            })
          : (objToReturn[foglalkozas[1]] = [
              {
                date: datum_str,
                hours: foglalkozas[0],
                string: foglalkozas[3],
              },
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
    this.date = new Date(date); //date obj
    this.kotelezoOra = kotelezoOra; //num
    this.kotelezoOraToCount = this.kotelezoOra;
    this.kivetel = kivetel; //boolean
    this.kivetelOk = kivetelOk; //string
    this.tulora = tulora; //num
    this.szabadOraObj = szabadOraObj; //{'1.':1,'3.':3,'4.':4,'6.':6, '8.':8, '10.':10, '11.':11, '14.':14, 'szakértői nap':100}
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

    if (kivetelOk == "tanítás nélküli munkanap") {
      this.szabadOraObj = { "11.": this.kotelezoOra };
      this.kotelezoOra = 0;
      this.tulora = 0;
    }

    if (kivetelOk == "szakértői nap") {
      this.szakertoiNapOra = this.kotelezoOra;
      this.kotelezoOra = 0;
      this.tulora = 0;
      this.szabadOraObj = {};
      this.utazasiKoltseg = "";
    }
    if (kivetelTipus == "kinti óra ledolgozása" ) {
      this.kivetelOk = "";
    }
    if(this.kivetelOk == "ünnepnap"){
      this.kivetelOk = "hetvege";
      
    }
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
  constructor(name,date,parentObj) {
    this.active = false;
    this.parentObject = parentObj;
    this.name = name? name : parentObj.BasicDataForm.name;
    this.date = date? new Date(date) : new Date(parentObj.BasicDataForm.date);

    this.node = document.createElement("div");

    this.sortingFunctions.iterateDates();
  }

  munkanapPotlas(kivetelArr_2){
    const munkanap = GlobalFunctions.nameFormatter(kivetelArr_2.replace(/i munkanap pótlása/,''))
    const utazas = this.parentObject.OrarendSablon.teljeshet[munkanap].foglalkozasutazas;
    const kotelezoOra = this.parentObject.OrarendSablon.teljeshet[munkanap].napiOraszam;
    const szabadOraObj = this.parentObject.OrarendSablon.teljeshet[munkanap].szabadOraList;
    const tulora = this.parentObject.OrarendSablon.teljeshet[munkanap].tuloraSum;
    return [kotelezoOra,
      szabadOraObj,
      tulora,
      utazas];
}

  get printable() {
    return this.name && this.date != "Invalid Date";
  }

  get koviHonapElsoMunkanap() {
    const jovoHonapElsoNapja = (thisDotDate) => {
      return (
        thisDotDate.getFullYear() +
        "." +
        (thisDotDate.getMonth() + 2>11? 1 :thisDotDate.getMonth()) +
        "." +
        "1"
      );
    };

    let dayToTry = new Date(jovoHonapElsoNapja(this.date));

    const okDay = (day) => {
      if (!this.sortingFunctions.kivetelTalalo(day)) {
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

    kivetelTalalo(dateObj) {
      const currentDate = dateObj;
      let toReturn = false;
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
          console.log("Kivételt találtunk: " + currentDate);
          toReturn = true;
        }
      });
      if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
        toReturn = true;
      }
      return toReturn;
    },

    iterateDates: () => {
      const startDate = new Date(this.date);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      let currentDate = startDate;

      let currentDay = startDay + 1;
      while (currentDate.getMonth() == startMonth && currentDay < 32) {
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
        if (!kivetel && (weekdayStr == "vasarnap" || weekdayStr == "szombat") && kivetelTipus != "munkanap áthelyezés") {
          kivetel = true;
          kivetelOk = "hetvege";
          kivetelTipus = "hetvege";
        }

      let szabadOraObj,tulora,utazas,kotelezoOra;
      
      if(/munkanap pótlása/.test(kivetelOk)){
        [kotelezoOra, szabadOraObj, tulora,utazas]  = this.munkanapPotlas(kivetelOk);
        kivetelOk = '';
      } else {
        const adat =
          GlobalFunctions.loadFromLocalStorage()[
            "Munyi-Generator-heti-foglalkozasok"
          ][weekdayStr];
        kotelezoOra = adat?.kotelezoOra.reduce((accu, ora) => {
          return accu + +ora[0];
        }, 0);
        szabadOraObj = adat ? adat.szabadOra : {};
        tulora = this.sortingFunctions.tuloraAznap(currentDate);
        utazas = adat ? adat.munkabaJaras : "";
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
      const datumObj = new Date(date);
      const datumString = datumObj
        .toLocaleString("hu-HU", { weekday: "long" })
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const basicData = JSON.parse(localStorage["Munyi-Generator-alapAdatok"]);

      const relevansFoglalkozasArr =
        datumObj.getDay() > 0 && datumObj.getDay() < 6
          ? GlobalFunctions.loadFromLocalStorage(
              basicData.name,
              basicData.date
            )["Munyi-Generator-heti-foglalkozasok"][datumString].kotelezoOra
          : null;

      if (relevansFoglalkozasArr) {
        return relevansFoglalkozasArr.reduce((accu, foglalkozas) => {
          if (foglalkozas[2]) {
            return accu + +foglalkozas[0];
          } else {
            //Nem volt túlóra.
            return 0;
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
            <div class="width-50 right-border">kezd.</div>
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
      (accu, actu) => accu + actu.szabadOraSumma,
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

  //// IDÁIG PRÓBA ////////////////////

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
        selectElement.innerHTML += `<option value="${date}">${date}</option>`;
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

//////////////////TESZTELÉS:
let m = new Menu();
m.append();
