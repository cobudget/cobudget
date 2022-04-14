const path = require("path");
const ejs = require("ejs");

/**
 * Handles loading and caching of templates
 */
class EmailTemplates {
  static getTemplateFile(fileName) {
    return path.resolve(__dirname, fileName);
  }
  static async getLoginTemplate(group, loginUrl, groupUrl) {
    const fileName = this.getTemplateFile("login.template.ejs");
    return ejs.renderFile(
      fileName,
      { group, loginUrl, groupUrl },
      { cache: true }
    );
  }
}

module.exports = EmailTemplates;
