const UserSchema = require('./user');
const MemberSchema = require('./member');
const EventSchema = require('./event');
const DreamSchema = require('./dream');
const GrantSchema = require('./grant');
const OrganiztionSchema = require('./organization');

const getModels = (db) => {
  return {
    Organization: db.model('Organization', OrganiztionSchema),
    User: db.model('User', UserSchema),
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema),
  };
};

module.exports = { getModels };
