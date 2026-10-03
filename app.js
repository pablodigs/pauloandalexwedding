// =========================
// PASSWORD PROTECT
// =========================

const SITE_PASSWORD = "pablodigs";

const passwordButton =
    document.getElementById("passwordButton");

const passwordInput =
    document.getElementById("passwordInput");

const passwordError =
    document.getElementById("passwordError");

passwordButton.addEventListener("click", () => {

    const entered =
        passwordInput.value.trim();

    if (entered === SITE_PASSWORD) {

        document
            .getElementById("passwordGate")
            .style.display = "none";

    } else {

        passwordError.textContent =
            "Incorrect access code.";
    }
});

//    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodGNzemF0bmZtbnFqdHJqd2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMzE0MjUsImV4cCI6MjEwNjYwNzQyNX0.SiNVD3vDqt5sf_folcO1SKp9Hy46NMAIXI3fBT-Z0Kk";

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
let guestToRemove = null;

// =========================
// ELEMENTS
// =========================

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const reservationCard =
    document.getElementById("reservationCard");

const partyCard =
    document.getElementById("partyCard");

const emailCard =
    document.getElementById("emailCard");

const guestName =
    document.getElementById("guestName");

const guest1Text =
    document.getElementById("guest1Text");

const seatCount =
    document.getElementById("seatCount");

const rsvpStatus =
    document.getElementById("rsvpStatus");

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

const removeGuestModal =
    document.getElementById("removeGuestModal");

const removeGuestMessage =
    document.getElementById("removeGuestMessage");

const cancelRemoveGuest =
    document.getElementById("cancelRemoveGuest");

const confirmRemoveGuest =
    document.getElementById("confirmRemoveGuest");

// =========================
// HELPERS
// =========================

function show(el) {
    if (el) {
        el.classList.remove("hidden");
    }
}

function hide(el) {
    if (el) {
        el.classList.add("hidden");
    }
}

function capitalizeWords(str) {
    if (!str) {
        return "";
    }

    return str
        .trim()
        .split(/\s+/)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");
}

function openRemoveGuestModal(guestNumber) {

    guestToRemove = guestNumber;

    let guestNameToRemove = "";

    if (
        guestNumber === 2 &&
        currentGuest &&
        currentGuest.guest2
    ) {
        guestNameToRemove =
            currentGuest.guest2;
    }

    if (
        guestNumber === 3 &&
        currentGuest &&
        currentGuest.guest3
    ) {
        guestNameToRemove =
            currentGuest.guest3;
    }

    removeGuestMessage.textContent =
        `Are you sure you want to remove ${guestNameToRemove} from your confirmed party?`;

    show(removeGuestModal);
}

function closeRemoveGuestModal() {

    hide(removeGuestModal);

    guestToRemove = null;
}

// =========================
// DISPLAY CONFIRMED SEATS
// =========================

function updateConfirmedSeatDisplay() {

    if (!currentGuest) {
        return;
    }

    const confirmedSeats =
        Number(currentGuest.seats) || 1;

    if (confirmedSeats === 1) {

        seatCount.textContent =
            "1 SEAT CONFIRMED";

    } else {

        seatCount.textContent =
            `${confirmedSeats} SEATS CONFIRMED`;
    }

    show(seatCount);
}

// =========================
// INITIAL UI
// =========================

function hideReservationSection() {

    hide(reservationCard);

    guestName.textContent = "";
    guest1Text.textContent = "";
    seatCount.textContent = "";
    rsvpStatus.textContent = "";
}

function hidePartySection() {

    hide(partyCard);

    partyInstructions.textContent = "";

    guest2Text.textContent = "";
    guest3Text.textContent = "";

    guest1Input.value = "";
    guest2Input.value = "";

    hide(guest2Text);
    hide(guest3Text);

    hide(removeGuest2);
    hide(removeGuest3);

    hide(guest1Input);
    hide(guest2Input);
}

function hideEmailSection() {

    hide(emailCard);

    emailInput.value = "";
}

function hideActionButtons() {

    hide(actionButtons);
    hide(confirmButton);
    hide(declineButton);
}

function resetUI() {

    hideReservationSection();
    hidePartySection();
    hideEmailSection();
    hideActionButtons();

    rsvpError.textContent = "";

    currentGuest = null;
}

resetUI();

// =========================
// SEARCH BUTTON
// =========================

searchButton.addEventListener(
    "click",
    async () => {

        rsvpError.textContent = "";

        const searchText =
            searchInput.value
                .trim()
                .toLowerCase();

        if (!searchText) {
            return;
        }

        hidePartySection();
        hideEmailSection();
        hideActionButtons();

        guest1Input.value = "";
        guest2Input.value = "";

        rsvpError.textContent = "";

        // =========================
        // GET GUESTS
        // =========================

        const { data, error } =
            await supabaseClient
                .from("Guests")
                .select("*");

        if (error) {
            alert(error.message);
            return;
        }

        let guest = null;

        // =========================
        // SEARCH
        // =========================

        data.some(item => {

            const firstLast =
                `${item.firstName || ""} ${item.lastName || ""}`
                    .trim()
                    .toLowerCase();

            const nickLast =
                `${item.nickName || ""} ${item.lastName || ""}`
                    .trim()
                    .toLowerCase();

            const guest2 =
                (item.guest2 || "")
                    .trim()
                    .toLowerCase();

            const guest3 =
                (item.guest3 || "")
                    .trim()
                    .toLowerCase();

            if (
                searchText === firstLast ||
                searchText === nickLast ||
                searchText === guest2 ||
                searchText === guest3
            ) {

                guest = item;

                return true;
            }

            return false;
        });

        // =========================
        // GUEST NOT FOUND
        // =========================

        if (!guest) {

            currentGuest = null;

            hidePartySection();
            hideEmailSection();
            hideActionButtons();

            show(reservationCard);

            guestName.textContent =
                "Invitation Not Found";

            guest1Text.textContent =
                "Please double-check the spelling of your name and try again. You may also search using your nickname and last name.\n\nIf you're still having trouble, please reach out to the couple.";

            show(guestName);
            show(guest1Text);

            hide(seatCount);
            hide(rsvpStatus);

            return;
        }

        currentGuest = guest;

        // =========================
        // RESERVATION
        // =========================

        show(reservationCard);

        const primaryGuestName =
            `${guest.firstName || ""} ${guest.lastName || ""}`
                .trim();

        guestName.textContent =
            primaryGuestName;

        show(guestName);

        // =========================
        // PRIMARY / INCLUDED GUEST
        // =========================

        const searchedGuest2 =
            (guest.guest2 || "")
                .trim()
                .toLowerCase();

        const searchedGuest3 =
            (guest.guest3 || "")
                .trim()
                .toLowerCase();

        if (
            searchText === searchedGuest2 ||
            searchText === searchedGuest3
        ) {

            guest1Text.textContent =
                "You are included in this reservation";

            show(guest1Text);

        } else if (
            guest.seats === 1
        ) {

            hide(guest1Text);

        } else {

            guest1Text.textContent =
                "Primary Guest";

            show(guest1Text);
        }

        // =========================
        // RSVP STATUS
        // =========================

        if (
            guest.rsvpStatus ===
            "Attending"
        ) {

            rsvpStatus.textContent =
                "ATTENDANCE CONFIRMED ✓";

            show(rsvpStatus);
            hide(removeGuest2);
            hide(removeGuest3);
            updateConfirmedSeatDisplay();

        } else if (
            guest.rsvpStatus ===
            "Not Attending"
        ) {

            rsvpStatus.textContent =
                "UNABLE TO ATTEND";

            show(rsvpStatus);

            hide(seatCount);
            hide(removeGuest2);
            hide(removeGuest3);

        } else {

            rsvpStatus.textContent =
                "AWAITING RESPONSE";

            show(rsvpStatus);

            if (
                guest.seats === 1
            ) {

                seatCount.textContent =
                    "1 SEAT RESERVED";

            } else {

                seatCount.textContent =
                    `${guest.seats} SEATS RESERVED`;
            }

            show(seatCount);
        }

        // =========================
        // NOT ATTENDING
        // =========================

        if (
            guest.rsvpStatus ===
            "Not Attending"
        ) {

            hideEmailSection();
            hideActionButtons();
            hidePartySection();

            return;
        }

        // =========================
        // ALREADY ATTENDING
        // =========================

        if (
            guest.rsvpStatus ===
            "Attending"
        ) {

            hideEmailSection();
            hideActionButtons();

            // Show party card only if
            // there are additional guests.
            if (
                guest.guest2 ||
                guest.guest3
            ) {

                show(partyCard);

                hide(partyInstructions);
                hide(removeGuest2);
                hide(removeGuest3);

                // =========================
                // GUEST #2
                // =========================

                if (
                    guest.guest2 &&
                    guest.guest2.trim() !== ""
                ) {

                    guest2Text.textContent =
                        "Guest #2: " +
                        guest.guest2;

                    show(guest2Text);

                } else {

                    hide(guest2Text);
                }

                // =========================
                // GUEST #3
                // =========================

                if (
                    guest.guest3 &&
                    guest.guest3.trim() !== ""
                ) {

                    guest3Text.textContent =
                        "Guest #3: " +
                        guest.guest3;

                    show(guest3Text);

                } else {

                    hide(guest3Text);
                }

                // No input boxes after
                // RSVP has been confirmed.
                hide(guest1Input);
                hide(guest2Input);

            } else {

                hidePartySection();
            }

            return;
        }

        // =========================
        // AWAITING RESPONSE
        // =========================

        show(emailCard);

        emailInput.value =
            guest.email || "";

        // =========================
        // PARTY
        // =========================

        if (
            guest.seats >= 2
        ) {

            show(partyCard);

            if (
                guest.seats === 2
            ) {

                partyInstructions.textContent =
                    "Please confirm the name of the guest to be included in your reservation.";

            } else {

                partyInstructions.textContent =
                    "Please confirm the name of each guest to be included in your reservation.";
            }

            show(partyInstructions);

            // =========================
            // GUEST #2
            // =========================

            if (
                guest.guest2 &&
                guest.guest2.trim() !== ""
            ) {

                guest2Text.textContent =
                    "Guest #2: " +
                    guest.guest2;

                show(guest2Text);
                show(removeGuest2);
                hide(guest1Input);

            } else {

                hide(guest2Text);
                hide(removeGuest2);
                show(guest1Input);
            }

            // =========================
            // GUEST #3
            // =========================

            if (
                guest.seats >= 3
            ) {

                if (
                    guest.guest3 &&
                    guest.guest3.trim() !== ""
                ) {

                    guest3Text.textContent =
                        "Guest #3: " +
                        guest.guest3;

                    show(guest3Text);
                    show(removeGuest3);
                    hide(guest2Input);

                } else {

                    hide(guest3Text);
                    hide(removeGuest3);
                    show(guest2Input);
                }

            } else {

                hide(guest3Text);
                hide(removeGuest3);
                hide(guest2Input);
            }

        } else {

            hidePartySection();
        }

        // =========================
        // RSVP BUTTONS
        // =========================

        show(actionButtons);
        show(confirmButton);
        show(declineButton);

        confirmButton.textContent =
            "YES, I'll be there";

        confirmButton.disabled = false;

        declineButton.textContent =
            "I can't make it";

        declineButton.disabled = false;
    }
);

// =========================
// CONFIRM RSVP
// =========================

confirmButton.addEventListener(
    "click",
    async () => {

        if (!currentGuest) {
            return;
        }

        // =========================
        // EMAIL REQUIRED
        // =========================

        if (
            !emailInput.value.trim()
        ) {

            emailInput.focus();

            rsvpError.textContent =
                "PLEASE ENTER YOUR EMAIL ADDRESS";

            return;
        }

        // =========================
        // SAVE EMAIL
        // =========================

        currentGuest.email =
            emailInput.value.trim();

        currentGuest.rsvpStatus =
            "Attending";

        // =========================
        // SAVE GUEST #2
        // =========================

        if (
            currentGuest.seats >= 2 &&
            (
                !currentGuest.guest2 ||
                currentGuest.guest2.trim() === ""
            )
        ) {

            currentGuest.guest2 =
                capitalizeWords(
                    guest1Input.value
                ) || "";
        }

        // =========================
        // SAVE GUEST #3
        // =========================

        if (
            currentGuest.seats >= 3 &&
            (
                !currentGuest.guest3 ||
                currentGuest.guest3.trim() === ""
            )
        ) {

            currentGuest.guest3 =
                capitalizeWords(
                    guest2Input.value
                ) || "";
        }

        // =========================
        // CALCULATE CONFIRMED SEATS
        // =========================

        let confirmedSeats = 1;

        if (
            currentGuest.guest2 &&
            currentGuest.guest2.trim() !== ""
        ) {

            confirmedSeats++;
        }

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim() !== ""
        ) {

            confirmedSeats++;
        }

        currentGuest.seats =
            confirmedSeats;

        // =========================
        // UPDATE SUPABASE
        // =========================

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    email:
                        currentGuest.email,

                    rsvpStatus:
                        currentGuest.rsvpStatus,

                    guest2:
                        currentGuest.guest2,

                    guest3:
                        currentGuest.guest3,

                    seats:
                        currentGuest.seats
                })
                .eq(
                    "id",
                    currentGuest.id
                );

        if (error) {

            alert(error.message);

            return;
        }

        // =========================
        // UPDATE SEAT DISPLAY
        // =========================

        updateConfirmedSeatDisplay();

        rsvpStatus.textContent =
            "ATTENDANCE CONFIRMED ✓";

        // =========================
        // HIDE EMAIL
        // =========================

        hideEmailSection();

        // =========================
        // HIDE INSTRUCTIONS
        // =========================

        hide(partyInstructions);

        // =========================
        // HIDE INPUTS
        // =========================

        hide(guest1Input);
        hide(guest2Input);

        // =========================
        // GUEST #2 DISPLAY
        // =========================

        if (
            currentGuest.guest2 &&
            currentGuest.guest2.trim() !== ""
        ) {

            guest2Text.textContent =
                "Guest #2: " +
                currentGuest.guest2;

            show(guest2Text);

        } else {

            hide(guest2Text);
        }

        // =========================
        // GUEST #3 DISPLAY
        // =========================

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim() !== ""
        ) {

            guest3Text.textContent =
                "Guest #3: " +
                currentGuest.guest3;

            show(guest3Text);

        } else {

            hide(guest3Text);
        }

        // =========================
        // SHOW REMOVE BUTTONS
        // =========================

        if (
            currentGuest.guest2 &&
            currentGuest.guest2.trim() !== ""
        ) {

            show(removeGuest2);

        } else {

            hide(removeGuest2);
        }

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim() !== ""
        ) {

            show(removeGuest3);

        } else {

            hide(removeGuest3);
        }

        // =========================
        // CONFIRM BUTTON
        // =========================

        confirmButton.textContent =
            "Attendance Confirmed ✓";

        confirmButton.disabled = true;

        hide(declineButton);
        hide(rsvpError);

        // =========================
        // HIDE PARTY IF ONLY
        // PRIMARY GUEST REMAINS
        // =========================

        if (
            currentGuest.seats === 1
        ) {

            hidePartySection();
        }
    }
);

// =========================
// DECLINE RSVP
// =========================

declineButton.addEventListener(
    "click",
    async () => {

        if (!currentGuest) {
            return;
        }

        const email =
            emailInput.value.trim();

        /*
         * EMAIL IS OPTIONAL WHEN DECLINING.
         *
         * If the guest entered an email,
         * we will save it.
         *
         * If they leave it blank,
         * we will simply save the RSVP
         * without an email.
         */

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    email: email || null,
                    rsvpStatus: "Not Attending",
                    guest2: "",
                    guest3: "",
                    seats: 0
                })
                .eq(
                    "id",
                    currentGuest.id
                );

        if (error) {
            rsvpError.textContent =
                error.message;

            show(rsvpError);

            return;
        }

        /*
         * Update the current guest object
         * so the page immediately reflects
         * the new RSVP status.
         */

        currentGuest.email =
            email || null;

        currentGuest.rsvpStatus =
            "Not Attending";

        currentGuest.guest2 =
            "";

        currentGuest.guest3 =
            "";

        currentGuest.seats =
            0;

        /*
         * Update the screen.
         */

        rsvpStatus.textContent =
            "UNABLE TO ATTEND";

        hide(seatCount);
        hide(emailCard);
        hide(partyCard);

        hide(guest2Text);
        hide(guest3Text);
        hide(removeGuest2);
        hide(removeGuest3);

        hide(guest1Input);
        hide(guest2Input);

        hide(rsvpError);

        confirmButton.textContent =
            "Unable To Attend";

        confirmButton.disabled =
            true;

        hide(declineButton);
    }
);

// =========================
// REMOVE GUEST #2 BUTTON
// =========================

removeGuest2.addEventListener(
    "click",
    () => {

        if (!currentGuest) {
            return;
        }

        openRemoveGuestModal(2);
    }
);

// =========================
// REMOVE GUEST #3 BUTTON
// =========================

removeGuest3.addEventListener(
    "click",
    () => {

        if (!currentGuest) {
            return;
        }

        openRemoveGuestModal(3);
    }
);

// =========================
// CANCEL REMOVE
// =========================

cancelRemoveGuest.addEventListener(
    "click",
    () => {

        closeRemoveGuestModal();
    }
);

// =========================
// CONFIRM REMOVE
// =========================

confirmRemoveGuest.addEventListener(
    "click",
    async () => {

        if (
            !currentGuest ||
            !guestToRemove
        ) {
            closeRemoveGuestModal();
            return;
        }

        // =========================
        // REMOVE GUEST #2
        // =========================

        if (
            guestToRemove === 2
        ) {

            // If Guest #3 exists,
            // move them into Guest #2.
            if (
                currentGuest.guest3 &&
                currentGuest.guest3.trim() !== ""
            ) {

                currentGuest.guest2 =
                    currentGuest.guest3;

                currentGuest.guest3 = "";

            } else {

                currentGuest.guest2 = "";
            }
        }

        // =========================
        // REMOVE GUEST #3
        // =========================

        if (
            guestToRemove === 3
        ) {

            currentGuest.guest3 = "";
        }

        // =========================
        // RECALCULATE SEATS
        // =========================

        let confirmedSeats = 1;

        if (
            currentGuest.guest2 &&
            currentGuest.guest2.trim() !== ""
        ) {

            confirmedSeats++;
        }

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim() !== ""
        ) {

            confirmedSeats++;
        }

        currentGuest.seats =
            confirmedSeats;

        // =========================
        // UPDATE SUPABASE
        // =========================

        const { error } =
            await supabaseClient
                .from("Guests")
                .update({
                    guest2:
                        currentGuest.guest2,

                    guest3:
                        currentGuest.guest3,

                    seats:
                        currentGuest.seats
                })
                .eq(
                    "id",
                    currentGuest.id
                );

        if (error) {

            alert(error.message);

            return;
        }

        // =========================
        // CLOSE MODAL
        // =========================

        closeRemoveGuestModal();

        // =========================
        // UPDATE SEAT COUNT
        // =========================

        updateConfirmedSeatDisplay();

        // =========================
        // UPDATE GUEST #2
        // =========================

        if (
            currentGuest.guest2 &&
            currentGuest.guest2.trim() !== ""
        ) {

            guest2Text.textContent =
                "Guest #2: " +
                currentGuest.guest2;

            show(guest2Text);
            show(removeGuest2);

        } else {

            hide(guest2Text);
            hide(removeGuest2);
        }

        // =========================
        // UPDATE GUEST #3
        // =========================

        if (
            currentGuest.guest3 &&
            currentGuest.guest3.trim() !== ""
        ) {

            guest3Text.textContent =
                "Guest #3: " +
                currentGuest.guest3;

            show(guest3Text);
            show(removeGuest3);

        } else {

            hide(guest3Text);
            hide(removeGuest3);
        }

        // =========================
        // NEVER SHOW INPUTS
        // =========================

        hide(guest1Input);
        hide(guest2Input);

        // =========================
        // IF ONLY PRIMARY GUEST
        // REMAINS
        // =========================

        if (
            currentGuest.seats === 1
        ) {

            hidePartySection();
        }
    }
);

// =========================
// EVENT LISTENERS - PRESS ENTER
// =========================

[
    emailInput,
    guest1Input,
    guest2Input
].forEach(input => {

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            confirmButton.click();
        }
    });
});

searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        searchButton.click();
    }
});

passwordInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        passwordButton.click();
    }
});