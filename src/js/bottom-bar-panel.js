let visible = false;

function handleWindowClick({ target }) {
  const closestContainer = target.closest(".panel-container");
  let hideDropdown = true;

  if (closestContainer) {
    hideDropdown = !!target.closest(".bottom-bar-panel-btn");
  }

  if (hideDropdown) {
    visible = false;
    document.getElementById("js-bottom-bar-panel").classList.remove("visible");
    window.removeEventListener("click", handleWindowClick);
  }
}

document.getElementById("js-bottom-bar-panel-toggle-btn").addEventListener("click", ({ currentTarget }) => {
  const container = currentTarget.nextElementSibling;
  visible = !visible;
  container.classList.toggle("visible", visible);

  if (visible) {
    window.addEventListener("click", handleWindowClick);
  }
  else {
    window.removeEventListener("click", handleWindowClick);
  }
});
