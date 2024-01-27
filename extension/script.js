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
});
