/**
 * Root element for rendering the application.
 * @type {HTMLElement}
 */
const rootElement = document.getElementById("root");

/**
 * Updates the application state and re-renders the UI.
 * @param {HTMLElement} element - The root DOM element where the content will be rendered.
 * @param {Immutable.Map} state - The current state of the application.
 * @param {Object} [newState={}] - New state to be merged into the existing state.
 * @param {Function} [callback=null] - Optional callback function to execute after state update.
 */
const updateApplicationState = async (
  element,
  state,
  newState = {},
  callback = null
) => {
  const updatedState = state.mergeDeep(newState);
  await renderUI(element, updatedState);
  if (callback) callback(updatedState);
};

/**
 * Renders the UI based on the current state.
 * @param {HTMLElement} element - The root DOM element where the content will be rendered.
 * @param {Immutable.Map} state - The current state of the application.
 */
const renderUI = async (element, state) => {
  element.innerHTML = generateAppContent(state);
};

/**
 * Generates HTML content based on the application state.
 * @param {Immutable.Map} state - The current state of the application.
 * @returns {string} - The HTML string for the application content.
 */
const generateAppContent = (state) => {
  const user = state.get("user");
  const rovers = state.get("rovers");
  const gallery = state.get("selectedRoverGallery");
  const darkMode = state.get("isDarkMode");

  const roverCardsHtml = rovers
    ? rovers.map((rover) => createRoverCard(state, rover)).join("")
    : showLoadingSpinner();

  const galleryHtml = gallery
    ? gallery
        .get("photos")
        ?.map((photo) => createPhotoCard(photo))
        .join("")
    : "";

  const themeClass = darkMode ? "dark-mode" : "light-mode";

  return `
    <header class="bg-dark text-light py-4 shadow-sm">
      <div class="container d-flex justify-content-between align-items-center">
        <h1 class="text-center">Mars Rover Dashboard</h1>
        <button class="btn btn-outline-light" onclick="toggleTheme(${convertToJSON(
          state
        )})">
          ${darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
    <main class="container py-5 ${themeClass}">
      <div class="alert alert-primary">
        ${createGreeting(user.get("name"))}
        <p class="lead">Explore Mars rover images and information from the NASA API.</p>
      </div>
      <div class="row row-cols-1 row-cols-md-4 g-2 justify-content-center">
        ${roverCardsHtml}
      </div>
      <div class="row row-cols-1 row-cols-md-3 g-4 mt-4">
        ${galleryHtml}
      </div>
      <button id="scrollToTopBtn" title="Go to top" onclick="scrollToTop()"><i class="fa-solid fa-arrow-up"></i></button>
    </main>
    <footer class="py-3 text-center ${themeClass}">
      <div class="container">
        <p class="mb-0">© 2024 Mars Rover Dashboard</p>
      </div>
    </footer>
  `;
};

/**
 * Toggles between dark and light theme.
 * @param {Immutable.Map} state - The current state of the application.
 */
const toggleTheme = (state) => {
  const currentState = Immutable.Map.isMap(state)
    ? state
    : Immutable.fromJS(state);
  const darkMode = currentState.get("isDarkMode");

  const newState = { isDarkMode: !darkMode };
  updateApplicationState(rootElement, currentState, newState);

  const htmlElement = document.documentElement;
  htmlElement.setAttribute("data-bs-theme", darkMode ? "light" : "dark");
};

/**
 * Generates greeting HTML based on the user's name.
 * @param {string} name - The name of the user.
 * @returns {string} - The HTML string for the greeting.
 */
const createGreeting = (name) => {
  return name
    ? `<h2 class="display-4">Welcome, ${name}!</h2>`
    : '<h2 class="display-4">Hello!</h2>';
};

/**
 * Generates HTML for a loading spinner.
 * @returns {string} - The HTML string for the spinner.
 */
const showLoadingSpinner = () => `
  <div class="d-flex justify-content-center my-4">
    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
`;

/**
 * Creates HTML for a photo card in the gallery.
 * @param {Immutable.Map} photo - The photo data.
 * @returns {string} - The HTML string for the photo card.
 */
const createPhotoCard = (photo) => {
  const url = photo.get("img_src");
  const camera = photo.get("camera")?.get("full_name") || "Unknown Camera";
  const date = photo.get("earth_date") || "Unknown Date";
  const rover = photo.get("rover")?.get("name") || "Unknown Rover";

  const description = `
    Captured by the ${camera} camera on ${date}.<br /><br />
    This image shows the Martian landscape as seen by the ${rover} rover.
  `;

  return `
    <div class="col mb-4">
      <div class="card border-secondary shadow-sm">
        <img src="${url}" class="card-img-top" alt="${camera}" style="object-fit: cover; height: 200px; width: 100%;">
        <div class="card-body">
          <h5 class="card-title">${rover} - ${camera}</h5>
          <p class="card-text">${description}</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Creates HTML for a rover card.
 * @param {Immutable.Map} state - The application state.
 * @param {Immutable.Map} rover - The rover data.
 * @returns {string} - The HTML string for the rover card.
 */
const createRoverCard = (state, rover) => {
  const launch = rover.get("launch_date");
  const landing = rover.get("landing_date");
  const status = rover.get("status");

  const selectedRover = state.get("selectedRover");
  const isLoading =
    Immutable.Map.isMap(selectedRover) && selectedRover.get("loading");
  const roverName = Immutable.Map.isMap(selectedRover)
    ? selectedRover.get("name")
    : null;

  return `
    <div class="col mb-4">
      <div class="card border-primary shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${rover.get("name")}</h5>
          <p class="card-text">
            <strong>Launch Date:</strong> ${launch}<br />
            <strong>Landing Date:</strong> ${landing}<br />
            <strong>Status:</strong> ${status}
          </p>
          <button class="btn btn-primary" onclick="showRoverDetails(${convertToJSON(
            state
          )}, ${convertToJSON(rover)})">
            ${
              isLoading && roverName === rover.get("name")
                ? `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
                : "View Latest Images"
            }
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Converts an object to a JSON string suitable for embedding in HTML.
 * @param {Object} obj - The object to be converted.
 * @returns {string} - The JSON string representation of the object.
 */
const convertToJSON = (obj) => JSON.stringify(obj).replace(/"/g, "'");

/**
 * Displays detailed information about a selected rover.
 * @param {Immutable.Map} state - The current state of the application.
 * @param {Immutable.Map} rover - The selected rover data.
 */
const showRoverDetails = (state, rover) => {
  const roverData = Immutable.Map.isMap(rover)
    ? rover
    : Immutable.fromJS(rover);

  const updatedState = Immutable.Map({
    selectedRoverGallery: false,
    selectedRover: roverData.set("loading", true),
  });

  updateApplicationState(
    rootElement,
    Immutable.fromJS(state),
    updatedState,
    fetchRoverData
  );
};

/**
 * Fetches and processes rover data from the API.
 * @param {Immutable.Map} state - The current state of the application.
 */
const fetchRoverData = (state) => {
  const selectedRover = state.get("selectedRover");
  fetchRoverPhotos(
    selectedRover.get("name"),
    selectedRover.get("max_date"),
    (data) => {
      const newState = Immutable.Map({
        selectedRoverGallery: Immutable.fromJS(data),
        selectedRover: Immutable.fromJS({ loading: false }),
      });
      updateApplicationState(rootElement, state, newState);
    }
  );
};

/**
 * Fetches the list of rovers from the API.
 * @param {Function} callback - The callback function to process the data.
 */
const fetchRoverList = (callback) => {
  fetch(`${process.env.API_SERVER}`)
    .then((response) => response.json())
    .then((json) => callback(json));
};

/**
 * Fetches photos of a specific rover from the API.
 * @param {string} roverName - The name of the rover.
 * @param {string} maxDate - The maximum date to filter photos.
 * @param {Function} callback - The callback function to process the data.
 */
const fetchRoverPhotos = (roverName, maxDate, callback) => {
  fetch(`${process.env.API_SERVER}rovers/${roverName}?max_date=${maxDate}`)
    .then((response) => response.json())
    .then((json) => callback(json));
};

// Initialize the application when the page loads.
window.addEventListener("load", () => {
  const initialState = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    selectedRover: false,
    selectedRoverGallery: false,
    isDarkMode: false, // Default dark mode state is false
  });

  renderUI(rootElement, initialState);

  fetchRoverList((data) => {
    const roversState = Immutable.Map({
      rovers: Immutable.fromJS(data.rovers),
    });

    updateApplicationState(rootElement, initialState, roversState);
  });
});

window.addEventListener("scroll", () => {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (window.scrollY > 200) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
});

/**
 * Scrolls the page to the top.
 */
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
