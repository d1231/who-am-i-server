let availableNations = config.availableNations;


module.exports = function(value) {

    return new Promise(function(resolve, reject) {

        let nationsToCheck;

        if (typeof value !== "Array") {
            nationsToCheck = [value];
        }

        for (let nation of nationsToCheck) {

            if (!availableNations.has(nation)) {
                reject(`Unsupported nation ${nation}`);
            }

        }

        resolve(nationsToCheck);

    })

}