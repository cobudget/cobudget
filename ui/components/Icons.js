// Use Heroicons if suitable icon is available. Add from here: https://heroicons.dev/

// Heroicons/trash
export const DeleteIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    ></path>
  </svg>
);

// Heroicons/plus
export const AddIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
      fillRule="evenodd"
    ></path>
  </svg>
);

// Heroicons/chat/outline
export const CommentIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    ></path>
  </svg>
);

// Boxicons/coin
export const CoinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12,6C7.03,6,2,7.546,2,10.5v4C2,17.454,7.03,19,12,19s10-1.546,10-4.5v-4C22,7.546,16.97,6,12,6z M4,14.5v-1.197 c0.576,0.335,1.251,0.623,2,0.86v1.881C4.688,15.53,4,14.918,4,14.5z M16,14.648v1.971c-0.867,0.179-1.867,0.31-3,0.358v-2 C14.028,14.935,15.041,14.823,16,14.648z M11,16.978c-1.133-0.048-2.133-0.179-3-0.358v-1.971c0.959,0.174,1.972,0.287,3,0.33 V16.978z M18,16.044v-1.881c0.749-0.237,1.424-0.524,2-0.86V14.5C20,14.918,19.313,15.53,18,16.044z M12,13c-5.177,0-8-1.651-8-2.5 S6.823,8,12,8s8,1.651,8,2.5S17.177,13,12,13z" />
  </svg>
);

// Heroicons/arrow-narrow-right
export const RightArrowIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    ></path>
  </svg>
);

// Heroicons/emoji-happy/outline
export const HappyEmojiIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

// Heroicons/heart/outline
export const HeartOutlineIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
  </svg>
);

// Heroicons/heart/solid
export const HeartSolidIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    ></path>
  </svg>
);

// Heroicons/search/outline
export const SearchIcon = (props) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
);

export const ListIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
      clipRule="evenodd"
    ></path>
  </svg>
);

// Boxicons Hide
export const HideSolidIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M8.073 12.194L4.212 8.333c-1.52 1.657-2.096 3.317-2.106 3.351L2 12l.105.316C2.127 12.383 4.421 19 12.054 19c.929 0 1.775-.102 2.552-.273l-2.746-2.746C9.811 15.88 8.174 14.243 8.073 12.194zM12.054 5c-1.855 0-3.375.404-4.642.998L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.298-3.298c2.638-1.953 3.579-4.637 3.593-4.679L22.107 12l-.105-.316C21.98 11.617 19.687 5 12.054 5zM13.96 12.546c.187-.677.028-1.439-.492-1.96s-1.283-.679-1.96-.492L10 8.586C10.602 8.222 11.3 8 12.054 8c2.206 0 4 1.794 4 4 0 .754-.222 1.452-.587 2.053L13.96 12.546z" />
  </svg>
);

// Boxicons Hide
export const HideOutlineIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757C12.568 16.983 12.291 17 12 17c-5.351 0-7.424-3.846-7.926-5 .204-.47.674-1.381 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379-.069.205-.069.428 0 .633C2.073 12.383 4.367 19 12 19zM12 5c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657.069-.205.069-.428 0-.633C21.927 11.617 19.633 5 12 5zM16.972 15.558l-2.28-2.28C14.882 12.888 15 12.459 15 12c0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501C9.796 7.193 10.814 7 12 7c5.351 0 7.424 3.846 7.926 5C19.624 12.692 18.76 14.342 16.972 15.558z" />
  </svg>
);
