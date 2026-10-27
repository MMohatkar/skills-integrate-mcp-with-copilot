document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const signupContainer = document.getElementById("signup-container");
  const authControls = document.getElementById("auth-controls");
  const loginButton = document.getElementById("login-button");
  const loginDialog = document.getElementById("login-dialog");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  let authorization = null;

  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function updateAuthControls(username) {
    authControls.replaceChildren();

    if (username) {
      const status = document.createElement("span");
      status.textContent = `Logged in as ${username}`;
      const logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.textContent = "Log out";
      logoutButton.addEventListener("click", () => {
        authorization = null;
        signupContainer.classList.add("hidden");
        updateAuthControls();
        fetchActivities();
      });
      authControls.append(status, logoutButton);
      signupContainer.classList.remove("hidden");
      return;
    }

    const button = document.createElement("button");
    button.id = "login-button";
    button.type = "button";
    button.textContent = "Teacher login";
    button.addEventListener("click", () => loginDialog.showModal());
    authControls.append(button);
    signupContainer.classList.add("hidden");
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                  (email) => `<li>
                    <span class="participant-email">${email}</span>
                    ${
                      authorization
                        ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">Remove</button>`
                        : ""
                    }
                  </li>`
                )
                .join("")}
            </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (!Array.from(activitySelect.options).some((item) => item.value === name)) {
          activitySelect.appendChild(option);
        }
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: { Authorization: authorization },
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  }

  loginButton?.addEventListener("click", () => loginDialog.showModal());
  document.getElementById("cancel-login").addEventListener("click", () => {
    loginDialog.close();
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.classList.add("hidden");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const credential = btoa(`${username}:${password}`);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { Authorization: `Basic ${credential}` },
      });
      const result = await response.json();

      if (!response.ok) {
        loginError.textContent = result.detail || "Login failed";
        loginError.classList.remove("hidden");
        return;
      }

      authorization = `Basic ${credential}`;
      loginDialog.close();
      loginForm.reset();
      updateAuthControls(username);
      fetchActivities();
    } catch (error) {
      loginError.textContent = "Failed to log in. Please try again.";
      loginError.classList.remove("hidden");
      console.error("Error logging in:", error);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { Authorization: authorization },
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
