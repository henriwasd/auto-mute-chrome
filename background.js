let lastTabWithAudio = null

chrome.runtime.onMessage.addListener((message, sender) => {
  try {
    if (message.type === 'mute_other_tabs') {
      muteOtherTabs(sender.tab.id)
    }
  } catch (error) {
    console.error('Error handling message:', error)
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  try {
    if (changeInfo.audible !== undefined) {
      muteOtherTabs(tabId)
    }
  } catch (error) {
    console.error('Error handling tab update:', error)
  }
})

function muteOtherTabs(currentTabId) {
  try {
    chrome.tabs.query({}, (tabs) => {
      let currentTabIsPlayingAudio = false
      let currentTabIsPinned = false

      tabs.forEach((tab) => {
        if (tab.id === currentTabId) {
          currentTabIsPinned = tab.pinned
          if (tab.audible) {
            currentTabIsPlayingAudio = true
            lastTabWithAudio = currentTabId
          }
          chrome.tabs.update(tab.id, { muted: false })
        }
      })

      if (!currentTabIsPinned) {
        tabs.forEach((tab) => {
          if (tab.id !== currentTabId && !tab.pinned) {
            chrome.tabs.update(tab.id, { muted: true })
          }
        })
      }

      if (!currentTabIsPlayingAudio && lastTabWithAudio !== null && !currentTabIsPinned) {
        chrome.tabs.query({ pinned: false }, (unpinnedTabs) => {
          const lastTab = unpinnedTabs.find(tab => tab.id === lastTabWithAudio)
          if (lastTab) {
            chrome.tabs.update(lastTabWithAudio, { muted: false })
          }
        })
      }
    })
  } catch (error) {
    console.error('Error muting other tabs:', error)
  }
}