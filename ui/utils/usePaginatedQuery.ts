import { useEffect, useReducer } from "react";
import { useQuery } from "urql";

const initialState = {
  currentPage: 0,
  pagesData: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "INCREMENT_PAGE":
      return {
        ...state,
        currentPage: state.currentPage + 1,
      };
    case "UPDATE_DATA":
      if (!action.payload.data) return state;
      return {
        ...state,
        pagesData: {
          ...state.pagesData,
          [state.currentPage]: action.payload.data,
        },
      };
    default:
      return state;
  }
};

function usePaginatedQuery({ query, variables, toFullPage, limit }) {
  const [resultsCache, dispatch] = useReducer(reducer, initialState);

  const [{ data: currentPageData, fetching, error }] = useQuery({
    query,
    variables: {
      ...variables,
      limit,
      offset: resultsCache.currentPage * limit,
    },
  });

  const fetchMore = () => {
    dispatch({ type: "INCREMENT_PAGE" });
  };

  const resetCache = () => {
    dispatch({ type: "RESET" });
  };

  const mergeResults = () => {
    dispatch({ type: "UPDATE_DATA", payload: { data: currentPageData } });
  };

  useEffect(resetCache, [variables]);
  useEffect(mergeResults, [currentPageData]);

  return {
    ...resultsCache,
    data: toFullPage(resultsCache.pagesData),
    fetching,

    fetchMore,
    error,
  };
}

export default usePaginatedQuery;
