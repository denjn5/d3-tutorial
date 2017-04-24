<!--- Sunburst Tutorial (d3 v4), Part 3 -->

## 
In this tutorial we'll begin with the "no frills" sunburst from [Tutorial 1](https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5). But we'll limit our detailed walk-through to the 2 new features:
1) properly-rotated labels
2) data loaded from external json file

On the [bl.ocks.org page](https://bl.ocks.org/denjn5/f059c1f78f9c39d922b1c208815d18af), scroll to the bottom to see the uninterrupted code of a Sunburst visual, based on d3 version 4. This tutorial builds on [Part 1](https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5).

Do good!  —David Richards


## 
In the first tutorial we began with the web page and variable definitions. This time, we'll skip all of that and go right for the first new code: getting data from our *.json file.

``` javascript
d3.json("data.json", function(error, nodeData) {
        if (error) throw error;

    // Put the code that works with our data here.
    
});
```

