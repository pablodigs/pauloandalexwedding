// =========================
// SUPABASE
// =========================

const SUPABASE_URL =
    "https://xhtcszatnfmnqjtrjwhh.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodGNzemF0bmZtbnFqdHJqd2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMzE0MjUsImV4cCI6MjEwNjYwNzQyNX0.SiNVD3vDqt5sf_folcO1SKp9Hy46NMAIXI3fBT-Z0Kk";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

// =========================
// STATE
// =========================

let currentGuest = null;
let searchText = "";

// =========================
// ELEMENTS
// =========================

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const reservationCard = document.getElementById("reservationCard");
const partyCard = document.getElementById("partyCard");
const emailCard = document.getElementById("emailCard");

const guestName = document.getElementById("guestName");
const seatCount = document.getElementById("seatCount");
const rsvpStatus = document.getElementById("rsvpStatus");

const partyInstructions =
    document.getElementById("partyInstructions");

const guest2Text =
    document.getElementById("guest2Text");

const guest3Text =
    document.getElementById("guest3Text");

const guest1Input =
    document.getElementById("guest1Input");

const guest2Input =
    document.getElementById("guest2Input");

const emailInput =
    document.getElementById("emailInput");

const rsvpError =
    document.getElementById("rsvpError");

const actionButtons =
    document.getElementById("actionButtons");

const confirmButton =
    document.getElementById("confirmButton");

const declineButton =
    document.getElementById("declineButton");

const removeGuest2 =
    document.getElementById("removeGuest2");

const removeGuest3 =
    document.getElementById("removeGuest3");

// =========================
// HELPERS
// =========================

function show(el) {
    el.classList.remove("hidden");
}

function hide(el) {
    el.classList.add("hidden");
}

function capitalizeWords(str) {

    if (!str) return "";

    return str
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");
}

function clearUI() {

    hide(reservationCard);
    hide(partyCard);
    hide(emailCard);
    hide(actionButtons);

    rsvpError.textContent = "";

    guest1Input.value = "";
    guest2Input.value = "";

    guest2Text.textContent = "";
    guest3Text.textContent = "";
}

// =========================
// SEARCH
// =========================

searchButton.addEventListener(
    "click",
    async () => {

        searchText =
            searchInput.value
                .trim()
                .toLowerCase();

        if (!searchText) return;

        clearUI();

        const { data, error } =
            await supabaseClient
                .from("Guests")
                .select("*");

        if (error) {

            alert(error.message);
            return;
        }

        let guest = null;

        data.some(item => {

            const firstLast =
                `${item.firstName || ""} ${item.lastName || ""}`
                .trim()
                .toLowerCase();

            const nickLast =
                `${item.nickname || ""} ${item.lastName || ""}`
                .trim()
                .toLowerCase();

            const g2 =
                (item.guest2 || "")
                .trim()
                .toLowerCase();

            const g3 =
                (item.guest3 || "")
                .trim()
                .toLowerCase();

            if (
                searchText === firstLast ||
                searchText === nickLast ||
                searchText === g2 ||
                searchText === g3
            ) {

                guest = item;
                return true;
            }

            return false;
        });

        if (!guest) {

            show(reservationCard);

            guestName.textContent =
                "Invitation Not Found";

            seatCount.textContent = "";

            rsvpStatus.textContent =
                "Please check spelling and try again.";

            return;
        }

        currentGuest = guest;

        renderGuest();
    }
);

// =========================
// RENDER
// =========================

function renderGuest() {

    show(reservationCard);

    guestName.textContent =
        currentGuest.title;

    seatCount.textContent =
        currentGuest.seats === 1
            ? "1 SEAT RESERVED"
            : `${currentGuest.seats} SEATS RESERVED`;

    if (
        currentGuest.rsvpStatus ===
        "Attending"
    ) {

        rsvpStatus.textContent =
            "ATTENDANCE CONFIRMED ✓";

    } else if (
        currentGuest.rsvpStatus ===
        "Not Attending"
    ) {

        rsvpStatus.textContent =
            "UNABLE TO ATTEND";

    } else {

        rsvpStatus.textContent =
            "AWAITING RESPONSE";
    }

    if (
        currentGuest.rsvpStatus ===
        "Attending"
    ) {

        renderParty();

        return;
    }

    show(emailCard);
    show(actionButtons);

    emailInput.value =
        currentGuest.email || "";

    renderParty();
}

function renderParty() {

    if (
        currentGuest.seats < 2
    ) {

        hide(partyCard);
        return;
    }

    show(partyCard);

    if (
        currentGuest.seats === 2
    ) {

        partyInstructions.textContent =
            "Please confirm the name of the guest included in your reservation.";

    } else {

        partyInstructions.textContent =
            "Please confirm the name of each guest included in your reservation.";
    }

    // Guest 2

    if (
        currentGuest.guest2 &&
        currentGuest.guest2.trim()
    ) {

        guest2Text.textContent =
            `Guest #2: ${currentGuest.guest2}`;

        guest2Text.style.display =
            "inline";

        removeGuest2.style.display =
            "inline-block";

        guest1Input.style.display =
            "none";

    } else {

        guest2Text.textContent = "";

        removeGuest2.style.display =
            "none";

        guest1Input.style.display =
            "block";
    }

    // Guest 3

    if (
        currentGuest.seats >= 3
    ) {

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim()
        ) {

            guest3Text.textContent =
                `Guest #3: ${currentGuest.guest3}`;

            guest3Text.style.display =
                "inline";

            removeGuest3.style.display =
                "inline-block";

            guest2Input.style.display =
                "none";

        } else {

            guest3Text.textContent = "";

            removeGuest3.style.display =
                "none";

            guest2Input.style.display =
                "block";
        }
    }
}

// =========================
// REMOVE GUEST #2
// =========================

removeGuest2.addEventListener(
    "click",
    async () => {

        if (!currentGuest) return;

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    guest2: ""
                })
                .eq("id", currentGuest.id);

        if (error) {
            alert(error.message);
            return;
        }

        currentGuest.guest2 = "";

        renderParty();
    }
);

// =========================
// REMOVE GUEST #3
// =========================

removeGuest3.addEventListener(
    "click",
    async () => {

        if (!currentGuest) return;

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    guest3: ""
                })
                .eq("id", currentGuest.id);

        if (error) {
            alert(error.message);
            return;
        }

        currentGuest.guest3 = "";

        renderParty();
    }
);

// =========================
// CONFIRM RSVP
// =========================

confirmButton.addEventListener(
    "click",
    async () => {

        if (!currentGuest) return;

        if (
            !emailInput.value.trim()
        ) {

            rsvpError.textContent =
                "PLEASE ENTER YOUR EMAIL ADDRESS";

            return;
        }

        const updateData = {

            email:
                emailInput.value.trim(),

            rsvpStatus:
                "Attending"
        };

        if (
            !currentGuest.guest2 &&
            guest1Input.value.trim()
        ) {

            updateData.guest2 =
                capitalizeWords(
                    guest1Input.value
                );
        }

        if (
            !currentGuest.guest3 &&
            guest2Input.value.trim()
        ) {

            updateData.guest3 =
                capitalizeWords(
                    guest2Input.value
                );
        }

        const { error } =
            await supabaseClient
                .from("Guests")
                .update(updateData)
                .eq("id", currentGuest.id);

        if (error) {

            alert(error.message);
            return;
        }

        Object.assign(
            currentGuest,
            updateData
        );

        renderGuest();
    }
);

// =========================
// DECLINE RSVP
// =========================

declineButton.addEventListener(
    "click",
    async () => {

        if (!currentGuest) return;

        if (
            !emailInput.value.trim()
        ) {

            rsvpError.textContent =
                "PLEASE ENTER YOUR EMAIL ADDRESS";

            return;
        }

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    email:
                        emailInput.value.trim(),

                    rsvpStatus:
                        "Not Attending",

                    guest2: "",
                    guest3: ""
                })
                .eq("id", currentGuest.id);

        if (error) {

            alert(error.message);
            return;
        }

        currentGuest.rsvpStatus =
            "Not Attending";

        currentGuest.guest2 = "";
        currentGuest.guest3 = "";

        renderGuest();
    
        rsvpStatus.className = "";

        if (currentGuest.rsvpStatus === "Attending") {

            rsvpStatus.textContent =
                "ATTENDANCE CONFIRMED ✓";

            rsvpStatus.classList.add(
                "rsvp-confirmed"
            );

        } else if (currentGuest.rsvpStatus === "Not Attending") {

            rsvpStatus.textContent =
                "UNABLE TO ATTEND";

            rsvpStatus.classList.add(
                "rsvp-declined"
            );

        } else {

            rsvpStatus.textContent =
                "AWAITING RESPONSE";

            rsvpStatus.classList.add(
                "rsvp-pending"
            );
        }
    }
);