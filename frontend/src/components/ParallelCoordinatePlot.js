import * as d3 from "d3";
import { useEffect, useRef } from "react";

function ParallelCoordinatePlot({ numClusters }) {
	const pcpSvgRef = useRef();

	useEffect(() => {
		const margin = { top: 70, right: 120, bottom: 50, left: 90 },
			width = 1400 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		let dimensions = [
			'bpm_categorical', 'key', 'mode', 'released_day', 'released_month', 'released_year_categorical',
			'in_apple_playlists_categorical', 'in_spotify_playlists_categorical',
			'danceability_percent', 'valence_percent',
			'energy_percent', 'acousticness_percent', 'instrumentalness_percent',
			'liveness_percent', 'speechiness_percent'];

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
		});
	}, [numClusters]); // Make sure to include numClusters in the dependency array if it's a prop

	return <svg width={1400} height={300} id='pcpPlot' ref={pcpSvgRef}></svg>;
}

export default ParallelCoordinatePlot;
