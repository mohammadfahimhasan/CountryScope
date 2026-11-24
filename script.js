 
const API_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

const continents = [
    { name: "Asia", icon: "🌏" },
    { name: "Africa", icon: "🌍" },
    { name: "Europe", icon: "🌍" },
    { name: "North America", icon: "🌎" },
    { name: "South America", icon: "🌎" },
    { name: "Oceania", icon: "🌏" },
    { name: "Antarctica", icon: "❄️" }
];

let countries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const countryList = document.getElementById("countryList");
const heading = document.getElementById("heading");
const subtitle = document.getElementById("subtitle");
const searchInput = document.getElementById("searchInput");
const backBtn = document.getElementById("backBtn");

// Find continent
function getContinent(country) {
    if (country.region === "Americas") {
        return country.subregion === "South America"
            ? "South America" : "North America";
    }

    return country.region;
}

// Load API data
async function loadCountries() {
    try {
        countryList.innerHTML =
            '<p class="message">Loading countries...</p>';

        const response = await fetch(API_URL);

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();

        countries = data.filter(country =>
            country.unMember ||
            ["PSE", "VAT"].includes(country.cca3)
        );

        showContinents();

    } catch (error) {
        countryList.innerHTML =
            '<p class="message">Unable to load data. Check your internet and try again.</p>';
    }
}

// Show continents
function showContinents() {
    searchInput.value = "";
    heading.innerText = "Explore Continents";
    subtitle.innerText = "Choose a continent to explore its countries.";
    backBtn.style.display = "none";

    countryList.innerHTML = "";

    continents.forEach(continent => {
        const total = countries.filter(country =>
            getContinent(country) === continent.name
        ).length;

        countryList.innerHTML += `
            <div class="country-card">
                <div class="flag">${continent.icon}</div>
                <h3>${continent.name}</h3>
                <p>${total} countries</p>
                <button data-continent="${continent.name}">
                    Explore Countries
                </button>
            </div>
        `;
    });
}

// Show selected continent
function showContinent(name) {
    const result = countries.filter(country =>
        getContinent(country) === name
    );

    heading.innerText = name;
    subtitle.innerText = result.length + " countries found.";
    backBtn.style.display = "inline-block";

    displayCountries(result);
}

// Display country cards
function displayCountries(list) {
    countryList.innerHTML = "";

    if (list.length === 0) {
        countryList.innerHTML =
            '<p class="message">No countries found.</p>';
        return;
    }

    list = [...list].sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
    );

    list.forEach(country => {
        const code = country.cca3;
        const capital = country.capital?.[0] || "Not available";

        const area = country.area
            ? country.area.toLocaleString() + " km²"
            : "Not available";

        const languages = country.languages
            ? Object.values(country.languages).join(", ")
            : "Not available";

        const currency = country.currencies
            ? Object.values(country.currencies)
                .map(item => item.name).join(", ")
            : "Not available";

        const saved = favorites.includes(code);

        countryList.innerHTML += `
            <div class="country-card">
                <div class="flag">${country.flag || "🌍"}</div>
                <h3>${country.name.common}</h3>

                <p><b>Capital:</b> ${capital}</p>
                <p><b>Continent:</b> ${getContinent(country)}</p>

                <button data-details="${code}">
                    View Details
                </button>

                <button class="fav-btn" data-favorite="${code}">
                    ${saved ? "❤️ Remove Favourite" : "🤍 Add Favourite"}
                </button>

                <div class="details" id="details-${code}">
                    <p><b>Official Name:</b> ${country.name.official}</p>
                    <p><b>Area:</b> ${area}</p>
                    <p><b>Language:</b> ${languages}</p>
                    <p><b>Currency:</b> ${currency}</p>
                    <p><b>Country Code:</b> ${country.cca2}</p>
                </div>
            </div>
        `;
    });
}

// Search country
function searchCountry() {
    const search = searchInput.value.toLowerCase().trim();

    if (!search) {
        showContinents();
        return;
    }

    const result = countries.filter(country =>
        country.name.common.toLowerCase().includes(search) ||
        country.name.official.toLowerCase().includes(search)
    );

    heading.innerText = "Search Results";
    subtitle.innerText = result.length + " country/countries found.";
    backBtn.style.display = "inline-block";

    displayCountries(result);
}

// Show all countries
function showAllCountries() {
    searchInput.value = "";
    heading.innerText = "All Countries";
    subtitle.innerText = "Explore all " + countries.length + " countries.";
    backBtn.style.display = "inline-block";

    displayCountries(countries);
}

// Random country
function randomCountry() {
    if (countries.length === 0) return;

    const index = Math.floor(Math.random() * countries.length);

    heading.innerText = "Random Country";
    subtitle.innerText = "Discover a random country.";
    backBtn.style.display = "inline-block";

    displayCountries([countries[index]]);
}

// Save favourites
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Toggle favourite
function toggleFavorite(code) {
    if (favorites.includes(code)) {
        favorites = favorites.filter(item => item !== code);
    } else {
        favorites.push(code);
    }

    saveFavorites();

    if (heading.innerText === "My Favourite Countries") {
        showFavorites();
    } else {
        const details = document.getElementById("details-" + code);
        const isOpen = details && details.style.display === "block";

        const current = [...countryList.querySelectorAll(".country-card h3")]
            .map(item => item.innerText);

        const result = countries.filter(country =>
            current.includes(country.name.common)
        );

        displayCountries(result);

        if (isOpen) {
            const box = document.getElementById("details-" + code);
            if (box) box.style.display = "block";
        }
    }
}

// Show favourite countries
function showFavorites() {
    const result = countries.filter(country =>
        favorites.includes(country.cca3)
    );

    heading.innerText = "My Favourite Countries";
    subtitle.innerText = result.length + " saved countries.";
    backBtn.style.display = "inline-block";

    displayCountries(result);
}

// Handle card buttons
countryList.addEventListener("click", function(event) {
    const continent = event.target.dataset.continent;
    const code = event.target.dataset.details;
    const favorite = event.target.dataset.favorite;

    if (continent) showContinent(continent);

    if (code) {
        const details = document.getElementById("details-" + code);

        details.style.display =
            details.style.display === "block" ? "none" : "block";
    }

    if (favorite) toggleFavorite(favorite);
});

// Button events
document.getElementById("searchBtn")
    .addEventListener("click", searchCountry);

document.getElementById("allBtn")
    .addEventListener("click", showAllCountries);

document.getElementById("randomBtn")
    .addEventListener("click", randomCountry);

document.getElementById("favoriteBtn")
    .addEventListener("click", showFavorites);

backBtn.addEventListener("click", showContinents);

searchInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") searchCountry();
});

// Start project
loadCountries();
