// I implemented this function for this assignment so that I could get full credit for this assignment...
// This was not implemented in my previous hw4, so I had to figure out a way to accomplish this...
// First, I want to create an event listener while loading in the DOM content, otherwise I could have to add this into the same pug file that
// it is supposed to monitor

document.addEventListener("DOMContentLoaded", function () {
    // onchange is a really interesting way to accomplish this... the way this works is we setup a function to trigger on the event that
    // the specified element in the DOM is changed.  In this case, we retrieve the element in the DOM with the 'category' id and then setup
    // the function to trigger whenever that dropdown menu changes...
    document.getElementById("category").onchange = function () {
        // Here we simply check to see if the other-category-div element has a value of 'OTHER" and if it does, we set its display to show,
        // otherwise we set its display to none
        document.getElementById("other-category-div").style.display = this.value === "Other" ? "block" : "none";
    };
});