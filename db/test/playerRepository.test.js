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

describe("Player Repo", function() {

    before(function(done) {

        db.init(config["DB_PATH"]).then(function() {

            console.log("Db is running");

            done();

        }).catch(function(err) {

            console.error(err);

        });

    });

    it("findByWikiId", function(done) {


        playerRepo.getById("Kamil Zayatte").then(function(res) {

            res.wikiId.should.equal("Kamil Zayatte");

            done();

        }).catch(function(err) {

            console.error(err);

            expect(true).to.equal(false);

        });

    });

    describe("Player sample", function() {

        it("Simple sample", function(done) {


            playerRepo.sample({
                size: 5
            }).then(function(res) {

                res.should.have.length(5);

                done();

            }).catch(function(err) {

                console.error(err);

            })

        });

        it("Nation sample", function(done) {


            playerRepo.sample({
                    nations: ["Israel"]
                })
                .then(function(res) {

                    expect(res.map((v) => v.nations)).all.to.include.members(["Israel"]);

                    done();

                })
                .catch(function(err) {

                    console.error(err);

                })

        });

    })

    after(() => db.disconnect());
});