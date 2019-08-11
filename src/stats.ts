import YAML from 'yaml'
import fs from 'fs'
import Ajv from 'ajv'
import glob from 'glob'

import match_schema from './match-schema.json';

const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const validate = ajv.compile(match_schema);


glob.sync("./mens/2019/seniors/*.yml").forEach(filename => {
    try {
        let content = fs.readFileSync(filename, 'utf8');

        let json = YAML.parse(content);

        var valid = validate(json);

        if (!valid)
            throw new Error(JSON.stringify(validate.errors));
    }
    catch (e) {
        console.log(filename);
        console.log(e.message);

    }
});

