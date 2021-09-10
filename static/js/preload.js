var windowLoaded = false,
  baseImgURL = baseURL + '/static/images',
  stars = [],
  goldStars;

function preloadImages(urls, allImagesLoadedCallback) {
  let loadedCounter = 0;
  let toBeLoadedNumber = Object.keys(urls).length;
  Object.keys(urls).forEach(url => {
    preloadImage(url, () => {
      document.querySelectorAll('.' + urls[url]).forEach(el => {
        el.setAttribute('src', url);
      });
      loadedCounter++;
      if (loadedCounter == toBeLoadedNumber) {
        allImagesLoadedCallback();
      }
    });
  });
  function preloadImage(url, anImageLoadedCallback) {
    let img = new Image();
    img.onload = anImageLoadedCallback;
    img.onerror = anImageLoadedCallback;
    img.src = url;
  }
}

fetch(baseURL + '/api/stars', {'cache': 'no-cache'})
.then(response => response.json())
.then(data => {
  stars = data.stars;
  let images = {};

  stars.forEach(fName => {
    images[baseImgURL + '/stars/' + fName + '.svg'] = fName;
  });

  images[baseImgURL + '/baffyPog.png'] = 'baffyPog';
  images[baseImgURL + '/baffyCrash.png'] = 'baffyCrash';
  images[baseImgURL + '/clapping.gif'] = 'clap';

  preloadImages(images, () => {
    goldStars = new GoldStars(baseURL, baseImgURL, streamer, stars);
    goldStars.init();
    document.querySelector('#loading').classList.add('display-none');
    document.body.classList.remove('hidden');
    let scrollTo = sessionStorage.getItem('scrollTo');
    if (scrollTo !== null) {
      goldStars.e.main.scrollTo(0, scrollTo);
      sessionStorage.removeItem('scrollTo');
    }
  });
});
