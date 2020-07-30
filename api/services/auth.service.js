const jwt = require('jsonwebtoken');
const MailgunService = require('./email.service');
const EmailService = require('./email.service');

const jwtSecretKey = process.env.JWT_SECRET;
const jwtOptions = {
  // issuer:
  // audience:
  algorithm: 'HS256',
  expiresIn: '30d'
};

class AuthService {

  static generateLoginJWT(user) {
    return new Promise((resolve, reject) => {
      return jwt.sign(
        { sub: user.id },
        jwtSecretKey,
        jwtOptions,
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        }
      );
    });
  };

  static async sendMagicLink({ inputEmail, currentOrg, models: { User, Member, Event } }
  ) {
    const email = inputEmail.toLowerCase();
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
    if (!emailRegex.test(email)) throw new Error('Not a valid email address');
  
    let user;
    if(currentOrg) {
      user = await User.findOne({ email, organizationId: currentOrg.id });
    }
    
    if (!user) {
      user = await new User({ email, organizationId: currentOrg.id }).save();
    }

    const token = await this.generateLoginJWT(user);
    const isSentSuccess = await EmailService.sendMagicLinkEmail(token, currentOrg, user);
    
    return {
      isSentSuccess,
      user
    }
  }
}

module.exports = AuthService;