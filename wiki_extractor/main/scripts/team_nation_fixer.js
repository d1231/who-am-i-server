'use strict';


let nations = new Set(["Italy", "England", "France", "Spain", "Israel", "Switzerland", "Netherlands", "Croatia", "Germany", "Portugal", "Austria", "Ukraine", "Russia",
    "Slovakia", "Slovenia", "Cyprus", "Finland", "Belarus", "USA", "Canada", "Mexico", "Chile", "Colombia", "Paraguay", "Uruguay", "Serbia", "Wales", "Ireland",
    "Norway", "Sweden", "Denmark", "Brazil", "Argentina", "Bosnia and Herzogovina", "Scotland", "Iran", "Iraq", "New Zealand", "Australia", "Romania", "Hungary",
    "Bulgaria", "Turkey", "Greece", "Belgium", "Japan", "China", "Iceland", "Poland", "Armenia", "Egypt", "South Africa", "India", "Bolivia", "Kazakhstan",
    "Latvia", "Albania", "Northern Ireland", "Estonia", "Lithuania", "Montenegro", "Moldova", "Malta", "Azerbaijan", "Andorra", "South Korea", "Ghana",
    "Ivory Coast", "Saudi Arabia", "Georgia", "Peru", "Indonesia", "Malaysia", "Morocco", "Czech Republic", "Kuwait", "Cameroon", "Namibia", "Thailand", "Costa Rica",
    "Honduras", "Tunisia", "Democratic Republic of the Congo", "Senegal", "Angola", "Venezuela", "Luxembourg", "Uzbekistan", "Bosnia and Herzegovina",
    "Qatar"
]);

let clues = [
    ["{{Major League Soccer}}", "USA"],
    ["[[Category:Football clubs in the Czech Republic]]", "Czech Republic"],
    ["[[Category:Defunct football clubs in the Czech Republic]]", "Czech Republic"],
    ["{{USSoccer}}", "USA"],
    ["[[Category:North American Soccer League teams]]", "USA"],
    ["{{Czech First League}}", "Czech Republic"],
    ["[[Canadian Soccer League]]", "Canada"]
];

let i = 0;

const db = require('../../../db/db');

let fetcher = require('../fetcher.js');
var wikiParser = require('wtf_wikipedia');

let Team = require('../../../db/models/team');

db.init("mongodb://localhost/projectt-v2")
    .then(
        () => Team.find({
            nation: "Unknown"
        })
    )
    .then(function (teams) {

        // teams = teams.slice(25, 50)

        for (let team of teams) {


            fetcher.fetch(team.id)
                .then(function (page) {

                    console.log(`Team: ${team.id} ${i++}`);
                    let wikiPage = wikiParser.parse(page.data);

                    let nation = getTeamNation(wikiPage, page);


                    if (nation) {

                        console.log(`Team: ${team.id}, nation: ${nation}, updating`);

                        team.nation = nation;

                        team.save().then(() => console.log("Saved")).catch((err) => console.error(err));
                    }


                })
                .catch(function (err) {
                    console.error(err);
                })

        }

    })
    .catch(function (err) {
        console.error(err);
    });


function getTeamNation(wikiPage, page) {

    for (let cat of wikiPage.categories) {
        if (cat.startsWith("Football clubs in ")) {
            let nation = cat.replace("Football clubs in ", "");
            if (nations.has(nation)) {
                return nation;
            }
        }
    }

    for (let nation of nations) {
        for (let cat of wikiPage.categories) {
            if (cat.indexOf(nation) >= 0) {
                console.log("Found nation with: " + cat);
                return nation;
            }
        }

        if (page.indexOf("Category:Football clubs in " + nation) >= 0) {
            return nation;
        }
    }

    for (let clue of clues) {
        if (page.indexOf(clue[0]) >= 0) {
            return clue[1];
        }
    }

    if (wikiPage.text && wikiPage.text.Intro) {
        let introText = wikiPage.text.Intro[0].text;

        for (let nation of nations) {
            if (introText.indexOf(introText) >= 0) {
                console.log("Found nation from introText: " + introText);
                return nation;
            }
        }
    }

}