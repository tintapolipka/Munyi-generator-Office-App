class Proba {
  constuctor() {
    this.allTeljesitesiToPrint = [];
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
          location: teljesitesiObj.place,
        });
      }
    );

    this.allTeljesitesiToPrint = arrToReturn.filter((item) => {
      return item.object.printable;
    });
  }

  teljesitesiPreview() {
    const preview = document.createElement("div");
    preview.id = "documents-to-print";
    preview.classList.add("onlyToPrint");

    this.allTeljesitesiToPrint.forEach((document) => {
      if (document.listItem.active) {
        preview.append(document["object"].render);
      }
    });
  }
  //// INNEN PRÓBA ////////////////////
}
