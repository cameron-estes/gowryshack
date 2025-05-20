// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  // host: "cse-mysql-classes-01.cse.umn.edu",// this will work
  host: "127.0.0.1",
  user: "C4131F24U34",
  database: "C4131F24U34",
  password: "1206", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});

// later you can use connPool.awaitQuery(query, data) -- it will return a promise for the query results.
// Some information of note for the TAs
// I have done quite a bit of work with SQL with my internship and have learned some stuff that I may implement in the methods below

async function addListing(data) {
  // you CAN change the parameters for this function.
  // this is a syntax from class that makes assigning varaibles from the body content a lot easier and capable on one single line
  const { title, img_url, description, category, end_date } = data;
  let res = await connPool.awaitQuery("INSERT INTO auction (title, img_url, description, category, end_date) VALUES (?, ?, ?, ?, ?);",
                      [title, img_url, description, category, end_date]);
  return res.insertId;
}

async function deleteListing(id) {
  let res = await connPool.awaitQuery("DELETE FROM auction WHERE id = ?;",
                      [id]);
  return res.affectedRows > 0;
}

async function getListing(id) {
  let listing_to_render = await connPool.awaitQuery("SELECT * FROM auction WHERE id = ?;", [id]);
  let bids_to_render = await connPool.awaitQuery("SELECT * FROM bid WHERE listing_id = ? ORDER BY amount DESC;", [id]);


  // Objet.assign is a way to package both the listing data held within the auction table and the bid data held within the bid table into
  // the same object:  I found this solution here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  // it describes how objects can be combined to form one final output object.
  let res = Object.assign({}, listing_to_render[0]);
  res.bids = bids_to_render;
  return res;
}

async function getGallery(query, category ) {
  // ok here things get a bit tricky, we have to render the gallery according to any potential search query that might be present
  // so for me, the rendered bids can be either Talismans, Incantations, or Crafting Materials, or all... in either case, we need to render
  // the associated listing.  Let's start by building a sql string and a list of arguments to inject

  // So first, we will always start with a select all statement from auction, and an empty set of parameters
  let q = "SELECT * FROM auction";
  let args = [];

  // first we need to check to see if the category is any when passed in...
  // if it is any, then we should just continue with the select * without the where condition
  if (category != "all") {
    q += " WHERE category = ?";
    args.push(category);
  }
  // next we should check for the existence of a query for a specific name or string that matches a listing name
  if (query) {
    if (category != "all") {
      q += " AND";
    }
    else {
      q += " WHERE";
    }
    q += " title LIKE ?";
    // The writeup for this assignment didn't say much about how we can do the query matching, so I found a unique way to determine
    // whether or not the "title" is LIKE the query
    // we can accomplish this by using the %% operators as a wildcard.  This is breifly described within the textbook
    // what it means is that we match the SELECT statement with any listings that contain the query within them, it doesn't matter
    // if it is the front, back, middle, mixed up, itll mathc properly
    args.push(`%${query}%`);
  }
  // Finally here, we actually execute the compiled query we made, with the list of arguments in order to inject
  let listings_to_render = await connPool.awaitQuery(q, args);
  for (let listing of listings_to_render) {
    listing.bids = await getBids(listing.id);
  }
  return listings_to_render;
}

async function placeBid(data) {
  // you CAN change the parameters for this function.
  // For this one, I just want to return a bool representing a successful select from teh auction table and a successful insert into bid
  const { listing_id, name, amount, comment } = data;
  try {
    let listings_to_render = await connPool.awaitQuery("SELECT * FROM auction WHERE id = ? AND end_date > NOW();",
                    [listing_id]);
    if (listings_to_render.length == 0) {
      throw new Error("Auction has expired");
    } else {
      let res = await connPool.awaitQuery("INSERT INTO bid (name, amount, comment, listing_id) VALUES (?, ?, ?, ?);",
                    [name, amount, comment, listing_id]);
      return res.affectedRows > 0;
    }
  } catch (error) {
    console.error("Cannot Place Bid on Expired Listing:" + error);
    return false;
  }

  // doing the same thing here that was done for deleteListing so I can determine if the bid was added or not.  If the bid was added, we will
  // see a nonzero amount of effected rows.
  // The writeup states that we set the return type of this function to whatever we want, so I selected bool to easily validate within server.js
}

async function getBids(listing_id) {
  const bids_to_render = await connPool.awaitQuery("SELECT id AS new_id, name, amount, comment FROM bid WHERE listing_id = ?;", [listing_id]);
  return bids_to_render;
}

async function getHighestBid(listing_id) {
  const highest_bid = await connPool.awaitQuery("SELECT MAX(amount) AS highest_bid FROM bid WHERE listing_id = ?;", [listing_id]);
  if (highest_bid.length == 0) {
    return 0;
  }
  else {
    return highest_bid;
  }
}

module.exports = {
    addListing,
    deleteListing,
    getListing,
    getGallery,
    placeBid,
    getBids,
    getHighestBid
};