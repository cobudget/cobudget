const fetch = require("node-fetch");

const discourse = ({ url, apiKey } = {}) => {
  const headers = {
    "Api-Key": apiKey,
    "Api-Username": "system",
    "Content-Type": "application/json",
  };
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  return {
    categories: {
      getAll: async () => {
        const res = await fetch(`${url}/categories.json`, {
          headers,
        });
        const {
          category_list: { categories },
        } = await res.json();
        return categories;
      },
      create: async ({ name, color = "2f2ad1", text_color = "FFFFFF" }) => {
        const res = await fetch(`${url}/categories`, {
          method: "post",
          headers,
          body: JSON.stringify({ name, color, text_color }),
        });

        const json = await res.json();

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
        const res = await fetch(`${url}/users`, {
          method: "post",
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

        const json = await res.json();
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
        { username, userApiKey } = {}
      ) => {
        const res = await fetch(`${url}/posts`, {
          method: "post",
          headers: {
            ...defaultHeaders,
            ...(username && { "Api-Username": username }),
            ...(userApiKey
              ? { "User-Api-Key": userApiKey }
              : { "Api-Key": apiKey }),
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
        return res.json();
      },
      update: async (id, { title, raw }, { username, userApiKey } = {}) => {
        const res = await fetch(`${url}/posts/${id}`, {
          method: "put",
          headers: {
            ...defaultHeaders,
            ...(username && { "Api-Username": username }),
            ...(userApiKey
              ? { "User-Api-Key": userApiKey }
              : { "Api-Key": apiKey }),
          },
          body: JSON.stringify({ title, post: { raw } }),
        });

        const { post = {} } = await res.json();
        return post;
      },
      get: async (id) => {
        // query parameter print=true will return up to 1000 posts in a topic
        const res = await fetch(`${url}/t/${id}.json?include_raw=true`, {
          headers,
        });
        const json = await res.json();
        return json;
      },
      getSingle: async (id) => {
        const res = await fetch(`${url}/posts/${id}.json`, {
          headers,
        });
        const json = await res.json();
        return json;
      },
      delete: async ({ id, userApiKey, username }) => {
        const res = await fetch(`${url}/posts/${id}`, {
          headers: {
            ...headers,
            ...(userApiKey && { "User-Api-Key": userApiKey }),
            ...(username && { "Api-Username": username }),
          },
          method: "DELETE",
        });

        return res;
      },
    },
    topics: {
      getSummary: async ({ id }, { username, userApiKey, apiKey }) => {
        const postRes = await fetch(`${url}/posts/by_number/${id}/1.json`, {
          headers: {
            ...defaultHeaders,
            ...(username && { "Api-Username": username }),
            ...(userApiKey
              ? { "User-Api-Key": userApiKey }
              : { "Api-Key": apiKey }),
          }
        });

        const post = await postRes.json();
        return post;
      }
    }
  };
};

module.exports = discourse;
