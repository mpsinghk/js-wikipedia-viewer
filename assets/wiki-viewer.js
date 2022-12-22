const searchInputElement = document.getElementById('search');
const resultsElement = document.getElementById('results');
const randomBtn = document.querySelector('.btn-random');
const prevBtn = document.querySelector('.btn-prev');
const nextBtn = document.querySelector('.btn-next');
const pagination = document.querySelector('.pagination');
const counter = document.getElementById('counter');

let timer;
let offset = 0;
let canContinue = false;
const perPage = 12;
searchInputElement.focus();

function reset() {
  offset = 0;
  canContinue = false;
  pagination.style.display = 'none';
  prevBtn.setAttribute('disabled', '');
  nextBtn.setAttribute('disabled', '');
  resultsElement.textContent = '';
  counter.textContent = '';
  searchInputElement.focus();
}

function generateURL(random) {
  const searchQuery = searchInputElement.value.trim();
  let params;
  let url = 'https://en.wikipedia.org/w/api.php?';

  if (!searchQuery && !random) {
    reset();
    return;
  }

  if (!random) {
    params = {
      action: 'query',
      list: 'search',
      origin: '*',
      srlimit: perPage,
      sroffset: offset,
      continue: '-||',
      format: 'json',
      srsearch: searchQuery
      // srsearch: `intitle:${searchQuery}` // Title should include the search term
    };
  } else {
    searchInputElement.value = '';
    params = {
      action: 'query',
      generator: 'random',
      grnlimit: perPage,
      grnnamespace: 0,
      origin: '*',
      prop: 'extracts',
      exchars: 200,
      explaintext: true,
      exintro: true,
      format: 'json'
    };
  }

  for (key in params) {
    url = `${url}${key}=${params[key]}&`;
  }

  // Removes extra '&' from the end of the string
  url = url.slice(0, -1);
  return url;
}

function sendHttpRequest(method, url) {
  // const promise = new Promise((resolve, reject) => {
  //   const xhr = new XMLHttpRequest();
  //   xhr.responseType = 'json';
  //   xhr.open(method, url);

  //   xhr.onload = function() {
  //     if (xhr.status >= 200 && xhr.status < 300) {
  //       resolve(xhr.response);
  //     } else {
  //       reject(new Error('Something went wrong'));
  //     }
  //   };

  //   xhr.onerror = function() {
  //     reject(new Error('Failed to send request!'));
  //   };

  //   xhr.send();
  // });

  // return promise;

  return fetch(url, { method: method })
    .then(response => {
      if (!response.ok) {
        throw new Error('Something went wrong...');
      }
      return response.json();
    })
    .catch(error => {
      throw new Error(error.message);
    });
}

function displayResults(wikiResults) {
  if (wikiResults.query.searchinfo.totalhits <= 0) {
    reset();
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
      <p>No results found. Please try different keywords.</p>
    `;
    resultsElement.append(resultElement);
    return;
  }

  pagination.style.display = 'flex';

  for (result of wikiResults.query.search) {
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
        <a href="https://en.wikipedia.org/?curid=${result.pageid}" title="Read more..." target="_blank" rel="noopener noreferrer"></a>
        <h2>${result.title}</h2>
        <p>${result.snippet}...</p>
      `;
    resultsElement.append(resultElement);
  }
}

function displayRandomResults(wikiResults) {
  Object.values(wikiResults.query.pages).forEach(result => {
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
        <a href="https://en.wikipedia.org/?curid=${result.pageid}" title="Read more..." target="_blank" rel="noopener noreferrer"></a>
        <h2>${result.title}</h2>
        <p>${result.extract}...</p>
      `;
    resultsElement.append(resultElement);
  });
}

async function fetchResults(random) {
  try {
    const url = generateURL(random);

    if (!url) {
      return;
    }

    const wikiResults = await sendHttpRequest('GET', url);
    resultsElement.textContent = '';
    counter.textContent = '';

    if (!random) {
      if (wikiResults.continue?.sroffset) {
        canContinue = true;
        nextBtn.removeAttribute('disabled', '');
      } else {
        nextBtn.setAttribute('disabled', '');
      }

      const totalHits = wikiResults.query.searchinfo.totalhits;
      counter.textContent = `
        ${offset + 1} to ${
        offset + perPage > totalHits ? totalHits : offset + perPage
      } of ${totalHits} records
      `;

      displayResults(wikiResults);
    } else {
      displayRandomResults(wikiResults);
    }
  } catch (error) {
    alert(error.message);
  }
}

searchInputElement.addEventListener('input', () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    reset();
    fetchResults(false);
  }, 1000);
});

nextBtn.addEventListener('click', () => {
  if (canContinue) {
    offset += perPage;
    prevBtn.removeAttribute('disabled', '');
    fetchResults(false);
  }
});

prevBtn.addEventListener('click', () => {
  if (offset > 0) {
    offset -= perPage;
    if (offset <= 0) {
      prevBtn.setAttribute('disabled', '');
    }
    fetchResults(false);
  }
});

randomBtn.addEventListener('click', () => {
  reset();
  fetchResults(true);
});
