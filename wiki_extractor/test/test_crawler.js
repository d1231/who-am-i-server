"use strict";

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var should = chai.should();

var expect = chai.expect;

var Crawler = require("./../main/crawler");

describe("Crawler", function () {

    var visits = 0;

    it("crawler 1 page visited", function (done) {

        var crawler = new Crawler(
            {
                fetch: function (page) {

                    return new Promise(function (resolve) {
                        resolve("fp:" + page)
                    });
                }
            },
            {
                visit: function (crawler, type, data) {

                    visits++;

                    expect(data).to.equal("fp:page");
                }
            });

        crawler.addPage({type: "p", name: "page"});

        crawler.startCrawling()
               .then(function finished() {

                   expect(visits).to.equal(1);

                   done();
               })
               .catch(function (err) {

                   done(err);
               })

    });

    it("crawler 1 page visited, adding new pages", function (done) {

        var crawler = new Crawler(
            {
                fetch: function (page) {

                    return new Promise(function (resolve) {
                        resolve("fp:" + page)
                    });
                }
            },
            {
                visit: function (crawler, type, data) {

                    expect(data).to.equal("fp:page");

                    if (visits < 5) {
                        crawler.addPage({type: "p", name: "page"});
                    }

                    visits++;
                }
            });


        crawler.addPage({type: "p", name: "page"});

        crawler.startCrawling()
               .then(function finished() {

                   expect(visits).to.equal(6);

                   done();
               })
               .catch(function (err) {

                   done(err);
               })

    });

});