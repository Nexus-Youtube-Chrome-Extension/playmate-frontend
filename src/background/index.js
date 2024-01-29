console.log('background is running')
let fInterval
let fMode = false

const trackUser = () => {
  console.log('CALLED')
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0]
      if (tab.url.includes('youtube.com')) {
        youTime += 1
        console.log(youTime)
        if (youTime === 1) {
          hideBody()
        } else if (youTime === 2) {
          showBody()
          youTime = 0
        }
      }
    }
  })
}

const hideBody = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0]
      if (tab.url.includes('youtube.com')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            document.body.innerHTML = `<div style="width:100%; height:100vh; display:flex; justify-content:center; align-items:center; flex-direction:column; ">
                <h1 style="z-index:100; color:white; font-size:8rem; ">YouTube Blocked</h1>
                <h1 style="z-index:100; color:white; font-size:8rem; ">Go do some productive work!</h1>
              </div>`
          },
        })
      }
    }
  })
}

const showBody = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      let tab = tabs[0]
      if (tab.url.includes('youtube.com')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            location.reload()
          },
        })
      }
    }
  })
}

chrome.runtime.onMessage.addListener((request) => {
  console.log(request)
  if (request.message === 'togglefocus') {
    console.log('FIRST')
    fMode = !fMode
    console.log(fMode)
    if (fMode) {
      console.log('Started')
      fInterval = setInterval(trackUser, 10000)
    } else {
      clearInterval(fInterval)
    }
  }
})
