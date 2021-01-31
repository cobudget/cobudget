const fetch = require('node-fetch');

const { DISCOURSE_API_URL, DISCOURSE_API_KEY } = process.env;
const DISCOURSE_API_USERNAME = 'system';

const headers = {
  'Api-Key': DISCOURSE_API_KEY,
  'Api-Username': DISCOURSE_API_USERNAME,
  'Content-Type': 'application/json',
};

const discourse = {
  categories: {
    getAll: async () => {
      const response = await fetch(`${DISCOURSE_API_URL}/categories`, {
        headers,
      });
      const {
        category_list: { categories },
      } = await response.json();
      return categories;
    },
    create: async ({ name, color = '2f2ad1', text_color = 'FFFFFF' }) => {
      const response = await fetch(`${DISCOURSE_API_URL}/categories`, {
        method: 'post',
        headers,
        body: JSON.stringify({ name, color, text_color }),
      });

      const json = await response.json();

      if (json.errors) {
        console.log(json.errors);
        // TODO: need to handle errors like category name is already taken.
      }

      return json.category;
    },
  },
  users: {
    create: async ({
      name,
      email,
      password,
      username,
      active = true,
      approved = true,
    }) => {
      const response = await fetch(`${DISCOURSE_API_URL}/users`, {
        method: 'post',
        headers,
        body: JSON.stringify({
          name,
          email,
          password,
          username,
          active,
          approved,
        }),
      });

      const json = await response.json();
      // json = {
      //     "success": true,
      //     "active": true,
      //     "message": "string",
      //     "user_id": 0
      //  }
      return json;
    },
  },
  posts: {
    create: async (
      {
        title, // required if creating a new topic or new private message
        topic_id, // required if creating a new post
        raw, // required
        category, // optional if creating a new topic, ignored if creating a new post
        target_recipients, // required for private message, comma separated usernames
        archetype, // required for private message, value: "private_message"
        created_at, // pick a date other than the default current time
      },
      { username }
    ) => {
      const response = await fetch(`${DISCOURSE_API_URL}/posts`, {
        method: 'post',
        headers: {
          ...headers,
          ...(username && { 'Api-Username': username }),
        },
        body: JSON.stringify({
          ...(title && { title }),
          ...(topic_id && { topic_id }),
          raw,
          ...(category && { category }),
          ...(target_recipients && { target_recipients }),
          ...(archetype && { archetype }),
          ...(created_at && { created_at }),
        }),
      });
      return response.json();
    },
    get: async (id) => {
      // query parameter print=true will return up to 1000 posts in a topic
      const response = await fetch(`${DISCOURSE_API_URL}/t/${id}.json`, {
        headers,
      });
      const json = await response.json();
      return json;
    },
    delete: async (id, username) => {
      const response = await fetch(`${DISCOURSE_API_URL}/posts/${id}`, {
        headers: {
          ...headers,
          ...(username && { 'Api-Username': username }),
        },
        method: 'DELETE',
      });

      return response;
    },
  },
};

module.exports = discourse;
