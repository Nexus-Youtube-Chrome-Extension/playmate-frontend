import { useState } from 'react'
import Switch from '@mui/material/Switch'

import './Popup.css'

export const Popup = () => {
  const [thumbnailsVisible, setThumbnailsVisible] = useState(true)
  let fMode = false
  let youTime = 0
  const [fInterval, setFInterval] = useState(null)

  const toggleThumbnails = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let tab = tabs[0]

      if (tab.url.includes('youtube.com') && thumbnailsVisible) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            window.observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                  const thumbnails = document.querySelectorAll('.ytd-thumbnail')
                  const thumbnails2 = document.querySelectorAll(
                    '#thumbnail.style-scope.ytd-rich-grid-media',
                  )
                  thumbnails2.forEach((thumbnail) => {
                    thumbnail.remove()
                  })
                  thumbnails.forEach((thumbnail) => {
                    thumbnail.remove()
                  })
                }
              })
            })
            window.observer.observe(document.body, { childList: true, subtree: true })
          },
        })
      } else if (tab.url.includes('youtube.com')) {
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
      setThumbnailsVisible(!thumbnailsVisible)
    })
  }

  const skipAds = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        let tab = tabs[0]
        if (tab.url.includes('youtube.com')) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function () {
              const btn = document.querySelector('.ytp-ad-skip-button-text')
              if (btn) {
                btn.click()
              }
            },
          })
        }
      }
    })
  }

  const trackUser = () => {
    chrome.runtime.sendMessage({ type: 'console', c: 'CALLED' })
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        let tab = tabs[0]
        if (tab.url.includes('youtube.com')) {
          youTime += 1
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
    chrome.runtime.sendMessage({ type: 'console', c: 'HIDE' })
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

  const toggleFocusMode = () => {
    fMode = !fMode
    chrome.runtime.sendMessage({ type: 'console', fMode, fInterval })
    if (fMode) {
      setFInterval(setInterval(trackUser, 10000))
    } else {
      clearInterval(fInterval)
    }
  }

  return (
    <main>
      <div>
        <div className="head">
          <h1>Youtube Tools</h1>
        </div>
        <div className="body">
          <div style={{ display: 'flex' }}>
            <p>Toggle thumbnail</p>
            <label className="switch" onClick={toggleThumbnails}>
              <input type="checkbox" />
              <span className="slider blue"></span>
            </label>
          </div>
          <div style={{ display: 'flex' }}>
            <p>Skip ad</p>
            <label className="switch" onClick={skipAds}>
              <input type="checkbox" />
              <span className="slider blue"></span>
            </label>
          </div>
          <div style={{ display: 'flex' }}>
            <p>Focus mode</p>
            <label className="switch" onClick={toggleFocusMode}>
              <input type="checkbox" />
              <span className="slider blue"></span>
            </label>
          </div>
          {/* <div style={{ display: 'flex' }}>
            <p>Toggle Theme</p>
            <label className="switch" onClick={toggleTheme}>
              <input type="checkbox" checked={toggleTheme} />
              <span className="slider blue"></span>
            </label>
          </div> */}
          <Switch />
        </div>
      </div>
    </main>
  )
}

export default Popup
