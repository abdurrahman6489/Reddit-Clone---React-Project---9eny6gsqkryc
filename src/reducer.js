import {
  filterObject,
  chipProps,
  changeVote,
  updateComments,
  deleteComment,
  openInputToEdit,
  editComments,
} from "./utils";
const filterCallback = {
  0: (elem) => true,
  1: (elem) => elem.upvote / elem.downvote > 3,
  2: (elem) =>
    elem.upvote / elem.downvote > 1.5 && elem.upvote / elem.downvote <= 3,
  3: (elem) =>
    elem.upvote / elem.downvote >= 1 && elem.upvote / elem.downvote < 1.5,
};

const INITIAL_POPUP_STATUS = {
  open: false,
  msg: "",
  signal: "",
};

const INITIAL_CURRENT_USER = { username: "", password: "", firstName: "" };

const INITIAL_STATE = {
  posts: [],
  filteredPosts: [],
  selectedPost: {},
  comments: {},
  users: [],
  currentUser: INITIAL_CURRENT_USER,
  popUp: INITIAL_POPUP_STATUS,
  currentFilter: Object.keys(filterObject)[1],
  filtersArray: chipProps,
  isLoggedIn: false,
};

export const postReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case "fetchPostandUser":
      return {
        ...state,
        posts: [...action.payload.posts],
        filteredPosts: filterObject[state.currentFilter]["filterThePosts"](
          action.payload.posts
        ),
        users: [...action.payload.users],
      };

    case "upvote":
      const updatedArrayUpvote = changeVote.changeUpvote(state.posts, action);
      const currentUpvotePost = updatedArrayUpvote
        .slice()
        .find((post) => post.id == action.payload.id);
      return {
        ...state,
        posts: updatedArrayUpvote,
        filteredPosts:
          filterObject[state.currentFilter].filterThePosts(updatedArrayUpvote),
        selectedPost: { ...state.selectedPost, ...currentUpvotePost },
      };

    case "downvote":
      const updatedArrayDownvote = changeVote.changeDownvote(
        state.posts,
        action
      );
      const currentDownvotePost = updatedArrayDownvote
        .slice()
        .find((post) => post.id == action.payload.id);
      return {
        ...state,
        posts: updatedArrayDownvote,
        filteredPosts:
          filterObject[state.currentFilter].filterThePosts(
            updatedArrayDownvote
          ),
        selectedPost: { ...state.selectedPost, ...currentDownvotePost },
      };

    case "addPost":
      return {
        ...state,
        posts: [
          {
            id: state.posts.length + 1,
            ...action.payload,
            upvote: 0,
            downvote: 0,
            time: Date.now(),
            username: state.currentUser.firstName || "",
          },
          ...state.posts,
        ],
      };

    case "filterPost":
      const newFiltersArray = state.filtersArray.map((filter, index) =>
        index == action.index
          ? { ...filter, status: true }
          : { ...filter, status: false }
      );
      return {
        ...state,
        filteredPosts: filterObject[action.payload].filterThePosts(
          state.posts,
          action.searchQuery
        ),
        currentFilter: action.payload,
        filtersArray: [...newFiltersArray],
      };

    case "getSelectedPost":
      const curentSelectedPost = state.posts.find(
        (post) => post.id === action.payload.id
      );
      return {
        ...state,
        selectedPost: { ...state.selectedPost, ...curentSelectedPost },
      };

    case "getAllComments":
      return {
        ...state,
        comments: { ...state.comments, ...action.payload },
      };

    case "addComment":
      const { comment, id } = action.payload;
      const newComments = updateComments(
        state.comments,
        comment,
        id,
        state.currentUser.firstName
      );
      return {
        ...state,
        comments: {
          ...state.comments,
          ...newComments,
        },
      };

    case "deleteComment":
      const { id: currentId, date } = action.payload;
      const updatedComments = deleteComment(
        state.comments,
        currentId,
        state.currentUser.firstName,
        date
      );
      return {
        ...state,
        comments: {
          ...state.comments,
          ...updatedComments,
        },
      };
    case "openToEdit":
      const toBeEditedComments = openInputToEdit(
        state.comments,
        action.payload.id,
        state.currentUser.firstName,
        action.payload.date
      );
      return {
        ...state,
        comments: {
          ...state.comments,
          ...toBeEditedComments,
        },
      };

    case "editComment":
      const editedComments = editComments(
        state.comments,
        action.payload.comment,
        action.payload.id,
        state.currentUser.firstName,
        action.payload.date
      );

      return {
        ...state,
        comments: {
          ...state.comments,
          ...editedComments,
        },
      };

    case "loginUser":
      return {
        ...state,
        currentUser: {
          ...action.payload,
          firstName: state.users[action.index].firstName,
        },
        isLoggedIn: true,
      };

    case "addUser":
      const { username, password, firstName, lastName } = action.payload;
      return {
        ...state,
        currentUser: { ...state.currentUser, username, password, firstName },
        users: [
          ...state.users,
          { id: state.users.length + 1, ...action.payload },
        ],
        isLoggedIn: true,
      };

    case "loginWithGoogle":
      const { googleUsername, googleFirstName } = action.payload;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          username: googleUsername,
          firstName: googleFirstName,
        },
        isLoggedIn: true,
      };

    case "userLogout":
      return {
        ...state,
        filteredPosts: filterObject["Best"]["filterThePosts"](state.posts),
        filtersArray: [...chipProps],
        currentUser: { ...state.currentUser, ...INITIAL_CURRENT_USER },
        isLoggedIn: false,
      };

    case "setMsg":
      return {
        ...state,
        popUp: { ...state.popUp, open: true, ...action.payload },
      };

    case "closeModal":
      return {
        ...state,
        popUp: { ...state.popUp, ...INITIAL_POPUP_STATUS },
      };
  }

  return state;
};
