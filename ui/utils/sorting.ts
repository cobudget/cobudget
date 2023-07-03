export const arraySortByStringKey = (arr, key: string) => {
    const newArr: typeof arr = [...arr];
    newArr.sort(( a, b ) => {
        if ( a[key].toLowerCase() < b[key].toLowerCase() ){
          return -1;
        }
        if ( a[key].toLowerCase() > b[key].toLowerCase() ){
          return 1;
        }
        return 0;
      })
    return newArr as typeof arr;
}