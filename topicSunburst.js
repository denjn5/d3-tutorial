/**
 * Created by drichards on 4/28/17.
 */

/*

TODO: Document functions and variables
TODO: Rotate labels
TODO: Fix article inclusion
TODO: Fix color palette (reds / greens for article, blue range for sunburst, [?] for corpus buttons)
TODO: Fix root label.
TODO: Shrink center (root)?

Phase 2:
* Article Sort
* Article Like, Junk (bad match)
* Improve chooser button coloring (once we have 3)
* Default sunburst to Top 5 (update labels)
* Colorblind palette and toggle
 */

// Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);
var arc;
var allTopicsData;
var allTextsData;
var slice;
var newSlice;
var root;
var currentCorpus;
var corpusA = 'Genesis';  // These variable names bind us to the buttonGroupIDs
var corpusB = 'Jonah';  // And the variable values must correspond to the file name
var corpusC = 'Revelation';  // And these values are used for the buttonGroup labels.


document.getElementById("corpusA").innerHTML = corpusA;
document.getElementById("corpusB").innerHTML = corpusB;
document.getElementById("corpusC").innerHTML = corpusC;

// Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
var g = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create our sunburst data structure and size it.
//noinspection JSUnresolvedFunction
var partition = d3.partition()
    .size([2 * Math.PI, radius]);

changeSelectedCorpus();
// getTopicsData();
// getTextsFile();

d3.selectAll("input[name=topTopicsSelect]").on("click", showTopTopics);
d3.selectAll("input[name=dateSelect]").on("click", showDate);
d3.selectAll("button.corpus").on("click", changeSelectedCorpus);


function drawSunburst(data) {

    // Find the root node, calculate the node.value, and sort our nodes by node.value
    root = d3.hierarchy(data)
        .sum(function (d) { return d.size; })
        .sort(function (a, b) { return b.value - a.value; });

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
        .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
        .attr("display", function(d) { return d.depth ? null : "none"; });

    // Populate the <text> elements with our data-driven titles.
    slice.selectAll("text").remove();
    newSlice.append("text")
        //.attr("transform", function(d) {
         //   return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
        .attr("dx", function(d) { return (d.parent ? "-30" : ""); } )  // "-20" for rim labels
        .attr("dy", function(d) { return (d.parent ? ".25em" : "-3em"); }) // ".5em" for rim labels
        .text(function(d) { return d.data.name.split(" ").slice(0,2).join(" "); })
        .attr("display", function(d) { return d.depth ? null : "none"; });
        //.attr("opacity", function (d) { return d.x1 - d.x0 > 0.06 ? 1 : 0; });
    // TODO: Text "wrap" for longer lines... (and add ellipsis for strings longer than 2 words)

    newSlice.on("click", selectSlice);
}


// Redraw the Sunburst Based on User Input
function selectSlice(c) {

    var clicked = c;
    //try {

        //var div = d3.select("#sidebar").selectAll("div").data(c.data.articles);
        var rootPathOrig = clicked.path(root);
        var rootPath = rootPathOrig.reverse();
        rootPath.shift(); // remove root node from the array

        newSlice.style("opacity", 0.4);
        newSlice.filter(function(d) {
        // We clicked on the last slice clicked & this is the node: unchoose everything
            if (d === clicked && d.prevClicked) {
                d3.select("#topicName").html("");
                d3.select("#sidebar").selectAll("div").remove();

                d.prevClicked = false;
                newSlice.style("opacity", 1);
                return true;

            } else if (d === clicked) { // Clicked a new node & this is the node: update path

                // try {
                    d3.select("#topicName").html("Topic: '" + c.data.name + "'");

                    // Add texts to the sidebar...
                    // TODO: Do I really want to name this "id"?
                    var divs = d3.select("#sidebar").selectAll("divs")
                        .data(allTextsData.filter(function(text) {
                                return text['topics'].indexOf(c.data.name) >= 0; }));
                    var newDivs = divs.enter().append("divs").merge(divs)
                        .html(function (d) {return d.htmlCard; });
                    divs.exit().remove();
                //} catch (e) { }

                d.prevClicked = true;
                return true;
            } else {
                d.prevClicked = false;
                return (rootPath.indexOf(d) >= 0);
            }
        }).style("opacity", 1);
    // } catch(e) {
    //     newSlice.filter(function(d) { d.prevClicked = false; return true; }).style("opacity", 1);
    //     d3.select("#sidebar").selectAll("span").text("");
    //     d3.select("#sidebar").selectAll("div").remove();
    //
    // }

}


function showDate() {
    alert("Not yet implemented: " + this.value);
}


function changeSelectedCorpus() {

    currentCorpus = (this.id ? window[this.id] : corpusA);

    getTopicsData();
    getTextsFile();

    // Update Page Labels
    d3.select("#corpusName").html(currentCorpus);
    d3.select("#topicName").html("");
    d3.select("#sidebar").selectAll("div").remove();

    // Update Corpus Buttons
    d3.selectAll(".corpus").classed("btn-primary", false);
    if (this.id === "corpusB") {
        d3.selectAll("#corpusB").classed("btn-primary", true);
    } else if (this.id === "corpusC") {
        d3.selectAll("#corpusC").classed("btn-primary", true);
    } else {
        d3.selectAll("#corpusA").classed("btn-primary", true);
    }

}

function getTopicsData() {

    // this line assumes that we have a variable with the same name as the this.id assigned (at the top of the file).
    var corpusPath = "Data/Topics-" + currentCorpus + ".json";

    // Get the data from our JSON file
    d3.json(corpusPath, function(error, topicsData) {
        if (error) throw error;

        allTopicsData = topicsData;
        var showTopicNodes = JSON.parse(JSON.stringify(topicsData));

        drawSunburst(showTopicNodes);
        showTopTopics();

    });

}

/**
 * Get the correct Texts file based on the corpus button selection.
 */
function getTextsFile() {

    // IMP: Must have var with the same name as this.id (assigned at top of the file currently).
    var corpusPath = "Data/Texts-" + currentCorpus + ".json";

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

    // Recalculate partition data and then animate the redraw of both slices and text.
    partition(root);
    newSlice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);
    newSlice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText)
        .attr("opacity", function (d) { return d.x1 - d.x0 > 0.06 ? 1 : 0; });
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
