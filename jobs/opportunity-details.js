function escapeDetailHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("opportunityDetails");
    const id = new URLSearchParams(window.location.search).get("id");
    try {
        const data = await CareerConnectData.load();
        const item = data.opportunities.find(opportunity => opportunity.id === id);
        if (!item) {
            container.innerHTML = '<section class="empty-state"><h2>Opportunity not found</h2><p>This listing may have expired or the link is invalid.</p><a class="primary-btn" href="../index.html#opportunities">Browse opportunities</a></section>';
            return;
        }

        document.title = `${item.title} | CareerConnect`;
        document.getElementById("detailLogo").textContent =
            item.companyInitials || item.company.slice(0, 2);
        document.getElementById("detailCompany").textContent = item.company;
        document.getElementById("detailType").textContent =
            item.type === "internship" ? "Internship" : "Fresher job";
        document.getElementById("detailTitle").textContent = item.title;
        document.getElementById("detailDescription").textContent = item.description;
        const duration = item.type === "internship"
            ? item.employmentType.split("·").pop().trim()
            : item.experience;
        document.getElementById("detailMeta").innerHTML = [
            item.location,
            item.salary,
            duration
        ].map(value => `<span>${escapeDetailHTML(value)}</span>`).join("");
        document.getElementById("detailSkills").innerHTML =
            item.skills.map(skill => `<span>${escapeDetailHTML(skill)}</span>`).join("");
        document.getElementById("detailApply").href =
            `../applications/apply.html?opportunity=${encodeURIComponent(item.id)}`;
    } catch (error) {
        console.error("Unable to load opportunity details:", error);
        container.innerHTML = `<section class="empty-state" role="alert"><h2>Opportunity details are unavailable</h2><p>${escapeDetailHTML(error.message)} Start the site from a local web server and try again.</p></section>`;
    }
});
