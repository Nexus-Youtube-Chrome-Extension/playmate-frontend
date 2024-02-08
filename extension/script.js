document.addEventListener("DOMContentLoaded", function () {
  let thumbnailCheckbox = document.querySelector("#toggleThumbnails input[type='checkbox']");
  chrome.storage.sync.get(["thumbnail"], function (result) {
    thumbnailCheckbox.checked = result.thumbnail;
  });
  thumbnailCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ thumbnail: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "toggleThumbnails" });
    });
  });

  let adCheckbox = document.querySelector("#skipAds input[type='checkbox']");
  chrome.storage.sync.get(["skipAds"], function (result) {
    adCheckbox.checked = result.skipAds;
  });
  adCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ skipAds: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "skipAds" });
    });
  });

  let focusModeCheckbox = document.querySelector("#focusMode input[type='checkbox']");
  chrome.storage.sync.get(["focusMode"], function (result) {
    focusModeCheckbox.checked = result.focusMode;
  });
  focusModeCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ focusMode: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "focusMode" });
    });
  });

  let DnDModeCheckbox = document.querySelector("#DnDMode input[type='checkbox']");
  chrome.storage.sync.get(["DnDMode"], function (result) {
    DnDModeCheckbox.checked = result.DnDMode;
  });
  DnDModeCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ DnDMode: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "DnDMode" });
    });
  });

  let skipModeCheckbox = document.querySelector("#skipMode input[type='checkbox']");
  chrome.storage.sync.get(["skipMode"], function (result) {
    skipModeCheckbox.checked = result.skipMode;
  });
  skipModeCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ skipMode: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "skipMode" });
    });
  });

  let toggleShortsCheckbox = document.querySelector("#toggleShorts input[type='checkbox']");
  chrome.storage.sync.get(["toggleShorts"], function (result) {
    toggleShortsCheckbox.checked = result.toggleShorts;
  });
  toggleShortsCheckbox.addEventListener("change", function () {
    chrome.storage.sync.set({ toggleShorts: this.checked }, function () {
      chrome.runtime.sendMessage({ message: "toggleShorts" });
    });
  });

  let data = [];
  let selected = [];
  chrome.storage.sync.get(["selected"], function (result) {
    selected = result?.selected || [];
    if (selected.length > 0) {
      updateSelectedItemsContainer();
    }
  });

  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestionsBox");
  let currentFocus = -1;

  searchInput.addEventListener("input", async function () {
    const value = this.value;
    if (value.length < 2) {
      suggestionsBox.innerHTML = "";
      return;
    }

    const response = await fetch("https://play-mate-backend.onrender.com/youtube_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: value }),
    });

    const channels = await response.json();

    const nameData = channels.map((channel) => ({ name: channel.name }));
    let suggestions = nameData;

    // Filter suggestions based on the input value
    const filtered = suggestions.filter((item) =>
      item.name.toLowerCase().startsWith(value.toLowerCase())
    );
    // Populate the suggestions box with the filtered results
    suggestionsBox.innerHTML = filtered
      .map((item) => `<button class='suggestion-btn' tabindex='0'>${item.name}</button>`)
      .join("");
    // Reset the current focus
    currentFocus = -1;
  });

  // Event listener for keydown events for navigation and selection in the suggestions box
  searchInput.addEventListener("keydown", function (e) {
    let items = suggestionsBox.getElementsByClassName("suggestion-btn");
    // Navigate down in the suggestions list
    if (e.keyCode == 40) {
      currentFocus = (currentFocus + 1) % items.length;
      setActive(items);
      // Navigate up in the suggestions list
    } else if (e.keyCode == 38) {
      currentFocus = (currentFocus - 1 + items.length) % items.length;
      setActive(items);
      // Handle Enter key to select a focused item
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1 && items[currentFocus]) {
        addSelectedItem(items[currentFocus].textContent);
        suggestionsBox.innerHTML = "";
        searchInput.value = "";
        currentFocus = -1;
      }
    }
  });

  // Click event listener for the suggestions box
  suggestionsBox.addEventListener("click", function (e) {
    // Add the clicked suggestion to the selected items list
    if (e.target && e.target.classList.contains("suggestion-btn")) {
      addSelectedItem(e.target.textContent);
      suggestionsBox.innerHTML = "";
      searchInput.value = "";
    }
  });

  // Function to highlight the active (focused) suggestion
  function setActive(items) {
    if (!items.length) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
  }

  // Function to remove highlighting from all suggestions
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("autocomplete-active");
    }
  }

  // Function to add a selected item to the list of selected items
  function addSelectedItem(item) {
    if (selected.includes(item)) {
      return;
    }

    selected.push(item);
    updateSelectedItemsContainer();
  }
  function updateSelectedItemsContainer() {
    const container = document.getElementById("selectedItemsContainer");
    container.innerHTML = ""; // Clear the container before updating

    selected.forEach(function (item) {
      const newItem = document.createElement("div");
      newItem.textContent = item + " ";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.setAttribute("aria-label", "Remove " + item);

      removeBtn.addEventListener("click", function () {
        removeItem(newItem, selected.indexOf(item));
      });

      newItem.appendChild(removeBtn);
      container.appendChild(newItem);
    });

    chrome.storage.sync.set({ selected });

    setTimeout(() => {
      chrome.runtime.sendMessage({ message: "filter" });
    }, 1000);
  }

  // Function to remove an item and manage focus appropriately
  function removeItem(itemElement, index) {
    selected.splice(index, 1);
    itemElement.remove();
    chrome.storage.sync.set({ selected });

    const container = document.getElementById("selectedItemsContainer");
    // container.removeChild(item);

    let remainingItems = container.getElementsByTagName("div");
    // Focus management: set focus to the next item, or the search input if no items left
    if (remainingItems.length > 0) {
      if (index < remainingItems.length) {
        remainingItems[index].getElementsByTagName("button")[0].focus();
      } else {
        remainingItems[remainingItems.length - 1].getElementsByTagName("button")[0].focus();
      }
    } else {
      document.getElementById("searchInput").focus();
    }
  }

  const filterBtn = document.getElementById("filter");
  filterBtn.addEventListener("click", function () {
    chrome.storage.sync.set({ selected }, function () {
      chrome.runtime.sendMessage({ message: "filter" });
    });
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let url = tabs[0].url;
  let urlParams = new URLSearchParams(new URL(url).search);
  let summarizeButton = document.querySelector(".btn");

  if (urlParams.has("v")) {
    summarizeButton.disabled = false;
  } else {
    summarizeButton.disabled = true;
  }

  summarizeButton.addEventListener("click", async function () {
    try {
      this.textContent = "Loading...";
      const response = await fetch("https://play-mate-backend.onrender.com/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url2;
      link.download = "Summarized.md";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.textContent = "Sumarize";
    }
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let url = tabs[0].url;
  if (!url.includes("youtube.com")) {
    document.body.innerHTML = `
  <div
    style="
      width: 200px;
      height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content:center;
    "
  >
  <h1>This extension only works on YouTube pages.</h1>
  </div>`;
    return;
  }
});
