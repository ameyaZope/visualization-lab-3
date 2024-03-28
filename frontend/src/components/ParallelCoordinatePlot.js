import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ParallelCoordinatePlot({ numClusters, chosenDimensions }) {
	const pcpSvgRef = useRef();
	const brushSelections = {}; // Object to store selections for each dimension


	useEffect(() => {
		const margin = { top: 70, right: 120, bottom: 50, left: 90 },
			width = 1400 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		let all_dimensions = [
			'bpm_categorical', 'key', 'mode', 'released_day', 'released_month', 'released_year_categorical',
			'in_apple_playlists_categorical', 'in_spotify_playlists_categorical',
			'danceability_percent', 'valence_percent',
			'energy_percent', 'acousticness_percent', 'instrumentalness_percent',
			'liveness_percent', 'speechiness_percent'];

		let numerical_dimensions = [
			'bpm_categorical', 'key', 'mode', 'released_day', 'released_month', 'released_year_categorical',
			'in_apple_playlists_categorical', 'in_spotify_playlists_categorical'];

		let dimensions = [];
		for (let i = 0; i < numerical_dimensions.length; i++) {
			dimensions.push(numerical_dimensions[i]);
		}
		for (let i = 0; i < chosenDimensions.length; i++) {
			console.log(`Adding ${chosenDimensions[i]}`)
			dimensions.push(chosenDimensions[i]);
		}
		console.log(`dimensions_list is ${dimensions}`)

		let isCategorical = {
			'bpm_categorical': true,
			'key': true,
			'mode': true,
			'released_day': true,
			'released_month': true,
			'released_year_categorical': true,
			'in_apple_playlists_categorical': true,
			'in_spotify_playlists_categorical': true,
			'danceability_percent': false,
			'valence_percent': false,
			'energy_percent': false,
			'acousticness_percent': false,
			'instrumentalness_percent': false,
			'liveness_percent': false,
			'speechiness_percent': false
		}

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#pcpPlot");
		svgSelected.selectAll("*").remove();

		var svg = d3.select(pcpSvgRef.current)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.json('/apis/parallelCoordinatePlot/data').then((data) => {
			const color = d3.scaleOrdinal()
				.domain(data['pcp_data'][numClusters - 1]['display_data'].map(d => d['cluster']))
				.range(d3.schemeCategory10.slice(0, numClusters));

			var y = {};
			dimensions.forEach((dim, i) => {
				if (i <= 7) {
					let uniqueValues = [...new Set(data['pcp_data'][numClusters - 1]['display_data'].map(d => d[dim]))];
					y[dim] = d3.scalePoint()
						.domain(uniqueValues)
						.range([height, 0]);
					} else {
						y[dim] = d3.scaleLinear()
							.domain(d3.extent(data['pcp_data'][numClusters - 1]['display_data'], d => d[dim]))
							.range([height, 0]);
					}
				});

			let x = d3.scalePoint()
				.range([0, width])
					.padding(1)
					.domain(dimensions);

			function path(d) {
				return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
			}

			// Handle dragging
			const handleDrag = d3.drag()
				.on("start", function (event, d) {
					d3.select(this).raise();
				})
				.on("drag", function (event, d) {
					let newPos = Math.max(0, Math.min(width, event.x));
					let newPositionIndex = Math.round((newPos / width) * (dimensions.length - 1));
					let currentIndex = dimensions.indexOf(d);

						if (newPositionIndex !== currentIndex) {
							dimensions.splice(currentIndex, 1);
							dimensions.splice(newPositionIndex, 0, d);
							console.log(dimensions)

								x.domain(dimensions);
								svg.selectAll(".axis")
									.attr("transform", dimension => `translate(${x(dimension)})`)
									.each(function (dimension) {
										d3.select(this).call(d3.axisLeft().scale(y[dimension]));
									});

									svg.selectAll("path.line")
									.attr("d", path); // Recalculate the line paths
							}
					});

			// Draw the lines
			svg.selectAll("path.line")
				.data(data['pcp_data'][numClusters - 1]['display_data'])
					.enter().append("path")
					.attr("class", "line")
					.attr("d", path)
					.style("fill", "none")
					.style("stroke", d => color(d['cluster']))
				.style("opacity", 0.5);

			// Draw the axis and apply drag behavior
			svg.selectAll(".axis")
				.data(dimensions).enter()
				.append("g")
					.attr("class", "axis")
					.attr("transform", d => `translate(${x(d)})`)
					.each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
					.call(handleDrag) // Apply the drag behavior to each axis
					.append("text")
					.style("text-anchor", "middle")
					.attr("y", -9)
				.attr("transform", "translate(-10,0)rotate(-15)")
				.style("text-anchor", "start")
				.text(d => d)
				.style("fill", "black");

			svg.append("text")
				.attr("x", width / 2)
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.style("text-decoration", "underline")
				.style("font", "bold 16px Comic Sans MS")
				.text(`Parallel Coordinate Plot`);

			// Create a brush for each axis
			dimensions.forEach(dim => {
				function brushed(event, dim) {
					if (!event.selection) {
						brushSelections[dim] = null; // Clear selection for this dimension
					} else {
						if (!isCategorical[dim]) {
							const [y1, y0] = event.selection.map(y[dim].invert, y[dim]);
							brushSelections[dim] = d => d[dim] >= y0 && d[dim] <= y1;
						} else {
							// Handle categorical dimension
							const positions = y[dim].domain().map(d => y[dim](d));
							brushSelections[dim] = d => {
										const position = y[dim](d[dim]);
								return position >= event.selection[0] && position <= event.selection[1];
							};
						}
					}

					// Apply global filtering logic
					svg.selectAll("path.line").style("stroke-opacity", d => {
						// Check every dimension's selection to decide if the line should be highlighted
						return Object.keys(brushSelections).every(dim => {
							const test = brushSelections[dim];
							return test ? test(d) : true; // If no selection for a dimension, consider it as passing the test
						}) ? 1 : 0.05;
					});

				}

				function brushended(event) {
					if (!event.selection) {
						svg.selectAll("path.line")
							.style("stroke-opacity", 0.5);
					}

					if (!event.selection) {
						delete brushSelections[dim]; // Remove the selection for this dimension
						// You might want to reapply the global filtering here as well
					}
				}

				const brush = d3.brushY()
					.extent([[-10, 0], [10, height]])
					.on("brush", event => brushed(event, dim)) // Pass the current dimension
					.on("end", brushended);

				svg.append("g")
					.attr("class", "brush")
					.attr("transform", `translate(${x(dim)})`)
					.call(brush);
			});
		});
	}, [numClusters, chosenDimensions]);

	return <svg width={1400} height={300} id='pcpPlot' ref={pcpSvgRef}></svg>;
}

export default ParallelCoordinatePlot;
