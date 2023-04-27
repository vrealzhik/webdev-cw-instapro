import { addPostFetch, getPosts, getUserPosts, addLike, addDislike } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { renderUserPageComponent } from "./components/user-page-component.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken()})
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();
      
      let userId = data.userId
      return getUserPosts({userId, token: getToken()})
      .then((newPosts) => {
        page = USER_POSTS_PAGE;
        posts = newPosts;
        renderApp();
      })
    }

    page = newPage;
    renderApp();

    return;
  }

  likeEventListeners();

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({description, imageUrl }) {
        // TODO: реализовать добавление поста в API
        addPostFetch({
          description,
          imageUrl,
          token: getToken(),
        })
        .then(() => {
          goToPage(POSTS_PAGE);
        })
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderUserPageComponent({
      appEl,
    });
  }

  likeEventListeners();
};

export const likeEventListeners = () => {
  const likeButtonsElements = document.querySelectorAll(".like-button");

  for ( const likeButtonElement of likeButtonsElements) {
    const postId = likeButtonElement.dataset.postId
    //const userId = likeButtonElement.dataset.userId
    const index = +(likeButtonElement.dataset.index)
    likeButtonElement.addEventListener("click", () => {
      let userId = posts[index].id
      // let postId = posts[index].id
      console.log(posts[index].isLiked)
      if (posts[index].isLiked === true) {
        addDislike({postId, token: getToken()}).then(() => {
          if(page === POSTS_PAGE) {
            return getPosts({ token: getToken()})
            .then((newPosts) => {
              page = POSTS_PAGE;
              posts = newPosts;
              renderApp();
            })
          } else {
            return getUserPosts({userId, token: getToken()})
            .then((newPosts) => {
              page = USER_POSTS_PAGE;
              posts = newPosts;
              renderApp();
            })
          }

        })
      } else {
        addLike({postId, token: getToken()}).then(() => {
          if(page === POSTS_PAGE) {
            return getPosts({ token: getToken()})
            .then((newPosts) => {
              page = POSTS_PAGE;
              posts = newPosts;
              renderApp();
            })
          } else {
            return getUserPosts({userId, token: getToken()})
            .then((newPosts) => {
              page = USER_POSTS_PAGE;
              posts = newPosts;
              renderApp();
            })
          }
        })
      }
    })
  }
}

const btnUp = {
  el: document.querySelector('.btn-up'),
  show() {
    this.el.classList.remove('btn-up_hide');
  },
  hide() {
    this.el.classList.add('btn-up_hide');
  },
  addEventListener() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      scrollY > 400 ? this.show() : this.hide();
    });
    document.querySelector('.btn-up').onclick = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }
}

btnUp.addEventListener();

goToPage(POSTS_PAGE);
likeEventListeners();
