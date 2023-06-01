// ==UserScript==
// @name        Block Twitter Affiliate links
// @namespace    https://github.com/rorre/twitterscripts
// @version      0.1
// @description  Twitter affiliate links blocker
// @author       rorre
// @match        http://www.twitter.com/*
// @match        https://www.twitter.com/*
// @match        http://twitter.com/*
// @match        https://twitter.com/*
// @grant        none
// ==/UserScript==

class QueueGarbage {
  constructor(maxElem) {
    this.keys = []
    this.elements = {}
    this.maxElem = maxElem
  }

  add(key, elem) {
    this.elements[key] = elem
    this.keys.unshift(key)
    if (this.keys.length > this.maxElem) {
      let removedKey = this.keys.pop()
      delete this.elements[removedKey]
    }
  }

  get(key) {
    return this.elements[key]
  }
}

const postCache = new QueueGarbage(20);
const DOMAINS = ["shope.ee", "tokopedia.link", "wa.link"]
const THREAD_HEADERS = [new RegExp("rekomendasi[^]*thread", "i"), new RegExp("kumpulan[^]*thread", "i")]

const BLOCK_HTML = `
<div class="css-1dbjc4n r-1igl3o0 r-qklmqi r-1adg3ll r-1ny4l3l">
<div class="css-1dbjc4n">
<div class="css-1dbjc4n">
<div class="css-1dbjc4n" data-testid="Withheld_Tombstone">
<article aria-labelledby="id__8d34ic7r8yn" role="article" tabindex="-1" class="css-1dbjc4n r-18u37iz r-1ny4l3l r-1udh08x r-1qhn6m8 r-i023vh">
<div class="css-1dbjc4n r-eqz5dr r-16y2uox r-1wbh5a2">
<div class="css-1dbjc4n r-16y2uox r-1wbh5a2 r-1ny4l3l">
<div class="css-1dbjc4n">
<div class="css-1dbjc4n r-18u37iz">
<div class="css-1dbjc4n r-1iusvr4 r-16y2uox r-ttdzmv"></div>
</div>
</div>
<div class="css-1dbjc4n r-18u37iz">
<div class="css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu">
<div class="css-1dbjc4n r-1awozwy r-g2wdr4 r-16cnnyw r-1867qdf r-1phboty r-rs99b7 r-18u37iz r-1wtj0ep r-s1qlax r-1f1sjgu">
<div class="css-1dbjc4n r-1adg3ll r-1wbh5a2 r-1fz3rvf">
<div dir="auto" lang="en" class="css-901oao r-1bwzh9t r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-qvutc0" id="id__8d34ic7r8yn"><span class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0">This post has been blocked because it contains affiliate link(s). Click to show the post anyway.</span></div>
</div>
</div>
</div>
</div>
</div>
</div>
</article>
</div>
</div>
</div>
</div>
`

function shouldBlock(elem) {
  if (elem.dataset.userShow) return false;

  let str = elem.innerHTML
  for (let i = 0; i < DOMAINS.length; i++) {
    let domain = DOMAINS[i]
    if (str.indexOf(domain) !== -1) {
      return true;
    }
  }

  for (let i = 0; i < THREAD_HEADERS.length; i++) {
    let re = THREAD_HEADERS[i]
    if (re.test(str)) {
      return true;
    }
  }

  return false;
}

function restorePost(elem, postId) {
  elem.dataset.userShow = true
  elem.innerHTML = postCache.get(postId)
}

function watchAndBlock() {
  const posts = document.querySelectorAll('[data-testid="cellInnerDiv"]')
  posts.forEach((post) => {
    if (shouldBlock(post)) {
      let originalHtml = post.innerHTML
      post.innerHTML = BLOCK_HTML

      let postId = (Math.random() + 1).toString(36).substring(2)
      postCache.add(postId, originalHtml)
      post.addEventListener("click", () => restorePost(post, postId))
    }
  })
}

(function() {
  setInterval(function(){
    watchAndBlock()
  }, 1000);
})()
