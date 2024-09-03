let lastTabWithAudio = null

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'mute_other_tabs') {
    muteOtherTabs(sender.tab.id)
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.audible !== undefined) {
    muteOtherTabs(tabId)
  }
})

function muteOtherTabs(currentTabId) {
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
      } else if (!tab.pinned) {
        chrome.tabs.update(tab.id, { muted: true })
      }
    })

    if (!currentTabIsPlayingAudio && lastTabWithAudio !== null && !currentTabIsPinned) {
      chrome.tabs.query({ pinned: false }, (unpinnedTabs) => {
        const lastTab = unpinnedTabs.find(tab => tab.id === lastTabWithAudio)
        if (lastTab) {
          chrome.tabs.update(lastTabWithAudio, { muted: false })
        }
      })
    }
  })
}