"use strict";

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var should = chai.should();

var expect = chai.expect;

var db = require('../db');

var repo = require('../repository/player_repository');

describe("Player Repo", function () {

	before(function (done) {

		db.init("mongodb://localhost/projectt").then(function () {

			console.log("Db is running");

			done();

		}).catch(function (err) {

			console.error(err);

		});

	});

	it("findById", function (done) {


		repo.getById("57828136d727f8805262aa0d").then(function (res) {

			res.name.should.equal("Kamil Zayatte");

			done();

		}).catch(function (err) {

			console.error(err);

			expect(true).to.equal(false);

		});

	});

	it("randomSample", function (done) {


		repo.randomSample(5).then(function (res) {

			res.should.have.length(5);

			done();

		}).catch(function (err) {

			console.error(err);

		})

	});
});