'use strict';

process.env.NODE_ENV = 'test';

let __base = "../../../";

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require(__base + "app/app");
var db = require(__base + 'db');
var config = require(__base + 'config')

let should = chai.should();

chai.use(chaiHttp);

describe('/players', () => {

    before((done) => {
        db.init(config["DB_PATH"]).then(function () {

                console.log("Db is running");
                done();

            })
            .catch((err) => {
                console.error(err);
                done(err);
            });
    });

    describe('/sample', () => {


        it('Simple get players', (done) => {

            chai.request(server)
                .post("/players/sample")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });

        });

        it('player get by 1 existing nations', (done) => {

            chai.request(server)
                .post("/players/sample")
                .send({
                    "nations": ["Israel"]
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it('player get by 1 existing nations and enddate', (done) => {

            chai.request(server)
                .post("/players/sample")
                .send({
                    nations: ["Israel"],
                    endYear: 2005
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it('player get by 1 not existing nations', (done) => {

            chai.request(server)
                .post("/players/sample")
                .send({
                    nations: ["Ysrael"]
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });


        it('player get by multiple existing nations', (done) => {

            chai.request(server)
                .post("/players/sample")
                .send({
                    "nations": ["Israel", "England"]
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });

        it('player get by multiple  nations with one not existing', (done) => {

            chai.request(server)
                .post("/players/sample")
                .send({
                    "nations": ["Israel2", "England"]
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

});