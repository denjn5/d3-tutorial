# d3 v4 Sunburst: A Detailed Explanation #
I wish there were more d3 version 4 sunburst tutorials. Sunbursts are great for explaining relationships in hierarchical data. However, the code can get a bit confusing as we mix html, css, svg, json, javascript, and d3. And, bounce between radians and degrees. I sometimes struggle when reviewing my own 6-month-old code. So this sunburst tutorial is for both of us. I'm hopeful and confident that you'll be able to follow this example and build something that you're proud of. 

In this tutorial, I strive to explain each line, and sometimes link to other tutorials that have helped me. If I don't explain it, or explain it well, I welcome your input. For each section, we'll begin with a title, some code, and the explanation.

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
This basic web page has includes 2 ```<script>``` tags
1) in the <head> points to our d3 library, that we've stored in the Libraries subdirectory
2) in the <body> will hold our d3 logic

The <body> section also contains and <svg> element.  This is where our d3 visualization will get drawn.

## Our Data (json) ##
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
JSON for a sunburst is structured as a hierarchy. Each **node** in the data (we'll also call these **arcs** when we draw them in d3 and **slices** when we're looking at our visualization), has a "name" and either "children" (with nodes under them) or a "size" (if it is childless). We'll call the very first node (```"name": "TOPICS"```) is called the **root** node. The root node is important as we create our sunbust (it's the center of the circle). We define each node in 1 of 2 ways:

1) ``` jacascript { "name": "abc", "children": [] }``` describes a node that has children. Size isn't defined for these nodes, because it'll be adopted (calculated by d3) based on children nodes. Children will either be more slices like this one, with children of their own, or nodes with a "size" when it has no children.

2) ```{ "name": "zyz", "size": 4 }``` describes an end slice (with no children). Slice configuration does not need to symmetrical. Often, one slice will be an end-point while another slice in the same list will have children.  Or slices will have differing numbers of children, as below. Last, more complex slice definitions are valuable, but not necessary in this simple example. */
  
## Initialize Variables (javascript & d3) ## 
``` javascript
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20b);
```

We set 4 variables here, ones that we'll use a few times.  They're also worth a few comments:

```var width = 500``` creates a variable set to 500, it does not actually set the width of anything, yet. That will
happen below when we apply this variable to the ```<svg>``` element's width attribute. Why don't we set width and height directly (```<svg width=500 height=500>```)? Because we'll use these values a few times and if we code them directly, we'll have to change all of their occurances every time. Stuff will break.

```var radius = Math.min(width, height) / 2``` determines which is smaller, the width or height, then it divides that value by 2 (since the radius is 1/2 of the circle's full diameter). It sets that value as our radius. This optimizes the size of our viz within the <svg> (since we don't want to leak over the edges, but we also don't want a bunch of wasted white space). Since both width and height are 500 here, the radius variable will equal 250. Eventually, this will become our sunburst's actual radius, once we do something with the variable.

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
based on the size of our <svg> element.

## Find the Root Node (d3) ##
``` javascript
var root = d3.hierarchy(nodeData)
    .sum(function (d) { return d.size});
```



