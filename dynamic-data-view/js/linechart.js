/** Class implementing the table, heavily borrows from HW5 */
class LineChart {
	/**
	 * Creates a LineChart Object
	 * @param globalApplicationState The shared global application state (has the data in it)
	 */
	constructor(globalApplicationState) {
		this.globalApplicationState = globalApplicationState;
		this.traceData = globalApplicationState.traceData;
		this.eventData = globalApplicationState.eventData;

		this.vizWidth = 900;
		this.vizHeight = 600;
		this.margin = { top: 25, left: 50, right: 25, bottom: 25 };

		this.drawChart(this.traceData, 400);

		let filter = d3
			.select(".item1")
			.append("input")
			.attr("type", "number")
			.attr("name", "filtervalue")
			.attr("value", 1000)
			.on("change", console.log(this));

		// let filterVal = filter.attr("value");
		// filter.on("input", this.drawChart(this.traceData, filterVal));
	}

	drawChart(data, nRows = null) {
		// Inspired by https://d3-graph-gallery.com/graph/connectedscatter_legend.html
		if (nRows === null) {
			console.log("null rows passed");
			nRows = data.length;
		}

		const groups = [
			"Beta1",
			"Beta2",
			"ChiSquare1",
			"Exponential1",
			"InverseGamma1",
			"Laplace2",
			"Normal1",
		];

		// Reformat the data: we need an array of arrays of {x, y} tuples
		const dataReady = groups.map(function (groupName) {
			return {
				name: groupName,
				values: data.map((d) => {
					return { time: d.Time, value: +d[groupName] };
				}),
			};
		});
		// console.log(dataReady);

		let svg = d3
			.select("#linechart-div")
			.append("svg")
			.attr("width", this.vizWidth)
			.attr("height", this.vizHeight);

		// A color scale: one color for each group
		const colorScale = d3
			.scaleOrdinal()
			.domain(groups)
			.range(d3.schemeTableau10);

		// Add X axis --> it is a date format
		const xScale = d3
			.scaleTime()
			.domain(
				d3.extent(
					data.filter((d, i) => {
						return d.Beta1 !== null && i <= nRows;
					}),
					(d) => d.Time
				)
			)
			.range([this.margin.left, this.vizWidth - this.margin.right])
			.nice();
		svg.append("g")
			.attr(
				"transform",
				`translate(0, ${this.vizHeight - this.margin.bottom})`
			)
			.call(d3.axisBottom(xScale));

		svg.append("text")
			.text("Time")
			.style("text-anchor", "middle")
			.attr(
				"transform",
				`translate(${this.vizWidth / 2 + 10}, ${this.vizHeight})`
			);

		svg.append("text")
			.text("Normalized Value")
			.style("text-anchor", "middle")
			.attr(
				"transform",
				`translate(${15}, ${this.vizHeight / 2})
                rotate(-90)`
			);

		// Which group has the greatest extent...
		for (let group of groups) {
			console.log(
				group,
				d3.extent(data, (d) => d[group])
			);
		}

		// Add Y axis
		const yScale = d3
			.scaleLinear()
			.domain(
				[0, 1]
				// d3.extent(
				// 	data.filter((d, i) => i <= nRows),
				// 	(d) => d.Exponential1
				// )
			)
			.range([this.vizHeight - this.margin.top, this.margin.bottom])
			.nice();
		svg.append("g")
			.attr("transform", `translate(${this.margin.left}, 0)`)
			.call(d3.axisLeft(yScale));

		const lineGenerator = d3
			.line()
			.x((d) => xScale(d.time))
			.y((d) => yScale(d.value))
			// Line should be defined only when d.value is "truthy" (not NaN's/null!)
			.defined((d) => d.value)
			.curve(d3.curveBasis);
		let lines = svg
			.append("g")
			.attr("id", "line-chart-g")
			.selectAll("path")
			.data(dataReady) // Add multiple here to add multiple lines
			.join("path")
			.attr("class", (d, i) => groups[i])
			.attr("d", (d) => lineGenerator(d.values))
			.attr("stroke", (d, i) => colorScale(groups[i]))
			.style("stroke-width", 2)
			.style("fill", "none")
			.attr("opacity", 1);

		// // This breaks with scaled data??
		// let pathLength = lines.node().getTotalLength();
		// lines
		// 	.attr("stroke-dashoffset", pathLength)
		// 	.attr("stroke-dasharray", pathLength)
		// 	.transition()
		// 	.duration(5000)
		// 	.attr("stroke-dashoffset", 0);

		// Add a legend (interactive)
		svg.selectAll("myLegend")
			.data(dataReady)
			.enter()
			.append("g")
			.append("text")
			.style("text-anchor", "middle")
			.attr("x", (d, i) => i * 150 + 100)
			.attr("y", 30)
			.text(function (d) {
				return d.name;
			})
			.style("fill", function (d) {
				return colorScale(d.name);
			})
			.attr("font-weight", "bold")
			.style("font-size", 14)
			.on("click", function (event, d) {
				// is the element currently visible ?

				let currentOpacity = d3.selectAll("." + d.name).attr("opacity");
				// Change the opacity: from 0 to 1 or from 1 to 0
				d3.selectAll("." + d.name)
					.transition()
					.attr("opacity", currentOpacity == 1 ? 0 : 1);
				d3.select(event.target).attr(
					"font-weight",
					currentOpacity == 1 ? "normal" : "bold"
				);
			})
			// On mouseover, make the cursor a pointer ("hand")
			.style("cursor", "pointer");
	}

	// TODO: Implement rolling averages
	rollingSum(data, xVar, windowSize) {
		data = data.sort(function (a, b) {
			return d3.ascending(a[xVar], b[xVar]);
		});

		let summed = data.map(function (d, i) {
			let start = Math.max(0, i - windowSize);
			let end = i;
			let sum = {};

			for (let key in d) {
				if (d.hasOwnProperty(key)) {
					sum[key] =
						key != xVar
							? d3.sum(data.slice(start, end), function (x) {
									return x[key];
							  })
							: d[key];
				}
			}

			return sum;
		});
		return summed;
	}
}
