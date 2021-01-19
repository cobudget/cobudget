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
};
