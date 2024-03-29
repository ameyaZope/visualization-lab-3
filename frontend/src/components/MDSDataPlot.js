import * as d3 from "d3";
import { useEffect, useRef } from "react";


function MDSDataPlot({ numClusters, handleNumClusterChange }) {
	const mdsDataPlotSvgRef = useRef();

	useEffect(() => {
		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 120, bottom: 50, left: 90 },
			width = 500 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		const numeric_column_list = ['instrumentalness', 'acousticness', 'danceability', 'valence',
			'energy', 'liveness', 'speechiness']

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#mdsDataPlot");
		svgSelected.selectAll("*").remove();

		// append the svg object to the body of the page
		var svg = d3.select(mdsDataPlotSvgRef.current)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
		svg.append("text")
			.attr("x", width / 2)
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("text-decoration", "underline")
			.style("font", "bold 16px Comic Sans MS")
			.text(`MDS Data Plot`);

		d3.json('/apis/mds/dataPlot').then((data) => {
			var minX = 1000000, maxX = -1000000;
			for (let i = 0; i < data['mds_data'].length; i++) {
				minX = Math.min(minX, data['mds_data'][numClusters - 1]['display_data'][i][0])
				maxX = Math.max(maxX, data['mds_data'][numClusters - 1]['display_data'][i][0])
			}
			const x = d3.scaleLinear()
				.domain([minX * 2, maxX * 2])
				.range([0, width])

			const xAxis = svg.append('g')
				.attr("transform", `translate(0,${height})`)
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");

			svg.append("text")
				.attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
				.style("text-anchor", "middle")
				.style("font", "bold 16px Comic Sans MS")
				.text(`MDS Dimension 1`);

			var minY = 1000000, maxY = -1000000;
			for (let i = 0; i < data['mds_data'].length; i++) {
				minY = Math.min(minY, data['mds_data'][numClusters - 1]['display_data'][i][1])
				maxY = Math.max(maxY, data['mds_data'][numClusters - 1]['display_data'][i][1])
			}
			const y = d3.scaleLinear()
				.domain([minY * 2, maxY * 2])
				.range([height, 0])
			const yAxis = svg.append('g')
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y));
			svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - margin.left)
				.attr("x", 0 - (height / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.style("font", "bold 16px Comic Sans MS")
				.text(`MDS Dimension 2`);

			var tooltip = d3
				.select('body')
				.append('div')
				.attr('class', 'd3-tooltip')
				.style('position', 'absolute')
				.style('z-index', '10')
				.style('visibility', 'hidden')
				.style('padding', '10px')
				.style('background', 'rgba(0,0,0,0.6)')
				.style('border-radius', '4px')
				.style('color', '#fff')
				.text('a simple tooltip');

			// Define the color scale.
			const color = d3.scaleOrdinal()
				.domain(data['mds_data'][numClusters - 1]['display_data'].map(d => d[2]))
				.range(d3.schemeCategory10.slice(0, numClusters));

			// Add dots
			svg.append('g')
				.selectAll("dot")
				.data(data['mds_data'][numClusters - 1]['display_data'])
				.enter()
				.append("circle")
				.attr("cx", function (d) {
					return x(0);
				})
				.attr("cy", function (d) {
					return y(d[1]);
				})
				.attr("r", 5)
				.attr("fill-opacity", 0.7)
				.attr("fill", function (d) {
					return color(d[2])
				})
				.on('mouseover', function (event, data) {
					tooltip
						.html(
							`<div> MDS Dimension 1 : ${data[0]} <br> MDS Dimension 2 : ${data[1]} </div>`
						)
						.style('visibility', 'visible');
					d3.select(this).style('fill', 'black');
				})
				.on('mousemove', function (d) {
					tooltip
						.style('top', d.pageY - 10 + 'px')
						.style('left', d.pageX + 10 + 'px');
				})
				.on('mouseout', function (event, d) {
					tooltip.html(``).style('visibility', 'hidden');
					d3.select(this).transition().style('fill', color(d[2])); // Use the original fill color
				})

			svg.selectAll("circle")
				.transition()
				.delay(function (d, i) { return (i * 3) })
				.duration(2000)
				.attr("cx", function (d) { return x(d[0]); })
				.attr("cy", function (d) { return y(d[1]); })

			// Legend setup
			var legendSpace = 20; // Spacing between legend items
			var legendRectSize = 14; // The size of the legend color squares
			var legendHeight = height + (margin.bottom / 2); // Positioning of the legend

			// Legend labels - adjust these based on your actual clusters or categories
			var legendLabels = ["Cluster 1", "Cluster 2", "Cluster 3", "Cluster 4", "Cluster 5", "Cluster 6", "Cluster 7", "Cluster 8", "Cluster 9", "Cluster 10"];

			// Add one dot in the legend for each name
			var legend = svg.selectAll("legend")
				.data(color.range())
				.enter()
				.append("g")
				.attr("transform", function (d, i) { return "translate(0," + i * legendSpace + ")"; });

			// Add the color squares to the legend
			legend.append("rect")
				.attr("x", width + 10)
				.attr("y", 0)
				.attr("width", legendRectSize)
				.attr("height", legendRectSize)
				.style("fill", function (d) { return d; });

			// Add the text labels to the legend
			legend.append("text")
				.attr("x", width + 30)
				.attr("y", 10)
				.style("font", "bold 16px Comic Sans MS")
				.text(function (d, i) { return legendLabels[i]; });
		})

	}, [numClusters]);

	return (
		<svg width={500} height={300} id='mdsDataPlot' ref={mdsDataPlotSvgRef} />
	)
}

export default MDSDataPlot;