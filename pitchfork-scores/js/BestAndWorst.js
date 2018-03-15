$(document).ready(function () {
    $("input[name=scgraphs]:radio").val(function () {
        if ($("#seeBest").is(":checked")) {

            d3.select("body").select("svg").remove();
            $("thead").html(" ");
            $("tbody").html(" ");
            $(".genreheadercontent").empty();


            // Setup svg using Bostock's margin convention
            var capitalizeString = function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            var margin = {
                top: 40,
                right: 160,
                bottom: 35,
                left: 60
            };

            var width = 1000 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

            var svg = d3.select("#graph")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            /* Data in strings like it would be if imported from a csv */

            var data = [
                {
                    label: "Rock",
                    tens: "53",
                    nines: "279",
                    eights: "109",
    },
                {
                    label: "Electronic",
                    tens: "3",
                    nines: "69",
                    eights: "137",
    },
                {
                    label: "Experimental",
                    tens: "6",
                    nines: "61",
                    eights: "19",
    },
                {
                    label: "Rap",
                    tens: "8",
                    nines: "32",
                    eights: "38",
    },
                {
                    label: "Pop/R&B",
                    tens: "12",
                    nines: "22",
                    eights: "26",
    },
                {
                    label: "Folk/Country",
                    tens: "1",
                    nines: "14",
                    eights: "35",
    },
                {
                    label: "Metal",
                    tens: "0",
                    nines: "8",
                    eights: "42",
    },
                {
                    label: "Jazz",
                    tens: "3",
                    nines: "19",
                    eights: "0",
    },
                {
                    label: "Global",
                    tens: "0",
                    nines: "4",
                    eights: "6",
    },
];




            // Transpose the data into layers
            var dataset = d3.layout.stack()(["eights", "nines", "tens"].map(function (score) {
                return data.map(function (d) {
                    return {
                        x: d.label,
                        y: +d[score]
                    };
                });
            }));


            // Set x, y and colors
            var x = d3.scale.ordinal()
                .domain(dataset[0].map(function (d) {
                    return d.x;
                }))
                .rangeRoundBands([10, width - 10], 0.05);

            var y = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d3.max(d, function (d) {
                        return d.y0 + d.y;
                    });
                })])
                .range([height, 0]);

            var colors = ["#DE6365", "#EFB1B2", "#F7D8D9"];


            // Define and draw axes
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5)
                .tickSize(-width, 0, 0)
                .tickFormat(function (d) {
                    return d
                });

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");


            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("y", 5 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", ".75em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("font-size", "15px")
                .attr("text-anchor", "start")
                .attr("transform", "rotate(-90)")
                .text("Number of Reviews");


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("y", 50)
                .attr("x", (width / 2))
                .attr("font-size","15px")
                .attr("font-weight", "bold")
                .style("text-anchor", "middle")
                .text("Genre");



            // Create groups for each series, rects for each segment
            var groups = svg.selectAll("g.count")
                .data(dataset)
                .enter().append("g")
                .attr("class", "count")
                .style("fill", function (d, i) {
                    return colors[i];
                });

            function tooltipOnMouseMove(data, index, rectangleIndex) {
              var xPosition = d3.mouse(this)[0] - 15;
              var yPosition = d3.mouse(this)[1] - 25;
              var tooltipText = data.x + " - Score: " + renderScoreFromCount(rectangleIndex) + " - Reviews: " + data.y

              //data.x + ": "

              tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");

              // add score to tooltip
              tooltip.select("text").text(tooltipText);
            }

            function renderScoreFromCount(rectangleIndex) {
              switch (rectangleIndex) {
              case 0:
                return 8;
              case 1:
                return 9;
              case 2:
                return 10;
              }
            }

            var rect = groups.selectAll("rect")
                .data(function (d) {
                    return d;
                })
                .enter()
                .append("rect")
                .attr("x", function (d) {
                    return x(d.x);
                })
                .attr("y", function (d) {
                    return y(d.y0 + d.y);
                })
                .attr("height", function (d) {
                    return y(d.y0) - y(d.y0 + d.y);
                })
                .attr("width", x.rangeBand())
                .on("mouseover", function () {
                    tooltip.style("display", null);
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                })
                .on("mousemove", tooltipOnMouseMove)
                .on("click", function (d) {
                  d3.csv("csv/Top5Details.csv", function (data2) {
                    var clickedGenre = d['x'];
                    //            var clickedGenreLower = clickedGenre.toLowerCase();
                    // on click, get an array of values from the other CSV, and assign that to a variable
                    var filteredData = data2.filter(function (row) {
                      // add to array if the csv's row is equal to the clicked genre
                      //                return row["genre"] == clickedGenreLower;
                      //            });
                      return row["Genre"] == clickedGenre;
                    });

                    var tbody = d3.select("#scoreDetails tbody");
                    var thead = d3.select("#scoreDetails thead");
                    var genreHeader = d3.select("#genreHeader");

                    tbody.html(null);
                    genreHeader.html(null);
                    thead.html(null);

                    genreHeader.append("h2")
                      .attr("class", "genreheadercontent")
                      .text(clickedGenre);

                    thead.append("tr")
                      .html("<th>Artist</th><th>Album</th><th>Score</th>");

                    for (i = 0; i < filteredData.length; i++) {
                      var artist = capitalizeString(filteredData[i]['Artist']);
                      var album = capitalizeString(filteredData[i]['Title']);
                      var score = filteredData[i]['Score'];

                      tbody.append("tr")
                        .html("<td>" + artist + "</td><td>" + album + "</td><td>" + score + "</td>")
                        .attr("class", "tableDetails");
                    }
                });
            });


            // Draw legend
            var legend = svg.selectAll(".legend")
                .data(colors)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(30," + i * 19 + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 17)
                .style("fill", function (d, i) {
                    return colors.slice().reverse()[i];
                });

            legend.append("text")
                .attr("x", width + 5)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .style("font-size", "13px")
                .attr("class", "label")
                .text(function (d, i) {
                    switch (i) {
                    case 0:
                        return "Score: 10s";
                    case 1:
                        return "Score: 9s";
                    case 2:
                        return "Score: 8s";

                    }

                });


            // Prep the tooltip bits, initial display is hidden
            var tooltip = svg.append("g")
                .attr("class", "tooltip")
                .style("display", "none");

            tooltip.append("rect")
                .attr("width", "285")
                .attr("height", 20)
                .attr("fill", "white")
                .style("opacity", 0.75);

            tooltip.append("text")
                .attr("x", 10)
                .attr("dy", "1.1em")
                .style("text-align", "middle")
                .attr("font-size", "14px")
                .attr("font-weight", "bold");

        };


        // WORKING CODE FOR CHANGE FUNCTION BELOW
        $("input[name=scgraphs]:radio").change(function () {
            if ($("#seeBest").is(":checked")) {
                d3.select("body").select("svg").remove();
                $("thead").html(" ");
                $("tbody").html(" ");
                $(".genreheadercontent").empty();

                // Setup svg using Bostock's margin convention
                var capitalizeString = function (string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                var margin = {
                    top: 40,
                    right: 160,
                    bottom: 35,
                    left: 60
                };

                var width = 1000 - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                var svg = d3.select("#graph")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                /* Data in strings like it would be if imported from a csv */

                var data = [
                    {
                        label: "Rock",
                        tens: "53",
                        nines: "279",
                        eights: "109",
    },
                    {
                        label: "Electronic",
                        tens: "3",
                        nines: "69",
                        eights: "137",
    },
                    {
                        label: "Experimental",
                        tens: "6",
                        nines: "61",
                        eights: "19",
    },
                    {
                        label: "Rap",
                        tens: "8",
                        nines: "32",
                        eights: "38",
    },
                    {
                        label: "Pop/R&B",
                        tens: "12",
                        nines: "22",
                        eights: "26",
    },
                    {
                        label: "Folk/Country",
                        tens: "1",
                        nines: "14",
                        eights: "35",
    },
                    {
                        label: "Metal",
                        tens: "0",
                        nines: "8",
                        eights: "42",
    },
                    {
                        label: "Jazz",
                        tens: "3",
                        nines: "19",
                        eights: "0",
    },
                    {
                        label: "Global",
                        tens: "0",
                        nines: "4",
                        eights: "6",
    },
];




                // Transpose the data into layers
                var dataset = d3.layout.stack()(["eights", "nines", "tens"].map(function (score) {
                    return data.map(function (d) {
                        return {
                            x: d.label,
                            y: +d[score]
                        };
                    });
                }));


                // Set x, y and colors
                var x = d3.scale.ordinal()
                    .domain(dataset[0].map(function (d) {
                        return d.x;
                    }))
                    .rangeRoundBands([10, width - 10], 0.05);

                var y = d3.scale.linear()
                    .domain([0, d3.max(dataset, function (d) {
                        return d3.max(d, function (d) {
                            return d.y0 + d.y;
                        });
                    })])
                    .range([height, 0]);

                var colors = ["#DE6365", "#EFB1B2", "#F7D8D9"];


                // Define and draw axes
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(5)
                    .tickSize(-width, 0, 0)
                    .tickFormat(function (d) {
                        return d
                    });

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");


                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("y", 5 - margin.left)
                        .attr("x", 0 - (height / 2))
                        .attr("dy", ".75em")
                        .attr("fill", "#000")
                        .attr("font-weight", "bold")
                        .attr("font-size", "15px")
                        .attr("text-anchor", "start")
                        .attr("transform", "rotate(-90)")
                        .text("Number of Reviews");


                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .append("text")
                        .attr("y", 50)
                        .attr("x", (width / 2))
                        .attr("font-size","15px")
                        .attr("font-weight", "bold")
                        .style("text-anchor", "middle")
                        .text("Genre");



                // Create groups for each series, rects for each segment
                var groups = svg.selectAll("g.count")
                    .data(dataset)
                    .enter().append("g")
                    .attr("class", "count")
                    .style("fill", function (d, i) {
                        return colors[i];
                    });

                    function tooltipOnMouseMove(data, index, rectangleIndex) {
                      var xPosition = d3.mouse(this)[0] - 15;
                      var yPosition = d3.mouse(this)[1] - 25;
                      var tooltipText = data.x + " - Score: " + renderScoreFromCount(rectangleIndex) + " - Reviews: " + data.y

                      //data.x + ": "

                      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");

                      // add score to tooltip
                      tooltip.select("text").text(tooltipText);
                    }

                    function renderScoreFromCount(rectangleIndex) {
                      switch (rectangleIndex) {
                      case 0:
                        return 8;
                      case 1:
                        return 9;
                      case 2:
                        return 10;
                      }
                    }

                    var rect = groups.selectAll("rect")
                        .data(function (d) {
                            return d;
                        })
                        .enter()
                        .append("rect")
                        .attr("x", function (d) {
                            return x(d.x);
                        })
                        .attr("y", function (d) {
                            return y(d.y0 + d.y);
                        })
                        .attr("height", function (d) {
                            return y(d.y0) - y(d.y0 + d.y);
                        })
                        .attr("width", x.rangeBand())
                        .on("mouseover", function () {
                            tooltip.style("display", null);
                        })
                        .on("mouseout", function () {
                            tooltip.style("display", "none");
                        })
                        .on("mousemove", tooltipOnMouseMove)
                        .on("click", function (d) {
                          d3.csv("csv/Top5Details.csv", function (data2) {
                            var clickedGenre = d['x'];
                            //            var clickedGenreLower = clickedGenre.toLowerCase();
                            // on click, get an array of values from the other CSV, and assign that to a variable
                            var filteredData = data2.filter(function (row) {
                              // add to array if the csv's row is equal to the clicked genre
                              //                return row["genre"] == clickedGenreLower;
                              //            });
                              return row["Genre"] == clickedGenre;
                            });

                            var tbody = d3.select("#scoreDetails tbody");
                            var thead = d3.select("#scoreDetails thead");
                            var genreHeader = d3.select("#genreHeader");

                            tbody.html(null);
                            genreHeader.html(null);
                            thead.html(null);

                            genreHeader.append("h2")
                              .attr("class", "genreheadercontent")
                              .text(clickedGenre);

                            thead.append("tr")
                              .html("<th>Artist</th><th>Album</th><th>Score</th>");

                            for (i = 0; i < filteredData.length; i++) {
                              var artist = capitalizeString(filteredData[i]['Artist']);
                              var album = capitalizeString(filteredData[i]['Title']);
                              var score = filteredData[i]['Score'];

                              tbody.append("tr")
                                .html("<td>" + artist + "</td><td>" + album + "</td><td>" + score + "</td>")
                                .attr("class", "tableDetails");
                            }
                        });
                    });


                // Draw legend
                var legend = svg.selectAll(".legend")
                    .data(colors)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function (d, i) {
                        return "translate(30," + i * 19 + ")";
                    });

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 17)
                    .style("fill", function (d, i) {
                        return colors.slice().reverse()[i];
                    });

                legend.append("text")
                    .attr("x", width + 5)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .style("font-size", "13px")
                    .attr("class", "label")
                    .text(function (d, i) {
                        switch (i) {
                        case 0:
                            return "Score: 10s";
                        case 1:
                            return "Score: 9s";
                        case 2:
                            return "Score: 8s";

                        }

                    });


                // Prep the tooltip bits, initial display is hidden
                var tooltip = svg.append("g")
                    .attr("class", "tooltip")
                    .style("display", "none");

                tooltip.append("rect")
                    .attr("width", "285")
                    .attr("height", 20)
                    .attr("fill", "white")
                    .style("opacity", 0.75);

                tooltip.append("text")
                    .attr("x", 10)
                    .attr("dy", "1.1em")
                    .style("text-align", "middle")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold");




            } else if ($("#seeWorst").is(":checked")) {
                d3.select("body").select("svg").remove();
                $("thead").html(" ");
                $("tbody").html(" ");
                $(".genreheadercontent").empty();

                var capitalizeString = function (string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                var margin = {
                    top: 40,
                    right: 160,
                    bottom: 35,
                    left: 60
                };

                var width = 1000 - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                var svg = d3.select("#graph")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                /* Data in strings like it would be if imported from a csv */

                var data = [
                    {
                        label: "Rock",
                        fives: "0",
                        fours: "152",
                        threes: "212",
                        twos: "105",
                        ones: "34",
                        zeroes: "17",
    },
                    {
                        label: "Electronic",
                        fives: "0",
                        fours: "59",
                        threes: "86",
                        twos: "42",
                        ones: "14",
                        zeroes: "3",
    },
                    {
                        label: "Experimental",
                        fives: "46",
                        fours: "34",
                        threes: "18",
                        twos: "6",
                        ones: "4",
                        zeroes: "2",
    },
                    {
                        label: "Rap",
                        fives: "0",
                        fours: "28",
                        threes: "31",
                        twos: "14",
                        ones: "5",
                        zeroes: "1",
    },
                    {
                        label: "Pop/R&B",
                        fives: "0",
                        fours: "34",
                        threes: "25",
                        twos: "17",
                        ones: "2",
                        zeroes: "3",
    },
                    {
                        label: "Folk/Country",
                        fives: "11",
                        fours: "16",
                        threes: "7",
                        twos: "3",
                        ones: "0",
                        zeroes: "0",
    },
                    {
                        label: "Metal",
                        fives: "0",
                        fours: "0",
                        threes: "29",
                        twos: "13",
                        ones: "5",
                        zeroes: "2",
    },
                    {
                        label: "Jazz",
                        fives: "0",
                        fours: "14",
                        threes: "7",
                        twos: "2",
                        ones: "1",
                        zeroes: "0",
    },
                    {
                        label: "Global",
                        fives: "3",
                        fours: "6",
                        threes: "0",
                        twos: "1",
                        ones: "0",
                        zeroes: "0",
    },
];




                // Transpose the data into layers
                var dataset = d3.layout.stack()(["zeroes", "ones", "twos", "threes", "fours", "fives"].map(function (score) {
                    return data.map(function (d) {
                        return {
                            x: d.label,
                            y: +d[score]
                        };
                    });
                }));


                // Set x, y and colors
                var x = d3.scale.ordinal()
                    .domain(dataset[0].map(function (d) {
                        return d.x;
                    }))
                    .rangeRoundBands([10, width - 10], 0.05);

                var y = d3.scale.linear()
                    .domain([0, d3.max(dataset, function (d) {
                        return d3.max(d, function (d) {
                            return d.y0 + d.y;
                        });
                    })])
                    .range([height, 0]);

                var colors = ["#000", "#450C0D", "#6B1E20", "#A12D2F", "#c42626", "#D8555F"];



                // Define and draw axes
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(5)
                    .tickSize(-width, 0, 0)
                    .tickFormat(function (d) {
                        return d
                    });

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");


                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("y", 5 - margin.left)
                        .attr("x", 0 - (height / 2))
                        .attr("dy", ".75em")
                        .attr("fill", "#000")
                        .attr("font-weight", "bold")
                        .attr("font-size", "15px")
                        .attr("text-anchor", "start")
                        .attr("transform", "rotate(-90)")
                        .text("Number of Reviews");


                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .append("text")
                        .attr("y", 50)
                        .attr("x", (width / 2))
                        .attr("font-size","15px")
                        .attr("font-weight", "bold")
                        .style("text-anchor", "middle")
                        .text("Genre");



                // Create groups for each series, rects for each segment
                var groups = svg.selectAll("g.count")
                    .data(dataset)
                    .enter().append("g")
                    .attr("class", "count")
                    .style("fill", function (d, i) {
                        return colors[i];
                    });

                    function tooltipOnMouseMove(data, index, rectangleIndex) {
                      var xPosition = d3.mouse(this)[0] - 15;
                      var yPosition = d3.mouse(this)[1] - 25;
                      var tooltipText = data.x + " - Score: " + renderScoreFromCount(rectangleIndex) + " - Reviews: " + data.y

                      //data.x + ": "

                      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");

                      // add score to tooltip
                      tooltip.select("text").text(tooltipText);
                    }

                    function renderScoreFromCount(rectangleIndex) {
                      switch (rectangleIndex) {
                      case 0:
                          return "0";
                      case 1:
                          return "1";
                      case 2:
                          return "2";
                      case 3:
                          return "3";
                      case 4:
                          return "4";
                      case 5:
                          return "5";

                      }
                    }

                    var rect = groups.selectAll("rect")
                        .data(function (d) {
                            return d;
                        })
                        .enter()
                        .append("rect")
                        .attr("x", function (d) {
                            return x(d.x);
                        })
                        .attr("y", function (d) {
                            return y(d.y0 + d.y);
                        })
                        .attr("height", function (d) {
                            return y(d.y0) - y(d.y0 + d.y);
                        })
                        .attr("width", x.rangeBand())
                        .on("mouseover", function () {
                            tooltip.style("display", null);
                        })
                        .on("mouseout", function () {
                            tooltip.style("display", "none");
                        })
                        .on("mousemove", tooltipOnMouseMove)
                        .on("click", function (d) {
                          d3.csv("csv/Bottom5Details.csv", function (data2) {
                            var clickedGenre = d['x'];
                            //            var clickedGenreLower = clickedGenre.toLowerCase();
                            // on click, get an array of values from the other CSV, and assign that to a variable
                            var filteredData = data2.filter(function (row) {
                              // add to array if the csv's row is equal to the clicked genre
                              //                return row["genre"] == clickedGenreLower;
                              //            });
                              return row["Genre"] == clickedGenre;
                            });

                            var tbody = d3.select("#scoreDetails tbody");
                            var thead = d3.select("#scoreDetails thead");
                            var genreHeader = d3.select("#genreHeader");

                            tbody.html(null);
                            genreHeader.html(null);
                            thead.html(null);

                            genreHeader.append("h2")
                              .attr("class", "genreheadercontent")
                              .text(clickedGenre);

                            thead.append("tr")
                              .html("<th>Artist</th><th>Album</th><th>Score</th>");

                            for (i = 0; i < filteredData.length; i++) {
                              var artist = capitalizeString(filteredData[i]['Artist']);
                              var album = capitalizeString(filteredData[i]['Title']);
                              var score = filteredData[i]['Score'];

                              tbody.append("tr")
                                .html("<td>" + artist + "</td><td>" + album + "</td><td>" + score + "</td>")
                                .attr("class", "tableDetails");
                            }
                        });
                    });


                // Draw legend
                var legend = svg.selectAll(".legend")
                    .data(colors)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function (d, i) {
                        return "translate(30," + i * 19 + ")";
                    });

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 17)
                    .style("fill", function (d, i) {
                        return colors.slice().reverse()[i];
                    });

                legend.append("text")
                    .attr("x", width + 5)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .style("font-size", "13px")
                    .attr("class", "label")
                    .text(function (d, i) {
                        switch (i) {
                        case 0:
                            return "Score: 5s";
                        case 1:
                            return "Score: 4s";
                        case 2:
                            return "Score: 3s";
                        case 3:
                            return "Score: 2s";
                        case 4:
                            return "Score: 1s";
                        case 5:
                            return "Score: 0s";

                        }

                    });


                // Prep the tooltip bits, initial display is hidden
                var tooltip = svg.append("g")
                    .attr("class", "tooltip")
                    .style("display", "none");

                tooltip.append("rect")
                    .attr("width", "285")
                    .attr("height", 20)
                    .attr("fill", "white")
                    .style("opacity", 0.75);

                tooltip.append("text")
                    .attr("x", 10)
                    .attr("dy", "1.1em")
                    .style("text-align", "middle")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold");
            }


            ;
        });
    })

    //NEW ENDING TO WORKING CODE
})
