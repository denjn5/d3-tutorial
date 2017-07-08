<!--- Sunburst Tutorial (d3 v4), Part 3 -->

## Smooth Updates and Sorting
In this tutorial we'll begin with our [Tutorial 2](https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af) Sunburst and add just 2 features:

1. sort slices by size
2. smooth updating based on user input.

We'll explain new features in detail, line-by-line. If we don't explain a line below, it's likely covered in a previous version:

1. [Tutorial 1](https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5): A "No Frills" Sunburst
2. [Tutorial 2](https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af): Add Labels & an External json File

If you're viewing this on [bl.ocks.org page](https://bl.ocks.org/denjn5/3b74baf5edc4ac93d5e487136481c601), scroll to the bottom to see the uninterrupted sunburst code, based on d3 version 4. Feedback welcome.

Do good!  —David Richards


## Make Labels "Non-Selectable"
In Tutorial 2, the label text was selectable.  That'll get annoying as we're clicking around on an interactive viz. We've added a line to our CSS to avoid that.

``` html
<style>
text { pointer-events: none; }  /* Make text "non selectable" */
</style>
```

The new style directive `text { pointer-events: none; }` tells our page that whatever is in the `<text>` element is not selectable with the mouse-pointer


## Formatting Our Page
We'll begin by dividing our page into 2 sections (main on the left, and sidebar on the right) and use the CSS style section to tell the browser how big each section is.

``` html
<body>
    <svg></svg>
    <label><input class="sizeSelect" type="radio" name="mode" value="size" checked /> Size</label>
    <label><input class="sizeSelect"  type="radio" name="mode" value="count" /> Count</label>
</body>
```

In our html body we've added two lines after our `<svg>` tag to get user input. 

`&lt;input class="sizeSelect" type="radio" name="mode" value="size" id="radioSize" checked>` is our actual radio button element.  
* class="sizeSelect" so that we can get a hold of it with d3.
* type="radio" tells html that this is a radio button.
* name="mode" tells html that all radio buttons with this name act as a unit, so if one is chosen, the others are un-chosen.
* value="size" is what we'll test for to see which radio button the user clicked.
* checked sets our default value.

Enclosing the input element and related label with a label element (`<label><input ...> Size</label>`) allows users to click on the word "Size" as if it's part of the radio button. Much more intuitive than forcing them to click the exact radio button.

The 2nd line is nearly identical to the first.  It creates the "Count" radio button.


## Sort the Slices
We've defined root just like this since Tutorial 1. Now we'll sort each slice by it's calculated value.

``` javascript
var root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size; })
    .sort(function(a, b) { return b.value - a.value; });
```

The new line above, `.sort(function(a, b) { return b.value - a.value; })`, sorts each node in comparison to its siblings using the requested comparison. In our case, we're comparing the "value" attribute that we just created for each node in .sum() above (See Tutorial 1 for a refresher here). Unlike our normal data-processing function (e.g., the one in the .sum() command), the compare function needs two nodes’ data (a and b). [Node.Sort](https://github.com/d3/d3-hierarchy/blob/master/README.md#node_sort) provides more details about how this function works.

## Store Begin States
Later in our code we'll animate a transition between our sunburst's current state and a new state. In order to do that, we need to know both the start and finish states. We've made a small adjustment to our arc equation to save the "start" states for our angles.
``` javascript
arc = d3.arc()
    .startAngle(function (d) { d.x0s = d.x0; return d.x0; })
    .endAngle(function (d) { d.x1s = d.x1; return d.x1; })
    .innerRadius(function (d) { return d.y0; })
    .outerRadius(function (d) { return d.y1; });
```

We've made a couple of small updates to our d3.arc functions below. Down below we'll be "tweening" (animating a change from one state to the next) our sunburst. At each small step of the animation, we need to know what our startAngle (x0) and endAngle (x1) were originally (so that when we re-calculate arc, we have a starting point. We've added:
* `d.x0s = d.x0` to our startAngle function. The creates a new attribute in each data node named x0s. The new x0s element contains our startAngle so that we'll have it later.
* `d.x1s = d.x1` to our endAngle function. It'll also help use later when we're tweening.

Also, we dropped the `var` prefix for our arc variable. The scope of a variable declared with var is its current execution context (e.g., enclosing function). Dropping var makes it visible outside of the `d3.json()` call. This allows us to place functions that use arc at the bottom for cleaner code.

## Slice variable
We'd like to create a handle for the g elements that contain each slice in our viz. We'll refer to this group of elements often. So we've taken what was a single block and broken it into two.

``` javascript
var slice = g.selectAll('g')
    .data(root.descendants())
    .enter().append('g').attr("class", "node");

slice.append('path').attr("display", function (d) { return d.depth ? null : "none"; })
    .attr("d", arc)
    .style('stroke', '#fff')
    .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });
```

Above we create a _slice_ variable that references our <g class="node"> elements.  Then we start with that when we add our <path> elements. We'll use _slice_ often.

## Get User Input; Redraw the Sunburst
We'd like to update our Sunburst based on user input. By default, our node slices are sized based on the "size" attribute within each node (well, it's our default because we built the sunburst that way).  Now we'd like an alternate presentation where the slices are sized based only on the count of child nodes. Happily, we can use d3 to handle web page interaction and events (beyond pure visualization work).
        
We've added the short section of code below within our d3.json() block. It's the secret sauce to respond to the user's radio button clicks and update the sunburst. In summary, we select our radio buttons, add a click-event watcher, then when the button is clicked we re-calculate the node.value attribute, update our arc size calculations, and then tell d3 to animate the change. The coolest part of this process is we animate both the arc updates and the text motion. 

``` javascript
d3.selectAll(".sizeSelect").on("click", function(d,i) {  // <-- 1

    // Determine how to size the slices.
    if (this.value === "size") {  // <-- 2
      root.sum(function (d) { return d.size; });  // <-- 3
    } else {  // <-- 2
      root.count();  // <-- 4
    }
    root.sort(function(a, b) { return b.value - a.value; });  // <-- 5
    
    partition(root);  // <-- 6

    slice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath);  // <-- 7
    slice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText);  // <-- 8

});
```

Let's break down each line above and see what it does:

1. `d3.selectAll(".sizeSelect")` gets a handle on the 2 radio button `<input class="sizeSelect">` elements we defined above (in the same way that it helps us get a hold of elements within the SVG).
    1. `.on("click", function(d,i) { ... })` adds an event listener to our selected elements. The event listener will fire if one of the elements is clicked (we could have called out any other compliant event) and run the code that's in our `function(d,i) {}` block.
    2. The `function(d,i) {}` returns the object where the event occurred as keyword "this". So it'll represent one or the other of our radio button elements.

2. `if (this.value === "size") {} else {}` helps us determine what the user selected. Remember from our html `<input>` elements above, they each have a value attribute. (NOTE: The this.value refers to the `<input value="...">` attribute. This is different than the value attribute in the node.) So we determine where the user clicked by inspecting the value of the element that was clicked: `this.value === "size"`.
    1. As we've seen, d3 uses the node "value" attribute to calculate the arc size. So we need to recalculate the "value" for each node in our sunburst. But we need to know what the user clicked. 

3. If the user clicked the "Size" radio button, then we'll calculate the node.value as we did initially, based on each node's (and it's child node's) sizes: `root.sum(function (d) { return d.size; })`

4. If the user clicked the "Count" radio button, then we'll calculate node.value based on the count of each node's children, using `root.count()`.

5. `root.sort(function(a, b) { return b.value - a.value; })` is a repeat of the sort command we did above when we first calculated the value of each node in our sunburst. We need to re-sort our data each time we update the "value". While our current data does not create an order change when we toggle between Size and Count, other data sets would create changes in the sort order. For example, you'd see a change in order if one of our topics (e.g., Topic B) had a bunch of small nodes (each with a small d.size). In that case, it would fall below other topics when _size_ is key, but rise above when ordered by _count_.

6. `partition(root)` updates the node value calculations for each arc.  Now we're ready to actually update the visible sunburst on the screen, which means we'll need to update both the slice paths <path d=""> and the label location and rotation (as part of the <text> element). There's a lot happening in these lines, so lets break it into parts...

7. `slice.selectAll("path").transition().duration(750).attrTween("d", arcTweenPath)`
    1. `slice` is our previously defined d3 handle on our <g class="node"> elements.
    2. `.selectAll("path")` clarifies that we're only referring to the <path> element children of slice.
    3. `.transition()` animates our changes to the sunburst. Instead of applying changes instantaneously, this transition smoothly interpolate each element from one state to the next over a given duration.
    4. `.duration(750)` sets the timing of our transition in milliseconds (750 = 3/4 of a second).
    5. `.attrTween("d", arcTweenPath)` tells d3 that we're transitioning an attribute with the selected element list and it tells d3 which element and which function will do the actual calculations:
        * `"d"` tells d3 to act upon the d attribute of the path element (e.g., <path d="...">). This "d" does not refer to d3's ubiquitous data variable.
        * `arcTweenPath` is the "tween factory" -- the local function (we'll define it below) that will calculates each step along the way.

8. `slice.selectAll("text").transition().duration(750).attrTween("transform", arcTweenText)` has just a few differences from the line above it:
    1. `.selectAll("text")` indicates that it's acting on our <text> element.
    2. `.attrTween("transform", arcTweenText)` tells d3 that we're tweening the "transform" attribute of the text element (e.g., `<text transform="...">`).  And we'll use arcTweenText to make the calculations -- d3 calls this our tween factory.


## The "Tween" Factory that Animates the Arc Update
The arcTweenPath function gets called one time for each node in our sunburst. It's job is to return a new function (tween) that gets run a bunch of times in rapid succession. tween's job is to recalculate the startAngle (x0) and endAngle (x1) incrementally, moving from the "old" value to the "new" value.

``` javascript
function arcTweenPath(a, i) {

    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);  // <-- 1
    function tween(t) {  // <-- 2
        var b = oi(t);  // <-- 3
        a.x0s = b.x0;  // <-- 4
        a.x1s = b.x1;  // <-- 4
        return arc(b);  // <-- 5
    }

    return tween;  // <-- 6
}
```

1. d3.interpolate(a,b) encompasses a whole series of helper functions that allow us to transitions smoothly from one value to another. For example `d3.interpolateNumber(10, 20)` might return 10, 12, 14, 16, 18, 20. We're interpolating the radian values for each slice startAngle and endAngle. Interpolate will calculate the range of values for any variable that it finds in both the _a_ and _b_ positions (_x0_ and _x1_ in our case). It will keep the final value throughout the process for any variable it finds only in the b position (all of the rest of the attributes of _a_--which you'll remember represents the current node)
    1. `var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a)` returns a function that will be called iteratively for values x0 and x1. It uses the x0s and x1s values that we stashed in the node data when we calculated the arc.
    2. See [d3-interpolate](https://github.com/d3/d3-interpolate/blob/master/README.md) for more details.

2. `function tween(t) {}` will get passed back to the `attrTween()` function above. It'll get run numerous times in rapid succession (almost 50 times per node in this example). Its job is to recalculate the startAngle (x0) and endAngle (x1) incrementally, moving from the "old" value to the "new" value.

3. In tween(t), t is a number between 0 and 1. When we submit it to oi, our interpolator (in the statement `var b = oi(t)`) will return the value for each variable a commensurate distance through the interpolation. From our example above, if `var oi = d3.interpolateNumber(10, 20)` and `t = 0.1`, then `oi(t)` would equal 11. (Okay, I'm rounding here to keep it simple. So it will return a number close to 11.) Then when t = 0.5, oi(t) will yield 15 (roughly).
    1. NOTE: This line creates a full node equal to the one we started with (a), but x0 and x1 have the interpolated value.

4. `a.x0s = b.x0` stashes our current new x0 value for the next iteration. This is very similar to what we did when we calculated arc above. (Frankly, I keep wanting to delete this line since it seems redundant to our arc calculation stash. But when I do, the animation gets clunky. I haven't worked out why yet, so I'm leaving this line in place.)
 
5. As mentioned above, _b_ represents a full node of data (it has all of the same attributes and attribute values as node _a_, with the exception of the interpolated values). So we'll send node _b_ into the _arc_ generator function and return that arc to the `attrTween()` function above. attrTween will populate the d attribute in the path element (e.g., `<path d="...">`).

6. return tween sends the newly created tween function back to `attrTween()` so that it can do all of the great work we talked about above.


## The "Tween" Factory that Animates the Text Location and Rotation
The arcTweenText function operate nearly identically to arcTweenPath, and shares most of the same lines.  However, instead of recreating the arc path repeatedly this will recreate the text transform attribute repeatedly.

``` javascript
function arcTweenText(a, i) {

    var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
    function tween(t) {
        var b = oi(t);
        return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")";
    }
    return tween;
}
```

The only different line in arcTweenText (from arcTweenPath) is `return "translate(" + arc.centroid(b) + ")rotate(" + computeTextRotation(b) + ")"`.  And we've seen this line before.  It's identical to the line we use to set the <text transform="..."> state when we first added labels in Tutorial 2. However, this time, it'll get called many times in rapid succession in order to animate the movement and rotation of our labels.

Excellent! You've made it through 3 tutorials (right?). I'm hoping that you now have a much better handle on d3 interpolators and tweening. I certainly do. 
