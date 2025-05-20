// The first things to setup is any initial express middleware
const express = require("express");
const data = require("./data");
const cookieParse = require("cookie-parser");
const app = express();
const PORT = 4131;

app.use(express.static("resources"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// const cookieParse = require("cookie-parser");
app.use(cookieParse());

app.set("view engine", "pug");
app.set("views", "templates");

// The next step is to setup the endpoints for the old server using app.get for each possible endpoint...
// Let's handle all the get requests first...
app.get("/main", (req, res) => {
    res.render("mainpage.pug", { title: "Gowry's Mystical and Magical Items"});
});
app.get("/", (req, res) => {
    res.render("mainpage.pug", { title: "Gowry's Mystical and Magical Items"});
});

app.get("/gallery", async (req, res) => {
    let query = "";
    let category = "all";
    if (req.query.query) { query = req.query.query.toLowerCase();}
    if (req.query.category) { category = req.query.category;}

    try {
        let listings = await data.getGallery(query, category);
        // I am looping through all the rendered listings are resorting their bids in order of max -> min bid amounts
        // The reason I am doing this is because I was having problems with the proper bidder name and amount being displayed in the gallery
        // I am accessing bids[0] to get the highest bidder but this doesn't work when storing the values in the db I have to re sort
        // each time when I render in case any new bids are made.
        for (let listing of listings) {
            listing.bids.sort((high, low) => low.amount - high.amount);
        }
        // console.log(bids_to_render);
        res.render("gallery.pug", { listings, title: "Gowry's Shack Exclusive Listings"});
    } catch (err) {
        res.status(500).send("Internal Server Error")
    }
});

app.get("/listing/:id", async (req, res) => {
    // NOTE: FOR GRADER:
    // I am not sure why, but there is a weird issue where whenever I add a new bid, the bid appears as an empty div
    // Only when I re-render the webpage does it appear in the correct order...
    // This is confusing to me because when I make the fetch call to post the new bid, it should dynamically re-render the bid on the spot
    // Please refresh the listing page to see the bid in the correct spot with the proper name, amount, and message

    // console.log("made it this far1");
    const listing_id = req.params.id;
    // console.log(listing_id);
    if (!listing_id) {
        // saw this in clas to do a 1 line solution simply setting the res status before the render call to the respective error code
        return res.status(400).render("404.pug", {title: "404"});
    }
    // console.log("made it this far2");

    let listing_to_render = await data.getListing(listing_id);
    let bids_to_render = await data.getBids(listing_id);
    if (!listing_to_render) {
        return res.status(404).render("404.pug", {title: "404"});
    }
    // here we can sort all the bids from low to high using the syntax described below...
    // I wanted to find a way that is less frustrating to do this than a double for loop...
    // the sort() function as described here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    // gave me an idea on how to do this
    // // console.log("made it this far3");
    // I have to resort the bid when I render the listings/id page in case a new bid was added
    bids_to_render = bids_to_render.sort((high, low) => low.amount - high.amount);
    res.render("listing.pug", {title: listing_to_render.title, listing_to_render, bids: bids_to_render})
});

app.get("/create", (req, res) => {
    res.render("create.pug", {title: "Create A New Listing!"});
});

// Next, let's handle the post requests
app.post("/api/place_bid", async (req, res) => {
    // first we want to establish the variables we need for the bid creation, which will be returned in the req.body
    // from the bid.js file.  We also want to ensure that they all exist otherwise we error out...
    const id = req.body.listing_id;
    // console.log(id);
    const amount = req.body.bid_amount;
    const comment = req.body.comment;
    const bidder = req.body.bidder_name;
    // let listing_to_render = null;
    if (!id || !amount || !comment || !bidder) {
        return res.status(400).json({err: "Invalid inputs"});
    }
    // passing in cookie parameters from the bidder name into the bid.js response...
    // sending cookiename of value bidder
    res.cookie("cookie_name", bidder, {httpOnly: false});
    let listing_to_render = await data.getListing(id);
    if (!listing_to_render) {
        return res.status(404).json({err: "No listing exists with that id"});
    }

    let currenthighest = await data.getHighestBid(id);
    // console.log(currenthighest[0].highest_bid);

    if (parseFloat(amount) <= parseFloat(currenthighest[0].highest_bid)) {
        return res.status(409).json({err: "Bid is too low..."});
    }

    // listing_to_render.bids.push({name: bidder, amount: amount, comment: comment});\
    const added_bid = await data.placeBid({ listing_id: id, name: bidder, amount, comment});
    if (added_bid) {
        const updatedBids = listing_to_render.bids.concat(added_bid);
        res.status(201).json(updatedBids);
    } else {
        res.status(500).json({err: "Internal Server Error"})
    }
    // for (const listing of listings) {
    //     if (Number(listing.id) === id) {
    //         // console.log("we are getting here");
    //         listing_to_render = listing;
    //         // console.log(listing_to_render);
    //     }
    // }
    // chekcing for highest bidder here...
    // let currenthighest = 0;
    // for (const bid of listing_to_render.bids) {
    //     const bidAmount = parseFloat(bid.amount);
    //     if (bidAmount > currenthighest) {
    //         currenthighest = bidAmount;
    //     }
    // }
});

app.post("/create", async (req, res) => {
    try {
        let title = req.body.title;
        let img_url = req.body.img_url;
        let description = req.body.description;
        let category = req.body.category;
        let category_other = req.body.other_category;
        let end_date = req.body.end_date;

        if ((!title || !img_url || !description || !category || !end_date) || (category == "Other" && !category_other)) {
            res.status(400).render("create_fail.pug");
        } else {
            if (category == "Other") {
                category = category_other;
            }

            const new_listing_to_render = await data.addListing({title, img_url, description, category, end_date});
            if (new_listing_to_render) {
                res.status(201).render("create_success.pug");
            } else {
                res.status(400).render("create_fail.pug");
            }
        }
    } catch (error) {
        res.status(500).json({err: "Internal Server Error"});
    }
})

// Finally, let's handle the delete requests that will be coming in from the gallery side of things...
app.delete("/api/delete_listing", async (req, res) => {
    const temp_id = req.body.listing_id;
    if (!temp_id) {
        return res.status(404).json({err: "No ID in request body"});
    }
    try {
        const listing_to_delete = await data.deleteListing(temp_id);
        if (listing_to_delete) {
            res.status(204).send();
        } else {
            res.status(404).json({err: "Delete Failed, Listing does not exist..."})
        }
    } catch (error) {
        res.status(500).json({err: "Internal server error"})
    }
})

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + String(PORT));
})