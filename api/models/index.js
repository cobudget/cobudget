let users = {
  1: {
    id: '1',
    name: 'Gustav Larsson',
    email: 'gustav.larsson@gmail.com',
    membershipIds: [1]
  },
  2: {
    id: '2',
    name: 'Dave Davids',
    email: 'dave.davids@gmail.com',
    membershipIds: [2]
  }
};

let memberships = {
  1: {
    id: '1',
    userId: '1',
    eventId: '1',
    isAdmin: true
  },
  2: {
    id: '2',
    userId: '2',
    eventId: '2',
    isAdmin: true
  }
};

let events = {
  1: {
    id: '1',
    slug: 'borderland2020',
    title: 'Borderland 2020',
    description: 'where dreams meet reality',
    membershipIds: ['1']
  },
  2: {
    id: '2',
    slug: 'sthlm-micro-burn',
    title: 'Sthlm Micro Burn 2020',
    membershipIds: ['2']
  }
};

export default {
  users,
  memberships,
  events
};
