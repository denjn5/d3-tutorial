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
var currentCorpora = 0;  // Tracks which corpus group is currently selected
var currentCorpus;
var currentTextIDs;
var color = d3.scaleLinear().domain([0, 0.5, 1]).range(['#337ab7', '#d3d3d3', '#464545']);
var overRide = '';  // Use this variable to force the use of a specific Topic / Text file pair.
var corpora = [['Testing', ['Psalms', 'Psalms2', 'Revelation', 'Psalms4', 'Psalms5']],
                    ['Gospels', ['Matthew', 'Mark', 'Luke', 'John']],
                    ['Poetry', ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon']],
                    ['Law', ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']]];


d3.select("#corpGrp0").html(corpora[0][0]);
d3.select("#corpGrp1").html(corpora[1][0]);
d3.select("#corpGrp2").html(corpora[2][0]);
d3.select("#corpGrp3").html(corpora[3][0]);

corporaSelectorUpdate();


/**
 * When the user selects a new corpus group, this function determines which corpus group has been
 * requested, manages the button highlighting and updates the radio buttons.
 */
function corporaSelectorUpdate() {

    // set defaults
    d3.selectAll(".corpGrps").classed("btn-primary", false);


    d3.selectAll(".corpGrps").style("display", "none");
    grpButtons = ["#corpGrp0", "#corpGrp1", "#corpGrp2", "#corpGrp3"];
    currentID = this.id ? "#" + this.id : "#corpGrp0";


    for (var g = 0; g < corpora.length; g++) {
        d3.select(grpButtons[g]).style("display", "inline");
        d3.select(grpButtons[g]).html(corpora[g][0]);
        if (currentID === grpButtons[g]) {
            d3.select(grpButtons[g]).classed("btn-primary", true);
            currentCorpora = g;
        }
    }


    // Update the detail radio buttons
    d3.selectAll(".corpDtl").style("display", "none");
    dtlRadios = ["#corpDtl0", "#corpDtl1", "#corpDtl2", "#corpDtl3", "#corpDtl4", "#corpDtl5", "#corpDtl6"];
    dtlLabels = corpora[currentCorpora][1];

    for (var i = 0; i < dtlLabels.length; i++) {
        d3.select(dtlRadios[i]).style("display", "inline");
        d3.select(dtlRadios[i] + " > span").html(dtlLabels[i]);
    }

    corpusSelected();
}


/**
 * When the user selects a new corpus (e.g., a new set of texts), this function determines which corpus has been
 * requested, maneges the cascade of functions to update the visualization, clears old conotrols on the page, and
 * marks the "current state" on the button group.
 */
function corpusSelected() {

    // Did the user click something (which has become current as this.id)? If so, check if there's a variable by
    // this name.  If so, window[this.id] returns the value of that variable.  If not, return the value of corpusA.
    // TODO: Handle when this value doesn't exist or when underlying file doesn't exist.
    corporaDetail = this.value ? this.value.substr(this.value.length - 1) : 0;
    currentCorpus = corpora[currentCorpora][1][corporaDetail];

    getTopicsData();
    getTextsFile();
    selectSlice();

    // Update Page Labels
    d3.select("#topicName").html("");
    d3.select("#topicDetails").html("");
    d3.selectAll(".cardsToggleAll").style("display", "none");
    d3.select("#sidebar").selectAll("div").remove();




}


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
d3.selectAll("input[name=topTopicsSelect]").on("click", showTopTopics);
d3.selectAll("input[name=dateSelect]").on("click", showDate);
d3.selectAll(".corpGrps").on("click", corporaSelectorUpdate);
d3.selectAll(".corpDtl > input").on("click", corpusSelected);

/**
 * Draw the sunburst, which includes sizing the slices, applying colors and labels
 * @param data {json} the topic data (parameterized because we may filter the data before drawing)
 */
function drawSunburst(data) {

    // Find the root node, calculate the node.value, and sort our nodes by node.value
    root = d3.hierarchy(data);

    // Determines size of each slice based on the topSize
    // TODO: Violates DRY (this logic exists below) -- but maybe that's okay?
    if (document.getElementById("top7").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 7) ? d.size : 0; return d.topSize; })
        .sort(function (a, b) { return b.value - a.value; });
    } else {
        root.sum(function (d) { d.topSize = d.size; return d.topSize; })
        .sort(function (a, b) { return b.value - a.value; });
    }


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
                // TODO: "display" works as style.  Seems like sometimes I call it from .attr()...
                d3.selectAll(".cardsToggleAll").style("display", "block");

                var topic = c.data.name;
                var verbatim = c.data.verbatims;
                currentTextIDs = c.data.textIDs;

                showTexts(topic, verbatim);
                var cards = document.getElementsByClassName("card");  // This also selects the card in "help"
                d3.select("#topicDetails").html(c.data.count + "+ mentions in " + c.data.textIDs.length + " texts");

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
                return currentTextIDs.indexOf(text['id']) >= 0;
                //return typeof(text["topics"][topic]) != "undefined";
            }));

        // TODO: What does merge do for me?
        divs.enter().append("divs").merge(divs)
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
        d3.select("#corpusCount").html(allTopicsData.text_count + " texts");

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
    if (document.getElementById("top7").checked) {
        root.sum(function (d) { d.topSize = (d.rank <= 7) ? d.size : 0; return d.topSize; });
    } else {
        root.sum(function (d) { d.topSize = d.size; return d.topSize; });
    }

    // Recalculate partition data and then animate the redraw of both slices and text.
    // "opacity" only show text label if slice is big enough
    partition(root);
    newSlice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    newSlice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText)
        .attr("opacity", function (d) { return d.x1 - d.x0 > 0.06 ? 1 : 0; });
}


/**
 * When switching data: interpolate the arcs in data space.
 * @param {node} a
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
 * @param {node} a
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
 * @param {node} d
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
 * @param contract {boolean}  Are we contracting?
 */
function cardToggleAll(contract) {

    var cards = document.querySelectorAll('.card');

    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
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
 * @param showFullVerbatim {boolean}  should we show the full topic name or just the 1st couple of words?
 * @returns {string}  the topic name for UI presentation
 */
function showTopicName(n, showFullVerbatim) {
    topicName =  (n.depth < 2 ? n.data.name : n.data.verbatims[0]);
    topicName = (n.depth < 2 ? topicName : topicName.replace(n.parent.data.name.toLowerCase(),'*'));

    if (showFullVerbatim) {
        return topicName;
    } else {
        return topicName.split(" ").slice(0,3).join(" ");
    }
}

/**
 * Toggle the visibility of the search box
 */
function searchToggle() {
    alert("coming soon...?")
}

function searchTopic(topic) {

}
