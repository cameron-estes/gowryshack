// OK so i need to start thinking about how I want to do this function
// Thinking about this logically, I want to add a series of event listeners, I already have the even listener
// for the create bid button, but now I should add one for the submit button... instead of the submit being within a form
// it should now access the /api/create_bid endpoint and use the api to generate a POST request using the fetch api
// ok lets start

document.addEventListener('DOMContentLoaded', function() {
    // here i simply create two const varaibles, one for the create button, and one for the from that contains all the buttons
    // I want to handle an event on button click that adds the invis class when the form is visible, and removes it when the form is
    // invisible... this will allow for the whole form to dynamically render itself invisible temporarily
    const createBidButton = document.getElementById('bid_button');
    const form = document.getElementById('bid_form');
    createBidButton.addEventListener('click', function() {
        if (form.classList.contains("invis")) {
            form.classList.remove("invis");
            form.classList.add("bid_form");
            bidButton.textContent = "Cancel";
        }
        else {
            form.classList.remove("bid_form");
            form.classList.add("invis");
            bidButton.textContent = "Place New Bid";
        }
    });

    // ok here we want to create a new event listener that watches the submit button for the old form
    // we want the listener to send a POST request using the fetch api to the /api/place_bid endpoint
    const submit_button = document.getElementById('submit_button');
    submit_button.addEventListener("click", () => {
        // first we want to initialize all the values that are being passed into the form as variables and create a new bid object with them
        const id = parseInt(document.getElementById("id").value);
        const amount = parseFloat(document.getElementById("amount").value);
        const name = document.getElementById("name").value;
        const comment = document.getElementById("comment").value;
        const new_bid = {
            listing_id: id,
            bid_amount: amount,
            bidder_name: name,
            comment: comment
        };
        // here we create a fetch.then.then
        // the first step is to fetch /api/place_bid as described in the writeup, with POST, application/json, and the bid we made
        fetch("/api/place_bid", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            // using stringify here...
            body: JSON.stringify(new_bid)
        })
        // The then case simply checks to see if the resp from the fetch is valid or not... in the case that it is valid,
        // we clear the contents of each value box for the form
        .then(resp => {
            if (resp.status === 201) {
                // document.getElementById("name").value = "";
                document.getElementById("amount").value = "";
                document.getElementById("comment").value = "";
                document.getElementById("amount").style.borderColor = "";
                // we need to also add the possible cookie value that may exist into the getelemnetbyid()
                // this is done by parsing the cookies that are set in the /api/
                let cookie_name;
                const cooks = document.cookie.split("; ");
                for (const cookies of cooks) {
                    const [key, value] = cookies.split("=");
                    if (key == "bidder") {
                        cookie_name = decodeURIComponent(value);
                    }
                }
                if (cookie_name) {
                    document.getElementById("name").value = cookie_name;
                }
                console.log(resp);
                return resp.json();
            }
            // in the case that the response returns 409, that is said to be a size to small for the bid, so we hav eto
            // make the outline of the amount section red to indicate that, as well as ensure that the menu stays open instead of
            // closing since I'm calling the createBidButton onclick()
            else if (resp.status === 409) {
                document.getElementById("amount").style.borderColor = "red";
                form.classList.remove("invis");
                form.classList.add("bid_form");
                return resp.json();
            }
        })
        // this final then is responsible for taking the resp.json() list of all bids that are to be generated, and to then create them
        // on the webpage... this can be done as described within the writeup with createElement() function...
        .then(bids => {
            // if I don't check bids here, I will be screwed if I incorrectly make an attempt to render bids that don't exist
            //
            if (bids && Array.isArray(bids)) {
                // creating variable for the div that holds all the bids...
                const container = document.getElementById("bidlist-container");
                container.innerHTML = "";

                // I was struggling to find a solution that was effective for this and was able to find a really robust solution
                // here: https://stackoverflow.com/questions/52030110/sorting-strings-in-descending-order-in-javascript-most-efficiently
                // in this webpage the syntax seen below was discussed, but how I actually applied it to this problem was my own work
                bids.sort((low, high) => parseFloat(high.amount) - parseFloat(low.amount));

                // ok continuing, for each bid, we need to render the necessary html elements onto the page...
                // my bids each have a section in the top that contains the name and the amount, with the comment in a section below
                // for this example, I need to create a div to hold everything first, then create a div to hold the name and amount
                // then add all necessary css classes to each of those so they display the same...

                // finally I need to create the p elements that actually contain all the values with all the css classes needed for those
                bids.forEach(bid => {
                    console.log(bid);

                    const bidbox = document.createElement("div");
                    bidbox.classList.add("bidder");
                    const name_and_amount = document.createElement("div");
                    name_and_amount.classList.add("topp");

                    const name = document.createElement("p");
                    name.classList.add("biddername");
                    name.textContent = bid.name;

                    const amount = document.createElement("p");
                    amount.textContent = parseFloat(bid.amount);

                    const comment = document.createElement("p");
                    comment.classList.add("biddermsg");
                    comment.textContent = bid.comment;
                    // creating all divs and p elements above...
                    // appending all values to the respective elements below...
                    name_and_amount.append(name, amount);
                    bidbox.append(name_and_amount, comment);
                    container.appendChild(bidbox);
                });
                // once this is done, and the bid has been posted successfully, make the bid invis again...
                form.classList.remove("bid_form");
                form.classList.add("invis");
                submit_button.textContent = "Place Bid";
            }
        })
    });
});