

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

JSON for our sunburst is formed as a hierarchy. All slides (aka, nodes) have a name and either children (with nodes under them) or a size (if they have no children).  Below, each node is defined in 1 of 2 ways:

* { "name": "abc", "children": [] } describes a middle (or root) slice that has children. Size isn't defined here. d3 will calculate the size of this slice as the sum of its children. Children will either be more slices like this one, with children of their own, or slices with sizes that have no children.

* { "name": "zyz", "size": 4 } describes an end slice (with no children). Slice configuration does not need to symmetrical. Often, one slice will be an end-point while another slice in the same list will have children.  Or slices will have differing numbers of children, as below. Last, more complex slice definitions are valuable, but not necessary in this simple example. */
    
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
