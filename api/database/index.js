import UserSchema from './models/user';
import MemberSchema from './models/member';
import EventSchema from './models/event';
import DreamSchema from './models/dream';
import GrantSchema from './models/grant';

const getModels = (db) => {
  return {
    User: db.model('User', UserSchema),
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema),
  };
};

module.exports = { getModels };
