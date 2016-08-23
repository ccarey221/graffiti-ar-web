const should = require('chai').should();
const request = require('request');

const connection = require('../db/db');
const db = connection.db;
const Place = connection.Place;
const Art = connection.Art;
const User = connection.User;

const placeRecord = { lat: 0, long: 0 };
const artRecord = { type: 'test' };
const userRecord = { fbookId: '0' };

const AWS = require('aws-sdk');

// Set up region for requests
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

// Create reference to existing bucket
const s3bucket = new AWS.S3({ params: { Bucket: 'hadashco-emblem' } });

const xbeforeEach = () => {}; // Mimic xit and xdescribe

describe('Build Models', () => {

  beforeEach(() => {
    db.sync()
      .then(() => User.destroy({ where: userRecord }))
      .then(() => Art.destroy({ where: artRecord }))
      .then(() => Place.destroy({ where: placeRecord }));
  });

  describe('User', () => {
    it ('should build and save a new User', (done) => {
      User.create(userRecord).then(user => {
        user.id.should.not.be.null;
        return User.findById(user.id).then(found => {
          found.id.should.equal(user.id);
          done();
        });
      });
    });
  });

  describe('Place', () => {
    it ('should build and save a new Place', (done) => {
      Place.create(placeRecord).then(place => {
        place.should.have.property('id');
        place.id.should.not.be.null;
        return Place.findById(place.id).then(found => {
          found.id.should.equal(place.id);
          done();
        });
      });
    });
  });

  describe('Art', () => {
    it ('should create an art record Art', (done) => {
      Art.create(artRecord).then(art => {
        art.should.have.property('id');
        art.id.should.not.be.null;
        return Art.findById(art.id).then(found => {
          found.id.should.equal(art.id);
          done();
        });
      });
    });
  });
});

describe('Geotagging Routes and Posting Art to AWS (S3)', () => {
  // for re-use throughout the tests
  let place, art;

  it ('should post a new Place to the server', (done) => {
    new Promise((resolve, reject) => {
      request.post({
        url: 'http://localhost:3000/place',
        body: JSON.stringify({ long: 22.44, lat: 88.00 }),
        headers: {
          'content-type': 'application/json',
        },
      }, (err, response, body) => {
        err ? reject(err) : resolve(response.body);
      });
    }).then(body => {
      place = JSON.parse(body);
      place.long.should.equal(22.44);
      place.id.should.not.be.null;
      done();
    });
  });

  it ('should post a new art to the server', (done) => {
    new Promise((resolve, reject) => {
      request.post({
        url: 'http://localhost:3000/art',
        body: JSON.stringify({ data: 'definitely an image' }),
        headers: {
          'file-type': 'img/fakeimg',
          'content-type': 'application/octet-stream',
        },
      }, (err, response, body) => {
        err ? reject(err) : resolve(response.body);
      });
    }).then(body => {
      art = JSON.parse(body);
      art.id.should.not.be.null;
      done();
    });
  });

  it ('should get objects from the s3 bucket', (done) => {
    new Promise((resolve, reject) => {
      request.get({
        url: `http://localhost:3000/art/${art.id}/download`,
      }, (err, response, body) => {
        err ? reject(err) : resolve(response.body);
      });
    }).then(body => {
      Buffer.isBuffer(body).should.be.true;
      done();
    });
  });

  it ('should tie art to the place', (done) => {
    new Promise((resolve, reject) => {
      request.post({
        url: `http://localhost:3000/place/${place.id}`,
        body: JSON.stringify({ id: art.id }),
      }, (err, response, body) => {
        err ? reject(err) : resolve(response);
      });
    }).then(response => {
      response.statusCode.should.equal(200);
      done();
    });
  });

  it ('should delete art from AWS', (done) => {
    new Promise((resolve, reject) => {
      request.post({
        url: `http://localhost:3000/art/${art.id}/delete`,
        body:
      })
    })
 //   router.post('/:id/delete
//

  });

  after(() => {
    Place.findById(place.id).then(place => place.destroy());
    Art.findById(art.id).then(art => art.destroy());
  });
});
