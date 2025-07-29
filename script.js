const baseURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

getPosts(true, currentPage);
switchUI();

// ============================== infinite scrolling and pagination ==============================
window.onscroll = function (ev) {
  // if the user scrolls to the bottom of the page, load more posts
  if (
    window.innerHeight + window.scrollY >= document.body.scrollHeight &&
    currentPage < lastPage
  ) {
    currentPage++;
    getPosts(false, currentPage);
  }
};
// ============================== //infinite scrolling and pagination// ==============================

// ============================== getPosts ==============================
function getPosts(refresh = true, page = 1) {
  if (refresh) {
    document.getElementById("posts").innerHTML = ``;
  }

  axios
    .get(`${baseURL}/posts?page=${page}`, { params: { limit: 10 } })
    .then((res) => {
      lastPage = res.data.meta.last_page;
      const posts = res.data.data;
      for (post of posts) {
        let author = post.author;
        let profileImages = author.profile_image;
        let image = post.image;
        let created_at = post.created_at;
        let title = post.title;
        let body = post.body;
        let comments_count = post.comments_count;
        let user = JSON.parse(localStorage.getItem("user"));
        let editPostButton = "";
        if (user != null && user != "") {
          let isOwner =
            user.id == post.author.id && user.id != null && user.id != "";
          // console.log("isOwner:", isOwner);
          editPostButton = isOwner
            ? `<div id="editPostButton" class="ms-auto">
                <button class="btn " type="button" onclick="editPost('${encodeURIComponent(
                  JSON.stringify(post)
                )}')"
                  style="font-size: 1.8rem;">✍️</button>
                  <button class="btn " type="button" onclick="deletePost(${
                    post.id
                  })"
                  style="font-size: 1.8rem;">🗑️</button>
            </div>`
            : ` `;
        }
        // Handle tags with error checking
        let tagsContent = "";
        if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
          for (let tag of post.tags) {
            if (tag) {
              // Check if tag is not null/undefined
              tagsContent += `<p class="btn orange mx-2 my-0 orange" style="border-radius: 40px;">${tag.name}</p>`;
            }
          }
        } else {
          tagsContent = `<p class="btn orange mx-2 my-0 orange" style="border-radius: 40px;">No tags</p>
`;
        }

        let content = `
            <div class="card shadow-sm my-3">
                    <!-- ============================== Post Header ============================== -->
                    <div class="card-header d-flex align-items-center my-2">
                     <span onclick="moveToProfile(${author.id})" style="cursor: pointer;">
                        <img src="${profileImages}" class="img-fluid rounded-circle mx-3"
                            onerror="this.src='./assessts/images/profile.png'"
                            style="height: 40px;width: 40px;" alt="accountPic"">
                        <b class="card-title">${author.username}</b>
                      </span>
                      ${editPostButton}
                    </div>
                    <!-- ============================== //Post Header// ============================== -->
                    <!-- ============================== Post Body ============================== -->
                    <div class="card-body">
                        <div class="row ">
                            <img src='${image}' class="img-fluid" style="height: 30rem;" alt="No image posted">
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <p class="text-muted">${created_at}</p>
                                <h5 class="card-title">${title}</h5>
                                <p class="card-text">${body}</p>
                                <a class="btn  mx-2" type="button" data-bs-toggle="modal"
                            data-bs-target="#commentsModal" onclick="showComments(${post.id})">💬 ${comments_count} comments</a>
                                ${tagsContent}
                            </div>
                        </div>
                        <!-- ============================== //Post Body// ============================== -->
                    </div>
                </div>`;
        document.getElementById("posts").innerHTML += content;
      }
    })
    .catch((err) => {
      console.log("error getting posts");
      console.log(err);
    });
}
// ============================== //getPosts// ==============================

// ============================== moveToProfile ==============================
function moveToProfile(id) {
  window.location.href = `profile.html?id=${id}`;
}
// ============================== //moveToProfile// ==============================

// ============================== login ==============================
function login() {
  axios
    .post(`${baseURL}/login`, {
      username: document.getElementById("loginUsername").value,
      password: document.getElementById("loginPassword").value,
    })
    .then((res) => {
      console.log("logged in");
      console.log(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // close the login modal
      const modal = document.getElementById("loginModal");
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((b) => b.remove());

      // allow scrolling
      document.body.style.overflow = "auto";

      showAlert("Logged in successfully!", "success");
      switchUI();

      // If on profile page, refresh it with the user's ID
      if (window.location.pathname.includes("profile.html")) {
        const user = JSON.parse(localStorage.getItem("user"));
        window.location.href = `profile.html?id=${user.id}`;
      }
    })
    .catch((err) => {
      console.log(err.response.data.message);
      showAlert(err.response.data.message, "danger");
    });
}
// ============================== //login// ==============================

// ============================== signup ==============================
function signup() {
  const formData = new FormData();
  formData.append("name", document.getElementById("signupName").value);
  formData.append("email", document.getElementById("signupEmail").value);
  formData.append("username", document.getElementById("signupUsername").value);
  formData.append("password", document.getElementById("signupPassword").value);
  formData.append("image", document.getElementById("profile_image").files[0]);

  axios
    .post(`${baseURL}/register`, formData)
    .then((res) => {
      console.log("signed up");
      console.log(res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // close the login modal
      const modal = document.getElementById("signupModal");
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((b) => b.remove());

      // allow scrolling
      document.body.style.overflow = "auto";

      showAlert("Signed up successfully!", "success");
      switchUI();
    })
    .catch((err) => {
      console.log(err.response.data.message);
      showAlert(err.response.data.message, "danger");
    });
}
// ============================== //signup// ==============================

// function to change the navbar login and signup to logout and add (add post button) and reverse
function switchUI() {
  const token = localStorage.getItem("token");
  if (token == null) {
    document.getElementById("loginAndSignup").style.display = "flex";
    document.getElementById("logoutGroup").style.display = "none";
    document.getElementById("addPostButton").style.display = "none";
  } else {
    let user = JSON.parse(localStorage.getItem("user"));

    // Set default profile image if user.profile_image is not a valid URL
    const profileImage =
      user.profile_image && typeof user.profile_image === "string"
        ? user.profile_image
        : "/assessts/images/profile.png";

    // console.log("from switchUI", user);
    document.getElementById("accountPic").src = profileImage;
    document.getElementById("accountName").innerHTML = user.username;
    document.getElementById("loginAndSignup").style.display = "none";
    document.getElementById("logoutGroup").style.display = "flex";
    document.getElementById("addPostButton").style.display = "flex";
    document.getElementById("profileLink").href = `profile.html?id=${user.id}`;
  }
}

// ============================== //switchUI// ==============================

// ============================== logout ==============================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  showAlert("Logged out successfully!", "success");
  switchUI();

  // If on profile page, redirect to index
  if (window.location.pathname.includes("profile.html")) {
    window.location.href = "index.html";
  }
}
// ============================== //logout// ==============================

// ============================== showAlert ==============================
function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  if (!alertPlaceholder) {
    console.error("Alert placeholder not found!");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
  alertPlaceholder.appendChild(wrapper);

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    if (wrapper && wrapper.parentNode === alertPlaceholder) {
      wrapper.remove();
    }
  }, 3000);
}
// ============================== //showAlert// ==============================

// ============================== showComments ==============================
function showComments(postId) {
  currentPostId = postId;
  const token = localStorage.getItem("token");
  document.getElementById("commentsList").innerHTML = ``;
  // Get comments for the post
  axios
    .get(`${baseURL}/posts/${postId}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("showComments");
      console.log(response.data.data.comments);
      document.getElementById(
        "commentsModalLabel"
      ).innerHTML = `Comments on ${response.data.data.author.username} post`;

      let comments = response.data.data.comments;
      for (let comment of comments) {
        let commentsContent = ``;
        commentsContent += `
                <div class="d-flex align-items-center mb-2">
                    <!-- post owner pic and username -->
                        <img src="${
                          comment.author.profile_image
                        }" class="rounded-circle me-2"
                            style="width: 40px; height: 40px;" onerror="this.src='./assessts/images/profile.png'"
                            alt="Profile picture">
                        <div>
                            <strong>${comment.author.username}</strong>
                            <small class="text-muted ms-2">${comment.author.created_at.substring(
                              0,
                              10
                            )}</small>
                        </div>
                    </div>
                    <p class="mb-0">${comment.body}</p>
                    <br>        
                `;
        document.getElementById("commentsList").innerHTML += commentsContent;
      }
    })
    .catch((err) => {
      console.log(err.response.data.message);
      console.log("error showing comments");
    });
}
// ============================== //showComments// ==============================

// ============================== addComment ==============================
function addComment() {
  const commentBody = document.getElementById("commentBody").value;

  // check if the comment body is empty
  if (!commentBody.trim()) {
    showAlert("Please write a comment first", "warning");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showAlert("Please login to add a comment", "warning");
    return;
  }

  axios
    .post(
      `${baseURL}/posts/${currentPostId}/comments`,
      { body: commentBody },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      showAlert("Comment added successfully", "success");
      document.getElementById("commentBody").value = ""; // Clear the input
      showComments(currentPostId); // Refresh comments
      // refresh the post with the new comments count
      console.log("currentPage:", currentPage);
    })
    .catch((error) => {
      console.error("Error adding comment:", error);
      showAlert("Error adding comment", "danger");
    });
}
// ============================== //addComment// ==============================

// ============================== addOrEditPost ==============================
function addOrEditPost() {
  let postId = document.getElementById("postId").value;
  let isCreate = postId == "" || postId == null;
  // return;

  const token = localStorage.getItem("token");
  let formData = new FormData();
  formData.append("title", document.getElementById("postTitle").value);
  formData.append("body", document.getElementById("postDescription").value);
  formData.append("image", document.getElementById("postImage").files[0]); // for file input

  let url = `${baseURL}/posts`;

  if (isCreate) {
    url = `${baseURL}/posts`;
  } else {
    formData.append("_method", "put");
    url = `${baseURL}/posts/${postId}`;
  }
  axios
    .post(url, formData, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => {
      // close the modal
      const modal = document.getElementById("postModal");
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((b) => b.remove());

      // allow scrolling
      document.body.style.overflow = "auto";

      showAlert("post successfully!", "success");
      getPosts();
    })
    .catch((err) => {
      console.log("failed to post");
      console.log(err.response.data.message);
      showAlert(err.response.data.message, "danger");
    });
}
// ============================== //addOrEditPost// ==============================

// ============================== addPost ==============================
function addPost() {
  document.getElementById("postId").value = "";
  document.getElementById("postModalLabel").innerHTML = "Add post";
  document.getElementById("postTitle").value = "";
  document.getElementById("postDescription").value = "";
  document.getElementById("postButton").innerHTML = "Post";
  document.getElementById("postImage").value = "";
  let postModal = new bootstrap.Modal(document.getElementById("postModal"), {});
  postModal.toggle();
}
// ============================== //addPost// ==============================

// ============================== editPost ==============================
function editPost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  console.log("postImage:", post.image);
  // here
  document.getElementById("postId").value = post.id;
  let user = JSON.parse(localStorage.getItem("user"));
  document.getElementById("postModalLabel").innerHTML = "Edit post";
  document.getElementById("postTitle").value = post.title;
  document.getElementById("postDescription").value = post.body;
  document.getElementById("postButton").innerHTML = "Update";
  // document.getElementById("postImage").value = post.image;
  let postModal = new bootstrap.Modal(document.getElementById("postModal"), {});
  postModal.toggle();
}
// ============================== //editPost// ==============================

// ============================== deletePost ==============================
function deletePost(postId) {
  let confirm = window.confirm("Are you sure you want to delete this post?");
  if (!confirm) {
    return;
  } else {
    const token = localStorage.getItem("token");
    axios
      .delete(`${baseURL}/posts/${postId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        console.log("post deleted");
        showAlert("Post deleted successfully", "success");
        getPosts();
      })
      .catch((err) => {
        console.log("error deleting post");
        console.log(err);
        showAlert(err, "danger");
      });
  }
}
// ============================== //deletePost// ==============================

function toggleLoading(isLoading) {
  if (isLoading) {
    document.getElementById("loading").style.visibility = "visible";
  } else {
    document.getElementById("loading").style.visibility = "hidden";
  }
}
