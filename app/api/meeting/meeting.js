'use strict';

const fetch = require('node-fetch');

const API_KEY = 'mirotalksfu_default_secret';
const MIROTALK_URL = 'https://sfu.mirotalk.com/api/v1/meeting';

export default async function handler(req, res) {
  try {
    const response = await fetch(MIROTALK_URL, {
      method: 'POST',
      headers: {
        authorization: API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.status(200).send(JSON.stringify(data));
  } catch (error) {
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
}
