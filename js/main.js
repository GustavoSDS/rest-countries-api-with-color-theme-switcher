window.addEventListener('load', () => {
  const customSelect = document.querySelector('.custom-select');
  const customSelectLimit = document.querySelector('.custom-select-limit');
  const select = document.querySelector('#search-filter');
  const constainerCountries = document.querySelector('#container-countries');
  const countries = document.querySelector('#countries');
  const constainerDetails = document.querySelector('#container-details');
  const details = document.querySelector('#details');
  const btnBack = document.querySelector('#btn-back');
  const searchInput = document.querySelector('#search-input');

  const REST_COUNTRIES_API_URL = 'https://restcountries.com/v3.1/';
  const FIELDS_API = "?fields=name,flags,population,region,capital,ccn3";
  const FIELDS_DETAILS_API = "?fields=name,flags,population,region,capital,subregion,tld,currencies,languages,borders";

  let changeTheme = document.querySelector('#theme');
  let light = document.querySelectorAll('.light');
  let dark = document.querySelectorAll('.dark');
  let classThemeBody = document.querySelector('body').classList;
  let loadingMessage = document.createElement('p');
  let timerInput; let borders;

  changeTheme.innerHTML = `
<i class="dark fa-regular fa-moon"></i>Light Mode`;


  // EVENTS
  changeTheme.addEventListener('click', () => {
    light = document.querySelectorAll('.light');
    dark = document.querySelectorAll('.dark');

    toggleClass(dark);
    toggleClass(light);

    if (changeTheme.innerText === "Light Mode") {
      changeTheme.innerHTML = `
      <i class="light fa-solid fa-moon"></i>Dark Mode`;
    } else {
      changeTheme.innerHTML = `
      <i class="dark fa-regular fa-moon"></i>Light Mode`;
    }
  });

  /*   customSelect.addEventListener('click', function () {
      let elementSelected = document.querySelector('.select-selected');
      let region = elementSelected.innerHTML.toLowerCase();
      countries.innerHTML = "";
      viewCountries(`${REST_COUNTRIES_API_URL}region/${region + FIELDS_API}`);
    }); */


  countries.addEventListener('click', (event) => {
    let idCountry = event.target.closest('.countries__country').id;
    let urlCountry = `${REST_COUNTRIES_API_URL}alpha/${idCountry + FIELDS_DETAILS_API}`
    viewCountryDetails(urlCountry);
    constainerCountries.style.display = "none";
    constainerDetails.style.display = "block";
  });

  btnBack.addEventListener('click', () => {
    constainerCountries.style.display = "block";
    constainerDetails.style.display = "none";
    details.innerHTML = "";
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(timerInput);
    let count = 1;
    countries.innerHTML = `<p>Plase wait... ${count}</p>`;
    timerInput = setInterval(() => {
      count--;
      countries.innerHTML = `<p>Plase wait... ${count}</p>`;
      if (count === 0) {
        clearInterval(timerInput);
        inputTimeout();
      }
    }, 1000);
  })

  details.addEventListener('click', (e) => {
    if (e.target.closest('span.borders')) {
      if (e.target.textContent != 'No borders') {
        let urlCountry = `${REST_COUNTRIES_API_URL}alpha/${e.target.textContent + FIELDS_DETAILS_API}`
        details.innerHTML = "";
        viewCountryDetails(urlCountry);
      }
    }
  });



  // CALL FUNCTIONS
  main();
  setFilterCountries(customSelect);
  setFilterCountries(customSelectLimit);

  // FUNCTIONS

  function setFilterCountries(element) {
    element.addEventListener('click', function () {

      let limit = getElementSelected(customSelectLimit);
      let region = getElementSelected(customSelect);

      if (region === "filter by region") {
        countries.innerHTML = "";
        viewCountries(`${REST_COUNTRIES_API_URL}all/${FIELDS_API}`, limit);
      } else {
        countries.innerHTML = "";
        viewCountries(`${REST_COUNTRIES_API_URL}region/${region + FIELDS_API}`, limit);
      }
    });
  }

  function getElementSelected(element) {
    let elementSelected = element.querySelector('.select-selected');
    return elementSelected.innerHTML.toLowerCase();
  }


  async function main() {
    try {
      viewCountries();
    } catch (error) {
      console.error(error);
    }
  }

  async function getData(url = `${REST_COUNTRIES_API_URL}all${FIELDS_API}`, limit = 8) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      } else {
        const data = await response.json();
        if (isFinite(limit)) {
          const results = [];
          let i = 0;
          while (i < data.length && results.length < limit) {
            results.push(data[i]);
            i++;
          }
          return results;
        } else {
          return data;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function viewCountries(url, limit) {
    const data = await getData(url, limit);

    if (data) {
      // console.log(data)
      data.forEach(element => {
        let name = element.name.common;
        countries.innerHTML += `
      <div id=${element.ccn3} class='countries__country ${classThemeBody}'>
      <img src="${element.flags.png}" alt="Imagen de la Bandera de ${name}" class="countries__country-flag">
        <div class="countries__country-details">
        <h2 class="countries__country-name">${name}</h2>
        <p>Polpulation: <span class="${classThemeBody}">${element.population}</span></p>
        <p>Region: <span class="${classThemeBody}">${element.region}</span></p>
        <p>Capital: <span class="${classThemeBody}">${element.capital === undefined ? 'No capital' : element.capital}</span></p>
        </div>
      </div>
      `;
      });
    } else {
      countries.innerHTML = `<p>No results found...</p>`;
    }
  }

  async function getDetailCountry(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  async function viewCountryDetails(url) {
    const data = await getDetailCountry(url);
    // console.log(data);
    const bordersCountry = data.borders.length === 0
      ? `<span class="${classThemeBody} borders">No borders</span>`
      : data.borders.map(border => `<span id="${border}" class="${classThemeBody} borders">${border}</span>`).join("");

    details.innerHTML += `
      <img src="${data.flags.png}" alt="Imagen de la Bandera de ${data.name.common}" class="country-details__flag">
      <div class="country-details__details">
      <h2 class="country-details__details-name">${data.name.common}</h2>
      <div class="country-details__details-container">
       <div class="country-details__details-principal">
       <p>Native Name: <span>${Object.values(data.name.nativeName)[0].common}</span></p>
       <p>Polpulation: <span>${data.population}</span></p>
       <p>Region: <span>${data.region}</span></p>
       <p>Sub Region: <span>${data.subregion}</span></p>
       <p>Capital: <span>${data.capitalInfo > 1 ? 'No capital' : data.capital}</span></p>
     </div>
     <div class="country-details__details-secondary">
       <p>Top Level Domain: <span>${data.tld}</span></p>
       <p>Currencies: <span>${Object.values(data.currencies)[0].name}</span></p>
       <p>Languages: <span>${Object.values(data.languages)}</span></p>
     </div>
       </div>
        <div id="borders" class="country-details__borders-countries">
          <p>Border Countries:</p>
          <div>
            ${bordersCountry}
          </div>
        </div>
      </div>
    `;
  }

  function toggleClass(elements) {
    elements.forEach(element => {
      element.classList.toggle('light');
      element.classList.toggle('dark');
    });
  }

  function inputTimeout() {
    loadingMessage.style.display = "none";
    countries.innerHTML = "";
    if (searchInput.value == "" || searchInput.value.length < 4) {
      main();
    } else {
      viewCountries(`${REST_COUNTRIES_API_URL}name/${searchInput.value}`);
    }
  }

});