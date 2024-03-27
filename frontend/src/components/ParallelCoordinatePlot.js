import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ParallelCoordinatePlot({ numClusters }) {

	const pcpSvgRef = useRef();

	useEffect(() => {

		// set the dimensions and margins of the graph
		const margin = { top: 70, right: 120, bottom: 50, left: 90 },
			width = 1400 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		let dimensions = [
			'bpm_categorical', 'key', 'mode', 'released_day', 'released_month', 'released_year_categorical',
			'in_apple_playlists_categorical', 'in_spotify_playlists_categorical',
			'danceability_percent', 'valence_percent',
			'energy_percent', 'acousticness_percent', 'instrumentalness_percent',
			'liveness_percent', 'speechiness_percent']

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#pcpPlot");
		svgSelected.selectAll("*").remove();

		// append the svg object to the body of the page
		var svg = d3.select(pcpSvgRef.current)
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
			.text(`Parallel Coordinates Plot`);

		d3.json('/apis/parallelCoordinatePlot/data').then((data) => {
			// Define the color scale.
			const color = d3.scaleOrdinal()
				.domain(data['pcp_data'][numClusters - 1]['display_data'].map(d => d[16]))
				.range(d3.schemeCategory10.slice(0, numClusters));

			// For each dimension, I build a linear scale. I store all in a y object
			var y = {}
			for (let i = 0; i < dimensions.length; i++) {
				let dim = dimensions[i]
				if (i <= 7) {
					let uniqueValues = [...new Set(data['pcp_data'][numClusters - 1]['display_data'].map(d => d[i + 1]))];
					y[dim] = d3.scalePoint()
						.domain(uniqueValues)
						.range([height, 0]);
				}
				else {
					y[dim] = d3.scaleLinear()
						.domain([0, 100])
						.range([height, 0]);
				}
			}

			// Build the X scale -> it find the best position for each Y axis
			let x = d3.scalePoint()
				.range([0, width])
				.domain(dimensions);

			// Highlight the cluster that is hovered
			var highlight = function (d) {

				let selected_cluster = 'dim' + d['target']['__data__'][16]

				// first every group turns grey
				d3.selectAll(".line")
					.transition().duration(200)
					.style("stroke", "lightgrey")
					.style("opacity", "0.2")
				// Second the hovered cluster takes its color
				d3.selectAll("." + selected_cluster)
					.transition().duration(200)
					.style("stroke", color(selected_cluster))
					.style("opacity", "1")
			}

			// Unhighlight
			var doNotHighlight = function (d) {
				d3.selectAll(".line")
					.transition().duration(200).delay(1000)
					.style("stroke", function (d) { return (color(d[16])) })
					.style("opacity", "1")
			}

			// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
			function path(d) {
				return d3.line()(dimensions.map(function (p, i) { return [x(p), y[p](d[i + 1])]; }));
			}

			// Draw the lines
			svg
				.selectAll("myPath")
				.data(data['pcp_data'][numClusters - 1]['display_data'])
				.enter()
				.append("path")
				.attr("class", function (d) { return "line dim" + d[16] }) // 2 class for each line: 'line' and the group name
				.attr("d", path)
				.style("fill", "none")
				.style("stroke", function (d) { return (color(d[16])) })
				.style("opacity", 0.5)
				.on("mouseover", highlight)
				.on("mouseleave", doNotHighlight)

			// Draw the axis:
			svg.selectAll("myAxis")
				.data(dimensions).enter()
				.append("g")
				.attr("transform", function (d) { return "translate(" + x(d) + ")"; })
				.each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
				.append("text")
				.style("text-anchor", "middle")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.attr("y", -9)
				.text(function (d) { return d; })
				.style("fill", "black")
		});
	}, [numClusters])

	return (
		<svg width={1400} height={300} id='pcpPlot' ref={pcpSvgRef} />
	)
}

export default ParallelCoordinatePlot;