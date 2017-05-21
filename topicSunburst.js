/**
 * Purpose: Quickly, intuitively explore primary themes in a large groups of texts.
 * Author: David Richards
 * Date: Summer 2017
 * Frameworks:
 *  - d3 | https://d3js.org/ | https://github.com/d3/d3/blob/master/API.md | viz builder
 *  - mark.js | https://markjs.io/ | highlights found strings
 *  - bootstrap | http://getbootstrap.com/ | responsive formatting, user controls
 *  - fontawesome | http://fontawesome.io/ | icons!
 *  - google font: Raleway | https://fonts.google.com/specimen/Raleway | clean, attractive
 * Data Files Requirements:
 *  - Topics-ABC.txt | A hierarchical json file that populates our sunburst
 *  - Texts-ABB.txt |
 *
 *
 * ***  Topics-ABC.txt example  ***
 * The file begins with a summary section, then has a list of children (one child per topic). Each topic has 0 or
 * more children representing phrases that provide context for the topic.
 * {"name": "Matthew",                  // name of the corpus, shown in the center of the sunburst
 *  "data_date": "",                    // the date of the data, shown in the center of the sunburst
 *  "run_date": "2017-05-20 13:33",     // the date we pulled the data, shown in the center of the sunburst
 *  "children": [{                      // ***  topics: the inner ring of our sunburst ***
 *      "name": "man",                  // the first topic, use this as the visible title of our slice
 *      "count": 108,                   // how many times does this topic appear in the texts? (shown at the top of
 *                                          the texts list.
 *      "rank": 1,                      // a rank order based on the number of texts it appears in
 *      "size": 7,                      //
 *      "textCount": 25,                // how many texts does this topic appear in (e.g., textIDs.length)
 *      "verbatims": ["man", "men"],    // alternate ways this topics is mentioned in our texts, used by to highlight
 *      "textIDs": ["936", "944",       // the textIDs where this topic appears (used to determine which texts to show
 *          "929", "956", "942", "945", "946", "947", "938", "954", "953", "948", "930",
 *          "935", "951", "950","952", "932", "940", "937", "943", "955", "941", "939", "949"],
 *      "children": [                   // ***  sub-topics: the outer ring of our sunburst  ***
 *                                      // each child has a subset of the attributes that we have for each topic
 *          {"name": "aman", "count": 13, "verbatims": ["a man"],
 *            "textIDs": ["945", "946", "937", "947", "941", "950", "953", "944", "940", "949"], "textCount": 10,
 *            "rank": 1, "size": 10},
 *          {"name": "thisman", "count": 8, "verbatims": ["this man"],
 *            "textIDs": ["937", "955", "941", "954", "940"],
 *            "textCount": 5, "rank": 1, "size": 5},
 *          {"name": "theman", "count": 6, "verbatims": ["the man", "the men"],
 *            "textIDs": ["954", "940", "936"],
 *            "textCount": 3, "rank": 1, "size": 3}]
 * }]}
 */


// Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var arc;
var allTopicsData;
var allTextsData;
var slice;
var newSlice;
var root;
var currentCorpus;
var currentTextIDs;
var color = d3.scaleLinear().domain([0, 0.5, 1]).range(['#337ab7', '#d3d3d3', '#464545']);
var corpusA = 'Proverbs';  // These variable names bind us to the buttonGroupIDs
var corpusB = 'Numbers';  // And the variable values must correspond to the file name
var corpusC = 'Mark';  // And these values are used for the buttonGroup labels.

// Set the labels on the Corpus choice buttons
d3.select("#corpusA").html(corpusA);
d3.select("#corpusB").html(corpusB);
d3.select("#corpusC").html(corpusC);

// Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
var g = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create our sunburst data structure and size it.
var partition = d3.partition()
    .size([2 * Math.PI, radius]);

// Get files, produce visuals, set up event handlers
changeSelectedCorpus();
d3.selectAll("input[name=topTopicsSelect]").on("click", showTopTopics);
d3.selectAll("input[name=dateSelect]").on("click", showDate);
d3.selectAll("button.corpus").on("click", changeSelectedCorpus);

/**
 * Draw the sunburst, which includes sizing the slices, applying colors and labels
 * @param data {json} the topic data (parameterized because we may filter the data before drawing)
 */
function drawSunburst(data) {

    // Find the root node, calculate the node.value, and sort our nodes by node.value
    root = d3.hierarchy(data);

    // Determines size of each slice based on the topSize
    // TODO: Violates DRY (this logic exists below) -- but maybe that's okay?
    if (document.getElementById("top5").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 5) ? d.size : 0; return d.topSize; })
        .sort(function (a, b) { return b.value - a.value; });
    } else if (document.getElementById("top10").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 10) ? d.size : 0; return d.topSize; })
        .sort(function (a, b) { return b.value - a.value; });
    } else {
        root.sum(function (d) { d.topSize = d.size; return d.topSize; })
        .sort(function (a, b) { return b.value - a.value; });
    }

    //
    // if (document.getElementById("top5").checked) {
    //     root.sum(function (d) { d.topSize = (d.rank <= 5) ? d.textCount : 0; return d.topSize; })
    //     .sort(function (a, b) { return b.value - a.value; });
    // } else if (document.getElementById("top10").checked) {
    //     root.sum(function (d) { d.topSize = (d.rank <= 10) ? d.textCount : 0; return d.topSize; })
    //     .sort(function (a, b) { return b.value - a.value; });
    // } else {
    //     root.sum(function (d) { d.topSize = d.textCount; return d.topSize; })
    //     .sort(function (a, b) { return b.value - a.value; });
    // }


    // Calculate the size of each arc; save the initial angles for tweening.
    partition(root);
    //noinspection JSUnresolvedFunction
    arc = d3.arc()
        .startAngle(function (d) { d.x0s = d.x0; return d.x0; })
        .endAngle(function (d) { d.x1s = d.x1; return d.x1; })
        .innerRadius(function (d) { return d.y0; })
        .outerRadius(function (d) { return d.y1; });

    // Add a <g> element for each node; create the slice variable since we'll refer to this selection many times
    slice = g.selectAll("g.node").data(root.descendants(), function(d) { return d.data.name; });
    // .enter().append('g').attr("class", "node");
    newSlice = slice.enter().append("g").attr("class", "node").merge(slice);
    slice.exit().remove();


    // Append <path> elements and draw lines based on the arc calculations. Last, color the lines and the slices.
    slice.selectAll("path").remove();
    newSlice.append("path").attr("display", function (d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style("stroke", "#fff")
        //.style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
        .style("fill", function (d) { return d.parent ? color(d.x0 / 6.28) : "white"; })
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .append("title").text(function (d) { return showTopicName(d, true); }) ;

    // Populate the <text> elements with our data-driven titles.
    slice.selectAll("text").remove();
    newSlice.append("text")
        .attr("dx", function(d) { return (d.parent ? "-30" : ""); } )  // "-20" for rim labels
        .attr("dy", function(d) { return (d.parent ? ".25em" : "-3em"); }) // ".5em" for rim labels
        .text(function(d) {  // Inner circle: Show name; outer circle, show first verbatim
            return showTopicName(d, false);
        })
        .attr("display", function(d) { return d.depth ? null : "none"; });

    // Adds in event handler for the slices
    newSlice.on("click", selectSlice);
}


/**
 * When a user clicks on a sunburst slice, we should highlight the path (update the visual) and then show the texts
 * encompassed by that part of the sunburst.]
 * @param c {node} the clicked node
 */
function selectSlice(c) {

    var clicked = c;
    try {
        // get the path between the clicked node and the root
        var rootPath = clicked.path(root).reverse();
        rootPath.shift(); // remove root node from the array

        newSlice.style("opacity", 0.4);  // Wash out ALL slices
        newSlice.filter(function(d) {

            if (d === clicked && d.prevClicked) {
                // TURN OFF PATH & HIDE TEXTS/TITLES
                // We've click on the last slice clicked & this is the current node (as we loop through all of them).
                d3.select("#topicName").html("");
                d3.select("#topicDetails").html("");
                d3.selectAll(".cardsToggleAll").style("display", "none");
                d3.select("#sidebar").selectAll("div").remove();

                d.prevClicked = false;
                newSlice.style("opacity", 1);
                return true;

            } else if (d === clicked) { // Clicked a new node & this is the node: update path
                // UPDATE PATH, SHOW TEXTS
                d3.select("#topicName").html( showTopicName(c, true) );
                d3.selectAll(".cardsToggleAll").style("display", "block");

                var topic = c.data.name;
                var verbatim = c.data.verbatims;
                currentTextIDs = c.data.textIDs;

                showTexts(topic, verbatim);
                var cards = document.getElementsByClassName("card");
                d3.select("#topicDetails").html(c.data.count + "+ mentions in " + cards.length + " texts");

                d.prevClicked = true;
                return true;
            } else {  // This is not the previously clicked or a newly clicked slice.
                //
                d.prevClicked = false;
                return (rootPath.indexOf(d) >= 0); // return true for this node if it's part of the path
            }
        }).style("opacity", 1);  // All of the above is to create an array for this style command
    } catch(e) {
        // newSlice.filter(function(d) { d.prevClicked = false; return true; }).style("opacity", 1);
        d3.selectAll(".node").style("opacity", 1);
        d3.select("#sidebar").selectAll("span").text("");
        d3.select("#sidebar").selectAll("div").remove();
    
    }
}


/** Once a user clicks on a slice in the sunburst, we will select the proper texts to show based on the topic
 * selected.  Then we'll highlight the selected phrase along with variants ("name" and "verbatims" in the json).
 * @param topic {str} the selected topic of phrase
 * @param verbatims {list} a list of verbatims of the selected topic of phrase
 */
function showTexts(topic, verbatims) {
    // FIXME: use textIDs to determine which texts to show...

    try {

        // SELECT THE TEXTS, and add to the sidebar...
        var divs = d3.select("#sidebar").selectAll("divs")
            .data(allTextsData.filter(function(text, textIDs) {
                // TODO: Find a better way than looking for undefined...
                return currentTextIDs.indexOf(text['id']) > 0;
                //return typeof(text["topics"][topic]) != "undefined";
            }));

        // TODO: What does merge do for me?
        var newDivs = divs.enter().append("divs").merge(divs)
            .html(function (d) {return d.htmlCard; });
        divs.exit().remove();

        // FIND THE TOPIC (use mark.js) [https://markjs.io/]
        var cards = document.querySelectorAll('.cardText');
        var options = {  // https://markjs.io/configurator.html
            "accuracy": { "value": "exactly", "limiters": [",", ".", ";", ":", "!", "?", "[", "]", "(", ")"] },
            "separateWordSearch": false
        };

        // loop through cards and then through verbatims
        for (i = 0; i < cards.length; ++i) {
            var instance = new Mark(cards[i]);

            for (v = 0; v < verbatims.length; ++v) {
                instance.mark(verbatims[v], options);
            }
        }

    } catch (e) { }

}


function showDate() {
    alert("Not yet implemented: " + this.value);
}


/**
 * When the user selects a new corpus (e.g., a new set of texts), this function determines which corpus has been
 * requested, maneges the cascade of functions to update the visualization, clears old conotrols on the page, and
 * marks the "current state" on the button group.
 */
function changeSelectedCorpus() {

    // Did the user click something (which has become current as this.id)? If so, pass the name of the id selected
    // (rather than the object itself). If no current selection, default to corpusA.
    currentCorpus = (this.id ? window[this.id] : corpusA);

    getTopicsData();
    getTextsFile();
    selectSlice();

    // Update Page Labels
    d3.select("#topicName").html("");
    d3.select("#topicDetails").html("");
    d3.selectAll(".cardsToggleAll").style("display", "none");
    d3.select("#sidebar").selectAll("div").remove();

    // Update Corpus Buttons, hold on to the last selected as the "current" state.
    d3.selectAll(".corpus").classed("btn-primary", false);
    if (this.id === "corpusB") {
        d3.selectAll("#corpusB").classed("btn-primary", true);
    } else if (this.id === "corpusC") {
        d3.selectAll("#corpusC").classed("btn-primary", true);
    } else {
        d3.selectAll("#corpusA").classed("btn-primary", true);
    }

}

/**
 * Get a new Topics file
 */
function getTopicsData() {

    // this line assumes that we have a variable with the same name as the this.id assigned (at the top of the file).
    var corpusPath = "Data/Topics-" + currentCorpus + ".txt";

    // Get the data from our JSON file
    d3.json(corpusPath, function(error, topicsData) {
        if (error) throw error;

        allTopicsData = topicsData;
        // var showTopicNodes = JSON.parse(JSON.stringify(topicsData));

        drawSunburst(allTopicsData);
        showTopTopics();
        d3.select("#corpusName").html(currentCorpus);
        d3.select("#corpusAsOf").html("As of " + allTopicsData.run_date.replace('2017-',''));

        if (allTopicsData.data_date) {
            d3.select("#corpusDate").html("Data: " + allTopicsData.data_date.replace('2017-',''));
        }

    });

}

/**
 * Get the correct Texts file based on the corpus button selection.
 */
function getTextsFile() {

    // IMP: Must have var with the same name as this.id (assigned at top of the file currently).
    var corpusPath = "Data/Texts-" + currentCorpus + ".txt";

    // Get the data from our JSON file
    d3.json(corpusPath, function(error, textsData) {
        if (error) throw error;

        // Store texts data for use throughout this page.
        allTextsData = textsData;
    });

}


/**
 * Redraw the sunburst based on user selection of how many topics they want to see. We don't remove slices, we set their
 * size to 0. And we animate the transition. "Top 10" is the default, so this gets called even at initial build.
 */
function showTopTopics() {

    // Create a "topSize" variable to store the size (0 or actual) based on user selection. Return that to the d3.sum
    // function.
    // TODO: Currently I stash a "rank" in all slices. Maybe better to base below calc on either local *or* parent rank?
    if (document.getElementById("top5").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 5) ? d.size : 0; return d.topSize; });
    } else if (document.getElementById("top10").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 10) ? d.size : 0; return d.topSize; });
    } else {
        root.sum(function (d) { d.topSize = d.size; return d.topSize; });
    }


    // if (document.getElementById("top5").checked) {
    //     root.sum(function (d) { d.topSize = (d.rank <= 5) ? d.textCount : 0; return d.topSize; });
    // } else if (document.getElementById("top10").checked) {
    //     root.sum(function (d) { d.topSize = (d.rank <= 10) ? d.textCount : 0; return d.topSize; });
    // } else {
    //     root.sum(function (d) { d.topSize = d.textCount; return d.topSize; });
    // }



    // Recalculate partition data and then animate the redraw of both slices and text.
    partition(root);
    newSlice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    newSlice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText)
        .attr("opacity", function (d) { return d.x1 - d.x0 > 0.07 ? 1 : 0; });
}


/**
 * When switching data: interpolate the arcs in data space.
 * @param {Node} a
 * @return {Number}
 */
function arcTweenPath(a) {

    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);

    function tween(t) {
        var b = oi(t);
        a.x0s = b.x0;
        a.x1s = b.x1;
        return arc(b);
    }

    return tween;
}


/**
 * When switching data: interpolate the text centroids and rotation.
 * @param {Node} a
 * @return {Number}
 */
function arcTweenText(a) {

    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
    function tween(t) {
        var b = oi(t);
        return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
    }
    return tween;
}


/**
 * Calculate the correct distance to rotate each label based on its location in the sunburst.
 * @param {Node} d
 * @return {Number}
 */
function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;

    // Avoid upside-down labels
    //return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
    return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}


/**
 * Expands or contracts a particular Card in the UI based on a link click. Also shows / hides the helper "cardToggle"
 * button.
 * @param cardID {int} The ID of the card. This is an integer assigned by Python when the cards are built.
 * @returns {boolean}
 */
function cardToggle(cardID) {

    var card = document.querySelector("#card_" + cardID);
    if (card.classList.contains("big")) {
        card.classList.remove("big");
        card.style.height = "94px";
        card.style.overflow = "hidden";
        card.scrollTop = 0;
        card.scrollLeft = 0;
        card.querySelector(".cardToggle").style.opacity = 0;

    } else {
        card.classList.add("big");
        card.style.height = "300px";
        card.style.overflow = "auto";
        card.querySelector(".cardToggle").style.opacity = 1;
    }

}


/**
 * Toggle the visibility of all of the cards.
 * @param contract {bool}  Are we contracting?
 */
function cardToggleAll(contract) {

    var cards = document.querySelectorAll('.card');

    for (i = 0; i < cards.length; ++i) {
        card = cards[i];
        if (contract) {
            card.classList.remove("big");
            card.style.height = "94px";
            card.style.overflow = "hidden";
            card.scrollTop = 0;
            card.querySelector(".cardToggle").style.opacity = 0;
        } else {
            card.classList.add("big");
            card.style.height = "300px";
            card.style.overflow = "auto";
            card.querySelector(".cardToggle").style.opacity = 1;
        }
    }
}


/**
 * Toggle (animate) the visibility of the page instructions.
 */
function welcomeToggle() {

    var message = d3.select("#welcomeMessage");
    if (message.classed("big")) {
        message.classed("big", false).transition().style("height", "0px").style("overflow", "hidden");
    } else {
        message.classed("big", true).transition().style("height", "300px").style("overflow", "auto");
    }
}


/**
 * Given a d3 node, we return a string for users to see. We'll either return the name (for the inner-ring) or the
 * first verbatim (for the outer-ring)
 * @param n {node}  the current d3 node object
 * @param showFullVerbatim {bool}  should we show the full topic name or just the 1st couple of words?
 * @returns {string}  the topic name for UI presentation
 */
function showTopicName(n, showFullVerbatim) {
    topicName =  (n.depth < 2 ? n.data.name : n.data.verbatims[0]);

    if (showFullVerbatim) {
        return topicName;
    } else {
        return topicName.split(" ").slice(0,2).join(" ");
    }
}

/**
 * Toggle the visibility of the search box
 */
function searchToggle() {

}

function searchTopic(topic) {

}
