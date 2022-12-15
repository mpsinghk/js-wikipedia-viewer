const postTemplate = document.querySelector('#template');
const postsElement = document.querySelector('.posts');
const fetchBtn = document.querySelector('.btn-fetch');

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

async function fetchPosts() {
  try {
    const listOfPosts = await sendHttpRequest(
      'GET',
      'https://jsonplaceholder.typicode.com/posts'
    );

    for (const post of listOfPosts) {
      const postElement = postTemplate.content.cloneNode(true);
      postElement.querySelector('li').id = post.id;
      postElement.querySelector('h2').textContent = post.id + '. ' + post.title;
      postElement.querySelector('p').textContent = post.body;
      postsElement.append(postElement);
    }
  } catch (error) {
    console.log(error.message);
  }
}

postsElement.addEventListener('click', event => {
  if (event.target.tagName === 'BUTTON') {
    event.target.closest('li').remove();
  }
});

fetchBtn.addEventListener('click', fetchPosts);
