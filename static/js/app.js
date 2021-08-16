class GoldStars {
  constructor(baseURL, baseImgURL, streamer=null, stars=null) {
    this.baseURL = baseURL;
    this.baseImgURL = baseImgURL;

    this.e = {
      'menuButton' : document.querySelector('#menu-button'),
      'menu' : document.querySelector('#menu'),
      'screenBlocker' : document.querySelector('#screen-blocker'),
      'addPerson' : document.querySelector('#add-person'),
      'playButton' : document.querySelector('#volume-play-button'),
      'volumeSlider' : document.querySelector('#volume'),
      'volumeToggle' : document.querySelector('#volume-toggle'),
      'booba' : new Audio('../static/audio/booba-faster.mp3?v=1'),
      'yay' : new Audio('../static/audio/yay.mp3?v=1'),
      'suck' : new Audio('../static/audio/you-suck.mp3?v=1'),
      'layoutToggle' : document.querySelector('#layout-toggle'),
      'orientationText' : document.querySelector('#orientation-text'),
      'confettiToggle' : document.querySelector('#confetti-toggle')
    };

    if (!starPage) return;

    // StarPage specifics

    this.streamer = streamer;
    this.stars = stars;

    let starPageElements = {
      'main' : document.querySelector('#main'),
      'popupContainer' : document.querySelector('.popup-container'),
      'popup' : document.querySelector('.popup'),
      'popupCloseBtn' : document.querySelector('.close'),
      'popupTitle' : document.querySelector('.popup-title'),
      'updateForm' : document.querySelector('#update-form'),
      'nameInput' : document.querySelector('#form-name'),
      'colourLabel' : document.querySelector('#form-colour-label'),
      'colourInput' : document.querySelector('#form-colour'),
      'twColours' : document.querySelector('#tw-colours'),
      'starList' : document.querySelector('#form-stars'),
      'deletePerson' : document.querySelector('#form-delete'),
      'hiddenId' : document.querySelector('#form-id'),
      'doneInput' : document.querySelector('#form-done'),
      'editButtons' : document.querySelectorAll('.edit'),
      'controls' : document.querySelectorAll('.controls'),
      'tables' : document.querySelectorAll('.star-table'),
      'nav' : document.querySelector('nav'),
      'mainExplosion' : document.querySelector('.explosion-svg'),
      'crashClapWrap' : document.querySelector('#crashClap-wrap'),
      'loading' : document.querySelector('#loading')
    }

    this.e = {...this.e, ...starPageElements};

    this.twPallet = {
      'Red': 'ff0000',
      'Blue': '0000ff',
      'Green': '008000',
      'Firebrick': 'b22222',
      'Coral': 'ff7f50',
      'Yellow Green': '99cd32',
      'Orange Red': 'ff4400',
      'Sea Green': '2e8b56',
      'Goldenrod': 'daa520',
      'Chocolate': 'd26a1e',
      'Cadet Blue': '5f9ea0',
      'Dodger Blue': '1e90ff', // 1e8fff
      'Hot Pink': 'ff69b4',
      'Blue Voilet': '8a2be2',
      'Spring Green': '00ff80'
    };

    this.addRemoveListenerData = [];
    this.controlsClickable = true;

    this.MAX_STAR_COUNT = 999999;
    this.MIN_STAR_COUNT = 1;

    this.crashAnimComplete = true;

    if (authenticated) {
      this.baseTr = this.htmlToElement(authedTr);
    }
  }

  htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  setFormNameColour(colour) {
    this.e.nameInput.style.color = colour;
  }

  deselectTwColourIfSelected() {
    let currentlyChecked = this.e.twColours.querySelector('.tw-colour:checked');
    if (currentlyChecked === null) return;
    this.e.twColours.querySelector('.tw-colour:checked').checked = false;
  }

  selectTwColourIfExists(nameColour) {
    let radio = document.getElementById(nameColour.substring(1));
    if (radio !== null) {
      radio.checked = true;
    } else {
      this.deselectTwColourIfSelected();
    }
  }

  onColourInputOrChange(ev) {
    this.setFormNameColour(ev.target.value);
    this.selectTwColourIfExists(ev.target.value);
  }

  startColourInputListeners() {
    let bind = this.onColourInputOrChange.bind(this);
    this.e.colourInput.addEventListener('input', bind);
    this.e.colourInput.addEventListener('change', bind);
  }

  editNameAndColour(tr) {
    let personName = tr.querySelector('.person-name');
    let nameColour = personName.getAttribute('style').match(/color:\s*(#[A-Fa-f0-9]{6});/)[1];
    this.e.nameInput.style.color = nameColour;
    this.e.nameInput.value = personName.innerText;
    this.selectTwColourIfExists(nameColour);
    this.e.colourInput.value = nameColour;
  }

  starSelect(starName) {
    let starToSelect = this.e.starList.querySelector('#' + starName);
    starToSelect.checked = true;
  }

  openEditPopup(tr) {
    this.e.popup.classList.add('edit-popup');
    // Set Title
    this.e.popupTitle.innerText = 'Edit Person';
    this.editNameAndColour(tr);
    // Star Selection
    let starName = tr.querySelector('.star').getAttribute('data-star-name');
    this.starSelect(starName);
    // Set hidden id input
    this.e.hiddenId.value = tr.id;
    // Show "Delete Person"
    this.e.deletePerson.classList.remove('display-none');
    // Reveal
    this.e.popupContainer.classList.remove('display-none');
    let scrollToThis = this.e.starList.querySelector('#' + starName + '-label');
    scrollToThis.closest('.selectable').scrollIntoView();
    this.e.main.overflowY = 'auto';
  }

  addNameAndColour() {
    this.e.nameInput.style.color = '#000000';
    this.e.nameInput.value = '';
    this.e.colourInput.value = '#000000';
  }

  openAddPopup() {
    this.e.popup.classList.add('add-popup');
    // Set Title
    this.e.popupTitle.innerText = 'Add Person';
    this.addNameAndColour();
    // Select first Star
    this.starSelect(this.stars[0]);
    // If Twitch Colour is selected, deselect
    this.deselectTwColourIfSelected();
    // Set hidden id input
    this.e.hiddenId.value = '0';
    // Hide "Delete Person"
    this.e.deletePerson.classList.add('display-none');
    // Reveal
    this.e.popupContainer.classList.remove('display-none');
    this.e.starList.scrollTop = 0;
    this.e.main.overflowY = 'hidden';
  }

  popupOpenListeners(editButtons) {
    // editButtons is only passed when a new table is added via js
    if (!editButtons) {
      if (authenticated && emptyRecords) this.openAddPopup();
      // editButtons are null if we arent authenticated
      if (this.e.editButtons === null) return;
    }
    let buttons = editButtons || this.e.editButtons;
    buttons.forEach((editButton) => {
      editButton.addEventListener('click', (ev) => {
        let id = ev.target.closest('tr').id;
        let tr = ev.target.closest('tr');
        if (id !== '') { this.openEditPopup(tr) } else { this.openAddPopup() };
      });
    })
  }

  closePopup() {
    this.e.popupContainer.classList.add('display-none');
    // clear .add-popup, .edit-popup
    this.e.popup.setAttribute('class', 'popup');
    this.e.main.overflowY = 'auto';
  }

  popupCloseListener() {
    var self = this;

    this.e.popupCloseBtn.addEventListener('click', () => {
      self.closePopup.call(self);
    });

    this.e.popupContainer.addEventListener('click', (ev) => {
      if (
        ev.target.classList.contains('simplebar-content-wrapper')
        || ev.target.classList.contains('popup-wrapper') // for 10px margin
      ) {
        self.closePopup.call(self);
      }
    });
  }
  
  getUpdateFormValues() {
    let vals = {};
    vals['form-name'] = document.querySelector('#form-name').value;
    vals['form-colour'] = document.querySelector('#form-colour').value;
    vals['form-id'] = parseInt(document.querySelector('#form-id').value);
    vals['form-star'] = document.querySelector('#update-form .form-star:checked').value;
    return vals;
  }

  updatePerson(vals) {
    this.showLoading();
    return fetch(this.baseURL + '/api/update', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          "update-schema" : true,
          "streamer" : this.streamer,
          "_id" : vals["form-id"],
          "values" : {
            "name" : vals["form-name"],
            "star" : vals["form-star"],
            "color": vals["form-colour"]
          }
        }
      )
    });
  }

  checkForErrors(response) {
    if (response.status === 403) {
      window.alert('Login token expired! Your last action was not saved. Please re-log.');
      document.cookie = 'jwt' + "=;expires=" + new Date(0).toUTCString();
      window.location = window.location
      return true;
    } else if (response.status !== 200) {
      alert('Something went wrong in the backend. Data was not saved!');
      return true;
    }
    return false;
  }

  scrollHandler() {
    sessionStorage.setItem('scrollTo', this.e.main.scrollTop);
    window.location = window.location;
  }

  getNewRecord(lastRecordTr) {
    let newRecordDataIndex;
    if (lastRecordTr === null) {
      newRecordDataIndex = 0;
    } else {
      newRecordDataIndex = parseInt(lastRecordTr.getAttribute('data-row-index')) + 1;
    }
    return [document.querySelector('[data-row-index="'+newRecordDataIndex+'"]'), newRecordDataIndex];
  }

  moveLastRecordClass(lastRecordTr, newRecordTr) {
    if (lastRecordTr !== null) {
      lastRecordTr.classList.remove('last-record');
    }
    newRecordTr.classList.add('last-record');
  }

  rePaintRecord(recordTr, data, add) {
    // Name
    let personName = recordTr.querySelector('.person-name');
    personName.setAttribute('style', 'color: ' + data.color + ';');
    personName.innerText = data.name;
    // Star Img
    let starImg = recordTr.querySelector('.star');
    starImg.setAttribute('src', baseImgURL + '/stars/' + data.star + '.svg');
    starImg.classList.remove('placeholder');
    starImg.classList.add(data.star);
    starImg.setAttribute('data-star-name', data.star);
    // Amount
    if (!add) return;
    let amount = recordTr.querySelector('.amount');
    amount.innerText = 'x 1';
  }

  createNewTable(newRecordDataIndex) {
    let table = document.createElement('table');
    table.classList.add('star-table');
    for (let i = 0; i < recordsPerTable; i++) {
      let tr = this.baseTr.cloneNode(true);
      newRecordDataIndex++;
      tr.setAttribute('data-row-index', newRecordDataIndex);
      tr.querySelector('.rank').innerText = '#' + (newRecordDataIndex+1);
      table.appendChild(tr);
    }
    let editButtons = table.querySelectorAll('.edit');
    this.popupOpenListeners(editButtons);
    this.e.main.appendChild(table);
  }

  createNewTableIfNeeded(newRecordDataIndex) {
    let recordsCount = newRecordDataIndex+1;
    let initialThreeTablesFull = recordsCount >= recordsPerTable*3;
    if (initialThreeTablesFull && recordsCount % recordsPerTable === 0) {
      this.createNewTable(newRecordDataIndex);
    }
  }

  boobaExplosion(tr) {
    this.playSound('booba');
    this.showExplosion(tr);
  }

  showLoading() {
    this.e.loading.classList.remove('display-none');
  }

  hideLoading() {
    this.e.loading.classList.add('display-none');
  }

  addNewRecord(data) {
    let lastRecordTr = document.querySelector('.last-record') || null;
    let newRecord = this.getNewRecord(lastRecordTr);
    let newRecordTr = newRecord[0];
    let newRecordDataIndex = newRecord[1];
    this.moveLastRecordClass(lastRecordTr, newRecordTr);
    newRecordTr.setAttribute('id', data._id);
    this.rePaintRecord(newRecordTr, data, true);

    // add + remove listeners
    let controls = newRecordTr.querySelector('.controls');
    this.addRemoveListener(controls, newRecordDataIndex, newRecordTr);

    this.createNewTableIfNeeded(newRecordDataIndex);
    this.closePopup();
    this.hideLoading();
    this.scrollToPersonIfNeeded(newRecordTr);
    this.boobaExplosion(newRecordTr);
  }

  updateRemoveListenerData(recordTr, data) {
    let dataRowIndex = recordTr.getAttribute('data-row-index');
    let arlData = this.addRemoveListenerData[parseInt(dataRowIndex)];
    arlData.name = data.name;
    arlData.star = data.star;
    arlData.colour = 'color: ' + data.color + ';';
  }

  editRecord(data) {
    let recordID = this.e.updateForm.querySelector('#form-id').value;
    let recordTr = document.getElementById(recordID);
    this.rePaintRecord(recordTr, data, false);
    this.closePopup();
    this.hideLoading();
    this.boobaExplosion(recordTr);
    this.updateRemoveListenerData(recordTr, data);
  }

  updateSubmitListener() {
    this.e.updateForm.addEventListener('submit', (ev) => {
      ev.preventDefault();

      let vals = this.getUpdateFormValues();

      this.updatePerson(vals)
      .then(response => {
        if (this.checkForErrors(response)) return null;
        return response.json();
      })
      .then(data => {
        if (data === null) return;
        if (this.e.popup.classList.contains('edit-popup')) {
          this.editRecord(data);
        } else {
          this.addNewRecord(data);
        }
      });
    });
  }

  deletePerson(id) {
    return fetch(this.baseURL + '/api/delete', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "delete-schema": true,
        "streamer": this.streamer,
        "_id" : parseInt(id)
      })
    });
  }

  deletePersonListener() {
    this.e.deletePerson.addEventListener('click', (ev) => {
      ev.preventDefault();
      let confirmed = window.confirm('Are you sure?');
      if (confirmed) {
        this.deletePerson(this.e.hiddenId.value)
        .then(response => {
          if (this.checkForErrors(response)) return null;
          return response.json();
        })
        .then(data => {
          if (data === null) return;
          this.scrollHandler();
        });
      }
    });
  }

  createSelectableWrapper() {
    let wrapper = document.createElement('div');
    wrapper.classList.add('selectable');
    return wrapper;
  }

  createRadioBtn(idAndVal, nameAndClass) {
    let radio = document.createElement('input');
    radio.setAttribute('id', idAndVal);
    radio.setAttribute('name', nameAndClass);
    radio.setAttribute('class', nameAndClass);
    radio.setAttribute('type', 'radio')
    radio.setAttribute('value', idAndVal);
    return radio;
  }

  createHiddenRadio(idAndVal, nameAndClass) {
    let radio = this.createRadioBtn(idAndVal, nameAndClass);
    radio.classList.add('hidden-input');
    return radio;
  }

  createRadioLabel(id, title, labelContents) {
    let label = document.createElement('label');
    label.setAttribute('id', id + '-label');
    label.setAttribute('for', id);
    label.setAttribute('title', title);
    label.appendChild(labelContents);
    return label;
  }

  createRadioLabelDiv(colour) {
    let div = document.createElement('div');
    div.setAttribute('class', 'tw-colour-label-div');
    div.setAttribute('style', 'background: #' + colour);
    return div;
  }

  populateTwPallet() {
    Object.keys(this.twPallet).forEach((cTitle) => {
      let wrapper = this.createSelectableWrapper();
      let colour = this.twPallet[cTitle];
      let radio = this.createHiddenRadio(colour, 'tw-colour');
      let radioContents = this.createRadioLabelDiv(colour);
      let radioLabel = this.createRadioLabel(colour, cTitle, radioContents);
      wrapper.appendChild(radio);
      wrapper.appendChild(radioLabel);
      this.e.twColours.appendChild(wrapper);
    });
  }

  startTwPalletListener() {
    this.e.twColours.addEventListener('change', (ev) => {
      let colour = '#' + ev.target.value;
      this.e.nameInput.style.color = colour;
      this.e.colourInput.value = colour;
    });
  }

  createRadioLabelImg(star) {
    let img = document.createElement('img');
    img.setAttribute('src', baseImgURL + '/stars/' + star + '.svg');
    img.setAttribute('alt', star + ' star');
    return img;
  }

  populateStarList() {
    this.stars.forEach((star) => {
      if (star === 'placeholder') return;
      let wrapper = this.createSelectableWrapper();
      let radio = this.createHiddenRadio(star, 'form-star');
      let labelContents = this.createRadioLabelImg(star);
      let radioLabel = this.createRadioLabel(star, star+' star', labelContents);
      wrapper.appendChild(radio);
      wrapper.appendChild(radioLabel);
      this.e.starList.appendChild(wrapper);
    });
    new SimpleBar(document.getElementById('form-stars'));
  }

  updateStarCount(item, inc) {
    return fetch(this.baseURL + '/api/starcount', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "starcount-schema": true,
        "streamer": this.streamer,
        "_id" : parseInt(item["_id"]),
        "inc" : inc
      })
    });
  }

  controlButtonIsActiveElement() {
    return (
      document.activeElement.classList.contains('add') ||
      document.activeElement.classList.contains('remove')
    );
  }

  stopButtonClick(ev) {
    let btn = ev.target.closest('button');
    if (!btn) {
      return;
    } else if (
      btn.classList.contains('add') || 
      btn.classList.contains('remove')) {
      ev.preventDefault();
    }
  }

  makeControlsUnClickable() {
    this.controlsClickable = false;
    document.body.classList.add('block-focus');
    document.body.addEventListener('click', this.stopButtonClick, {capture:true});
  }

  makeControlsClickable() {
    this.controlsClickable = true;
    if (this.controlButtonIsActiveElement()) { document.activeElement.blur(); };
    document.body.classList.remove('block-focus');
    document.body.removeEventListener('click', this.stopButtonClick, {capture:true});
  }

  resetAnimation(el, cl, makeClickable=false) {
    el.classList.remove(cl);
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
    if (makeClickable) this.makeControlsClickable();
  }

  blinkAnimation(green=true, tr) {
    let type = green ? 'greenBlink' : 'redBlink';
    tr.addEventListener('animationend', () => {
      this.resetAnimation(tr, type, true);
    }, {'once': true});
    tr.classList.add(type);
  }

  clickedAndGainedRank(item, newRowIndex) {
    return (item.clicked && item.rowIndex > newRowIndex);
  }

  clickedAndDroppedRank(item, newRowIndex) {
    return (item.clicked && item.rowIndex < newRowIndex);
  }

  paintRowItemData(tr, item) {
    tr.id = item._id;
    let personName = tr.querySelector('.person-name');
    personName.setAttribute('style', item.colour);
    personName.innerText = item.name;
    let star = tr.querySelector('.star');
    star.setAttribute('class', 'star');
    star.classList.add(item.star);
    star.setAttribute('src', baseImgURL + '/stars/' + item.star + '.svg');
    star.setAttribute('data-star-name', item.star);
    tr.querySelector('.amount').innerText = 'x ' + item.amount;
  }

  blurButton() {
    /* Blurs the add or remove button if the data in its
    row is going to be repainted */
    if (this.controlButtonIsActiveElement()) {
      let tr = document.activeElement.closest('tr');
      let rowIndex = parseInt(tr.getAttribute('data-row-index'));
      let newRowIndex = this.addRemoveListenerData[rowIndex].rowIndex;
      if (rowIndex !== newRowIndex) {
        document.activeElement.blur();
      }
    }
  }

  playSound(name, skip=0) {
    if (this.volumeMuted) return;
    let audioControl = this.e[name];
    audioControl.currentTime = skip;
    audioControl.play();
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  throwConfetti(duration, conf, xyList, intervalMs) {
    if (!this.confettiEnabled) return;

    let animationEnd = Date.now() + duration;
    let interval;

    function intervalFunc() {
      let timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      let particleCount = 100 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      xyList.forEach((xy) => {
        confetti(Object.assign({}, conf, {
          particleCount,
          origin: {
            x: (typeof xy[0] === 'function') ? xy[0]() : xy[0],
            y: (typeof xy[1] === 'function') ? xy[1]() : xy[1]
        }}));
      });
    }

    intervalFunc();
    interval = setInterval(intervalFunc, intervalMs);
  }

  fullScreenConfetti() {
    let duration = 4 * 1000;
    let conf = { startVelocity: 40, spread: 780, ticks: 60, zIndex: 1 };
    let xyList = [
      [this.randomInRange.bind(null, 0.1, 0.3), function() {Math.random() - 0.2}],
      [this.randomInRange.bind(null, 0.7, 0.9), function() {Math.random() - 0.2}]
    ];
    this.throwConfetti(duration, conf, xyList, 260);
  }

  getViewWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth);
  }

  getViewHeight() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight);
  }

  trConfetti(tr) {
    let duration = .2 * 1000; /* Smaller duration than booba explosion */
    let conf = { startVelocity: 40, spread: 40, ticks: 60, zIndex: 1, scalar: .8 };
    let controlsRect = tr.querySelector('.controls').getBoundingClientRect();
    let viewWidth = this.getViewWidth();
    let viewHeight = this.getViewHeight();
    let controlsCenter = controlsRect.width/2;
    let xyList = [
      [(controlsRect.left+controlsCenter)/viewWidth,
      (controlsRect.bottom-20)/viewHeight]
    ];
    this.throwConfetti(duration, conf, xyList, 250);
  }

  rePaintRow(item, tr) {
    let newRowIndex = parseInt(tr.getAttribute('data-row-index'));
    let clickedAndGainedRank = this.clickedAndGainedRank(item, newRowIndex);
    let clickedAndDroppedRank = this.clickedAndDroppedRank(item, newRowIndex);
    let clickedAndMoved = clickedAndGainedRank || clickedAndDroppedRank;

    if (clickedAndMoved) {
      this.makeControlsUnClickable();
      this.blurButton();
    }

    this.paintRowItemData(tr, item);

    if (clickedAndMoved) this.scrollToPersonIfNeeded(tr);

    if (clickedAndGainedRank) {
      this.revealCrash();
      this.fullScreenConfetti();
      this.blinkAnimation(true, tr);
      this.playSound('yay');
    } else if (clickedAndDroppedRank) {
      this.blinkAnimation(false, tr);
      this.playSound('suck');
    }

    item.rowIndex = newRowIndex;
    item.clicked = false;
  }

  rePaintTables() {
    let count = 0;
    let max = this.addRemoveListenerData.length;

    for (let ti = 0; ti < this.e.tables.length; ti++) {
      let rows = this.e.tables[ti].querySelectorAll('tr');
      for (let ri = 0; ri < rows.length; ri++) {
        let item = this.addRemoveListenerData[count];
        let tr = rows[ri];
        this.rePaintRow(item, tr);
        count++;
        if (count === max) break;
      }
      if (count === max) break;
    }
  }

  restartOrderTimeout(item) {
    window.clearTimeout(this.orderTimeout);
    this.orderTimeout = window.setTimeout(() => {
      this.addRemoveListenerData.sort((a, b) => {
        return b['amount']-a['amount'];
      });
      this.rePaintTables(item);
    }, 800);
  }

  showPlusOrMinusOne(plus=true, tr) {
    let plusOrMinusOne = tr.querySelector('.plus-or-minus-1');
    plusOrMinusOne.innerText = plus ? '+1' : '-1';
    plusOrMinusOne.style.color = plus ? 'hsl(120, 100%, 32%)' : 'red';
    let starWidth = tr.querySelector('.star').clientWidth;
    let amountWidth = tr.querySelector('.amount').getBoundingClientRect().width;
    let totWidth = starWidth + amountWidth;
    plusOrMinusOne.style.left = 'calc(50% + ' + (totWidth - 4) +'px/2)';
    plusOrMinusOne.addEventListener('animationend', () => { 
      this.resetAnimation(plusOrMinusOne, 'reveal');
    }, {'once': true});
    plusOrMinusOne.classList.add('reveal');
  }

  revealExplosion(svg) {
    this.resetAnimation(svg, 'animated');
    svg.classList.add('animated');
  }

  cloneExplosionToTr(tr) {
    if (!this.explosionSvgContent) {
      this.explosionSvgContent = this.e.mainExplosion.contentDocument.querySelector('svg');
    }
    if (!tr.querySelector('object')) {
      let newObject = document.createElement('object');
      newObject.classList.add('explosion-svg');
      tr.querySelector('.star-wrapper').prepend(newObject);
    }
    let object = tr.querySelector('.star-wrapper > object');
    object.appendChild(this.explosionSvgContent);
    return object.querySelector('svg');
  }

  showExplosion(tr) {
    let svg = this.cloneExplosionToTr(tr);
    this.revealExplosion(svg);
  }

  revealCrash() {
    this.e.crashClapWrap.addEventListener('animationend', () => {
      this.resetAnimation(this.e.crashClapWrap, 'zoom');
      this.crashAnimComplete = true;
    }, {'once': true});
    this.crashAnimComplete = false;
    this.e.crashClapWrap.classList.add('zoom');
  }

  incrementAmount(item, amount, tr) {
    item.inc++;
    item.amount++;
    amount.innerText = 'x ' + item.amount;
    this.showPlusOrMinusOne(true, tr);
    this.boobaExplosion(tr);

    if (window.matchMedia('(min-width: 1200px)').matches) {
      this.trConfetti(tr);
    }

    this.lastInc = item._id;
  }

  decrementAmount(item, amount, tr) {
    item.inc--;
    item.amount--;
    amount.innerText = 'x ' + item.amount;
    this.showPlusOrMinusOne(false, tr);
  }

  processAddRemoveListener(ind, ev) {
    if (!this.controlsClickable) return;
    let item = this.addRemoveListenerData[ind];
    item.clicked = true;
    this.restartOrderTimeout(item);

    let amount = ev.target.closest('.stars').querySelector('.amount');
    let tr = ev.target.closest('tr');

    if (ev.target.closest('button').classList.contains('add') && 
        item.amount !== this.MAX_STAR_COUNT) {
      this.incrementAmount(item, amount, tr);
    } else if (ev.target.closest('button').classList.contains('remove') && 
        item.amount !== this.MIN_STAR_COUNT) {
      this.decrementAmount(item, amount, tr);
    }
    this.updateStarCount(item, item.inc).then(response => {
      this.checkForErrors(response);
    });
    item.inc = 0;
  }

  addRemoveListener(control, ind, tr) {
    let addButton = control.querySelector('.add');
    let amount = addButton.closest('.stars').querySelector('.amount');
    let personName = tr.querySelector('.person-name');

    this.addRemoveListenerData.push({
      '_id' : tr.id,
      'rowIndex': parseInt(tr.getAttribute('data-row-index')),
      'name' : personName.textContent,
      'star' : tr.querySelector('.star').getAttribute('data-star-name'),
      'colour' : personName.getAttribute('style'),
      'inc': 0,
      'amount': parseInt(amount.textContent.split('x ')[1]),
      'clicked': false
    });

    addButton.addEventListener('click', 
      this.processAddRemoveListener.bind(this, ind)
    );

    control.querySelector('.remove').addEventListener('click', 
      this.processAddRemoveListener.bind(this, ind)
    );
  }

  controlListeners() {
    // Controls will be null if we arent athenticated
    if (this.e.controls === null) return;
    for (let i = 0; i < this.e.controls.length; i++) {
      let control = this.e.controls[i];
      let tr = control.closest('tr');
      if (!tr.id) break;
      this.addRemoveListener(control, i, tr);
    }
  }

  calculateScrollOffset(tr) {
    let trRect = tr.getBoundingClientRect();
    let navHeight = this.e.nav.clientHeight;
    let viewHeight = this.getViewHeight();

    let aboveNav = trRect.top-navHeight < 0;
    let belowViewport = trRect.bottom > viewHeight;

    let offset = null;

    if (aboveNav) {
      offset = this.e.main.scrollTop+trRect.top-navHeight;
    } else if (belowViewport) {
      offset = this.e.main.scrollTop+trRect.bottom-viewHeight;
    }

    return offset;
  }

  scrollToPersonIfNeeded(tr) {
    let offset = this.calculateScrollOffset(tr);
    if (offset !== null) this.e.main.scrollTo(0, offset);
  }

  hideDropDownMenu() {
    this.e.menu.classList.add('display-none');
    this.e.screenBlocker.classList.add('display-none');
    this.menuVisible = false;
  }

  showDropDownMenu() {
    this.e.menu.classList.remove('display-none');
    this.e.screenBlocker.classList.remove('display-none');
    this.menuVisible = true;
  }

  dropDownMenuListener() {
    let bubbled = false;
    this.menuVisible = false;

    this.e.menuButton.addEventListener('click', () => {
      (this.menuVisible) ? this.hideDropDownMenu() : this.showDropDownMenu();
      bubbled = true;
    });

    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('#menu') && !bubbled && this.menuVisible) {
        this.hideDropDownMenu();
      }
      bubbled = false;
    });
  }

  addPersonListener() {
    if (sessionStorage.getItem('addPerson') !== null) {
      this.openAddPopup();
      sessionStorage.removeItem('addPerson');
    }

    this.e.addPerson.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (authenticated) {
        this.openAddPopup();
        this.hideDropDownMenu();
      } else {
        sessionStorage.setItem('addPerson', true);
        window.location.href = this.baseURL + '/' + displayName;
      }
    });
  }

  playButtonListener() {
    this.e.playButton.addEventListener('click', () => {
      this.playSound('booba');
    });
  }

  setVolume(sliderVal) {
    ['booba', 'yay', 'suck'].forEach((eName) => {
      let audio = this.e[eName];
      audio.volume = sliderVal/100;
    });
  }

  volumeSliderListener() {
    let sliderVal = localStorage.getItem('volume');

    if (sliderVal !== null) {
      this.setVolume(sliderVal);
      this.e.volumeSlider.value = sliderVal;
    } else {
      this.e.volumeSlider.value = '100';
    }

    this.e.volumeSlider.addEventListener('change', (ev) => {
      sliderVal = ev.currentTarget.value;
      this.setVolume(sliderVal);
      localStorage.setItem('volume', sliderVal);
    });
  }

  volumeToggleListener() {
    let muted = localStorage.getItem('muted');

    if (muted !== null) {
      this.volumeMuted = muted === 'true';
      this.e.volumeToggle.checked = !this.volumeMuted;
    } else {
      this.e.volumeToggle.checked = true;
    }

    this.e.volumeToggle.addEventListener('change', (ev) => {
      if (ev.target.checked) {
        this.volumeMuted = false;
        localStorage.setItem('muted', 'false');
      } else {
        this.volumeMuted = true;
        localStorage.setItem('muted', 'true');
      }
    });
  }

  volumeListeners() {
    this.playButtonListener();
    this.volumeSliderListener();
    this.volumeToggleListener();
  }

  setLayoutVertical() {
    document.body.classList.add('vertical');
    this.e.orientationText.innerText = 'Vertical';
  }

  setLayoutHorizontal() {
    document.body.classList.remove('vertical');
    this.e.orientationText.innerText = 'Horizontal';
    localStorage.setItem('vertical', 'false');
  }

  toggleLayoutListener() {
    if (vertical !== null) {
      this.e.layoutToggle.checked = !vertical;
      if (vertical) this.e.orientationText.innerText = 'Vertical';
    } else {
      this.e.layoutToggle.checked = true;
    }

    this.e.layoutToggle.addEventListener('change', (ev) => {
      if (ev.target.checked) {
        this.setLayoutHorizontal();
        localStorage.setItem('vertical', 'false');
      } else {
        this.setLayoutVertical();
        localStorage.setItem('vertical', 'true');
      }
    });
  }

  toggleConfettiListener() {
    let confetti = localStorage.getItem('confetti');

    if (confetti !== null) {
      this.confettiEnabled = confetti === 'true';
      this.e.confettiToggle.checked = this.confettiEnabled;
    } else {
      this.e.confettiToggle.checked = true;
      this.confettiEnabled = true;
    }

    this.e.confettiToggle.addEventListener('change', (ev) => {
      if (ev.target.checked) {
        localStorage.setItem('confetti', 'true');
        this.confettiEnabled = true;
      } else {
        localStorage.setItem('confetti', 'false');
        this.confettiEnabled = false;
      }
    });
  }

  dropDownMenuItemListeners() {
    this.addPersonListener();
    this.volumeListeners();
    this.toggleLayoutListener();
    this.toggleConfettiListener();
  }

  init() {
    if (loggedIn) {
      if (starPage) {
        this.startColourInputListeners();
        this.populateTwPallet();
        this.startTwPalletListener();
        this.populateStarList();
      }
      this.dropDownMenuListener();
      this.dropDownMenuItemListeners();
      if (!starPage) return;
      this.updateSubmitListener();
      this.deletePersonListener();
      this.popupCloseListener();
      this.popupOpenListeners();
      this.controlListeners();
    }
  }
}
