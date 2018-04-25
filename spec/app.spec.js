process.env.NODE_ENV = 'test';
const {expect} = require('chai')
const app = require('../app')
const request = require('supertest')(app);
const mongoose = require('mongoose')

describe.only('app', () => {
    after(() => {
        mongoose.disconnect();
    });
    describe('api', () => {
        describe('articles', () => {
            it('resolves with a 200', (done) => {
                request
                .get('/api/articles')
                .expect(200)
                .expect('content-type', /json/)
                .then(res => {
                    expect(res).to.be.an('Object');
                    done();
                })
            });
        });
    });
});