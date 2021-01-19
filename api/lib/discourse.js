const fetch = require('node-fetch');

const { DISCOURSE_API_URL, DISCOURSE_API_KEY } = process.env;
const DISCOURSE_API_USERNAME = 'system';

const headers = {
  'Api-Key': DISCOURSE_API_KEY,
  'Api-Username': DISCOURSE_API_USERNAME,
  'Content-Type': 'application/json',
};

module.exports = {
  categories: {
    getAll: async () => {
      const response = await fetch(`${DISCOURSE_API_URL}/categories.json`, {
        headers,
      });
      const {
        category_list: { categories },
      } = await response.json();
      return categories;
    },
    create: async (name) => {
      const body = { name, color: '2f2ad1', text_color: 'FFFFFF' };
      const response = await fetch(`${DISCOURSE_API_URL}/categories.json`, {
        method: 'post',
        body: JSON.stringify(body),
        headers,
      });

      const json = await response.json();

      if (json.errors) {
        console.log(json.errors);
        // need to handle errors like category name is already taken.
      }

      return json.category;
    },
  },
};
