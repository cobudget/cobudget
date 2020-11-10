const MemberSchema = require('./member');
const EventSchema = require('./event');
const DreamSchema = require('./dream');
const GrantSchema = require('./grant');
const {
  db: {
    schemas: { OrganizationSchema, UserSchema },
  },
} = require('plato-core');

const { createLogModels } = require('./log');

let models = null;
const getModels = (db) => {
  if (models === null)
    models = {
      Organization: db.model('Organization', OrganizationSchema),
      User: db.model('User', UserSchema),
      Member: db.model('Member', MemberSchema),
      Event: db.model('Event', EventSchema),
      Dream: db.model('Dream', DreamSchema),
      Grant: db.model('Grant', GrantSchema),
      logs: createLogModels(db),
    };

  return models;
};

module.exports = { getModels };
