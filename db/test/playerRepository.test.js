"use strict";

let __base = '../../';
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
var expect = chai.expect;

var db = require(__base + 'db/main');
var config = require(__base + 'config/main')
var playerRepo = require(__base + 'db/repository/playerRepository');

describe("Player Repo", function () {

    before(function (done) {

        db.init(config["DB_PATH"]).then(function () {

            console.log("Db is running");

            done();

        }).catch(function (err) {

            console.error(err);

        });

    });

    it("findByWikiId", function (done) {


        playerRepo.getById("Phil Neville").then(function (res) {

            res.wikiId.should.equal("Phil Neville");

            done();

        }).catch(function (err) {

            console.error(err);

            done(new Error("Failure"));

        });

    });

    describe("Player sample", function () {

        it("Simple sample", function (done) {


            playerRepo.sample({
                size: 5
            }).then(function (res) {

                res.should.have.length(5);

                done();

            }).catch(function (err) {

                console.error(err);

                done(err);
            })

        });

        it("Nation sample", function (done) {


            playerRepo.sample({
                    nations: ["Israel"]
                })
                .then(function (res) {

                    res.forEach(function (element) {
                        expect(element.nations).to.include("Israel");
                    }, this);

                    done();

                })
                .catch(function (err) {

                    console.error(err);

                    done(err);

                })

        });

        it("End year sample", function (done) {


            playerRepo.sample({
                    endYear: 2006
                })
                .then(function (res) {

                    res.forEach(function(element) {
                        expect(element.endYear).to.be.least(2006);
                    }, this);

                    done();

                })
                .catch(function (err) {

                    console.error(err);

                    done(err);

                })

        });

    })

    after(() => db.disconnect());
});