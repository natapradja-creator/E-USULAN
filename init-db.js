import fetch from 'node-fetch';

async function init() {
  try {
    const res = await fetch('http://localhost:3000/api/init-db');
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

init();
