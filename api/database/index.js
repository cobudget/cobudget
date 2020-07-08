import UserSchema from './models/user';
import MemberSchema from './models/member';
import EventSchema from './models/event';
import DreamSchema from './models/dream';
import GrantSchema from './models/grant';
import OrganiztionSchema from './models/organization';

const getModels = (db) => {
  return {
    User: db.model('User', UserSchema),
    Organization: db.model('Organization', OrganiztionSchema),
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema),
  };
};

module.exports = { getModels };
