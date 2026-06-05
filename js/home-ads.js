import { db } from "./firebase-config.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const slider =
  document.getElementById(
    "homepageAdsSlider"
  );

const prevBtn =
  document.getElementById(
    "adsPrev"
  );

const nextBtn =
  document.getElementById(
    "adsNext"
  );

let ads = [];

let currentIndex = 0;

let autoSlide = null;

function createAdCard(
  ad,
  active = false
){

  return `

  <a
    href="${ad.targetUrl || '#'}"
    target="_blank"
    class="
      ad-card
      ${active ? 'active' : 'inactive'}
    ">

    <img
      src="${ad.imageUrl}"
      alt="${ad.title || 'Advertisement'}">

  </a>

  `;
}

function renderAds(){

  if(!slider) return;

  if(ads.length === 0){

    slider.innerHTML =
      `<div class="testimonial-empty">
        No Ads Available
      </div>`;

    return;
  }

  let html = "";

  const visible = 3;

  for(let i=0;i<visible;i++){

    const index =
      (currentIndex + i)
      % ads.length;

    html += createAdCard(
      ads[index],
      i === 1
    );
  }

  slider.innerHTML = html;
}

function showNext(){

  slider.classList.add(
    "testimonial-slide-out-left"
  );

  setTimeout(()=>{

    currentIndex++;

    if(currentIndex >= ads.length){
      currentIndex = 0;
    }

    renderAds();

    slider.classList.remove(
      "testimonial-slide-out-left"
    );

    slider.classList.add(
      "testimonial-slide-in"
    );

  },500);
}

function showPrevious(){

  slider.classList.add(
    "testimonial-slide-out-right"
  );

  setTimeout(()=>{

    currentIndex--;

    if(currentIndex < 0){
      currentIndex =
        ads.length - 1;
    }

    renderAds();

    slider.classList.remove(
      "testimonial-slide-out-right"
    );

    slider.classList.add(
      "testimonial-slide-in"
    );

  },500);
}

function startAutoSlide(){

  clearInterval(autoSlide);

  autoSlide = setInterval(()=>{

    showNext();

  },5000);
}

function loadAds(){

  const q = query(
    collection(
      db,
      "homepage_ads"
    ),
    orderBy(
      "displayOrder",
      "asc"
    )
  );

  onSnapshot(
    q,
    (snapshot)=>{

      ads = [];

      snapshot.forEach((doc)=>{

        const data = doc.data();

        if(data.active){

          ads.push({
            id: doc.id,
            ...data
          });

        }

      });

      renderAds();

      startAutoSlide();
    }
  );
}

prevBtn?.addEventListener(
  "click",
  ()=>{
    showPrevious();
    startAutoSlide();
  }
);

nextBtn?.addEventListener(
  "click",
  ()=>{
    showNext();
    startAutoSlide();
  }
);

document.addEventListener(
  "DOMContentLoaded",
  loadAds
);