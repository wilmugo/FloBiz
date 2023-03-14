import path from 'path';
import express from 'express';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import * as PrismicH from '@prismicio/helpers';
import { client } from './prismicConfig.js';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import errorHandler from 'errorhandler';

const app = express();
const port = process.env.PORT || 3000;

//Meta content fetch
const { results } = await client.getByType('meta');
const [meta] = results;

//const prod = await client.getByUID('product', 'silver-necklace');
//console.log(prod);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(errorHandler());

const handlerLinkResolver = (doc) => {
  if (doc.type == 'product') {
    return `/detail/${doc.slug}`;
  }

  if (doc.type == 'collections') {
    return '/collections';
  }

  if (doc.type == 'about') {
    return '/about';
  }
  return '/';
};

app.use((req, res, next) => {
  res.locals.ctx = {
    PrismicH,
  };
  res.locals.Link = handlerLinkResolver;
  next();
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  //const { results } = await client.get()
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  const preloader = await client.getSingle('preloader');
  const navigation = await client.getSingle('navigation');
  const { results } = await client.getByType('home');
  const [home] = results;
  res.render('pages/home', {
    home,
    meta,
    preloader,
    collections,
    navigation,
  });
});

app.get('/about', async (req, res) => {
  const preloader = await client.getSingle('preloader');
  const navigation = await client.getSingle('navigation');
  const { results } = await client.getByType('about');
  const [about] = results;
  res.render('pages/about', { about, meta, preloader, navigation });
});

app.get('/detail/:uid', async (req, res) => {
  const preloader = await client.getSingle('preloader');
  const navigation = await client.getSingle('navigation');
  const uid = req.params.uid;
  const product = await client.getByUID('product', uid, {
    fetchLinks: 'collection.title',
  });
  res.render('pages/detail', {
    product,
    meta,
    preloader,
    navigation,
  });
});

app.get('/collections', async (req, res) => {
  const preloader = await client.getSingle('preloader');
  const navigation = await client.getSingle('navigation');
  const home = await client.getSingle('home');
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image',
  });
  res.render('pages/collections', {
    collections,
    meta,
    home,
    preloader,
    navigation,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
