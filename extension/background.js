let thumbnailsVisible = true;
let skipAds = false;
let observer = null;

function toggleThumbnails() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    if (tab.url.includes("youtube.com") && thumbnailsVisible) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          const thumbnails = document.querySelectorAll(".ytd-thumbnail");
          thumbnails.forEach((thumbnail) => {
            thumbnail.style.display = "none";
          });
          observer = new MutationObserver(function () {
            const thumbnails = document.querySelectorAll(".ytd-thumbnail");
            thumbnails.forEach((thumbnail) => {
              thumbnail.style.display = "none";
            });
          });
          observer.observe(document, { childList: true, subtree: true });
        },
      });
    } else if (tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          const thumbnails = document.querySelectorAll(".ytd-thumbnail");
          thumbnails.forEach((thumbnail) => {
            thumbnail.style.display = "block";
          });
          if (observer) {
            observer.disconnect();
          }
        },
      });
    }
    thumbnailsVisible = !thumbnailsVisible;
  });
}

function skipYouTubeAds() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    if (tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          const btn = document.querySelector(".ytp-ad-skip-button-text");
          if (btn) {
            btn.click();
          }
        },
      });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "toggleThumbnails") {
    toggleThumbnails();
  } else if (request.message === "skipAds") {
    skipAds = !skipAds;
    if (skipAds) {
      setInterval(skipYouTubeAds, 1000);
    }
  }
});
