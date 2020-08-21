const UserSchema = require('./models/user');
const MemberSchema = require('./models/member');
const EventSchema = require('./models/event');
const DreamSchema = require('./models/dream');
const GrantSchema = require('./models/grant');
const OrganizationSchema = require('./models/organization');

const getModels = (db) => {
  return {
    User: db.model('User', UserSchema),
    Organization: db.model('Organization', OrganizationSchema),
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema),
  };
};

module.exports = { getModels };
