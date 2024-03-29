function hideThumbnails() {
  const thumbnails = document.querySelectorAll(".ytd-thumbnail");
  const thumbnails2 = document.querySelectorAll("#thumbnail.style-scope.ytd-rich-grid-media");
  thumbnails2.forEach((thumbnail) => {
    thumbnail.style.display = "none";
  });
  thumbnails.forEach((thumbnail) => {
    thumbnail.style.display = "none";
  });
}

function DnDMode() {
  const thumbnails = document.querySelectorAll(
    ".ytd-thumbnail, #thumbnail.style-scope.ytd-rich-grid-media"
  );
  const thumbnails1 = document.querySelectorAll(
    ".style-scope ytd-comments",
    ".style-scope ytd-watch-flexy"
  );
  const secondaryElements = document.querySelectorAll("#secondary, #secondary-inner");
  const expandButton = document.querySelector(".style-scope.ytd-text-inline-expander");

  thumbnails1.forEach((thumbnail) => {
    thumbnail.style.display = "none";
  });
  thumbnails.forEach((thumbnail) => {
    thumbnail.style.display = "none";
  });
  secondaryElements.forEach((element) => {
    element.style.display = "none";
  });
  if (expandButton) {
    expandButton.click();
  }
}

function hideBody() {
  document.body.innerHTML = `<div style="width:100%; height:100vh; display:flex; justify-content:center; align-items:center; flex-direction:column; ">
          <h1 style="z-index:100; color:white; font-size:8rem; ">YouTube Blocked</h1>
          <h1 style="z-index:100; color:white; font-size:8rem; ">Go do some productive work!</h1>
        </div>`;
}

chrome.storage.sync.get(["DnDMode"], function (result) {
  if (result.DnDMode) {
    setTimeout(() => {
      DnDMode();
    }, 1000);
  }
});

chrome.storage.sync.get(["thumbnail"], function (result) {
  if (result.thumbnail) {
    hideThumbnails();
    window.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          hideThumbnails();
        }
      });
    });
    window.observer.observe(document.body, { childList: true, subtree: true });
  }
});
chrome.storage.sync.get(["blockedTime"], function (result) {
  if (result.blockedTime) {
    hideBody();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "runFunctions") {
    main();
  }
});

// Your functions here...

function main() {
  const e = document.getElementById("movie_player");
  if (!e) return null;
  try {
    // Create an observer instance
    const observer = new MutationObserver((mutation) => {
      skipBtnClick();
      adVideoManipulation();
    });
    observer.observe(e, {
      subtree: false, // default
      childList: false, // default
      attributes: true, // monitor select element attribute only
      attributeFilter: ["class"], // specific attribute to monitor
      characterData: false, // default
    });

    // Function to check the initial state of a class on an element
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
      // console.info('skip button click by XPath successful');
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
      // console.info('skip button click by ClassName successful');
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
    const elementXPath = '//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video';
    const adElement = getElementByXpath(elementXPath);
    // no ads found
    if (!adElement) return false;

    // set params
    adElement.volume = 0;
    adElement.muted = true;
    adElement.playbackRate = 16; // max video playback speed
    // console.info("ad video manipulation successful");
    return true;
  } catch (err) {
    console.error("ad manipulation error=>", err);
  }
  return false;
}
