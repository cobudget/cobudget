const path = require("path");
const ejs = require("ejs");

/**
 * Handles loading and caching of templates
 */
class EmailTemplates {
  static getTemplateFile(fileName) {
    return path.resolve(__dirname, fileName);
  }
  static async getLoginTemplate(organization, loginUrl, organizationUrl) {
    const fileName = this.getTemplateFile("login.template.ejs");
    return ejs.renderFile(
      fileName,
      { organization, loginUrl, organizationUrl },
      { cache: true }
    );
  }
}

module.exports = EmailTemplates;
