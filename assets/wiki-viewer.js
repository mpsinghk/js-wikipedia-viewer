const searchInputElement = document.querySelector('#search');
const resultsElement = document.querySelector('.results');
const randomBtn = document.querySelector('.btn-random');

searchInputElement.focus();

function generateURL(random) {
  const searchQuery = searchInputElement.value.trim();
  let params;
  let url = 'https://en.wikipedia.org/w/api.php?';

  if (!searchQuery && !random) {
    resultsElement.textContent = '';
    searchInputElement.focus();
    return;
  }

  if (!random) {
    params = {
      action: 'query',
      list: 'search',
      origin: '*',
      srlimit: '5',
      format: 'json',
      srsearch: searchQuery
      // srsearch: `intitle:${searchQuery}` // Title should include the search term
    };
  } else {
    searchInputElement.value = '';
    params = {
      action: 'query',
      generator: 'random',
      grnlimit: 5,
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
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
      <p>No results found. Please try different keywords.</p>
    `;
    resultsElement.append(resultElement);
    return;
  }

  for (result of wikiResults.query.search) {
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
        <h2>${result.title}</h2>
        <h3><a href="https://en.wikipedia.org/?curid=${result.pageid}" title="${result.title}" target="_blank" rel="noopener noreferrer">https://en.wikipedia.org/?curid=${result.pageid}</a></h3>
        <p>${result.snippet}...</p>
      `;
    resultsElement.append(resultElement);
  }
}

function displayRandomResults(wikiResults) {
  Object.values(wikiResults.query.pages).forEach(result => {
    const resultElement = document.createElement('li');
    resultElement.innerHTML = `
        <h2>${result.title}</h2>
        <h3><a href="https://en.wikipedia.org/?curid=${result.pageid}" title="${result.title}" target="_blank" rel="noopener noreferrer">https://en.wikipedia.org/?curid=${result.pageid}</a></h3>
        <p>${result.extract}...</p>
      `;
    resultsElement.append(resultElement);
  });

  // for (resultKey in wikiResults.query.pages) {
  //   const result = wikiResults.query.pages[resultKey];

  //   const resultElement = document.createElement('li');
  //   resultElement.innerHTML = `
  //       <h2>${result.title}</h2>
  //       <h3><a href="https://en.wikipedia.org/?curid=${result.pageid}" title="${result.title}" target="_blank" rel="noopener noreferrer">https://en.wikipedia.org/?curid=${result.pageid}</a></h3>
  //       <p>${result.extract}...</p>
  //     `;
  //   resultsElement.append(resultElement);
  // }
}

async function fetchResults(random) {
  try {
    const url = generateURL(random);

    if (!url) {
      return;
    }

    const wikiResults = await sendHttpRequest('GET', url);
    resultsElement.textContent = '';

    if (!random) {
      displayResults(wikiResults);
    } else {
      displayRandomResults(wikiResults);
    }
  } catch (error) {
    alert(error.message);
  }
}

searchInputElement.addEventListener('input', () => {
  fetchResults(false);
});

randomBtn.addEventListener('click', () => {
  fetchResults(true);
});
