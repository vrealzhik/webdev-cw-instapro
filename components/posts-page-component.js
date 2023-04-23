import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";

export function renderPostsPageComponent({ appEl }) {

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const postsHtml = posts.map((post) => {
    return `<li class="post">
    <div class="post-header" data-user-id="${post.id}">
        <img src=${post.userImg} class="post-header__user-image">
        <p class="post-header__user-name">${post.name}</p>
    </div>
    <div class="post-image-container">
      <img class="post-image" src=${post.img}>
    </div>
    <div class="post-likes">
      <button data-post-id="642d00579b190443860c2f32" class="like-button">
        <img src="./assets/images/like-active.svg">
      </button>
      <p class="post-likes-text">
        Нравится: <strong>2</strong>
      </p>
    </div>
    <p class="post-text">
      <span class="user-name">${post.name}</span>
      ${post.description}
    </p>
    <p class="post-date">
      19 минут назад
    </p>
  </li>`
  })

  const appHtml = `
    <div class="page-container">
    <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
