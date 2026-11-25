function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

const opportunityIcons = {
    location: '<svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>',
    salary: '<svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"></rect><path d="M3 10h18m-9 3v3m2-3h-3.5a1.5 1.5 0 0 0 0 3H14a1.5 1.5 0 0 1 0 3h-4"></path></svg>',
    duration: '<svg class="meta-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>',
    arrow: '<svg class="opportunity-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"></path></svg>'
};

document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("opportunityList");
    if (!list) return;

    const search = document.getElementById("opportunitySearch");
    const locationFilter = document.getElementById("locationFilter");
    const typeFilter = document.getElementById("typeFilter");
    const count = document.getElementById("listingCount");
    const body = document.body;
    const baseType = body.dataset.opportunityType || "all";
    const homeUrl = body.dataset.homeUrl || "index.html";
    const pageSize = 4;
    let opportunities = [];
    let selectedCategory = "";
    let currentPage = 1;

    try {
        const data = await CareerConnectData.load();
        opportunities = data.opportunities;
        if (typeFilter && baseType !== "all") {
            const typeFilterLabel = typeFilter.closest("label");
            if (typeFilterLabel) typeFilterLabel.hidden = true;
        }

        const query = new URLSearchParams(window.location.search).get("q") || "";
        if (search) search.value = query;

        if (locationFilter) {
            const pageLocations = [...new Set(
                opportunities
                    .filter(item => baseType === "all" || item.type === baseType)
                    .map(item => item.location)
            )].sort();
            locationFilter.insertAdjacentHTML("beforeend", pageLocations.map(location =>
                `<option value="${escapeHTML(location)}">${escapeHTML(location)}</option>`
            ).join(""));
        }

        function getFilteredOpportunities() {
            const searchTerm = search ? search.value.trim().toLowerCase() : "";
            const selectedLocation = locationFilter ? locationFilter.value : "";
            const selectedType = typeFilter ? typeFilter.value : "";
            return opportunities.filter(item => {
                const searchable = [
                    item.title,
                    item.company,
                    item.location,
                    item.description,
                    item.salary,
                    item.experience,
                    item.employmentType,
                    ...(item.skills || [])
                ].join(" ").toLowerCase();
                const typeMatches = selectedType
                    ? item.type === selectedType
                    : baseType === "all" || item.type === baseType;
                const categoryMatches = !selectedCategory ||
                    (item.categories || []).includes(selectedCategory);
                return typeMatches &&
                    categoryMatches &&
                    (!searchTerm || searchable.includes(searchTerm)) &&
                    (!selectedLocation || item.location === selectedLocation);
            });
        }

        function render() {
            const filtered = getFilteredOpportunities();
            const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
            currentPage = Math.min(currentPage, pageCount);
            const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
            if (count) {
                const label = baseType === "job" ? "jobs" :
                    baseType === "internship" ? "internships" : "opportunities";
                count.textContent = `${filtered.length} ${label} found`;
            }

            if (!visible.length) {
                list.innerHTML = '<div class="empty-state"><h2>No opportunities found</h2><p>Try a different search, category, or location filter.</p></div>';
            } else {
                const detailsPage = baseType === "all"
                    ? "jobs/opportunity-details.html"
                    : "opportunity-details.html";
                list.innerHTML = visible.map(item => renderCard(item, detailsPage)).join("");
            }
            updatePagination(pageCount);
        }

        function updatePagination(pageCount) {
            const previous = document.getElementById("previousPage");
            const next = document.getElementById("nextPage");
            const label = document.getElementById("pageLabel");
            const progress = document.getElementById("pageProgress");
            const progressTrack = document.querySelector(".progress-track");
            if (previous) previous.disabled = currentPage <= 1;
            if (next) next.disabled = currentPage >= pageCount;
            if (label) label.textContent = `${currentPage} / ${pageCount}`;
            if (progress) progress.style.width = `${(currentPage / pageCount) * 100}%`;
            if (progressTrack) {
                progressTrack.setAttribute("aria-valuenow", String(
                    Math.round((currentPage / pageCount) * 100)
                ));
            }
        }

        function resetAndRender() {
            currentPage = 1;
            render();
        }

        if (search) search.addEventListener("input", resetAndRender);
        if (locationFilter) locationFilter.addEventListener("change", resetAndRender);
        if (typeFilter) typeFilter.addEventListener("change", resetAndRender);
        document.querySelectorAll(".category-pill").forEach(button => {
            button.addEventListener("click", () => {
                const category = button.dataset.category || "";
                selectedCategory = selectedCategory === category ? "" : category;
                document.querySelectorAll(".category-pill").forEach(pill => {
                    const active = pill.dataset.category === selectedCategory;
                    pill.classList.toggle("is-active", active);
                    pill.setAttribute("aria-pressed", String(active));
                });
                resetAndRender();
            });
        });

        const filterToggle = document.getElementById("filterToggle");
        const advancedFilters = document.getElementById("advancedFilters");
        if (filterToggle && advancedFilters) {
            filterToggle.addEventListener("click", () => {
                const expanded = filterToggle.getAttribute("aria-expanded") === "true";
                filterToggle.setAttribute("aria-expanded", String(!expanded));
                filterToggle.setAttribute("aria-label", expanded ? "Show filters" : "Hide filters");
                advancedFilters.hidden = expanded;
            });
        }

        const clearFilters = document.getElementById("clearFilters");
        if (clearFilters) {
            clearFilters.addEventListener("click", () => {
                if (search) search.value = "";
                if (locationFilter) locationFilter.value = "";
                if (typeFilter) typeFilter.value = "";
                selectedCategory = "";
                document.querySelectorAll(".category-pill").forEach(pill => {
                    pill.classList.remove("is-active");
                    pill.setAttribute("aria-pressed", "false");
                });
                resetAndRender();
            });
        }

        const previous = document.getElementById("previousPage");
        const next = document.getElementById("nextPage");
        if (previous) previous.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage -= 1;
                render();
            }
        });
        if (next) next.addEventListener("click", () => {
            const pageCount = Math.max(
                1,
                Math.ceil(getFilteredOpportunities().length / pageSize)
            );
            if (currentPage < pageCount) {
                currentPage += 1;
                render();
            }
        });

        const navSearch = document.querySelector(".nav-search");
        const navSearchInput = navSearch?.querySelector('input[type="search"]');
        if (navSearchInput && query) navSearchInput.value = query;
        if (navSearch) {
            navSearch.addEventListener("submit", event => {
                event.preventDefault();
                const term = navSearchInput.value.trim();
                window.location.href = `${homeUrl}?q=${encodeURIComponent(term)}#opportunities`;
            });
        }

        render();
    } catch (error) {
        console.error("Unable to load opportunities:", error);
        list.innerHTML = `<div class="empty-state" role="alert"><h2>Opportunities are unavailable</h2><p>${escapeHTML(error.message)} Start the site from a local web server and try again.</p></div>`;
    }
});

function renderCard(item, detailsPage) {
    const typeLabel = item.type === "internship" ? "Internship" : "Job";
    const duration = item.type === "internship"
        ? item.employmentType.split("·").pop().trim()
        : item.experience || "Fresher";
    const skills = (item.skills || []).slice(0, 3).map(skill =>
        `<span>${escapeHTML(skill)}</span>`
    ).join("");

    return `
        <article class="opportunity-card">
            <div class="opportunity-card-top">
                <span class="hiring-badge"><span aria-hidden="true">ϟ</span> Actively hiring</span>
                <div class="company-logo" aria-label="${escapeHTML(item.company)} logo">${escapeHTML(item.companyInitials || item.company.slice(0, 2))}</div>
            </div>
            <div class="opportunity-copy">
                <h3 title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</h3>
                <p class="opportunity-company">${escapeHTML(item.company)}</p>
            </div>
            <hr class="card-divider">
            <div class="opportunity-meta">
                <div class="opportunity-meta-row">${opportunityIcons.location}<span>${escapeHTML(item.location)}</span></div>
                <div class="opportunity-meta-row">${opportunityIcons.salary}<span>${escapeHTML(item.salary || "Compensation details available")}</span></div>
                <div class="opportunity-meta-row">${opportunityIcons.duration}<span>${escapeHTML(duration)}</span></div>
            </div>
            <div class="skill-list">${skills}</div>
            <div class="opportunity-card-footer">
                <span class="opportunity-tag">${typeLabel}</span>
                <a class="opportunity-details-link" href="${detailsPage}?id=${encodeURIComponent(item.id)}">
                    View details ${opportunityIcons.arrow}
                </a>
            </div>
        </article>`;
}
