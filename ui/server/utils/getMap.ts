const getMap = (arr: unknown[], key: string) => {
  const map = {};
  arr.forEach((e) => {
    map[e[key]] = e;
  });
  return map;
};

export default getMap;
