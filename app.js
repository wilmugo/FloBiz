import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import * as prismic from '@prismicio/client';
import * as PrismicH from '@prismicio/helpers';
import { client } from './prismicConfig.js';
//const express = require('express');
//const app = express();
//const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

//const PrismicH = require('@prismicio/helpers');
//const { client } = require('./prismicConfig.js');

/*const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOkEN,
    req,
    fetch,
  });
};

const handleLinkResolver = (doc) => {
  //if (doc.type === 'page') {
  //  return '/page/' + doc.uid;
  //} else if (doc.type === 'blog_post') {
  //  return '/blog/' + doc.uid;
  //}
  return '/';
};
*/
//Meta content fetch
const { results } = await client.getByType('meta');
const [meta] = results;

app.use((req, res, next) => {
  res.locals.ctx = {
    PrismicH,
  };
  next();
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  //const { results } = await client.get()
  const { results } = await client.getByType('home');
  const [home] = results;
  res.render('pages/home', { home, meta });
});

app.get('/about', async (req, res) => {
  res.render('pages/about');
});

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail');
});

app.get('/collections', (req, res) => {
  res.render('pages/collections');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
