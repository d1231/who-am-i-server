'use strict';

process.env.NODE_ENV = 'test';

let __base = "../../../";

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require(__base + "app/app");
var db = require(__base + 'db');
var config = require(__base + 'config')

let should = chai.should();

chai.use(chaiHttp);

describe('/nations', () => {

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


    it("simple get", (done) => {
        chai.request(server)
            .get("/nations")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                let expected = config["AVAILABLE_NATIONS"];
                expect(res.body.length).to.equal(Array.from(expected).length);
                expect(res.body).to.have.members(Array.from(expected));
                done();
            })
    });

});