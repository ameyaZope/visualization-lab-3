import * as d3 from "d3";
import { useEffect, useRef } from "react";


function MDSVariablesPlot({ chosenDimensions, handleChosenDimensionsChange }) {
	const mdsVariablesPlotSvgRef = useRef();

	useEffect(() => {
		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 120, bottom: 50, left: 90 },
			width = 500 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		const numeric_column_list = ['instrumentalness', 'acousticness', 'danceability', 'valence',
			'energy', 'liveness', 'speechiness']

		// below line clears the svg so that next graph can be drawn on it, 
		// else there is overlap of graphs
		var svgSelected = d3.select("#mdsVariablesPlot");
		svgSelected.selectAll("*").remove();

		// append the svg object to the body of the page
		var svg = d3.select(mdsVariablesPlotSvgRef.current)
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
			.text(`MDS Variables Plot`);

		d3.json('/apis/mds/variablesPlot').then((data) => {
			var minX = 1000000, maxX = -1000000;
			for (let i = 0; i < data['mds_variables_data'].length; i++) {
				minX = Math.min(minX, data['mds_variables_data'][i][0])
				maxX = Math.max(maxX, data['mds_variables_data'][i][0])
			}
			const x = d3.scaleLinear()
				.domain([minX * 1.1, maxX * 1.1])
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
			for (let i = 0; i < data['mds_variables_data'].length; i++) {
				minY = Math.min(minY, data['mds_variables_data'][i][1])
				maxY = Math.max(maxY, data['mds_variables_data'][i][1])
			}
			const y = d3.scaleLinear()
				.domain([minY * 1.1, maxY * 1.1])
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

			// Add dots
			svg.append('g')
				.selectAll("dot")
				.data(data['mds_variables_data'])
				.enter()
				.append("circle")
				.attr("cx", function (d) {
					return x(0);
				})
				.attr("cy", function (d) {
					return y(d[1]);
				})
				.attr("r", 5)
				.attr("fill", function (d) {
					return "steelblue"
				})
				.on('mouseover', function (event, data) {
					tooltip
						.html(
							`<div> MDS Dimension 1 : ${data[0]} <br> MDS Dimension 2 : ${data[1]} </div>`
						)
						.style('visibility', 'visible');
					d3.select(this).style('fill', 'orange');
				})
				.on('mousemove', function (d) {
					tooltip
						.style('top', d.pageY - 10 + 'px')
						.style('left', d.pageX + 10 + 'px');
				})
				.on('mouseout', function (event, d) {
					tooltip.html(``).style('visibility', 'hidden');
					for (let i = 0; i < chosenDimensions.length; i++) {
						if (d[2] === chosenDimensions[i]) {
							d3.select(this).style('fill', 'crimson');
							return;
						}
					}
					d3.select(this).transition().style('fill', "steelblue"); // Use the original fill color
				})
				.on('click', function (event, d) {
					if (chosenDimensions.length >= 1) {
						let prevX = -1;
						let prevY = -1;
						let mds_variables_data = data['mds_variables_data']
						for (let i = 0; i < mds_variables_data.length; i++) {
							if (mds_variables_data[i][2] == chosenDimensions[chosenDimensions.length - 1]) {
								prevX = mds_variables_data[i][0];
								prevY = mds_variables_data[i][1];
							}
						}
						let currX = -1;
						let currY = -1;
						for (let i = 0; i < mds_variables_data.length; i++) {
							if (mds_variables_data[i][2] == d[2]) {
								currX = mds_variables_data[i][0];
								currY = mds_variables_data[i][1];
							}
						}
						console.log(`line = ${prevX} ${prevY} ${currX} ${currY}`)
						// Define the line generator
						var line = d3.line()
							.x(function (d) { return x(d[0]); })
							.y(function (d) { return y(d[1]); });
						// Append the path to the SVG
						svg.append(`path`)
							.attr('class', `path_${chosenDimensions.length}`)
							.datum([[prevX, prevY], [currX, currY]]) // Array of two points
							.attr("stroke", "black") // or any other color
							.attr("stroke-width", 2)
							.attr("d", line);
					}
					for (let i = 0; i < chosenDimensions.length; i++) {
						if (d[2] === chosenDimensions[i]) {
							chosenDimensions.splice(i, 1);
							handleChosenDimensionsChange([...chosenDimensions])
							d3.select(this).style('fill', 'steelblue');
							if (chosenDimensions.length >= 1) {
								d3.select(`.path_${chosenDimensions.length}`).remove()
							}
							return;
						}
					}
					console.log(d)
					let temp = [...chosenDimensions, d[2]]
					chosenDimensions.push(d[2])
					handleChosenDimensionsChange(temp)
					d3.select(this).style('fill', 'crimson');
				})

			svg.selectAll("circle")
				.transition()
				.delay(function (d, i) { return (i * 3) })
				.duration(2000)
				.attr("cx", function (d) { return x(d[0]); })
				.attr("cy", function (d) { return y(d[1]); })

			svg.append('g')
				.selectAll("text.dot_label")
				.data(data['mds_variables_data'])
				.enter()
				.append("text")
				.attr("x", function (d) {
					return x(d[0]);
				})
				.attr("y", function (d) {
					return y(d[1]) - 10;
				})
				.style("font", "12px Comic Sans MS")
				.text(function (d) {
					return d[2]
				});
		})
	}, []);

	return (
		<svg width={700} height={300} id='mdsVariablesPlot' ref={mdsVariablesPlotSvgRef} />
	)
}

export default MDSVariablesPlot;