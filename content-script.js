function muteOtherTabs() {
  chrome.runtime.sendMessage({ type: 'mute_other_tabs' })
}

function setupPageVisibilityChangeListener() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      muteOtherTabs()
    }
  })
}

setupPageVisibilityChangeListener()

if (document.visibilityState === 'visible') {
  muteOtherTabs()
}