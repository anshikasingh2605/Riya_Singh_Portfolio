document.addEventListener("DOMContentLoaded", () => {

    /* ALL JS GOES HERE */
    const heroImage = document.querySelector(".image-wrapper img");

    if (heroImage) {

        document.addEventListener("mousemove", (e) => {

            const x = (window.innerWidth / 2 - e.clientX) / 50;
            const y = (window.innerHeight / 2 - e.clientY) / 50;

            heroImage.style.transform =
                `translate(${x}px,${y}px) scale(1.05)`;

        });

        document.addEventListener("mouseleave", () => {

            heroImage.style.transform =
                "translate(0,0) scale(1)";

        });

    }
    const navbar = document.querySelector(".navbar");

    if (navbar) {

        window.addEventListener("scroll", () => {

            navbar.classList.toggle(

                "scrolled",

                window.scrollY > 50

            );

        });

    }
    const experienceCards =

        document.querySelectorAll(

            ".experience-card"

        );

    if (experienceCards.length) {

        const observer =

            new IntersectionObserver(

                (entries) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add("show");

                        }

                    });

                },

                {

                    threshold: .2

                }

            );

        experienceCards.forEach(card => {

            observer.observe(card);

        });

    }
    const campaignCards =
        document.querySelectorAll(
            ".campaign-card"
        );

    const campaignModal =
        document.getElementById(
            "videoModal"
        );

    const campaignPopup =
        document.getElementById(
            "popupVideo"
        );

    const campaignClose =
        document.getElementById(
            "closeVideo"
        );

    if (campaignCards.length && campaignModal && campaignPopup && campaignClose) {
        campaignCards.forEach(card => {
            card.onclick = () => {
                const sourceEl = card.querySelector("source");
                if (sourceEl) {
                    campaignPopup.src = sourceEl.src;
                    campaignModal.style.display = "flex";
                    campaignPopup.play();
                }
            };
        });

        campaignClose.onclick = () => {
            campaignModal.style.display =
                "none";
            campaignPopup.pause();
        };
    }
    document
        .querySelectorAll(".creative-card img")
        .forEach(img => {
            img.onclick = () => {
                window.open(img.src);
            };
        });

    document
        .querySelectorAll(".proof-gallery img")
        .forEach(img => {
            img.onclick = () => {
                window.open(img.src, "_blank");
            };
        });

    // EVENT VIDEOS INLINE PLAY/PAUSE
    const eventVideos = document.querySelectorAll(".shoot-grid .shoot-card video");
    eventVideos.forEach(video => {
        const card = video.closest(".shoot-card");
        const overlay = card.querySelector(".play-overlay");
        
        card.addEventListener("click", (e) => {
            if (e.target === video && video.controls) return;
            
            if (video.paused) {
                eventVideos.forEach(otherVideo => {
                    if (otherVideo !== video && !otherVideo.paused) {
                        otherVideo.pause();
                        const otherCard = otherVideo.closest(".shoot-card");
                        const otherOverlay = otherCard.querySelector(".play-overlay");
                        if (otherOverlay) otherOverlay.style.display = "flex";
                        otherVideo.controls = false;
                    }
                });
                
                video.play();
                if (overlay) overlay.style.display = "none";
                video.controls = true;
            } else {
                video.pause();
                if (overlay) overlay.style.display = "flex";
                video.controls = false;
            }
        });

    });

    // SEEK VIDEOS TO POSTER FRAME ON PAGE LOAD
    document.querySelectorAll(".campaign-card video, .shoot-card video").forEach(video => {
        const sourceEl = video.querySelector("source");
        const src = sourceEl ? sourceEl.getAttribute("src") : video.getAttribute("src");
        if (src) {
            let seekTime = 1.0;
            const match = src.match(/#t=([\d.]+)/);
            if (match) {
                seekTime = parseFloat(match[1]);
            }
            video.addEventListener("loadedmetadata", () => {
                video.currentTime = seekTime;
            });
            if (video.readyState >= 1) {
                video.currentTime = seekTime;
            }
        }
    });

    // MEME CAROUSEL
    const memeTrack = document.getElementById("meme-track");
    const memePrev = document.getElementById("meme-prev");
    const memeNext = document.getElementById("meme-next");

    if (memeTrack && memePrev && memeNext) {
        const cards = Array.from(memeTrack.children);
        const cardCount = cards.length;
        const gap = 20;

        // Clone first two cards
        const cloneFirst1 = cards[0].cloneNode(true);
        const cloneFirst2 = cards[1].cloneNode(true);
        // Clone last two cards
        const cloneLast1 = cards[cardCount - 2].cloneNode(true);
        const cloneLast2 = cards[cardCount - 1].cloneNode(true);

        // Append and prepend clones
        memeTrack.appendChild(cloneFirst1);
        memeTrack.appendChild(cloneFirst2);
        memeTrack.insertBefore(cloneLast2, memeTrack.firstChild);
        memeTrack.insertBefore(cloneLast1, memeTrack.firstChild);

        let currentIndex = 2; // Starts at 2 due to prepended clones
        let isTransitioning = false;

        function updateCarousel(instant = false) {
            const card = cards[0];
            let cardWidth = card ? card.getBoundingClientRect().width : 0;

            // Robust dynamic width fallback if DOM is not fully ready
            if (cardWidth === 0) {
                const viewport = memeTrack.parentElement;
                const viewportWidth = viewport ? viewport.getBoundingClientRect().width : 0;
                if (viewportWidth > 0) {
                    if (viewportWidth < 500) {
                        cardWidth = viewportWidth;
                    } else {
                        cardWidth = (viewportWidth - gap) / 2;
                    }
                } else {
                    cardWidth = 340; // absolute fallback
                }
            }

            const offset = -currentIndex * (cardWidth + gap);
            if (instant) {
                memeTrack.style.transition = "none";
            } else {
                memeTrack.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            }
            memeTrack.style.transform = `translateX(${offset}px)`;
        }

        // Set initial position
        setTimeout(() => {
            updateCarousel(true);
        }, 100);

        window.addEventListener("resize", () => {
            updateCarousel(true);
        });

        function slideNext() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex += 2;
            updateCarousel();
        }

        function slidePrev() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex -= 2;
            updateCarousel();
        }

        memeNext.addEventListener("click", slideNext);
        memePrev.addEventListener("click", slidePrev);

        memeTrack.addEventListener("transitionend", () => {
            isTransitioning = false;
            if (currentIndex >= cardCount + 2) {
                currentIndex = 2;
                updateCarousel(true);
            } else if (currentIndex <= 0) {
                currentIndex = cardCount;
                updateCarousel(true);
            }
        });

        // Click on memes opens them in a modal
        const memeModal = document.querySelector(".meme-modal");
        const memeModalImg = memeModal ? memeModal.querySelector("img") : null;
        const memeModalClose = memeModal ? memeModal.querySelector("span") : null;

        if (memeModal && memeModalImg && memeModalClose) {
            memeTrack.addEventListener("click", (e) => {
                const card = e.target.closest(".meme-card");
                if (card) {
                    const img = card.querySelector("img");
                    if (img) {
                        memeModalImg.src = img.src;
                        memeModal.style.display = "flex";
                    }
                }
            });

            memeModalClose.onclick = () => {
                memeModal.style.display = "none";
            };

            memeModal.onclick = (e) => {
                if (e.target === memeModal) {
                    memeModal.style.display = "none";
                }
            };
        }
    }

    // TESTIMONIALS SLIDER
    const testimonials = [
        {
            name: "Falak",
            role: "Influencer",
            avatar: "F",
            stars: 5,
            text: `"Riya has been wonderful to work with—kind, supportive, and professional throughout our collaboration. Her communication and positive approach made the entire experience seamless and enjoyable. Looking forward to many more collaborations together!" `
        },
        {
            name: "Shampa",
            role: "Influencer, Creator",
            avatar: "Sh",
            stars: 5,
            text: `"Riya is one of the most supportive and professional people I've had the pleasure of collaborating with. Her kindness, clear communication, and creator-friendly approach made the experience truly enjoyable. Looking forward to working together again!" 🌸`
        },
        
    ];

    const tCard = document.getElementById("testimonial-card");
    const tStars = document.getElementById("testimonial-stars");
    const tText = document.getElementById("testimonial-text");
    const tAvatar = document.getElementById("testimonial-avatar");
    const tName = document.getElementById("testimonial-name");
    const tRole = document.getElementById("testimonial-role");
    const tPrev = document.getElementById("t-prev");
    const tNext = document.getElementById("t-next");
    const tDotsContainer = document.getElementById("t-dots");

    if (tCard && tText && tAvatar && tName && tRole && tPrev && tNext && tDotsContainer) {
        let currentTestimonialIndex = 0;

        function showTestimonial(index) {
            tCard.classList.add("fade-out");
            tCard.classList.remove("fade-in");

            setTimeout(() => {
                const item = testimonials[index];
                tText.textContent = item.text;
                tAvatar.textContent = item.avatar;
                tName.textContent = item.name;
                tRole.textContent = item.role;

                tStars.innerHTML = "";
                for (let i = 0; i < item.stars; i++) {
                    tStars.innerHTML += '<i class="fa-solid fa-star"></i>';
                }

                const dots = tDotsContainer.querySelectorAll(".t-dot");
                dots.forEach((dot, idx) => {
                    dot.classList.toggle("active", idx === index);
                });

                tCard.classList.remove("fade-out");
                tCard.classList.add("fade-in");
            }, 400);
        }

        tPrev.addEventListener("click", () => {
            currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentTestimonialIndex);
        });

        tNext.addEventListener("click", () => {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            showTestimonial(currentTestimonialIndex);
        });

        tDotsContainer.addEventListener("click", (e) => {
            const dot = e.target.closest(".t-dot");
            if (dot) {
                const index = parseInt(dot.getAttribute("data-index"), 10);
                currentTestimonialIndex = index;
                showTestimonial(currentTestimonialIndex);
            }
        });
    }

    // CONTACT FORM AUTOMATIC EMAIL SUBMISSION VIA FORMSUBMIT AJAX
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;
            const submitBtn = contactForm.querySelector("button[type='submit']");

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

            fetch("https://formsubmit.co/ajax/singhriya132003@gmail.com", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    Name: name,
                    Email: email,
                    Subject: subject,
                    Message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success === "true" || data.success === true) {
                    showSuccessMessage("Message Sent Successfully!");
                    contactForm.reset();
                } else {
                    // Fallback to mailto link if submission fails
                    triggerMailtoFallback(subject, name, email, message);
                }
            })
            .catch((error) => {
                console.error("FormSubmit Error:", error);
                // Fallback to mailto link if request fails
                triggerMailtoFallback(subject, name, email, message);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }

    function triggerMailtoFallback(subject, name, email, message) {
        const emailBody = `Hi Riya,\n\nYou have received a new message from your portfolio website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nBest regards,\n${name}`;
        const mailtoLink = `mailto:singhriya132003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;

        showSuccessMessage("Opening Mail Client...");
    }

    function showSuccessMessage(text) {
        const successMsg = document.getElementById("success-message");
        if (successMsg) {
            successMsg.textContent = text;
            successMsg.style.display = "block";
            setTimeout(() => {
                successMsg.style.display = "none";
            }, 4000);
        }
    }

    // THEME TOGGLE (LIGHT / DARK MODE)
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector("i");

        // Load saved theme (default to dark)
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.body.classList.remove("dark-theme");
            if (icon) {
                icon.className = "fa-solid fa-moon";
            }
        } else {
            document.body.classList.add("dark-theme");
            if (icon) {
                icon.className = "fa-solid fa-sun";
            }
        }

        themeToggleBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-theme");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            if (icon) {
                icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
            }
        });
    }

    // MOBILE NAV MENU TOGGLE
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        const toggleIcon = menuToggle.querySelector("i");
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            if (toggleIcon) {
                if (navLinks.classList.contains("active")) {
                    toggleIcon.className = "fa-solid fa-xmark";
                } else {
                    toggleIcon.className = "fa-solid fa-bars";
                }
            }
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                if (toggleIcon) {
                    toggleIcon.className = "fa-solid fa-bars";
                }
            });
        });
    }

});
