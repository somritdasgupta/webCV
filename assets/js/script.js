'use strict';

// script.js

window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  const content = document.querySelector('.content');
  const duration = 1000; // Total duration of the transition in milliseconds
  let startTimestamp;

  function animate(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      // Calculate the progress of the animation (0 to 1)
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing function for smoother transition
      const easedProgress = easeInOutQuad(progress);

      preloader.style.opacity = 1 - easedProgress;
      content.style.opacity = easedProgress;

      if (progress < 1) {
          requestAnimationFrame(animate);
      } else {
          preloader.style.display = 'none';
          preloader.style.backdropFilter = 'none';
          document.body.style.overflow = 'auto';
      }
  }

  requestAnimationFrame(animate);

  // Easing function for smoother transition
  function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
});


function loadContent(section) {
  fetch(section + '.html')
    .then(response => response.text())
    .then(content => {
      document.getElementById('content').innerHTML = content;
    })
    .catch(error => console.error('Error loading content:', error));
}

function handleNavigation(event) {
  const section = event.target.getAttribute('data-nav-link');
  if (section) {
    loadContent(section);
    history.pushState({ section }, '', `#${section}`);
  }
}

window.addEventListener('popstate', event => {
  const section = event.state.section || 'about';
  loadContent(section);
});

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navbar-link');
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  const initialSection = window.location.hash.substring(1) || 'about';
  loadContent(initialSection);
});

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }  



//Blog
// script.js
const GET_USER_ARTICLES = `
  query GetUserArticles($page: Int!) {
    user(username: "somrit") {
      publication {
        posts(page: $page) {
          title
          brief
          slug
          coverImage
          dateAdded
        }
      }
    }
  }
`;

async function displayBlogPosts() {
  try {
    const response = await fetch('https://api.hashnode.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_USER_ARTICLES,
        variables: { page: 0 },
      }),
    });

    const result = await response.json();
    const articles = result.data.user.publication.posts;

    const container = document.querySelector('.blog-posts-list');

    container.innerHTML = ''; // Clear existing content

    articles.forEach(article => {
      const blogCard = document.createElement('div');
      blogCard.classList.add('blog-card');

      const formattedDate = new Date(article.dateAdded).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      blogCard.innerHTML = `
        <a href="https://hashnode.com/post/${article.slug}" target="_blank">
          <div class="blog-banner-box">
            <img src="${article.coverImage}" alt="${article.title}">
          </div>
          <div class="blog-content">
            <h2 class="blog-item-title">${article.title}</h2>
            <time>${formattedDate}</time>
          </div>
        </a>
      `;

      container.appendChild(blogCard);
    });
  } catch (error) {
    console.error('Error fetching and displaying blog posts:', error);
  }
}

// Function to update blog posts and display them
function updateAndDisplayBlogPosts() {
  displayBlogPosts();
}

// Call the function to display initial blog posts
updateAndDisplayBlogPosts();

// Set up an interval to update blog posts every 5 seconds
const updateInterval = 5000; 
setInterval(updateAndDisplayBlogPosts, updateInterval);







// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
function showExceedToast() {
  const toast = document.getElementById('exceed-toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Show for 3 seconds
}

function updateFileName(input) {
  const label = input.parentNode;
  const fileLabel = document.getElementById('fileLabel'); // Get the file label element
  const sendButton = label.nextElementSibling; // Get the send button element

  const file = input.files[0];
  
  if (file) {
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    
    if (fileSize > 5) {
      // Show toaster notification for exceeded file size
      showExceedToast();
      
      input.value = ''; // Clear the file input
      fileLabel.textContent = 'Choose';
      sendButton.disabled = false; // Re-enable the send button
      return;
    }
    
    fileLabel.textContent = 'Done';
    label.querySelector('ion-icon').setAttribute('name', 'cloud-done-outline'); // Change icon to tickmark
    sendButton.disabled = false; // Re-enable the send button
  } else {
    fileLabel.textContent = 'Attach File';
    label.querySelector('ion-icon').setAttribute('name', 'attach'); // Change icon back to attach
    sendButton.disabled = true; // Disable the send button until a file is selected
  }
}




// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}