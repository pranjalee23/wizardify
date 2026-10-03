'use client'

import { useEffect } from 'react'

const options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }

type Early = Window & { __reveal?: IntersectionObserver; __revealed?: Map<Element, Animation[]> }

// Starts revealing [data-reveal] elements the moment the page's HTML arrives, so what's on screen
// fades in straight away instead of waiting for the page's scripts (seconds, on a slow phone). It
// plays the same fade as the rules in globals.css with the Web Animations API, which leaves the
// markup untouched, so React's hydration still matches the server's HTML.
const early = `(function(){
if(!window.IntersectionObserver||!Element.prototype.animate||!matchMedia('(prefers-reduced-motion: no-preference)').matches)return;
var shown=window.__revealed=new Map();
var io=window.__reveal=new IntersectionObserver(function(es){es.forEach(function(e){
if(!e.isIntersecting)return;io.unobserve(e.target);
var t={duration:1000,delay:(parseFloat(getComputedStyle(e.target).getPropertyValue('--reveal-delay'))||0)*1000,fill:'both'};
shown.set(e.target,[
e.target.animate({opacity:[0,1],filter:['blur(8px)','none']},Object.assign({easing:'ease'},t)),
e.target.animate({transform:['translateY(22px)','none']},Object.assign({easing:'cubic-bezier(0.16,0.84,0.3,1)'},t))
])})},${JSON.stringify(options)});
document.querySelectorAll('[data-reveal]').forEach(function(el){io.observe(el)})})()`

export default function RevealObserver() {
  useEffect(() => {
    const w = window as Early
    w.__reveal?.disconnect()
    // What the early script revealed: once each fade finishes, hand the element to the CSS (.in)
    // and drop the animation, which would otherwise pin its styles (and block hover effects)
    w.__revealed?.forEach((animations, el) => {
      Promise.all(animations.map((a) => a.finished))
        .then(() => {
          el.classList.add('in')
          animations.forEach((a) => a.cancel())
        })
        .catch(() => {})
    })
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      }
    }, options)
    const observe = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => w.__revealed?.has(el) || io.observe(el))
    }
    observe(document)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('[data-reveal]')) io.observe(node)
          observe(node)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  // Runs only from the server's HTML; React leaves it inert on the client (as the Next.js guide on
  // preventing flash before hydration recommends)
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: early }}
    />
  )
}
