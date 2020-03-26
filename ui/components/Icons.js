// Use Heroicons if suitable icon is available. Add from here: https://heroicons.dev/

// Heroicons/trash
export const DeleteIcon = props => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    ></path>
  </svg>
);

// Heroicons/chat/outline
export const CommentIcon = props => (
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
export const CoinIcon = props => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12,6C7.03,6,2,7.546,2,10.5v4C2,17.454,7.03,19,12,19s10-1.546,10-4.5v-4C22,7.546,16.97,6,12,6z M4,14.5v-1.197 c0.576,0.335,1.251,0.623,2,0.86v1.881C4.688,15.53,4,14.918,4,14.5z M16,14.648v1.971c-0.867,0.179-1.867,0.31-3,0.358v-2 C14.028,14.935,15.041,14.823,16,14.648z M11,16.978c-1.133-0.048-2.133-0.179-3-0.358v-1.971c0.959,0.174,1.972,0.287,3,0.33 V16.978z M18,16.044v-1.881c0.749-0.237,1.424-0.524,2-0.86V14.5C20,14.918,19.313,15.53,18,16.044z M12,13c-5.177,0-8-1.651-8-2.5 S6.823,8,12,8s8,1.651,8,2.5S17.177,13,12,13z" />
  </svg>
);

// Heroicons/arrow-narrow-right
export const RightArrowIcon = props => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    ></path>
  </svg>
);

// Heroicons/emoji-happy/outline
export const HappyEmojiIcon = props => (
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
export const HeartOutlineIcon = props => (
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
export const HeartSolidIcon = props => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    ></path>
  </svg>
);

// Heroicons/search/outline
export const SearchIcon = props => (
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

export const ListIcon = props => (
  <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
      clipRule="evenodd"
    ></path>
  </svg>
);
