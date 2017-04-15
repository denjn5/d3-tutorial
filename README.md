# A d3 v4 Sunburst: A Detailed Explaination #
The sunburst is under represented in d3 version 4 tutorials. While it's uniquely useful for explaining relationships in hierarchical data, it's not used often. Maybe it's because the code can be confusing. It mixes html, css, svg, json, javascript, and d3. And, at our best, we're able to understand circles both in terms of degrees and radians. No wonder it can seem confusing. I'll tell you that I sometimes get turned around when reviewing my own 6-month-old code. So this sunburst tutorial is for both of us. And I'm confident that you can follow this code and build something that you're proud of. 

I strive to explain everything that I can about each line, and sometimes link to helpful tutorials. If I don't explain it, or explain it well, I'd welcome your input.

For this sunburst, we will stay vanilla. No labels, no interaction. 


``` html
<!DOCTYPE html>
<head>
    <script src="Libraries/d3.v4.js"></script>
</head>
<body>
    <svg></svg>
</body>

<script>
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
    
