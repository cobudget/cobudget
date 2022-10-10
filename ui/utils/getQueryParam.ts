/**
 * returns query parameter. If query parameter is an array, it
 * returns first element
 *
 * @param   {Object}    query   -router.query
 * @param   {string}    param   -the param which needs to be fetched
 *
 * @returns {string | undefined}
 */

const getQueryParam = (
  query: { [key: string]: string | string[] },
  param: string
) => {
  if (query[param]) {
    if (Array.isArray(query[param])) {
      return query[param][0];
    } else {
      return query[param] + "";
    }
  }
};

export default getQueryParam;
