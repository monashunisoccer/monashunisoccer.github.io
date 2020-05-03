import YAML from 'yaml'
import fs from 'fs'
import Ajv from 'ajv'
import glob from 'glob'

import match_schema from './match-schema.json';
import {MatchWrapper} from "./match-implementations";


const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const validate = ajv.compile(match_schema);

let matches: MatchWrapper[] = [];

glob.sync("./mens-playing/2019/seniors/*.yml").forEach(filename => {
    try {
        let content = fs.readFileSync(filename, 'utf8');

        let json = YAML.parse(content);

        var valid = validate(json);

        if (!valid)
            throw new Error(JSON.stringify(validate.errors));

        matches.push(new MatchWrapper(json));
    }
    catch (e) {
        console.log(filename);
        console.log(e.message);

    }
});

console.log("| R | DATE | VENUE| OPP | RESULT | SCORERS | OTHER |");
console.log("| --- | --- | --- | --- |   ---  |  ---    |  ---  |");

matches.sort((a,b) => a.date.getTime() - b.date.getTime())
    .forEach((m) => {

        console.log(m.asResultMarkdownRow());


        if (m.round === "R6") {
            for (var [key, value] of m.starter) {
                console.log(value.shortUniqueName(m.ourPlayers.values()));
            }

            m.ourGoals.sort((a,b) => a.when.localeCompare(b.when))
                .forEach((g) => console.log(JSON.stringify(g)));
        }

});

console.log("H Home, A Away, N Neutral");
console.log("CS Clean sheet, PS Penalty save, RC Red card");
console.log("OG Own goal");

class AppearanceCount {

    starting: number = 0;
    sub: number = 0;
    total: number = 0;

    bumpStarter() {
        this.starting += 1;
        this.total += 1;
    }

    bumpSub() {
        this.sub += 1;
        this.total += 1;
    }
}

let appearances = new Map<string, AppearanceCount>();

matches.sort((a,b) => a.date.getTime() - b.date.getTime())
    .forEach((m) => {

        for (var [starterName, starterPlayer] of m.starter) {
            if (!appearances.has(starterName))
                appearances.set(starterName, new AppearanceCount());

            appearances.get(starterName).bumpStarter();
        }

        for (var [benchName, benchPlayer] of m.bench) {
            if (!appearances.has(benchName))
                appearances.set(benchName, new AppearanceCount());

            appearances.get(benchName).bumpSub();
        }


    });

let counts = Array.from(appearances.entries());

counts.sort((a,b) => b[1].starting - a[1].starting);
counts.sort((a,b) => b[1].total - a[1].total);

counts.forEach((c) => {
   console.log(c[0] + ' ' + c[1].total + ' starting ' + c[1].starting + ' sub ' + c[1].sub);
});
