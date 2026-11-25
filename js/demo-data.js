(function () {
    const dataScript = document.currentScript;
    const dataUrl = new URL("../data/db.json", dataScript.src);

    window.CareerConnectData = {
        async load() {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                throw new Error(`Could not load demo data (${response.status}).`);
            }
            const data = await response.json();
            const employerListings = this.read("careerConnectEmployerListings", []);
            if (!Array.isArray(employerListings)) {
                throw new Error("Saved employer listings are invalid. Clear this site's local storage and try again.");
            }
            return {
                ...data,
                opportunities: [...employerListings, ...data.opportunities]
            };
        },

        read(key, fallback) {
            const stored = localStorage.getItem(key);
            return stored === null ? fallback : JSON.parse(stored);
        },

        write(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
})();
