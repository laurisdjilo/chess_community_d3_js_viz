function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
}


const months = ['Janvier 2020', 'Février 2020', 'Mars 2020', 'Avril 2020', 'Mai 2020', 'Juin 2020', 'Juillet 2020', 'Aout 2020', 'Septembre 2020', 'Octobre 2020', 'Novembre 2020', 'Décembre 2020',
    'Janvier 2021', 'Février 2021', 'Mars 2021', 'Avril 2021', 'Mai 2021', 'Juin 2021', 'Juillet 2021', 'Aout 2021', 'Septembre 2021', 'Octobre 2021', 'Novembre 2021']

const margin = {top: 40, right: 150, bottom: 60, left: 30},
    width = getWidth()*.8*.9 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  
function restart(){
  i=0;
  svg.selectAll("circle.bubbles")
    .transition()
    .duration(10)
    .attr("cx", d => x(d.nbr_players[i]))
    .attr("cy", d => y(d.top_k_avg[i]))
    .attr("r", d => z(d.nbr_titles[i]))
  
  current_month.text(months[i]);
  i++;
  setInterval(
    function(){
      if(i<23){
        svg.selectAll("circle.bubbles")
          .transition()
          .duration(1000)
          .attr("cx", d => x(d.nbr_players[i]))
          .attr("cy", d => y(d.top_k_avg[i]))
          .attr("r", d => z(d.nbr_titles[i]))
        current_month.text(months[i]);
        i++;
      }
    }
    , 1000
  );
}

//Read the data
d3.json("../datasets/feds_standard_evolution.json").then(function(data) {
  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//
  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, 20000])
    .range([0, width]);
  var xAxis = d3.axisBottom(x).ticks(15);
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text("Nombre de joueurs");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([1000, 3000])
    .range([ height, 0]);
  var yAxis = d3.axisLeft(y);
  svg.append("g")
    .attr("class", "axis axis--y")
    .style("font-size", "9")
    .call(yAxis);

  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text("Score ELO moyen du top 10")
      .attr("text-anchor", "start")

  current_month = svg.append("text")
      .attr("x", width/2)
      .attr("y", 0 )
      .text("")
      .attr("font-size", "20")
      .attr("font-weight", "bold")

  // Add a scale for bubble size
  const z = d3.scaleSqrt()
    .domain([0, 1000])
    .range([2, 30]);

  // Add a scale for bubble color
  const myColor = d3.scaleOrdinal()
    .domain(['Asie', 'Europe', 'Afrique', 'Océanie', 'Amérique', 'Iconnu'])
    .range(d3.schemeSet1);

  var brush = d3.brush().on("end", brushended),
    idleTimeout,
    idleDelay = 350;
  svg.append("g")
    .attr("class", "brush")
    .call(brush);
  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  const tooltip = d3.select("#my_dataviz")
    .style("position", "relative")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")
      .style("position", "absolute")


  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  const showTooltip = function(event,d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html("Fédération: " + d.name)//----------------------
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2-50 + "px")
  }
  const moveTooltip = function(event, d) {
    tooltip
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2-50 + "px")
  }
  const hideTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  const highlight = function(event, d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll("."+d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  const noHighlight = function(event, d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots

  i=0;
  svg.append('g')
  .selectAll("dot")
  .data(data)
  .join("circle")
    .attr("class", function(d) { return "bubbles " + d.region })
    .attr("cx", d => x(d.nbr_players[i]))
    .attr("cy", d => y(d.top_k_avg[i]))
    .attr("r", d => z(d.nbr_titles[i]))
    .attr("id", d => d.name)
    .style("fill", d => myColor(d.region))
  // -3- Trigger the functions for hover
  .on("mouseover", showTooltip )
  .on("mousemove", moveTooltip )
  .on("mouseleave", hideTooltip)
  current_month.text(months[i]);

  setInterval(
    function(){
      i++;
      if(i<23){
        svg.selectAll("circle.bubbles")
          .transition()
          .duration(1000)
          .attr("cx", d => x(d.nbr_players[i]))
          .attr("cy", d => y(d.top_k_avg[i]))
          .attr("r", d => z(d.nbr_titles[i]))
        current_month.text(months[i]);
      } else{
        i--;
      }
    }
    , 1000
  );
  
// ---------------------------//
//       Zooming              //
// ---------------------------//

  
function brushended(event) {
  var s = event.selection;
  if (!s) {
    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
    x.domain([0, 20000]);
    y.domain([1000, 3000]);
  } else {
    x.domain([s[0][0], s[1][0]].map(x.invert, x));
    y.domain([s[1][1], s[0][1]].map(y.invert, y));
    svg.select(".brush").call(brush.move, null);
  }
  zoom();
}

function idled() {
  idleTimeout = null;
}


function zoom() {
  var t = svg.transition().duration(750);
  svg.select(".axis--x").transition(t).call(xAxis);
  svg.select(".axis--y").transition(t).call(yAxis);
  svg.selectAll("circle.bubbles").transition(t)
    .attr("cx", d => x(d.nbr_players[i]))
    .attr("cy", d => y(d.top_k_avg[i]))
    .attr("r", d => z(d.nbr_titles[i]));
}


// ---------------------------//
//       LEGEND              //
// ---------------------------//

// Add legend: circles
const xLabel = width +50//- margin.right + 50

const size = 20
const allgroups = ['Asie', 'Europe', 'Afrique', 'Océanie', 'Amérique', 'Iconnu']
svg.selectAll("myrect")
  .data(allgroups)
  .join("circle")
    .attr("cx", xLabel)
    .attr("cy", (d,i) => 10 + i*(size+5)) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", d =>  myColor(d))
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

// Add labels beside legend dots
svg.selectAll("mylabels")
  .data(allgroups)
  .enter()
  .append("text")
    .attr("x", xLabel + size*.8)
    .attr("y", (d,i) =>  i * (size + 5) + (size/2)) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", d => myColor(d))
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

// Add legend: circles
var valuesToShow = [10, 200, 500]
const tmp = 50 + 6*(size+5);
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("circle")
    .attr("cx", xLabel)
    .attr("cy", function(d){ return tmp - z(d) } )
    .attr("r", function(d){ return z(d) })
    .style("fill", "none")
    .attr("stroke", "black")

  
// Add legend: segments
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("line")
    .attr('x1', function(d){ return xLabel + z(d) } )
    .attr('x2', xLabel + 50)
    .attr('y1', function(d){ return tmp - z(d) } )
    .attr('y2', function(d){ return tmp - z(d) } )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

// Add legend: labels
svg
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("text")
    .attr('x', xLabel+50)
    .attr('y', function(d){ return tmp - z(d) } )
    .text( function(d){ return d } )
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle');

svg
  .selectAll("legend")
  .data(["Nombre de titres"])
  .enter()
  .append("text")
    .attr("x", xLabel - 50)
    .attr("y", tmp + 20)
    .text( function(d){ return d })

});


