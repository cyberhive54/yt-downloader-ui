// Global variables
let currentMainTab = "single"
let currentFormatTab = "video"
const downloadQueue = []
let isProcessing = false

const videoDetails = document.getElementById("video-details")
const formatTabs = document.querySelector(".format-tabs")

// DOM elements
const mainTabBtns = document.querySelectorAll(".main-tab-btn")
const mainTabContents = document.querySelectorAll(".main-tab-content")
const formatTabBtns = document.querySelectorAll(".format-tab-btn")
const formatContents = document.querySelectorAll(".format-content")
const loadingOverlay = document.getElementById("loading-overlay")
const loadingText = document.getElementById("loading-text")
const progressFill = document.querySelector(".progress-fill")
const downloadResults = document.getElementById("download-results")
const resultsGrid = document.getElementById("results-grid")
const batchTextarea = document.getElementById("batch-urls")
const urlCount = document.querySelector(".url-count")
const faqItems = document.querySelectorAll(".faq-item")

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeMainTabs()
  initializeFormatTabs()
  initializeShowMoreButtons()
  initializeFAQ()
  initializeBatchCounter()
  initializeDemoCards()
  initializeMobileMenu()
  initializeSmoothScrolling()
  handleScrollAnimations()
})

// Main tab functionality
function initializeMainTabs() {
  mainTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab")
      switchMainTab(tabId)
    })
  })
}

function switchMainTab(tabId) {
  // Update active main tab button
  mainTabBtns.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active")
    }
  })

  // Update active main tab content
  mainTabContents.forEach((content) => {
    content.classList.remove("active")
    if (content.id === `${tabId}-tab`) {
      content.classList.add("active")
    }
  })

  currentMainTab = tabId
}

// Format tab functionality
function initializeFormatTabs() {
  formatTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const formatId = btn.getAttribute("data-format")
      switchFormatTab(formatId)
    })
  })
}

function switchFormatTab(formatId) {
  formatTabBtns.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.getAttribute("data-format") === formatId) {
      btn.classList.add("active")
    }
  })

  formatContents.forEach((content) => {
    content.classList.remove("active")
    if (content.id === `${formatId}-formats`) {
      content.classList.add("active")
    }
  })

  currentFormatTab = formatId
}

// Show more functionality
function initializeShowMoreButtons() {
  const showMoreBtns = document.querySelectorAll(".show-more-btn")
  showMoreBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const formatType = btn.id.includes("video") ? "video" : "audio"
      const additionalFormats = document.getElementById(`${formatType}-additional`)
      const isExpanded = additionalFormats.classList.contains("active")

      if (isExpanded) {
        additionalFormats.classList.remove("active")
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Show More Formats'
      } else {
        additionalFormats.classList.add("active")
        btn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less Formats'
      }
    })
  })
}

// FAQ functionality
function initializeFAQ() {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question")
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active")

      // Close all FAQ items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("active")
      })

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active")
      }
    })
  })
}

// Batch URL counter
function initializeBatchCounter() {
  if (batchTextarea) {
    batchTextarea.addEventListener("input", updateUrlCount)
  }
}

function updateUrlCount() {
  const text = batchTextarea.value.trim()
  const urls = text ? text.split("\n").filter((line) => line.trim() !== "") : []
  const validUrls = urls.filter((url) => isValidYouTubeUrl(url.trim()))
  urlCount.textContent = `${validUrls.length} valid URLs detected`
}

// Demo cards functionality
function initializeDemoCards() {
  const demoCards = document.querySelectorAll(".demo-card")
  demoCards.forEach((card) => {
    const downloadBtn = card.querySelector(".demo-download-btn")
    const qualityOptions = card.querySelectorAll(".quality-options span")

    downloadBtn.addEventListener("click", () => {
      const title = card.querySelector("h4").textContent
      simulateDownload(`Demo: ${title}`, "https://demo-url.com")
    })

    qualityOptions.forEach((option) => {
      option.addEventListener("click", () => {
        qualityOptions.forEach((opt) => (opt.style.background = "#f1f5f9"))
        qualityOptions.forEach((opt) => (opt.style.color = "#64748b"))
        option.style.background = "#6366f1"
        option.style.color = "white"
      })
    })
  })
}

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const nav = document.querySelector(".nav")

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      nav.classList.toggle("active")
    })
  }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight
        const targetPosition = targetElement.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })
}

// Download functions
function analyzeVideo() {
  const urlInput = document.getElementById("video-url")
  const url = urlInput.value.trim()

  if (!url) {
    showNotification("Please enter a YouTube URL", "error")
    return
  }

  if (!isValidYouTubeUrl(url)) {
    showNotification("Please enter a valid YouTube URL", "error")
    return
  }

  simulateAnalysis("Single Video", url)
}

function analyzePlaylist() {
  const urlInput = document.getElementById("playlist-url")
  const url = urlInput.value.trim()

  if (!url) {
    showNotification("Please enter a YouTube playlist URL", "error")
    return
  }

  if (!isValidYouTubeUrl(url)) {
    showNotification("Please enter a valid YouTube playlist URL", "error")
    return
  }

  simulatePlaylistAnalysis(url)
}

function analyzeBatch() {
  const urls = batchTextarea.value
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "")
  const validUrls = urls.filter((url) => isValidYouTubeUrl(url.trim()))

  if (validUrls.length === 0) {
    showNotification("Please enter valid YouTube URLs", "error")
    return
  }

  simulateBatchAnalysis(validUrls)
}

// Simulation functions
function simulateAnalysis(title, url) {
  if (isProcessing) return

  isProcessing = true
  showLoading()

  const steps = [
    "Analyzing video...",
    "Extracting video information...",
    "Fetching metadata...",
    "Processing formats...",
    "Analysis complete!",
  ]

  let currentStep = 0
  const stepInterval = setInterval(() => {
    if (currentStep < steps.length) {
      loadingText.textContent = steps[currentStep]
      progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`
      currentStep++
    } else {
      clearInterval(stepInterval)
      hideLoading()
      showVideoDetails()
      showFormatOptions()
      showNotification("Video analyzed successfully! Choose your format below.", "success")
      isProcessing = false
    }
  }, 800)
}

function showVideoDetails() {
  // Simulate video metadata
  const mockData = {
    title: "Amazing Tutorial: Complete Guide to Web Development",
    thumbnail: "/placeholder.svg?height=180&width=320&text=Video+Thumbnail",
    uploadDate: "Dec 15, 2023",
    views: "1,234,567 views",
    duration: "15:42",
    channel: "TechMaster Pro",
    description: `Welcome to this comprehensive web development tutorial! 

In this video, you'll learn:
• HTML5 fundamentals and semantic markup
• CSS3 advanced techniques and animations  
• JavaScript ES6+ features and best practices
• Responsive design principles
• Modern development tools and workflows

🔗 Resources mentioned in this video:
- GitHub repository: https://github.com/example/repo
- Documentation: https://developer.mozilla.org
- Practice exercises: https://codepen.io/collection

📚 Chapters:
00:00 Introduction
02:30 HTML Basics
05:15 CSS Styling
08:45 JavaScript Fundamentals
12:20 Responsive Design
14:30 Conclusion

Don't forget to like and subscribe for more tutorials!

#WebDevelopment #HTML #CSS #JavaScript #Tutorial`,
  }

  document.getElementById("video-title").textContent = mockData.title
  document.getElementById("video-thumb").src = mockData.thumbnail
  document.getElementById("upload-date").textContent = mockData.uploadDate
  document.getElementById("view-count").textContent = mockData.views
  document.getElementById("duration").textContent = mockData.duration
  document.getElementById("channel-name").textContent = mockData.channel
  document.getElementById("description-text").textContent = mockData.description

  videoDetails.classList.add("active")
}

function showFormatOptions() {
  const formatTabs = document.getElementById("format-tabs")
  formatTabs.classList.add("active")
  // Show the default video formats
  document.getElementById("video-formats").classList.add("active")
}

function toggleDescription() {
  const descContent = document.getElementById("description-content")
  const toggle = document.querySelector(".description-toggle")
  const icon = toggle.querySelector("i")
  const text = toggle.querySelector("span")

  if (descContent.classList.contains("active")) {
    descContent.classList.remove("active")
    icon.className = "fas fa-chevron-down"
    text.textContent = "Show Description"
  } else {
    descContent.classList.add("active")
    icon.className = "fas fa-chevron-up"
    text.textContent = "Hide Description"
  }
}

function copyDescription() {
  const descText = document.getElementById("description-text").textContent
  navigator.clipboard
    .writeText(descText)
    .then(() => {
      showNotification("Description copied to clipboard!", "success")
    })
    .catch(() => {
      showNotification("Failed to copy description", "error")
    })
}

function downloadThumbnail() {
  const thumbnailUrl = document.getElementById("video-thumb").src
  const link = document.createElement("a")
  link.href = thumbnailUrl
  link.download = "video-thumbnail.jpg"
  link.click()
  showNotification("Thumbnail download started!", "success")
}

function simulatePlaylistAnalysis(url) {
  if (isProcessing) return

  isProcessing = true
  showLoading()

  // Simulate playlist processing
  const videos = [
    "Complete Web Development Tutorial",
    "Advanced CSS Techniques",
    "JavaScript ES6+ Features",
    "React.js Fundamentals",
    "Node.js Backend Development",
    "Database Design and SQL",
    "Git and GitHub Workflow",
    "Responsive Web Design",
    "Web Performance Optimization",
    "Deployment and DevOps",
  ]

  let currentVideo = 0
  const videoInterval = setInterval(() => {
    if (currentVideo < videos.length) {
      loadingText.textContent = `Analyzing: ${videos[currentVideo]}`
      progressFill.style.width = `${((currentVideo + 1) / videos.length) * 100}%`
      currentVideo++
    } else {
      clearInterval(videoInterval)
      hideLoading()
      displayPlaylistResults()
      isProcessing = false
    }
  }, 800)
}

function displayPlaylistResults() {
  const playlistResults = document.getElementById("playlist-results")
  playlistResults.classList.add("active")
  playlistResults.scrollIntoView({ behavior: "smooth" })
  showNotification("Playlist analyzed successfully! 10 videos found.", "success")
}

function toggleVideoDescription(button) {
  const videoItem = button.closest(".video-item")
  const descContent = videoItem.querySelector(".video-description-content")
  const icon = button.querySelector("i")
  const text = button.querySelector("span")

  if (descContent.classList.contains("active")) {
    descContent.classList.remove("active")
    icon.className = "fas fa-chevron-down"
    text.textContent = "Show Description"
  } else {
    descContent.classList.add("active")
    icon.className = "fas fa-chevron-up"
    text.textContent = "Hide Description"
  }
}

function copyVideoDescription(button) {
  const descText = button.nextElementSibling.textContent
  navigator.clipboard
    .writeText(descText)
    .then(() => {
      showNotification("Description copied to clipboard!", "success")
    })
    .catch(() => {
      showNotification("Failed to copy description", "error")
    })
}

function simulateBatchAnalysis(urls) {
  if (isProcessing) return

  isProcessing = true
  showLoading()

  let currentUrl = 0
  const urlInterval = setInterval(() => {
    if (currentUrl < urls.length) {
      loadingText.textContent = `Analyzing video ${currentUrl + 1} of ${urls.length}`
      progressFill.style.width = `${((currentUrl + 1) / urls.length) * 100}%`
      currentUrl++
    } else {
      clearInterval(urlInterval)
      hideLoading()
      displayBatchResults(urls.length)
      isProcessing = false
    }
  }, 1200)
}

// Format download handlers
document.addEventListener("click", (e) => {
  if (e.target.closest(".download-format-btn")) {
    const btn = e.target.closest(".download-format-btn")
    const formatCard = e.target.closest(".format-card")
    const quality = formatCard.querySelector(".format-quality").textContent
    const details = formatCard.querySelector(".format-details").textContent
    const action = btn.getAttribute("data-action")

    if (action === "render") {
      simulateRender(quality, details)
    } else {
      simulateDownload(`Video in ${quality}`, "demo-url", `${quality} ${details}`)
    }
  }
})

// Replace the existing simulateRender function with this enhanced version
function simulateRender(quality, details) {
  showRenderModal(quality, details)
}

// Add new render modal functions
function showRenderModal(quality, details) {
  const modal = document.getElementById("render-modal-overlay")
  const qualityDisplay = document.getElementById("render-quality-display")
  const formatDisplay = document.getElementById("render-format-display")
  const videoTitle = document.getElementById("render-video-title")
  const videoFileSize = document.getElementById("video-file-size")
  const audioFileSize = document.getElementById("audio-file-size")

  // Get video title from the analyzed video
  const currentVideoTitle =
    document.getElementById("video-title")?.textContent || "Amazing Tutorial: Complete Guide to Web Development"

  qualityDisplay.textContent = quality
  formatDisplay.textContent = details
  videoTitle.textContent = currentVideoTitle

  // Set file sizes based on quality
  const fileSizes = getFileSizes(quality)
  videoFileSize.textContent = fileSizes.video
  audioFileSize.textContent = fileSizes.audio

  modal.classList.add("active")

  // Start the render process
  startRenderProcess(quality)
}

// Add function to get file sizes based on quality
function getFileSizes(quality) {
  const sizeMap = {
    "144p": { video: "20MB", audio: "5MB" },
    "240p": { video: "35MB", audio: "10MB" },
    "360p": { video: "65MB", audio: "15MB" },
    "480p": { video: "120MB", audio: "30MB" },
    "720p": { video: "220MB", audio: "60MB" },
    "1080p": { video: "380MB", audio: "70MB" },
    "4K": { video: "980MB", audio: "220MB" },
    "8K": { video: "2.1GB", audio: "450MB" },
  }

  return sizeMap[quality] || { video: "220MB", audio: "60MB" }
}

function startRenderProcess(quality) {
  const steps = [
    { name: "VIDEO PROCESSING", duration: 30 },
    { name: "SOUND PROCESSING", duration: 25 },
    { name: "RENDER", duration: 35 },
    { name: "DONE", duration: 10 },
  ]

  let currentStep = 0
  let progress = 0
  let isPaused = false
  const estimatedTime = getEstimatedTime(quality)
  let remainingTime = estimatedTime

  const progressFill = document.getElementById("render-progress-fill")
  const progressText = document.getElementById("render-progress-text")
  const timeDisplay = document.getElementById("render-time-display")
  const pauseBtn = document.getElementById("render-pause-btn")
  const cancelBtn = document.getElementById("render-cancel-btn")

  // Update estimated time display
  updateTimeDisplay(remainingTime)

  // Set up control buttons
  pauseBtn.onclick = () => togglePause()
  cancelBtn.onclick = () => cancelRender()

  function togglePause() {
    isPaused = !isPaused
    const icon = pauseBtn.querySelector("i")
    const text = pauseBtn.querySelector("span")

    if (isPaused) {
      icon.className = "fas fa-play"
      text.textContent = "Resume"
      pauseBtn.classList.add("resumed")
    } else {
      icon.className = "fas fa-pause"
      text.textContent = "Pause"
      pauseBtn.classList.remove("resumed")
    }
  }

  function cancelRender() {
    hideRenderModal()
    showNotification("Render process cancelled", "error")
  }

  function updateTimeDisplay(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    timeDisplay.textContent = `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  function updateProgress() {
    if (isPaused) {
      setTimeout(updateProgress, 100)
      return
    }

    progress += 0.5
    remainingTime = Math.max(0, remainingTime - 1)

    // Update progress bar
    progressFill.style.width = `${progress}%`
    progressText.textContent = `${Math.round(progress)}%`

    // Update time display
    updateTimeDisplay(remainingTime)

    // Update step indicators
    const newStep = Math.floor(progress / 25)
    if (newStep > currentStep && newStep < steps.length) {
      // Mark previous step as completed
      const prevStepEl = document.querySelector(`[data-step="${currentStep + 1}"]`)
      if (prevStepEl) {
        prevStepEl.classList.remove("active")
        prevStepEl.classList.add("completed")
      }

      // Activate new step
      currentStep = newStep
      const currentStepEl = document.querySelector(`[data-step="${currentStep + 1}"]`)
      if (currentStepEl) {
        currentStepEl.classList.add("active")
      }
    }

    if (progress < 100) {
      setTimeout(updateProgress, 200)
    } else {
      // Process complete
      completeRender(quality)
    }
  }

  // Start the progress
  setTimeout(updateProgress, 500)
}

// Update the completeRender function
function completeRender(quality) {
  // Mark final step as completed
  const finalStep = document.querySelector('[data-step="4"]')
  if (finalStep) {
    finalStep.classList.add("active", "completed")
  }

  // Hide pause button and show final result
  setTimeout(() => {
    const pauseBtn = document.getElementById("render-pause-btn")
    const finalResult = document.getElementById("render-final-result")
    const finalFileName = document.getElementById("final-file-name")
    const finalQuality = document.getElementById("final-quality")
    const finalSize = document.getElementById("final-size")
    const finalDownloadBtn = document.getElementById("final-download-btn")

    // Hide pause button
    pauseBtn.style.display = "none"

    // Show final result
    finalResult.style.display = "block"

    // Set final file details
    const videoTitle = document.getElementById("render-video-title").textContent
    const fileName = `${videoTitle.replace(/[^a-z0-9]/gi, "_")}_${quality}.mp4`
    const formatDisplay = document.getElementById("render-format-display").textContent
    const totalSize = getTotalFileSize(quality)

    finalFileName.textContent = fileName
    finalQuality.textContent = `${quality} • ${formatDisplay.split("•")[1]?.trim() || "Ultra HD"}`
    finalSize.textContent = totalSize

    // Set up download button
    finalDownloadBtn.onclick = () => {
      const link = document.createElement("a")
      link.href = "#"
      link.download = fileName
      link.click()

      showNotification(`${quality} video download started!`, "success")

      // Close modal after download starts
      setTimeout(() => {
        hideRenderModal()
      }, 1000)
    }

    showNotification(`${quality} video rendered successfully!`, "success")
  }, 1000)
}

// Add function to calculate total file size
function getTotalFileSize(quality) {
  const sizeMap = {
    "144p": "25MB",
    "240p": "45MB",
    "360p": "80MB",
    "480p": "150MB",
    "720p": "280MB",
    "1080p": "450MB",
    "4K": "1.2GB",
    "8K": "2.5GB",
  }

  return sizeMap[quality] || "280MB"
}

// Update the resetRenderModal function
function resetRenderModal() {
  // Reset progress
  const progressFill = document.getElementById("render-progress-fill")
  const progressText = document.getElementById("render-progress-text")
  const timeDisplay = document.getElementById("render-time-display")

  progressFill.style.width = "0%"
  progressText.textContent = "0%"
  timeDisplay.textContent = "0:00"

  // Reset steps
  const steps = document.querySelectorAll(".render-step")
  steps.forEach((step, index) => {
    step.classList.remove("active", "completed")
    if (index === 0) {
      step.classList.add("active")
    }
  })

  // Reset buttons
  const pauseBtn = document.getElementById("render-pause-btn")
  const icon = pauseBtn.querySelector("i")
  const text = pauseBtn.querySelector("span")

  icon.className = "fas fa-pause"
  text.textContent = "Pause"
  pauseBtn.classList.remove("resumed")
  pauseBtn.style.display = "flex" // Show pause button again

  // Hide final result
  const finalResult = document.getElementById("render-final-result")
  finalResult.style.display = "none"
}

function getEstimatedTime(quality) {
  const timeMap = {
    "144p": 45,
    "240p": 60,
    "360p": 75,
    "480p": 90,
    "720p": 120,
    "1080p": 180,
    "4K": 300,
    "8K": 360,
  }

  return timeMap[quality] || 120
}

// Update existing simulateDownload function to handle different button states
function simulateDownload(title, url, format = "MP4") {
  showNotification(`Downloading ${title} in ${format}`, "success")

  // Simulate file download
  const link = document.createElement("a")
  link.href = "#"
  link.download = `${title.replace(/[^a-z0-9]/gi, "_")}.${format.includes("MP3") ? "mp3" : "mp4"}`
  link.click()
}

// UI helper functions
function showLoading() {
  loadingOverlay.classList.add("active")
  progressFill.style.width = "0%"
}

function hideLoading() {
  loadingOverlay.classList.remove("active")
}

function showBatchResults(urls) {
  resultsGrid.innerHTML = ""
  urls.forEach((url, index) => {
    const resultCard = createResultCard(`Video ${index + 1}`, url, "mp4")
    resultsGrid.appendChild(resultCard)
  })
  downloadResults.classList.add("active")
  downloadResults.scrollIntoView({ behavior: "smooth" })
}

function createResultCard(title, url, format) {
  const card = document.createElement("div")
  card.className = "result-card"
  card.innerHTML = `
        <div class="result-thumbnail">
            <img src="/placeholder.svg?height=180&width=320" alt="${title}">
        </div>
        <div class="result-info">
            <h4>${title}</h4>
            <p>Format: ${format.toUpperCase()} • Ready for download</p>
            <div class="result-actions">
                <button class="quality-btn" onclick="downloadFile('${title}', '720p')">720p</button>
                <button class="quality-btn" onclick="downloadFile('${title}', '1080p')">1080p</button>
                <button class="quality-btn" onclick="downloadFile('${title}', 'MP3')">MP3</button>
            </div>
        </div>
    `
  return card
}

function downloadFile(title, quality) {
  showNotification(`Downloading ${title} in ${quality}`, "success")

  // Simulate file download
  const link = document.createElement("a")
  link.href = "#"
  link.download = `${title}_${quality}.${quality === "MP3" ? "mp3" : "mp4"}`
  link.click()
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  // Add notification styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Utility functions
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

// Add notification animations to CSS dynamically
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    
    @media (max-width: 768px) {
        .nav.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 0 0 16px 16px;
        }
    }
`
document.head.appendChild(style)

// Scroll animations
function handleScrollAnimations() {
  const elements = document.querySelectorAll(".feature-card, .demo-card, .step")

  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top
    const elementVisible = 150

    if (elementTop < window.innerHeight - elementVisible) {
      element.style.animation = "fadeInUp 0.6s ease forwards"
    }
  })
}

// Add scroll event listener
window.addEventListener("scroll", handleScrollAnimations)

// Add these functions after the existing functions:

function updateSelectionCount() {
  const checkboxes = document.querySelectorAll(".playlist-videos .video-checkbox")
  const checkedBoxes = document.querySelectorAll(".playlist-videos .video-checkbox:checked")
  const downloadSelectedBtn = document.getElementById("download-selected")
  const selectionBadge = document.getElementById("selection-count")

  const count = checkedBoxes.length

  if (count > 0) {
    downloadSelectedBtn.disabled = false
    selectionBadge.style.display = "flex"
    selectionBadge.textContent = count
  } else {
    downloadSelectedBtn.disabled = true
    selectionBadge.style.display = "none"
  }
}

function updateBatchSelectionCount() {
  const checkboxes = document.querySelectorAll(".batch-videos .batch-video-checkbox")
  const checkedBoxes = document.querySelectorAll(".batch-videos .batch-video-checkbox:checked")
  const downloadSelectedBtn = document.getElementById("batch-download-selected")
  const selectionBadge = document.getElementById("batch-selection-count")

  const count = checkedBoxes.length

  if (count > 0) {
    downloadSelectedBtn.disabled = false
    selectionBadge.style.display = "flex"
    selectionBadge.textContent = count
  } else {
    downloadSelectedBtn.disabled = true
    selectionBadge.style.display = "none"
  }
}

function displayBatchResults(videoCount) {
  const batchResults = document.getElementById("batch-results")
  const batchFound = document.querySelector(".batch-found span")

  batchFound.textContent = `Found ${videoCount} videos from batch URLs`
  batchResults.classList.add("active")
  batchResults.scrollIntoView({ behavior: "smooth" })
  showNotification(`Batch analyzed successfully! ${videoCount} videos found.`, "success")
}

function hideRenderModal() {
  const modal = document.getElementById("render-modal-overlay")
  modal.classList.remove("active")
}

// Try Other Tools functionality
function openToolPopup() {
  showNotification("This tool is coming soon! Stay tuned for updates.", "info")
}

function openMoreDownloaders() {
  const popup = document.getElementById("more-downloaders-popup")
  popup.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeMoreDownloaders() {
  const popup = document.getElementById("more-downloaders-popup")
  popup.classList.remove("active")
  document.body.style.overflow = "auto"
}

function searchDownloaders(query) {
  const toolCards = document.querySelectorAll(".popup-tool-card")
  const searchTerm = query.toLowerCase()

  toolCards.forEach((card) => {
    const title = card.querySelector("h5").textContent.toLowerCase()
    const description = card.querySelector("p").textContent.toLowerCase()

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Close popup when clicking outside
document.addEventListener("click", (e) => {
  const popup = document.getElementById("more-downloaders-popup")
  if (e.target === popup) {
    closeMoreDownloaders()
  }
})

// Close popup with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMoreDownloaders()
  }
})
