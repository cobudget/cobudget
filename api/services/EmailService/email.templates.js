const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

let cache = {};

/**
 * Handles loading and caching of templates
 */
class EmailTemplates {

    static getTemplate(fileName) {
        if(cache[fileName]) {
            return cache[fileName];
        }
        const template = readFile(path.resolve(__dirname, fileName), "utf8");
        cache[fileName] = template;
        return template;
    }

    static async getLoginTemplate(organizationName, link) {
        let template = await this.getTemplate('./login.template.html');
        template = template.replace("${ORGANIZATION_NAME}", organizationName);
        template = template.replace("${LINK}", link);
        return template;
    };
}

module.exports = EmailTemplates;
