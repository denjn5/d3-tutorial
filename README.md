# d3 v4 Sunburst: A Detailed Explanation #
Sunbursts are great for explaining relationships in hierarchical data. But the code can get a bit confusing as we mix html, css, svg, json, javascript, and d3. And, bounce between radians and degrees. 

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

```var width = 500``` creates a variable set to 500; it does not actually set the width of anything, yet. Below we'll apply this variable to the ```<svg>``` element's width attribute. We could set width directly (```<svg width=500>```). But we'll use this values a few times. If we coded it directly, we'd then need to change each occurances every time. Mistakes will happen.

```var radius = Math.min(width, height) / 2``` determines which is smaller (the ```min```), the width or height. Then it divides that value by 2 (since the radius is 1/2 of the circle's diameter). Then we store that value as our radius. This optimizes the size of our viz within the ```<svg>``` element (since we don't want to leak over the edges, but we also don't want a bunch of wasted white space). Since both width and height are 500 here, the radius variable will equal 250. Eventually, this will become our sunburst's actual radius, once we do something with the variable.

```d3.scaleOrdinal```: Scales help us map something in our data to something in our visual. Outside of d3, *ordinal scales* indicate the direction of the underlying data and provide some nominal information (e.g., low, medium, high).  So this type of scale in d3 allows us to relate something in our data to something that has a series of named values (like an array of colors). ```schemeCategory20b``` is a d3 command that returns an array of colors. d3 has several similar options that are specifically designed to work with ```d3.scaleOrdinal()```.  The result of this line is that we'll have a variable ("color") that will return a rainbow of options for our sunburst.

## Set up our SVG workspace (html & svg) ##
``` javascript
var g = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
```

```d3.select('svg')``` selects our ```<svg></svg>``` element so that we can work with it. The select command finds the first element (and only the first, if there are multiple) that matches the specified selector string ("svg" in this case). If the select command doesn't find a match, it returns an empty selection. Often you'll see people create the ```<svg>``` element via code, like this: ```d3.select("body").append("svg")```

```.attr('width', width)``` sets the width attribute of our selected ```<svg>``` element. In HTML, we could have set it directly with ```<svg width="500">```. But we'll use the width variable a few times, so it's better as a variable.

```.append('g')``` adds a ```<g>``` element to our SVG. ```<g>``` is a special SVG element that acts as a container; it's used to group other SVG elements. Transformations applied to the ```<g>``` element are performed on all of its child elements, and any of its attributes are inherited by its child elements.


```.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')``` looks a bit more complex. First we see that ```.attr('transform', ...)``` sets the value for the ```'transform'``` attribute. The transform attribute allows us to scale, translate (move), rotate, etc. our <g> element and it's children. In this case we'll move our ```<g>``` element using the translate function.

```'translate(' + width / 2 + ',' + height / 2 + ')'```. If our width and height are each 500, this formula resolves to ```translate(250, 250)``` which moves our coordinate system for our ```<g>``` element 250 units right (x-axis) and 250 units down (y-axis). This can be a bit confusing, and brings up 2 questions: 
1) Why "down"? Because SVG's coordinate system starts with 0,0 in the upper-left corner; x values move things to the right and y values move things down. 
2) What's the point this translate statement? It moves 0,0 from the upper-left corner to the *center* of our ```<svg>``` element. Now, our ```<svg>``` container, if it's 400 wide, stretches from -200 to 200, instead of 0 to 400. (Wanna diver deeper? See [Sara Soueidan's article](https://sarasoueidan.com/blog/svg-transformations/) helps clarify the mechanics.)

### Method Chaining & the HTML ###
NOTE: d3 leverages method chaining. That means that we can sometimes connect multiple commands together into a
single statement, like we've done below. To understand method chaining, it's important to recognize that each
method returns something, and the next method in the chain applies to that something. To keep it simple for now,
let's just look at how it works in the example below:
1) ```d3.select('svg')``` returns a handle to the ```<svg>``` element. (HTML: )
2) ```attr('width', width)``` sets the width of ```<svg>``` and then returns the ```<svg>``` element. (HTML: )
3) ```attr('height', height)``` sets the height of ```<svg>``` and then returns the ```<svg>``` element. (HTML: )
4) ```append('g')``` adds a ```<g>``` element to the ```<svg>``` element, then it returns the ```<g>``` element. (HTML: )
5) ```attr('transform', ...)``` moves 0,0 (the center) of the ```<g>``` element. (HTML: )
Method chaining happens often in Javascript and is key to understanding what's going on in the d3 code. To fully "get" the meaning of a code block, we must understand both what the method does and what it returns.

Another way to think about the progression is to watch the elements grow through each step:
1) ```<svg></svg>```
2) ```<svg width="500"></svg>```
3) ```<svg width="500" height="500"></svg>```
4) ```<svg width="500" height="500"><g></g></svg>```
5) ```<svg width="500" height="500"><g transform="translate(250,250)"></g></svg>```

## Correctly Formatting the Data (d3) ##
``` javascript
var partition = d3.partition()
    .size([2 * Math.PI, radius]);
```
The ```partition``` command is a special tool that will help transform our data (later) into the actual sunburst pattern, and ensure it's properly sized (e.g., that we use all 360 degrees of the circle, and that each slice is sized relative to the other slices.  If an underlying datum has a size that is 2 times as large as another datum, then partition helps us see that in the final product. (Though the hierarchy command below plays an important role also.)

```size``` sets this partition's overall size ```["width", "height"]```.
* 2π (aka, 2 * Math.PI) is the number of radians to set your circle a full 360°. Want a ½ circle? Set size as π (Math.PI).
* radius sets the overall distance from the center to the outside of the circle; we set this distance way above
based on the size of our ```<svg>``` element.

## Find the Root Node (d3) ##
``` javascript
var root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size});
```



