# d3 v4 Sunburst: A Detailed Explanation #
Sunbursts are great for explaining relationships in hierarchical data. But the code can get confusing as we mix html, css, svg, json, javascript, and d3. And, bounce between radians and degrees. 

In this tutorial, I strive to explain each line. If I don't explain it, or explain it well, I welcome your input. For each titled section, we'll begin with the code and then explain it. Maybe it'll help you solve a problem in your own code or build something that you're proud of. 

## A Basic Web Page (html) ##
``` html
<head>
    <script src="Libraries/d3.v4.js"></script>
</head>
<body>
    <svg></svg>

    <script>
    <!–– d3 logic goodness here ––> 
    </script>
</body>
```
This very basic web page has includes 2 ```<script>``` sections
1) In the ```<head>```: points the browser to our d3 library, that we've stored in a "Libraries" subdirectory.
2) In the ```<body>```: will hold all of the code shared below.

The ```<body>``` section also contains a ```<svg>``` element. This is where our d3 visualization will actually get drawn.


## The Data (json) ##
``` javascript
var nodeData = {
    "name": "TOPICS", "children": [{
        "name": "Topic A",
        "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]
    }, {
        "name": "Topic B",
        "children": [{"name": "Sub B1", "size": 3}, {"name": "Sub B2", "size": 3}, {
            "name": "Sub B3", "size": 3}]
    }, {
        "name": "Topic C",
        "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]
    }]
};
```
JSON for a sunburst is structured as a hierarchy. This JSON contains data about 11 **nodes**. (We'll call these **arcs** when we calculate each node's size in d3 code. And we sometimes call them **slices** when we're looking at our visualization.).  The very first node is called the **root** node (in our code above: ```"name": "TOPICS"```). The root node is a sort of anchor for our data and visualization, and we often treat it differently since it's the center of or sunbust. We define each node in the above data in 1 of 2 ways:

1) ```{ "name": "abc", "children": [] }``` describes a node that has children. Size isn't defined for these nodes, because it'll be adopted (calculated by d3) based on children nodes. Children will either be more nodes like this one, with children of their own, or nodes with a "size" when it has no children.

2) ```{ "name": "zyz", "size": 4 }``` describes an end node with no children. The hierarchy doesn't need to be symmetrical in any way if.  Nodes can have differing numbers of children, or have "sibling" nodes that have no children at all).

  
## Initialize Variables (javascript & d3) ## 
``` javascript
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);
```

We'll set 4 variables that we can use throughout our code:
* ```var width = 500``` creates a variable set to 500; it does not actually set the width of anything, yet. Below we'll apply this variable to the ```<svg>``` element's width attribute. We could set width directly (```<svg width=500>```). But we'll use this values a few times. If we coded it directly, we'd then need to change each occurances every time. Mistakes will happen.

* ```var radius = Math.min(width, height) / 2``` determines which is smaller (the ```min```), the width or height. Then it divides that value by 2 (since the radius is 1/2 of the circle's diameter). Then we store that value as our radius. This optimizes the size of our viz within the ```<svg>``` element (since we don't want to leak past the edges, but we also don't want a bunch of wasted white space). Since width and height are both 500, the radius variable will equal 250.

* ```d3.scaleOrdinal```: d3 scales help us map our data to something in our visual. Outside of d3, *ordinal scales* indicate the direction of the underlying data and provide nominal information (e.g., low, medium, high). In the same way, scaleOrdinal in d3 allows us to relate a part of our data to something that has a series of named values (like an array of colors). 

* ```schemeCategory20b``` is a d3 command that returns an array of colors. d3 has several similar options that are specifically designed to work with ```d3.scaleOrdinal()```.  The result of this line is that we'll have a variable ("color") that will return a rainbow of options for our sunburst.


## Setting up our SVG workspace (html & svg) ##
``` javascript
var g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
```

1) ```d3.select('svg')``` selects our ```<svg></svg>``` element so that we can work with it. The ```d3.select()``` command finds the first element (and only the first, if there are multiple) that matches the specified string. If the select command doesn't find a match, it returns an empty selection. 

2) ```.attr('width', width)``` sets the width attribute of our ```<svg>``` element.

3) ```.attr('height', height)``` does the same as the width.

4) ```.append('g')``` adds a ```<g>``` element to our SVG. ```<g>``` doesn't do much directly, it's is a special SVG element that acts as a container; it groups other SVG elements. And transformations applied to the ```<g>``` element are performed on all of its child elements. And its attributes are inherited by its children. That'll be helpful later.

5) ```.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')``` sets the value for the ```transform``` attribute (as we did with ```width``` above). SVG's transform attribute allows us to scale, translate (move), and rotate our ```<g>``` element (and it's children). There's a longer conversation to be had about the SVG coordinate system (See [Sara Soueidan's article](https://sarasoueidan.com/blog/svg-transformations/) helps clarify the mechanics.). For now, we'll simply say that we'll use this tranform attribute to move the "center" [0,0] of our ```<g>``` element from the upper-left to the actual center of our ```<svg>``` element:
    * ```'translate(' + width / 2 + ',' + height / 2 + ')'``` will resolves to ```translate(250, 250)```. This command moves our coordinate system (for ```<g>```) 250 units right (x-axis) and 250 units down (y-axis). 


### Method Chaining & the HTML ###
*Method chaining* allows us to connect multiple commands together with periods between into a single statement, like we've done above. It's important to recognize that each d3 method returns something, and the next method in the chain applies to that something. Here's the above code, with a note about what each line returns:
``` javascript
var g = d3.select('svg')  // returns a handle to the <svg> element
    .attr('width', width)  // sets the width of <svg> and then returns the <svg> element again
    .attr('height', height)  // (same as width)
    .append('g')  // adds a <g> element to the <svg> element. It returns the <g> element
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');  // takes the <g> element and moves the [0,0] center over and down
```
1) ```d3.select('svg')``` returns a handle to the ```<svg>``` element.
2) ```attr('width', width)``` sets the width of ```<svg>``` and then returns the ```<svg>``` element again.
3) ```attr('height', height)``` (same as width).
4) ```append('g')``` adds a ```<g>``` element to the ```<svg>``` element. It returns the ```<g>``` element.
5) ```attr('transform', ...)``` takes the ```<g>``` element and moves the [0,0] center over and down.
Method chaining is key to understanding what's going on in most all d3 code. To fully "get" the meaning of a code block, we must understand both what the method does and what it returns. (Want more? See Scott Murray's [Chaining methods](http://alignedleft.com/tutorials/d3/chaining-methods) article.)

Another way to think about the progression of our d3 is to see our html elements grow through each step. Thinking about the same 1-5 steps above, we'd see the following happen:
1) ```<svg></svg>```
2) ```<svg width="500"></svg>```
3) ```<svg width="500" height="500"></svg>```
4) ```<svg width="500" height="500"><g></g></svg>```
5) ```<svg width="500" height="500"><g transform="translate(250,250)"></g></svg>```


## Formatting the Data (d3) ##
``` javascript
var partition = d3.partition()
    .size([2 * Math.PI, radius]);
```
The ```partition``` command is a special tool that will help organize our data into the sunburst pattern, and ensure things are properly sized (e.g., that we use all 360 degrees of the circle, and that each slice is sized relative to the other slices.) So far, this is about structure, since we haven't linked it to our actual data yet.

```size``` sets this partition's overall size "width" and "height". But we've shifted from an [x,y] coordinate system (where a box could be 25 by 25] to a system where we size each part of our sunburst in radians (how much of the 360 the shape will consume) and depth (distance from center to full radius): 
* ```2 * Math.PI``` tells d3 the number of **radians** our sunburst will consume. Remember from middle-school geometry that a circle has a circumfrance of 2πr (2 * pi * r). This coordinate tells d3 how big our sunburst is in "radiuses". The answer is that it's 2π radiuses (or *radians*). So it's a full circle. 
    * Want a sunburt that's a ½ circle? Delete the ```2 * ```.
    * Want to better understand radians and how they map to degrees? Try [mathisfun: radians](https://www.mathsisfun.com/geometry/radians.html) or [Intuitive Guide to Angles, Degrees and Radians](https://betterexplained.com/articles/intuitive-guide-to-angles-degrees-and-radians/). 
* ```radius``` takes our variable, set above, and tells d3 that this is the distance from the center to the outside of the sunburst.

## Find the Root Node (d3) ##
``` javascript
var root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size});
```



