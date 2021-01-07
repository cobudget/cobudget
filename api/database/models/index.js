const EventMemberSchema = require('./eventMember');
const EventSchema = require('./event');
const DreamSchema = require('./dream');
const GrantSchema = require('./grant');
const {
  db: {
    schemas: { OrganizationSchema, OrgMemberSchema },
  },
} = require('plato-core');

const { createLogModels } = require('./log');

let models = null;
const getModels = (db) => {
  if (models === null)
    models = {
      Organization: db.model('Organization', OrganizationSchema),
      OrgMember: db.model('OrgMember', OrgMemberSchema),
      EventMember: db.model('EventMember', EventMemberSchema),
      Event: db.model('Event', EventSchema),
      Dream: db.model('Dream', DreamSchema),
      Grant: db.model('Grant', GrantSchema),
      logs: createLogModels(db),
    };

  return models;
};

module.exports = { getModels };
