## Tell Me More UI Technical Documentation

This document discusses each key part of the Tell Me More UI. It will describe flow and key features.
* index.html
* ...

### Data Model: Topics
We bring topic data over from the Python pre-processor vis a json file.

The file begins with a summary section, then has a list of children (one child per topic). Each topic has 0 or more children representing phrases that provide context for the topic.

``` json
{"name": "Matthew",                  // Name of the corpus, shown in the center of the sunburst
 "data_date": "2017-05-19",          // Date of the data, shown in the center of the sunburst (YYYY-MM-DD)
 "run_date": "2017-05-20 13:33",     // Date we pulled the data, shown in the center of the sunburst (YYYY-MM-DD)
 "children": [{                      // Children: The topics shown on the inner ring of our sunburst
     "name": "man",                  // Name: The Topic (visible on the UI slice).
     "count": 108,                   // Count: The number of times this topic appears in the corpus.
     "rank": 1,                      // Rank: a rank order based on the number of texts it appears in
     "size": 7,                      //
     "textCount": 25,                // how many texts does this topic appear in (e.g., textIDs.length)
     "verbatims": ["man", "men"],    // alternate ways this topics is mentioned in our texts, used by to highlight
     "textIDs": ["936", "944"],       // the textIDs where this topic appears (used to determine which texts to show
     "children": [                   // ***  sub-topics: the outer ring of our sunburst  ***
                                     // each child has a subset of the attributes that we have for each topic
         {"name": "aman", "count": 13, "verbatims": ["a man"],
           "textIDs": ["945", "946", "937", "947", "941", "950", "953", "944", "940", "949"], "textCount": 10,
           "rank": 1, "size": 10},
         {"name": "thisman", "count": 8, "verbatims": ["this man"],
           "textIDs": ["937", "955", "941", "954", "940"],
           "textCount": 5, "rank": 1, "size": 5},
         {"name": "theman", "count": 6, "verbatims": ["the man", "the men"],
           "textIDs": ["954", "940", "936"],
           "textCount": 3, "rank": 1, "size": 3}]
 }]}
 ```
 
 