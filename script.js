// --- Register GSAP Plugins ---
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- Custom Cursor Animation ---
const cursor = document.querySelector("#cursor");
document.addEventListener("mousemove", function (e) {
  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.2,
  });
});

// --- Navigation Bar Animation on Scroll ---
gsap.to("#nav", {
  backgroundColor: "rgba(30, 58, 138, 0.8)",
  backdropFilter: "blur(10px)",
  height: "75px",
  duration: 0.5,
  scrollTrigger: {
    trigger: "#page1",
    scroller: "body",
    start: "top -10%",
    end: "top -11%",
    scrub: 1,
  },
});

// --- Full Hero Section Animation Timeline ---
document.addEventListener("DOMContentLoaded", () => {
  // Function to split the main title into letters for animation
  function animateHeroTitle() {
    const title = document.querySelector(".main-heading");
    if (!title) return;
    const text = title.textContent;
    const letters = text.split("");
    title.innerHTML = "";
    letters.forEach((letter) => {
      const span = document.createElement("span");
      span.textContent = letter === " " ? "\u00A0" : letter;
      title.appendChild(span);
    });
  }
  animateHeroTitle();

  // Create the master timeline for all hero animations
  const heroTl = gsap.timeline();

  // 1. Animate the main "Swasti" title first
  heroTl.from(".main-heading span", {
    y: 150,
    opacity: 0,
    stagger: 0.05,
    duration: 0.5,
    ease: "power3.out",
  });

  // 2. Animate the tagline (h3) with a typewriter effect
  heroTl.to(
    ".hero-text h3",
    {
      duration: 1,
      text: {
        value: `"Health Support Made Simple"`,
        delimiter: " ",
      },
      ease: "none",
      onStart: () =>
        document.querySelector(".hero-text h3").classList.add("typing-effect"),
      onComplete: () =>
        document
          .querySelector(".hero-text h3")
          .classList.remove("typing-effect"),
    },
    "-=0.5"
  );

  // 3. Animate the paragraph (p) with a typewriter effect
  heroTl.to(
    ".hero-text p",
    {
      duration: 2,
      text: "Your friendly AI-powered health assistant, available 24/7 in 12 Indian languages.",
      ease: "none",
      onStart: () =>
        document.querySelector(".hero-text p").classList.add("typing-effect"),
      onComplete: () =>
        document
          .querySelector(".hero-text p")
          .classList.remove("typing-effect"),
    },
    "-=1.5"
  );

  // 4. Fade in the button and the image at the end
  heroTl.to(
    [".cta-button", ".hero-image img"],
    {
      opacity: 1,
      scale: 1,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out",
    },
    "-=1"
  );
});

// --- On-Scroll Reveal Animations for Sections ---
const revealElements = document.querySelectorAll(".scroll-reveal");
revealElements.forEach((el) => {
  gsap.from(el, {
    y: 100,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: el,
      scroller: "body",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
});