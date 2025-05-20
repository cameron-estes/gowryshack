// Here I want to create an event listener for all the delete buttons that exist on the table...
// In order to do this I need to querySelectorAll()
// https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
// https://www.w3schools.com/cssref/css_selectors.php
// I need to use querySelectorAll() on some sort of legal CSS selector, such as an id or a class of some sort...


document.addEventListener("DOMContentLoaded", function() {
    // I am going to select all elements that have a delete-listing-button class attached to them
    const del_buttons = document.querySelectorAll(".delete-listing-button");

    del_buttons.forEach(button => {
        button.addEventListener("click", function () {
            // as written within the writeup, I can retrieve a table row and all respective rows for a specific button id
            // so depending on which button is clicked, it selects the listing id of that button and deletes the nearest tr element
            const id = button.closest("tr").getAttribute("data-listing-id");

            // use simple fetch().then() to create a DELETE request containing the listing id
            fetch("/api/delete_listing", {
                method: "DELETE",
                headers: {"Content-Type": "application/json",},
                body: JSON.stringify({listing_id: id}),
            })
            // the then case is simple here, we just check to see the status of the response code, if 204, then we remove the button
            // indicating that the DELETE request is proper, if the resp status is anything else (404)
            .then(resp => {
                if (resp.status === 204) {
                    button.closest("tr").remove();
                }
                else if (resp.status === 404) {
                    alert("Listing not found.");
                }
            })
        });
    });

    // here is the js for previewing each listing:
    // it functions quite simply, first and foremost, I create two separeate functions, one to handle when the mouse enters a specfic row
    // and another for when the mouse leaves that specific row
    function displayPreview(event) {
        const gallery = document.getElementById("gallery");
        const preview = document.getElementById("previewdiv");

        const img = event.currentTarget.getAttribute("prev-imgurl");
        const desc = event.currentTarget.getAttribute("prev-desc");

        // when the mouse enters, I will shorten the size of the whole gallery
        // and then display block so that the img and desc can appear
        gallery.style.width = "65%";
        preview.style.display = "block";

        console.log(img);
        console.log(desc);
        preview.innerHTML = `
            <div>
                <img src="${img}" class="image-alter-preview">
                <p class="description">${desc}</p>
            </div>
        `;
    }
    function removePreview(event) {
        const gallery = document.getElementById("gallery");
        const preview = document.getElementById("previewdiv");
        // just reassigning the width to its original size
        // and the style to display none when the mouse leaves
        gallery.style.width = "100%";
        preview.style.display = "none";
    }

    // had to figure out how this worked for a bit, for some reason if I didn't create a class for the query selector, it would fail to
    // properly assign the innerHTML, but it would properly resize upon mouse enter and exit... it was very weird...
    // for example, if my querySelectorAll() condition was .gallery tr it wouldn't show the images and desc, but would resize,
    // only with #gallery tr would it properly work
    const rowsToDisplay = document.querySelectorAll("#gallery tr");
    rowsToDisplay.forEach(row => {
        // creating mouseenter and mouseleave events for displayPreview and removePreview respectively,
        // this will allow for the displayed previews to show up when the mouse hovers, and to disappear when the mouse exists...
        row.addEventListener("mouseenter", displayPreview);
        row.addEventListener("mouseleave", removePreview);
    });


    // below is the js for updating the listing end times each second...
    setInterval(countdownListings, 1000);
    countdownListings();

    function countdownListings() {
        // with this function, I had to go back and change all the dates for all my listings in server.js, they were are previously set to
        // funny names like "When I say So..." instead of the proper "YYYY-MM-DD" format they should be...
        const listings = document.querySelectorAll('tr[prev-endtime]');
        listings.forEach(function(listing) {
            // I neglected to implement this functionality for counting down the time in the past projects, but in this one I did
            // as described in zyBooks 6.8, the Date() object can be manipulated to find total time in ms since a specific date...
            const bidEndDate = new Date(listing.getAttribute("prev-endtime"));
            const currentDate = new Date();
            // simply subtract currentDate from the endDate and we can get the total time until the bid ends
            // use getTime() as described in the hmk3 writeup
            const timeUntilEnd = bidEndDate.getTime() - currentDate.getTime();

            // Easy to find the node we want to add the countdown to by simply looking for the td with the specific id I want...
            const countdownVal = listing.querySelector('.ending-counter');
            if (timeUntilEnd <= 0) {
                countdownVal.textContent = "Auction Expired";
            } else {
                // Here I am simply creating const values to represent the various amounts of milliseconds needed to find days, hours, mins, and secs
                const msToDays = 86400000;
                const msToHours = 3600000;
                const msToMins = 60000;
                const msToSecs = 1000;
                // Here we just do the math:
                // num days is the time to the end divided by the amount of ms per day
                // num hours is the remainder of how many days exist, then divided by ms per hour
                // num mins is the remainder of hwo many hours exist, then divided by ms per min
                // num secs is the remainder of how mant mins exist, then divided my ms per sec

                const num_days = Math.floor(timeUntilEnd / msToDays);
                const num_hours = Math.floor((timeUntilEnd % msToDays) / msToHours);
                const num_minutes = Math.floor((timeUntilEnd % msToHours) / msToMins);
                const num_seconds = Math.floor((timeUntilEnd % msToMins) / msToSecs);

                // formatting similar to the writeup (xxd xxh:  xxm xxs)
                const time_to_display = `${num_days}d ${num_hours}h:  ${num_minutes}m ${num_seconds}s`;
                countdownVal.textContent = time_to_display;
            }
        });
    }
});