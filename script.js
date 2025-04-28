// Import Firebase core and initialize
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

// Import Firebase Auth module at the top level
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBWwt4mz32LhdQnHsZ5WvrwJiO-7c6U5L4",
    authDomain: "jobfind-8d30d.firebaseapp.com",
    projectId: "jobfind-8d30d",
    storageBucket: "jobfind-8d30d.firebasestorage.app",
    messagingSenderId: "746793435300",
    appId: "1:746793435300:web:a77eb2755827c09524e631",
    measurementId: "G-9H3SHTC0TE",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase Auth
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  // ===============================
  // DOM Elements
  // ===============================

  // Auth Modal Elements
  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");
  const loginBtn = document.querySelector(".btn-login");
  const signupBtn = document.querySelector(".btn-signup");
  const showLoginBtn = document.getElementById("show-login");
  const showSignupBtn = document.getElementById("show-signup");
  const closeButtons = document.querySelectorAll(".close-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const googleLoginBtn = document.getElementById("google-login");
  const googleSignupBtn = document.getElementById("google-signup");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
  const notification = document.getElementById("auth-notification");
  const notificationMessage = document.querySelector(".notification-message");
  const notificationClose = document.querySelector(".notification-close");
  const signupPassword = document.getElementById("signup-password");
  const strengthMeter = document.querySelector(".strength-meter-fill");
  const strengthText = document.querySelector(".strength-text");

  // Job Search Elements
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const jobSearchForm = document.querySelector(".job-search-form");
  const jobsWrapper = document.querySelector(".jobs-wrapper");
  const jobCards = document.querySelectorAll(".job-card");
  const searchBtn = document.querySelector(".search-btn");
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");

  // ===============================
  // Auth Modal Functions
  // ===============================

  // Open login modal
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      if (signupModal) signupModal.classList.remove("active");
      if (loginModal) loginModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Open signup modal
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      if (loginModal) loginModal.classList.remove("active");
      if (signupModal) signupModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Switch between login and signup
  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (signupModal) signupModal.classList.remove("active");
      if (loginModal) loginModal.classList.add("active");
    });
  }

  if (showSignupBtn) {
    showSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.classList.remove("active");
      if (signupModal) signupModal.classList.add("active");
    });
  }

  // Close modals
  if (closeButtons) {
    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const modalId = button.getAttribute("data-modal");
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
        document.body.style.overflow = "auto";
      });
    });
  }

  // Close modal if clicked outside
  window.addEventListener("click", (e) => {
    if (loginModal && e.target === loginModal) {
      loginModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
    if (signupModal && e.target === signupModal) {
      signupModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // Show/Hide Password
  if (togglePasswordButtons) {
    togglePasswordButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling;
        const type = passwordInput.getAttribute("type");
        const icon = button.querySelector("i");

        if (type === "password") {
          passwordInput.setAttribute("type", "text");
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          passwordInput.setAttribute("type", "password");
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });
    });
  }

  // Password strength checker
  if (signupPassword) {
    signupPassword.addEventListener("input", checkPasswordStrength);
  }

  function checkPasswordStrength() {
    const password = signupPassword.value;
    let strength = 0;

    if (password.length > 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    if (strengthMeter) strengthMeter.setAttribute("data-strength", strength);

    if (strengthText) {
      if (password.length === 0) {
        strengthText.textContent = "";
      } else if (strength < 2) {
        strengthText.textContent = "Weak password";
        strengthText.style.color = "#ff6b6b";
      } else if (strength === 2) {
        strengthText.textContent = "Medium password";
        strengthText.style.color = "#ff9e6b";
      } else if (strength === 3) {
        strengthText.textContent = "Strong password";
        strengthText.style.color = "#f9c74f";
      } else {
        strengthText.textContent = "Very strong password";
        strengthText.style.color = "#43aa8b";
      }
    }
  }

  // ===============================
  // Notification System
  // ===============================

  // Show notification
  function showNotification(message, type) {
    // For auth notification component
    if (notification && notificationMessage) {
      notificationMessage.textContent = message;
      notification.classList.add("active", type);

      setTimeout(() => {
        notification.classList.remove("active", "success", "error");
      }, 4000);
    } else {
      // Create custom notification for job search
      // Remove any existing notification
      clearNotification();

      // Create notification element
      const notificationElement = document.createElement("div");
      notificationElement.className = "search-notification";
      notificationElement.textContent = message;
      notificationElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === "error" ? "#ff6b6b" : "#4CAF50"};
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

      document.body.appendChild(notificationElement);

      // Fade in
      setTimeout(() => {
        notificationElement.style.opacity = "1";
      }, 10);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        notificationElement.style.opacity = "0";
        setTimeout(() => {
          notificationElement.remove();
        }, 300);
      }, 3000);
    }
  }

  // Hide notification
  function hideNotification() {
    if (notification) {
      notification.classList.remove("active", "success", "error");
    }
  }

  // Clear custom notification
  function clearNotification() {
    const existingNotification = document.querySelector(".search-notification");
    if (existingNotification) {
      existingNotification.remove();
    }
  }

  if (notificationClose) {
    notificationClose.addEventListener("click", hideNotification);
  }

  // ===============================
  // Authentication Functions
  // ===============================

  // Sign up with email and password
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const termsAccepted = document.getElementById("terms").checked;

      if (!termsAccepted) {
        showNotification(
          "Please accept the Terms of Service and Privacy Policy",
          "error"
        );
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Add user name to profile
          return updateProfile(userCredential.user, {
            displayName: name,
          }).then(() => {
            showNotification("Account created successfully!", "success");
            if (signupModal) signupModal.classList.remove("active");
            document.body.style.overflow = "auto";
            signupForm.reset();
            updateUIOnAuth();
          });
        })
        .catch((error) => {
          console.error("Signup error:", error);
          if (error.code === "auth/email-already-in-use") {
            showNotification(
              "Email already in use. Try logging in instead.",
              "error"
            );
          } else {
            showNotification(
              "Error creating account: " + error.message,
              "error"
            );
          }
        });
    });
  }

  // Login with email and password
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          showNotification("Logged in successfully!", "success");
          if (loginModal) loginModal.classList.remove("active");
          document.body.style.overflow = "auto";
          loginForm.reset();
          updateUIOnAuth();
        })
        .catch((error) => {
          console.error("Login error:", error);
          if (
            error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
          ) {
            showNotification("Invalid email or password", "error");
          } else {
            showNotification("Error logging in: " + error.message, "error");
          }
        });
    });
  }

  // Google sign-in handler for both login and signup
  function handleGoogleSignIn() {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        showNotification("Logged in with Google successfully!", "success");
        if (loginModal) loginModal.classList.remove("active");
        if (signupModal) signupModal.classList.remove("active");
        document.body.style.overflow = "auto";
        updateUIOnAuth();
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
        showNotification(
          "Error with Google sign-in: " + error.message,
          "error"
        );
      });
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", handleGoogleSignIn);
  }

  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", handleGoogleSignIn);
  }

  // Update UI based on authentication state
  function updateUIOnAuth() {
    const user = auth.currentUser;

    if (user) {
      // User is signed in
      if (loginBtn) loginBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";

      // Create a dropdown for user profile if it doesn't exist
      if (
        document.querySelector(".auth-buttons") &&
        !document.querySelector(".user-dropdown")
      ) {
        const authButtons = document.querySelector(".auth-buttons");
        const userDropdown = document.createElement("div");
        userDropdown.className = "user-dropdown";

        const userName = user.displayName || user.email.split("@")[0];

        userDropdown.innerHTML = `
            <button class="dropdown-toggle">
                <i class="fas fa-user-circle"></i>
                <span>${userName}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
                <a href="#" class="dropdown-item"><i class="fas fa-user"></i> Profile</a>
                <a href="#" class="dropdown-item"><i class="fas fa-briefcase"></i> My Jobs</a>
                <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Settings</a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        `;

        authButtons.appendChild(userDropdown);

        // Toggle dropdown
        const dropdownToggle = userDropdown.querySelector(".dropdown-toggle");
        const dropdownMenu = userDropdown.querySelector(".dropdown-menu");

        dropdownToggle.addEventListener("click", (e) => {
          e.preventDefault();
          dropdownMenu.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
          if (!userDropdown.contains(e.target)) {
            dropdownMenu.classList.remove("show");
          }
        });

        // Logout functionality
        const logoutBtn = userDropdown.querySelector(".logout-btn");
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          signOut(auth)
            .then(() => {
              showNotification("Logged out successfully", "success");
              userDropdown.remove();
              if (loginBtn) loginBtn.style.display = "block";
              if (signupBtn) signupBtn.style.display = "block";
            })
            .catch((error) => {
              showNotification("Error signing out: " + error.message, "error");
            });
        });
      }
    } else {
      // User is signed out
      if (loginBtn) loginBtn.style.display = "block";
      if (signupBtn) signupBtn.style.display = "block";

      const userDropdown = document.querySelector(".user-dropdown");
      if (userDropdown) {
        userDropdown.remove();
      }
    }
  }

  // Listen for authentication state changes
  onAuthStateChanged(auth, () => {
    updateUIOnAuth();
  });

  // ===============================
  // Mobile Menu Toggle Functionality
  // ===============================
  if (menuToggle && mainNav) {
    // Toggle the menu when the button is clicked
    menuToggle.addEventListener("click", function () {
      menuToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
    });

    // Close the menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !menuToggle.contains(event.target) &&
        !mainNav.contains(event.target) &&
        mainNav.classList.contains("active")
      ) {
        menuToggle.classList.remove("active");
        mainNav.classList.remove("active");
      }
    });

    // Close the menu when window is resized to desktop size
    window.addEventListener("resize", function () {
      if (window.innerWidth > 992 && mainNav.classList.contains("active")) {
        menuToggle.classList.remove("active");
        mainNav.classList.remove("active");
      }
    });
  }

  // ===============================
  // Job Search & Filter Functionality
  // ===============================
  if (jobSearchForm && jobsWrapper) {
    // Add loading indicator to search button when clicked
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        const searchIcon = this.querySelector("i");
        const searchText = this.querySelector("span");

        if (searchIcon && searchText) {
          searchIcon.className = "fas fa-spinner fa-spin";
          searchText.textContent = "Searching...";

          // Reset button after search completes
          setTimeout(() => {
            searchIcon.className = "fas fa-search";
            searchText.textContent = "Search";
          }, 800);
        }
      });
    }

    // Handle form submission
    jobSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Show "searching" notification
      showNotification("Searching for jobs...", "success");

      // Get search values
      const keyword = jobSearchForm
        .querySelector('input[placeholder="Job title or keyword"]')
        .value.toLowerCase()
        .trim();
      const location = jobSearchForm
        .querySelector('input[placeholder="Location"]')
        .value.toLowerCase()
        .trim();
      const category = jobSearchForm
        .querySelector("select")
        .value.toLowerCase()
        .trim();

      // Filter jobs
      let matchCount = 0;

      jobCards.forEach((card) => {
        const title = card
          .querySelector(".job-card-title h3")
          .textContent.toLowerCase();
        const company = card
          .querySelector(".job-card-title p")
          .textContent.toLowerCase();
        const jobLocation = card
          .querySelector(".detail-item:nth-child(1) span")
          .textContent.toLowerCase();
        const jobType = card.querySelector(".detail-item:nth-child(2) span")
          ? card
              .querySelector(".detail-item:nth-child(2) span")
              .textContent.toLowerCase()
          : "";
        const jobTags = Array.from(
          card.querySelectorAll(".job-card-tags .tag")
        ).map((tag) => tag.textContent.toLowerCase());

        // Check if job matches search criteria
        let matches = true;

        if (
          keyword &&
          !title.includes(keyword) &&
          !company.includes(keyword) &&
          !jobTags.some((tag) => tag.includes(keyword))
        ) {
          matches = false;
        }

        if (location && !jobLocation.includes(location)) {
          matches = false;
        }

        if (category && category !== "" && category !== "all categories") {
          // Define keyword arrays for each category
          const categoryKeywords = {
            it: [
              "it",
              "software",
              "developer",
              "web",
              "frontend",
              "backend",
              "fullstack",
              "programmer",
              "coding",
            ],
            marketing: ["marketing", "social media", "seo", "content", "brand"],
            design: ["design", "ui", "ux", "graphic", "figma", "photoshop"],
            finance: [
              "finance",
              "accounting",
              "financial",
              "economist",
              "banking",
            ],
          };

          // Get keywords for the selected category
          const keywords = categoryKeywords[category] || [category];

          // Check if any keyword matches in title, job type, or tags
          const categoryMatches = keywords.some(
            (keyword) =>
              title.includes(keyword) ||
              (jobType && jobType.includes(keyword)) ||
              jobTags.some((tag) => tag.includes(keyword))
          );

          if (!categoryMatches) {
            matches = false;
          }
        }

        // Show or hide based on matches with animation
        if (matches) {
          card.style.display = "block";
          matchCount++;
          setTimeout(() => {
            card.style.opacity = "1";
          }, 50);
        } else {
          card.style.opacity = "0";
          setTimeout(() => {
            card.style.display = "none";
          }, 300);
        }
      });

      // Update UI to show search results
      setTimeout(() => {
        // Clear notification
        clearNotification();

        // Show results message
        if (matchCount === 0) {
          showResultsMessage(
            "No jobs found matching your criteria. Try different keywords or filters."
          );
        } else {
          showResultsMessage(
            `Found ${matchCount} job${
              matchCount === 1 ? "" : "s"
            } matching your criteria.`
          );
        }

        // Add clear filters button if filters are applied
        if (
          keyword ||
          location ||
          (category && category !== "" && category !== "all categories")
        ) {
          addClearFiltersButton();
        }
      }, 800); // Short delay to simulate search
    });
  }

  // Function to show results message
  function showResultsMessage(message) {
    // Remove any existing message
    const existingMessage = document.querySelector(".search-results-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    if (jobsWrapper) {
      // Create message element
      const messageElement = document.createElement("div");
      messageElement.className = "search-results-message";
      messageElement.textContent = message;
      messageElement.style.cssText = `
        margin: 15px 0;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 5px;
        text-align: center;
        font-size: 14px;
        animation: fadeIn 0.3s ease;
    `;

      // Insert before the jobs wrapper
      jobsWrapper.parentNode.insertBefore(messageElement, jobsWrapper);
    }
  }

  // Function to add clear filters button
  function addClearFiltersButton() {
    // Remove any existing button
    const existingButton = document.querySelector(".clear-filters-btn");
    if (existingButton) {
      existingButton.remove();
    }

    if (jobsWrapper) {
      // Create button
      const button = document.createElement("button");
      button.className = "clear-filters-btn";
      button.textContent = "Clear Filters";
      button.style.cssText = `
        margin: 10px auto;
        padding: 8px 15px;
        background-color: #f1f1f1;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        display: block;
        font-size: 14px;
        transition: all 0.2s ease;
    `;

      // Add hover effect
      button.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#e1e1e1";
      });

      button.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "#f1f1f1";
      });

      // Add click event to clear filters
      button.addEventListener("click", function () {
        // Reset form
        if (jobSearchForm) jobSearchForm.reset();

        // Show all jobs
        jobCards.forEach((card) => {
          card.style.display = "block";
          setTimeout(() => {
            card.style.opacity = "1";
          }, 50);
        });

        // Remove results message
        const existingMessage = document.querySelector(
          ".search-results-message"
        );
        if (existingMessage) {
          existingMessage.remove();
        }

        // Remove this button
        this.remove();
      });

      // Insert before the results message
      const resultsMessage = document.querySelector(".search-results-message");
      if (resultsMessage) {
        resultsMessage.parentNode.insertBefore(button, resultsMessage);
      } else {
        jobsWrapper.parentNode.insertBefore(button, jobsWrapper);
      }
    }
  }

  // ===============================
  // Bookmark Functionality
  // ===============================
  if (bookmarkButtons) {
    bookmarkButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const icon = this.querySelector("i");

        // Toggle bookmark status
        if (icon) {
          if (icon.classList.contains("far")) {
            icon.classList.remove("far");
            icon.classList.add("fas");
            showNotification("Job saved to bookmarks!", "success");
          } else {
            icon.classList.remove("fas");
            icon.classList.add("far");
            showNotification("Job removed from bookmarks!", "success");
          }
        }
      });
    });
  }

  // ===============================
  // Add CSS for animations and dropdowns
  // ===============================
  const style = document.createElement("style");
  style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.job-card {
    transition: opacity 0.3s ease;
}

.search-btn {
    position: relative;
}

.search-btn i {
    margin-right: 5px;
}

.user-dropdown {
    position: relative;
    margin: auto;
}

.dropdown-toggle {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: transparent;
    border: 2px solid #f9c74f;
    border-radius: 5px;
    color: #f9c74f;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dropdown-toggle:hover {
    background: rgba(249, 199, 79, 0.1);
}

.dropdown-toggle i {
    margin-right: 8px;
}

.dropdown-toggle .fa-chevron-down {
    margin-left: 8px;
    margin-right: 0;
    font-size: 0.8rem;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 200px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    padding: 10px 0;
    display: none;
    z-index: 1000;
}

.dropdown-menu.show {
    display: block;
}

.dropdown-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    color: #333;
    transition: all 0.3s ease;
}

.dropdown-item:hover {
    background: #f5f5f5;
    color: #f8961e;
}

.dropdown-item i {
    margin-right: 10px;
    width: 20px;
    text-align: center;
}

.dropdown-divider {
    height: 1px;
    background: #eee;
    margin: 8px 0;
}

.logout-btn {
    color: #ff6b6b;
}

.logout-btn:hover {
    background: #fff1f1;
    color: #ff6b6b;
}
`;
  document.head.appendChild(style);
});
