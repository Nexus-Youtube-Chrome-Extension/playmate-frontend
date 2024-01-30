let thumbnailsVisible = false;
let DndVisible = true;
let shortsVisible = true;
let skipAds = false;
let youTime = 0;
let fMode = false;
let fInterval;
let sInterval;

function skipMode() {
  var tabList = [];

  function main() {
    const e = document.getElementById("movie_player");
    if (!e) return null;
    try {
      const observer = new MutationObserver((mutation) => {
        skipBtnClick();
        adVideoManipulation();
      });
      observer.observe(e, {
        subtree: false,
        childList: false,
        attributes: true,
        attributeFilter: ["class"],
        characterData: false,
      });
      adVideoManipulation();
      skipBtnClick();
      return observer;
    } catch (err) {
      return null;
    }
  }

  function skipBtnClick() {
    try {
      const skipBtnXPath = '//span[@class="ytp-ad-skip-button-container"]/button';
      const getElementByXpath = (path) =>
        document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          .singleNodeValue;
      const skipBtn1 = getElementByXpath(skipBtnXPath);
      if (skipBtn1) {
        skipBtn1.click();
        return true;
      }

      const skipBtnList = [];
      const targetClassNames = [
        "ytp-ad-skip-button-modern ytp-button",
        "ytp-ad-skip-button ytp-button",
        "ytp-ad-skip-button-container",
      ];
      targetClassNames.forEach((classNames) => {
        skipBtnList.push(...document.getElementsByClassName(classNames));
      });
      if (skipBtnList.length !== 0) {
        skipBtnList.forEach((btn) => btn?.click());
        return true;
      }
    } catch (err) {
      console.error("skip btn click error=>", err);
    }
    return false;
  }

  function adVideoManipulation() {
    try {
      const getElementByXpath = (path) =>
        document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          .singleNodeValue;
      const elementXPath =
        '//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video';
      const adElement = getElementByXpath(elementXPath);
      // no ads found
      if (!adElement) return false;

      // set params
      adElement.volume = 0;
      adElement.muted = true;
      adElement.playbackRate = 10;
      return true;
    } catch (err) {
      console.error("ad manipulation error=>", err);
    }
    return false;
  }

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const condition1 = true;
    const condition2 = tab.url && tab.url.includes("https://www.youtube.com/watch");
    if (condition1 && condition2) {
      if (tabList.includes(tabId)) {
        console.log(`script already injected for tab ${tabId}`);
        return;
      }

      chrome.tabs.sendMessage(tabId, { message: "runFunctions" });
      main();
      tabList.push(tabId);
    }
  });

  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabList.includes(tabId)) {
      tabList = tabList.filter((x) => x !== tabId);
      console.info(`script removed for tab ${tabId}`);
    }
  });
}

function toggleThumbnails() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    if (tab.url.includes("youtube.com") && !thumbnailsVisible) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          window.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === "childList") {
                const thumbnails = document.querySelectorAll(".ytd-thumbnail");
                const thumbnails2 = document.querySelectorAll(
                  "#thumbnail.style-scope.ytd-rich-grid-media"
                );
                thumbnails2.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });
                thumbnails.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });
              }
            });
          });
          window.observer.observe(document.body, { childList: true, subtree: true });
        },
      });
    } else if (tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          location.reload();
        },
      });
    }
    thumbnailsVisible = !thumbnailsVisible;
  });
}

function DNDMode() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];

    if (tab.url.includes("youtube.com") && DndVisible) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          const thumbnails = document.querySelectorAll(
            ".ytd-thumbnail, #thumbnail.style-scope.ytd-rich-grid-media"
          );
          thumbnails.forEach((thumbnail) => {
            thumbnail.style.display = "none";
          });

          const thumbnails1 = document.querySelectorAll(
            ".style-scope ytd-comments",
            ".style-scope ytd-watch-flexy"
          );
          thumbnails1.forEach((thumbnail) => {
            thumbnail.style.display = "none";
          });

          const secondaryElements = document.querySelectorAll("#secondary, #secondary-inner");
          secondaryElements.forEach((element) => {
            element.style.display = "none";
          });
          const expandButton = document.querySelector(".style-scope.ytd-text-inline-expander");
          if (expandButton) {
            expandButton.click();
          }
        },
      });
    } else if (tab.url.includes("youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          const thumbnails = document.querySelectorAll(
            ".ytd-thumbnail, #thumbnail.style-scope.ytd-rich-grid-media",
            ".style-scope ytd-comments",
            ".style-scope ytd-watch-flexy"
          );
          thumbnails.forEach((thumbnail) => {
            thumbnail.style.display = "";
          });
          const thumbnails1 = document.querySelectorAll(
            ".style-scope ytd-comments",
            ".style-scope ytd-watch-flexy"
          );
          thumbnails1.forEach((thumbnail) => {
            thumbnail.style.display = "";
          });
          const secondaryElements = document.querySelectorAll("#secondary, #secondary-inner");
          secondaryElements.forEach((element) => {
            element.style.display = "";
          });
          const expandButton = document.querySelector(".style-scope.ytd-text-inline-expander");
          if (expandButton) {
            expandButton.click();
          }
        },
      });
    }
    DndVisible = !DndVisible;
  });
}

function skipYouTubeAds() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0];
      if (tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            window.observer = new MutationObserver(function () {
              const btn = document.querySelector(".ytp-ad-skip-button-text");
              const adElements = document.querySelectorAll(
                "ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer"
              );
              adElements.forEach((adElement) => adElement.remove());
              if (btn) {
                btn.click();
              }
            });
            window.observer.observe(document, { childList: true, subtree: true });
          },
        });
      }
    }
  });
}

function hideBody() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0];
      if (tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            document.body.innerHTML = `<div style="width:100%; height:100vh; display:flex; justify-content:center; align-items:center; flex-direction:column; ">
                <h1 style="z-index:100; color:white; font-size:8rem; ">YouTube Blocked</h1>
                <h1 style="z-index:100; color:white; font-size:8rem; ">Go do some productive work!</h1>
              </div>`;
          },
        });
        chrome.storage.sync.set({ blockedTime: true });
      }
    }
  });
}

function showBody() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0];
      if (tab.url.includes("youtube.com")) {
        chrome.storage.sync.get(["blockedTime"], function (result) {
          const blockedTime = result.blockedTime;
          if (blockedTime) {
            chrome.storage.sync.remove(["blockedTime"], function () {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: function () {
                  location.reload();
                },
              });
            });
          }
        });
      }
    }
  });
}

function trackUser() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0];
      if (tab.url.includes("youtube.com")) {
        youTime += 1;
        if (youTime === 1) {
          hideBody();
        } else if (youTime === 3) {
          showBody();
          youTime = 0;
        }
      }
    }
  });
}

function filterChannel() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    if (tab.url.includes("youtube.com")) {
      chrome.storage.sync.get(["selected"], function (result) {
        if (result.selected.length > 0) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function (value) {
              window.observer = new MutationObserver(function () {
                let videos = document.querySelectorAll("ytd-grid-video-renderer,#dismissible");
                let channel = value || [];
                videos.forEach((video) => {
                  let channelElement = video.querySelector("#text.style-scope.ytd-channel-name");
                  if (channelElement) {
                    let channelName = channelElement.innerText;
                    if (channel.includes(channelName)) {
                      video.remove();
                    }
                  }
                });
              });
              window.observer.observe(document, { childList: true, subtree: true });
            },
            args: [result.selected],
          });
        } else {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function () {
              location.reload();
            },
          });
        }
      });
    }
  });
}

const toggleShorts = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];

    if (tab.url.includes("youtube.com") && shortsVisible) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          window.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === "childList") {
                const elements = document.querySelectorAll('[title*="Shorts"]');

                elements.forEach((element) => {
                  element.parentNode.removeChild(element);
                });

                const thumbnails = document.querySelectorAll(".ytd-reel-shelf-renderer");
                thumbnails.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });

                const thumbnails1 = document.querySelectorAll(
                  "#dismissible.ytd-rich-shelf-renderer"
                );
                thumbnails1.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });

                const thumbnails2 = document.querySelectorAll(
                  "ytd-rich-grid-renderer[is-shorts-grid] #contents.ytd-rich-grid-renderer"
                );
                thumbnails2.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });

                const thumbnails3 = document.querySelectorAll(
                  'yt-tab-shape[tab-title="Shorts"] .yt-tab-shape-wiz__tab'
                );
                thumbnails3.forEach((thumbnail) => {
                  thumbnail.style.display = "none";
                });
              }
            });
          });
          window.observer.observe(document.body, { childList: true, subtree: true });
        },
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          location.reload();
        },
      });
    }
    shortsVisible = !shortsVisible;
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "toggleThumbnails") {
    toggleThumbnails();
  } else if (request.message === "skipAds") {
    skipAds = !skipAds;
    if (skipAds) {
      skipYouTubeAds();
    }
  } else if (request.message === "focusMode") {
    fMode = !fMode;
    if (fMode) {
      fInterval = setInterval(trackUser, 5000);
    } else {
      if (youTime === 1) {
        showBody();
      }
      clearInterval(fInterval);
    }
  } else if (request.message === "DnDMode") {
    DNDMode();
  } else if (request.message === "skipMode") {
    skipMode();
  } else if (request.message === "filter") {
    filterChannel();
  } else if (request.message === "toggleShorts") {
    toggleShorts();
  }
});
