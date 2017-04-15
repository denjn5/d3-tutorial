# A Very Basic d3 v4 Sunburst Explained in Excrutiating Detail #
The sunburst is under represented in d3 version 4 tutorials. And the code can be confusing. It mixes html, css, svg, json, and d3. I sometimes get turned around when looking at my own code written 6 months ago. So this sunburst tutorial is for both of us. I'll strive to explain everything that I understand about each line, and sometimes point to other helpful tutorials. If don't.

``` html
<!DOCTYPE html>
<head>
    <script src="Libraries/d3.v4.js"></script>
</head>
<body>
    <svg></svg>
</body>

<script>
```


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
JSON for our sunburst is formed as a hierarchy. All slides (aka, nodes) have a name and either children (with nodes under them) or a size (if they have no children).  Below, each node is defined in 1 of 2 ways:

* ``` jacascript { "name": "abc", "children": [] }``` describes a node (or root) slice that has children. Size isn't defined here. d3 will calculate the size of this slice as the sum of its children. Children will either be more slices like this one, with children of their own, or slices with sizes that have no children.

* { "name": "zyz", "size": 4 } describes an end slice (with no children). Slice configuration does not need to symmetrical. Often, one slice will be an end-point while another slice in the same list will have children.  Or slices will have differing numbers of children, as below. Last, more complex slice definitions are valuable, but not necessary in this simple example. */
    
