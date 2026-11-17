// ========================================
// CINEBOOK - MOVIE DATA
// ========================================

const movies = [
    { id: "interstellar", name: "Interstellar", genre: "Sci-Fi", duration: "2h 49m", price: 250, image: "images/interstellar.jpg" },
    { id: "inception", name: "Inception", genre: "Thriller", duration: "2h 28m", price: 220, image: "images/inception.jpg" },
    { id: "darkknight", name: "The Dark Knight", genre: "Action", duration: "2h 32m", price: 200, image: "images/darkknight.jpg" },
    { id: "avatar", name: "Avatar", genre: "Adventure", duration: "2h 42m", price: 280, image: "images/avatar.jpg" },
    { id: "oppenheimer", name: "Oppenheimer", genre: "Drama", duration: "3h", price: 260, image: "images/oppenheimer.jpg" },
    { id: "spiderman", name: "Spider-Man: Brand New Day", genre: "Action", duration: "2h 28m", price: 250, image: "images/spiderman.jpg" },
    { id: "avengers", name: "Avengers: Doomsday", genre: "Action", duration: "3h 1m", price: 270, image: "images/avengers.jpg" },
    { id: "dune2", name: "Dune: Part Two", genre: "Sci-Fi", duration: "2h 46m", price: 260, image: "images/dune2.jpg" },
    { id: "johnwick4", name: "John Wick: Chapter 4", genre: "Action", duration: "2h 49m", price: 230, image: "images/johnwick4.jpg" },
    { id: "topgun", name: "Top Gun: Maverick", genre: "Action", duration: "2h 10m", price: 240, image: "images/topgun.jpg" },
    { id: "jawan", name: "Jawan", genre: "Action", duration: "2h 49m", price: 200, image: "images/jawan.jpg" },
    { id: "insideout2", name: "Inside Out 2", genre: "Animation", duration: "1h 36m", price: 190, image: "images/insideout2.jpg" }
];

// ========================================
// ELEMENTS
// ========================================

const movieGrid = document.getElementById("movieGrid");
const movieSearch = document.getElementById("movieSearch");

const selectedMovieText = document.getElementById("selectedMovie");
const selectedMovieInfo = document.getElementById("selectedMovieInfo");

const cinemaSelect = document.getElementById("cinema");
const dateSelect = document.getElementById("date");
const seatGrid = document.getElementById("seatGrid");

const seatCountText = document.getElementById("seatCount");
const totalPriceText = document.getElementById("totalPrice");

const customerSection = document.getElementById("customerSection");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const formError = document.getElementById("formError");

const confirmBtn = document.getElementById("confirmBtn");

const historyBtn = document.getElementById("historyBtn");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");

const ticketModal = document.getElementById("ticketModal");
const ticketDetails = document.getElementById("ticketDetails");
const closeTicketBtn = document.getElementById("closeTicketBtn");
const closeTicketBottomBtn = document.getElementById("closeTicketBottomBtn");
const printTicketBtn = document.getElementById("printTicketBtn");


// ========================================
// BOOKING STATE
// ========================================

let selectedMovie = null;
let selectedSeats = [];

let booking = {
    cinema: "",
    date: "",
    showtime: ""
};

const STORAGE_KEY = "cinebookBookings";


// ========================================
// LOCAL STORAGE
// ========================================

function getBookings() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read booking data:", error);
        return [];
    }
}

function saveBookings(bookings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        return true;
    } catch (error) {
        console.error("Could not save booking data:", error);
        alert("Your browser could not save this booking. Check browser storage settings.");
        return false;
    }
}


// ========================================
// DISPLAY MOVIES
// ========================================

function displayMovies(searchTerm = "") {
    movieGrid.innerHTML = "";

    const filteredMovies = movies.filter(movie =>
        movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredMovies.length === 0) {
        movieGrid.textContent = "No movies found.";
        return;
    }

    filteredMovies.forEach(movie => {
        const card = document.createElement("article");
        card.className = "movie-card";

        if (selectedMovie && selectedMovie.id === movie.id) {
            card.classList.add("selected");
        }

        const posterWrap = document.createElement("div");
        posterWrap.className = "poster-wrap";

        const poster = document.createElement("img");
        poster.src = movie.image;
        poster.alt = movie.name + " poster";

        poster.addEventListener("error", () => {
            poster.remove();

            const fallback = document.createElement("div");
            fallback.className = "poster-fallback";
            fallback.textContent = movie.name;
            posterWrap.appendChild(fallback);
        }, { once: true });

        posterWrap.appendChild(poster);

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.textContent = movie.name;

        const meta = document.createElement("p");
        meta.className = "movie-meta";
        meta.textContent = `${movie.genre} • ${movie.duration}`;

        const price = document.createElement("p");
        price.className = "movie-price";
        price.textContent = `Starting from ₹${movie.price}`;

        const button = document.createElement("button");
        button.className = "movie-select-button";

        if (selectedMovie && selectedMovie.id === movie.id) {
            button.textContent = "✓ MOVIE SELECTED";
            button.classList.add("is-selected");
        } else {
            button.textContent = "SELECT MOVIE";
        }

        button.addEventListener("click", () => selectMovie(movie));

        info.append(title, meta, price, button);
        card.append(posterWrap, info);
        movieGrid.appendChild(card);
    });
}

movieSearch.addEventListener("input", () => {
    displayMovies(movieSearch.value);
});


// ========================================
// SELECT MOVIE
// ========================================

function selectMovie(movie) {
    selectedMovie = movie;

    selectedMovieText.textContent = movie.name;
    selectedMovieInfo.textContent =
        `${movie.genre} • ${movie.duration} • Base ticket price ₹${movie.price}`;

    resetSelectedSeats();
    hideCustomerForm();
    updatePrice();
    displayMovies(movieSearch.value);
    generateSeats();

    document.getElementById("bookingSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ========================================
// GENERATE NEXT 7 DATES
// ========================================

function generateDates() {
    dateSelect.innerHTML = '<option value="">Choose date</option>';

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const value = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

        const label = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });

        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;

        dateSelect.appendChild(option);
    }
}


// ========================================
// SHOW SELECTION
// ========================================

function getSelectedShowtime() {
    const selected = document.querySelector('input[name="showtime"]:checked');
    return selected ? selected.value : "";
}

function isShowSelected() {
    return Boolean(
        selectedMovie &&
        booking.cinema &&
        booking.date &&
        booking.showtime
    );
}

function updateShowDetails() {
    booking.cinema = cinemaSelect.value;
    booking.date = dateSelect.value;
    booking.showtime = getSelectedShowtime();

    resetSelectedSeats();
    hideCustomerForm();
    generateSeats();
    updatePrice();
}

cinemaSelect.addEventListener("change", updateShowDetails);
dateSelect.addEventListener("change", updateShowDetails);

document.querySelectorAll('input[name="showtime"]').forEach(radio => {
    radio.addEventListener("change", updateShowDetails);
});


// ========================================
// SEAT PRICING
// ========================================

function getSeatPrice(seat) {
    if (!selectedMovie) return 0;

    const row = seat.charAt(0);
    const basePrice = selectedMovie.price;

    if (row === "A" || row === "B") {
        return basePrice;
    }

    if (row === "C" || row === "D") {
        return basePrice + 80;
    }

    return basePrice + 150;
}

function calculateTotal() {
    return selectedSeats.reduce((total, seat) => {
        return total + getSeatPrice(seat);
    }, 0);
}

function updatePrice() {
    seatCountText.textContent = selectedSeats.length;
    totalPriceText.textContent = `₹${calculateTotal()}`;
}


// ========================================
// BOOKED SEATS
// ========================================

function getBookedSeatsForCurrentShow() {
    if (!isShowSelected()) return [];

    const bookings = getBookings();

    return bookings
        .filter(item =>
            item.status !== "Cancelled" &&
            item.movieId === selectedMovie.id &&
            item.cinema === booking.cinema &&
            item.date === booking.date &&
            item.showtime === booking.showtime
        )
        .flatMap(item => item.seats);
}


// ========================================
// GENERATE SEAT GRID
// ========================================

function generateSeats() {
    seatGrid.innerHTML = "";

    const rows = ["A", "B", "C", "D", "E"];
    const bookedSeats = getBookedSeatsForCurrentShow();
    const canChooseSeats = isShowSelected();

    rows.forEach(row => {
        for (let number = 1; number <= 8; number++) {
            const seatName = row + number;

            const seat = document.createElement("button");
            seat.type = "button";
            seat.className = "seat";
            seat.textContent = seatName;
            seat.setAttribute("aria-label", `Seat ${seatName}`);

            if (bookedSeats.includes(seatName)) {
                seat.classList.add("booked");
                seat.disabled = true;
                seat.title = "Already booked";
            } else if (!canChooseSeats) {
                seat.classList.add("disabled");
                seat.disabled = true;
                seat.title = "Choose movie, cinema, date and showtime first";
            } else {
                seat.classList.add("available");

                if (selectedSeats.includes(seatName)) {
                    seat.classList.remove("available");
                    seat.classList.add("selected");
                    seat.setAttribute("aria-pressed", "true");
                } else {
                    seat.setAttribute("aria-pressed", "false");
                }

                seat.addEventListener("click", () => toggleSeat(seatName));
            }

            seatGrid.appendChild(seat);
        }
    });
}


// ========================================
// SELECT / DESELECT SEAT
// ========================================

function toggleSeat(seatName) {
    if (!isShowSelected()) {
        alert("Please select a movie, cinema, date and showtime first.");
        return;
    }

    if (selectedSeats.includes(seatName)) {
        selectedSeats = selectedSeats.filter(seat => seat !== seatName);
    } else {
        selectedSeats.push(seatName);
    }

    generateSeats();
    updatePrice();

    if (selectedSeats.length > 0) {
        showCustomerForm();
    } else {
        hideCustomerForm();
    }
}

function resetSelectedSeats() {
    selectedSeats = [];
    updatePrice();
}

function showCustomerForm() {
    customerSection.hidden = false;
    formError.textContent = "";
}

function hideCustomerForm() {
    customerSection.hidden = true;
    customerName.value = "";
    customerPhone.value = "";
    formError.textContent = "";
}


// ========================================
// CONFIRM BOOKING
// ========================================

confirmBtn.addEventListener("click", () => {
    if (!isShowSelected()) {
        formError.textContent = "Please complete your movie and show selections.";
        return;
    }

    if (selectedSeats.length === 0) {
        formError.textContent = "Please select at least one seat.";
        return;
    }

    const name = customerName.value.trim();
    const phone = customerPhone.value.trim();

    if (name.length < 2) {
        formError.textContent = "Please enter a valid name.";
        customerName.focus();
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        formError.textContent = "Please enter a valid 10-digit phone number.";
        customerPhone.focus();
        return;
    }

    const currentBookings = getBookings();
    const bookedSeats = getBookedSeatsForCurrentShow();

    // Check again before saving, in case another booking was made.
    const conflict = selectedSeats.some(seat => bookedSeats.includes(seat));

    if (conflict) {
        formError.textContent =
            "One or more selected seats are no longer available. Please choose again.";
        resetSelectedSeats();
        generateSeats();
        hideCustomerForm();
        return;
    }

    const bookingId = "CB-" + Date.now().toString(36).toUpperCase();

    const newBooking = {
        id: bookingId,
        movieId: selectedMovie.id,
        movie: selectedMovie.name,
        cinema: booking.cinema,
        date: booking.date,
        showtime: booking.showtime,
        seats: [...selectedSeats],
        customerName: name,
        phone: phone,
        total: calculateTotal(),
        status: "Confirmed",
        createdAt: new Date().toISOString()
    };

    currentBookings.push(newBooking);

    if (!saveBookings(currentBookings)) return;

    showTicket(newBooking);

    resetSelectedSeats();
    hideCustomerForm();
    generateSeats();
    updatePrice();
});


// ========================================
// DIGITAL TICKET POPUP
// ========================================

function addTicketRow(container, label, value) {
    const row = document.createElement("div");
    row.className = "ticket-row";

    const left = document.createElement("span");
    left.textContent = label;

    const right = document.createElement("span");
    right.textContent = value;

    row.append(left, right);
    container.appendChild(row);
}

function showTicket(item) {
    ticketDetails.innerHTML = "";

    const movieName = document.createElement("div");
    movieName.className = "ticket-movie";
    movieName.textContent = item.movie;

    ticketDetails.appendChild(movieName);

    addTicketRow(ticketDetails, "Customer", item.customerName);
    addTicketRow(ticketDetails, "Phone", item.phone);
    addTicketRow(ticketDetails, "Cinema", item.cinema);
    addTicketRow(ticketDetails, "Date", formatDate(item.date));
    addTicketRow(ticketDetails, "Showtime", item.showtime);
    addTicketRow(ticketDetails, "Seats", item.seats.join(", "));
    addTicketRow(ticketDetails, "Tickets", String(item.seats.length));
    addTicketRow(ticketDetails, "Total Paid", `₹${item.total}`);

    const idBox = document.createElement("div");
    idBox.className = "ticket-booking-id";

    const idLabel = document.createElement("p");
    idLabel.textContent = "BOOKING ID";

    const idValue = document.createElement("strong");
    idValue.textContent = item.id;

    idBox.append(idLabel, idValue);
    ticketDetails.appendChild(idBox);

    ticketModal.hidden = false;
    closeTicketBtn.focus();
}

function closeTicket() {
    ticketModal.hidden = true;
}

closeTicketBtn.addEventListener("click", closeTicket);
closeTicketBottomBtn.addEventListener("click", closeTicket);

ticketModal.querySelector(".modal-backdrop").addEventListener("click", closeTicket);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeTicket();
        historySection.hidden = true;
    }
});

printTicketBtn.addEventListener("click", () => {
    window.print();
});


// ========================================
// BOOKING HISTORY
// ========================================

function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function displayHistory() {
    historyList.innerHTML = "";

    const bookings = getBookings().slice().reverse();

    if (bookings.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-history";
        empty.textContent = "You haven't made any bookings yet.";
        historyList.appendChild(empty);
        return;
    }

    bookings.forEach(item => {
        const card = document.createElement("article");
        card.className = "history-card";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.movie;

        const info = document.createElement("p");
        info.textContent =
            `${item.cinema} • ${formatDate(item.date)} • ${item.showtime}`;

        const seats = document.createElement("p");
        seats.textContent = `Seats: ${item.seats.join(", ")} • Total: ₹${item.total}`;

        const status = document.createElement("p");
        status.textContent = `Booking ID: ${item.id} • Status: ${item.status}`;

        details.append(title, info, seats, status);

        const cancel = document.createElement("button");
        cancel.className = "cancel-button";
        cancel.textContent = item.status === "Cancelled"
            ? "CANCELLED"
            : "CANCEL BOOKING";

        cancel.disabled = item.status === "Cancelled";

        cancel.addEventListener("click", () => cancelBooking(item.id));

        card.append(details, cancel);
        historyList.appendChild(card);
    });
}

function cancelBooking(id) {
    const confirmed = confirm("Are you sure you want to cancel this booking?");

    if (!confirmed) return;

    const bookings = getBookings();

    const updatedBookings = bookings.map(item => {
        if (item.id === id) {
            return { ...item, status: "Cancelled" };
        }
        return item;
    });

    if (saveBookings(updatedBookings)) {
        displayHistory();
        generateSeats();
    }
}

historyBtn.addEventListener("click", () => {
    displayHistory();
    historySection.hidden = false;

    historySection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

closeHistoryBtn.addEventListener("click", () => {
    historySection.hidden = true;
});


// ========================================
// INITIALISE CINEBOOK
// ========================================

generateDates();
displayMovies();
generateSeats();
updatePrice();