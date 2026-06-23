/* ============================================================
   Soft Landing Coaching — script
   Mobile nav · sticky header · scroll reveal · scrollspy ·
   newsletter + contact form handling.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Mobile navigation ---------- */
    const navToggle = document.getElementById("navToggle");
    const primaryNav = document.getElementById("primaryNav");

    const closeNav = () => {
        primaryNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
    };

    if (navToggle && primaryNav) {
        navToggle.addEventListener("click", () => {
            const open = primaryNav.classList.toggle("open");
            navToggle.classList.toggle("open", open);
            navToggle.setAttribute("aria-expanded", String(open));
            navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        primaryNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));
    }

    /* ---------- Sticky header shadow ---------- */
    const header = document.getElementById("siteHeader");
    const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.transitionDelay = `${e.target.dataset.delay || 0}ms`;
                    e.target.classList.add("in");
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add("in"));
    }

    /* ---------- Highlight the current page in the nav ---------- */
    const navLinks = [...document.querySelectorAll(".primary-nav a")];
    const current = location.pathname.split("/").pop() || "index.html";
    navLinks.forEach(l => {
        const href = l.getAttribute("href");
        const isHome = (current === "" || current === "index.html");
        l.classList.toggle("active", href === current || (isHome && href === "index.html"));
    });

    /* ---------- Helpers ---------- */
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const setMsg = (el, text, type) => {
        if (!el) return;
        el.textContent = text;
        el.className = "form-msg " + type;
    };

    /* ---------- Newsletter ---------- */
    const emailInput = document.getElementById("emailInput");
    const subscribeBtn = document.getElementById("subscribeBtn");
    const newsletterMsg = document.getElementById("newsletterMsg");

    if (subscribeBtn && emailInput) {
        const subscribe = () => {
            const v = emailInput.value.trim();
            if (!v)             return setMsg(newsletterMsg, "Please enter your email address.", "err");
            if (!emailRe.test(v)) return setMsg(newsletterMsg, "That email doesn't look quite right.", "err");
            // Connect your mailing-list provider (Mailchimp, etc.) here.
            setMsg(newsletterMsg, "Thank you for subscribing.", "ok");
            emailInput.value = "";
        };
        subscribeBtn.addEventListener("click", subscribe);
        emailInput.addEventListener("keydown", e => { if (e.key === "Enter") subscribe(); });
    }

    /* ---------- Contact form ----------
       To make messages reach the inbox, create a free Web3Forms access key
       at https://web3forms.com (no backend needed), paste it below, and the
       form will email submissions to rah@softlandingcoaching.com.
       Leave it as-is to just show a confirmation without sending.            */
    const WEB3FORMS_ACCESS_KEY = ""; // <-- paste your key here

    const contactSubmit = document.getElementById("contactSubmit");
    const contactMsg = document.getElementById("contactMsg");

    if (contactSubmit) {
        const fields = {
            first: document.getElementById("firstName"),
            last:  document.getElementById("lastName"),
            email: document.getElementById("contactEmail"),
            body:  document.getElementById("message"),
        };

        const submit = async () => {
            const first = fields.first.value.trim();
            const last  = fields.last.value.trim();
            const email = fields.email.value.trim();
            const body  = fields.body.value.trim();

            if (!first || !last || !email || !body)
                return setMsg(contactMsg, "Please fill in all fields.", "err");
            if (!emailRe.test(email))
                return setMsg(contactMsg, "Please enter a valid email address.", "err");

            // No key set yet: confirm locally without sending.
            if (!WEB3FORMS_ACCESS_KEY) {
                setMsg(contactMsg, "Thanks! Your message has been received.", "ok");
                Object.values(fields).forEach(f => (f.value = ""));
                return;
            }

            setMsg(contactMsg, "Sending...", "ok");
            try {
                const res = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: "New enquiry from Soft Landing Coaching",
                        name: `${first} ${last}`,
                        email,
                        message: body,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setMsg(contactMsg, "Thanks! Your message has been sent.", "ok");
                    Object.values(fields).forEach(f => (f.value = ""));
                } else {
                    setMsg(contactMsg, "Something went wrong. Please email us directly.", "err");
                }
            } catch {
                setMsg(contactMsg, "Network error. Please email us directly.", "err");
            }
        };

        contactSubmit.addEventListener("click", submit);
    }
});
