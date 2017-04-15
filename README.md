# d3 v4 Sunburst: A Detailed Explanation #
I wish there were more d3 version 4 sunburst tutorials. Sunbursts are great for explaining relationships in hierarchical data. However, the code can get a bit confusing as we mix html, css, svg, json, javascript, and d3. And, bounce between radians and degrees. I sometimes struggle when reviewing my own 6-month-old code. So this sunburst tutorial is for both of us. I'm hopeful and confident that you'll be able to follow this example and build something that you're proud of. 

In this tutorial, I strive to explain each line, and sometimes link to other tutorials that have helped me. If I don't explain it, or explain it well, I welcome your input. For each section, we'll begin with a title, some code, and the explanation.

## A Basic Web Page (HTML) ##
``` html
<head>
    <script src="Libraries/d3.v4.js"></script>
</head>
<body>
    <svg>
    <!–– d3 sunburst here ––> 
    </svg>

    <script>
    <!–– d3 logic goodness here ––> 
    </script>
</body>
```
This basic web page has includes 2 ```<script>``` tags
1) in the <head> points to our d3 library, that we've stored in the Libraries subdirectory
2) in the <body> will hold our d3 logic

The <body> section also contains and <svg> element.  This is where our d3 visualization will get drawn.

## Our Data (JSON) ##
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
    
