/** Class implementing the table, heavily borrows from HW5 */
class ScatterplotMatrix {
	/**
	 * Creates a LineChart Object
	 * @param globalApplicationState The shared global application state (has the data in it)
	 */
	constructor(globalApplicationState) {
		this.globalApplicationState = globalApplicationState;
		// Proof of concept: make SPLOM for first 400 datapoints
		// d.Beta1 is just checking for "truthy" values (filter out NaN's)
		this.traceData = globalApplicationState.traceData;

		this.vizHeight = 600;
		this.margin = { top: 10, left: 25, right: 10, bottom: 10 };
		this.vizSize = 900 - this.margin.left - this.margin.right;

		const svg = d3
			.select("#splom-div")
			.append("svg")
			.attr("id", "splom-svg")
			.attr("width", this.vizSize + this.margin.left * 3)
			.attr("height", this.vizSize + this.margin.top * 3)
			.append("g")
			.attr(
				"transform",
				`translate(${this.margin.left},${this.margin.top})`
			);

		const allVar = Object.keys(this.traceData[0])
			.filter((d) => d.includes("Scaled"))
			.map((d) => d.slice(0, d.indexOf("_")));

		this.drawCells(allVar);
	}

	drawCells(allVar, data = this.traceData.filter((d, i) => i <= 200)) {
		// console.log("length of splom data", data.length);
		// Removing DOM elements frowned upon, but this works to update number of cells
		d3.selectAll(".cell").remove();

		// Get product of iterables since matrix will have N by N elements
		let pairs = d3.cross(allVar, allVar);

		// Calculate the size of a single chart, keeping some padding between them
		const numVar = allVar.length;
		let padding = 20;
		let size = this.vizSize / numVar;

		// Position scale is used to place <g> elements at the right position in a grid/matrix
		let position = d3
			.scalePoint()
			.domain(allVar)
			.range([0, this.vizSize - size]);

		const svg = d3.select("#splom-svg");

		// Create <g> elements at the correct positions for the "cells" of the SPLOM
		const cells = svg
			.selectAll("g")
			.data(pairs)
			.join("g")
			.classed("cell", true)
			.attr("transform", (d) => {
				let [var1, var2] = d;
				// console.log(var1, var2);
				return `translate(${
					position(var1) + padding + this.margin.left
				},${position(var2) + padding})`;
			});

		allVar.forEach((d, i) => {
			// Add labels for main horizontal axis
			svg.append("text")
				.text(d)
				.style("text-anchor", "middle")
				.attr(
					"transform",
					`translate(${i * size + size / 2 + this.margin.left}, ${
						this.vizSize + padding
					})`
				)
				.style("font-size", 12)
				.classed("cell", true);

			// Add text labels for main vertical axis
			svg.append("text")
				.text(d)
				.style("text-anchor", "middle")
				.attr(
					"transform",
					`translate(${10}, ${i * size + size / 2}) rotate(-90)`
				)
				.style("font-size", 12)
				.classed("cell", true);
		});

		// Filter the cells selection by the portion of the matrix the cells are in

		// Lower triangle will be used for hexbin plots
		const lowerCells = cells.filter((d) => {
			let [var1, var2] = d;
			return allVar.indexOf(var1) - allVar.indexOf(var2) < 0;
		});
		// Diagonal entries in matrix will be used for KDEs
		const diagonalCells = cells.filter((d) => {
			let [var1, var2] = d;
			return allVar.indexOf(var1) === allVar.indexOf(var2);
		});
		// Upper triangle will be used for rectangles which display correlation coefficients
		const upperCells = cells.filter((d) => {
			let [var1, var2] = d;
			return allVar.indexOf(var1) - allVar.indexOf(var2) > 0;
		});

		// Create hexbin plots on bottom-left of matrix

		lowerCells.each(function ([var1, var2]) {
			// Add X Scale of each graph
			let xextent = d3.extent(data, function (d) {
				return +d[var1];
			});
			const x = d3
				.scaleLinear()
				.domain(xextent)
				.range([0, size - 2 * padding])
				.nice();

			// Add Y Scale of each graph
			let yextent = d3.extent(data, function (d) {
				return +d[var2];
			});
			const y = d3
				.scaleLinear()
				.domain(yextent)
				.range([size - 2 * padding, 0])
				.nice();

			let tmp = d3.select(this);

			tmp.append("g")
				.attr("transform", `translate(0,${size - padding * 2})`)
				.call(d3.axisBottom(x).ticks(3)); //.tickFormat(d3.format(".1e"))
			tmp.append("g").call(d3.axisLeft(y).ticks(3));

			let hexbin = d3
				.hexbin()
				.x((d) => x(+d[var1]))
				.y((d) => y(+d[var2]))
				.radius(3.5)
				.extent([
					[0, 0],
					[size, size],
				]);

			let bins = hexbin(data);
			let color = d3
				.scaleSequential(d3.interpolateBuPu)
				.domain([0, d3.max(bins, (d) => d.length) / 2]);
			let radius = d3.scaleSqrt(
				[0, d3.max(bins, (d) => d.length)],
				[0, hexbin.radius() * Math.SQRT2]
			);

			tmp.append("g")
				.selectAll("path")
				.data(bins)
				.join("path")
				// .attr("d", (d) => hexbin.hexagon(radius(d.length)))
				.attr("d", (d) => hexbin.hexagon())
				.attr("transform", (d) => `translate(${d.x},${d.y})`)
				.attr("fill", (d) => color(d.length))
				.attr("stroke", "gray")
				.attr("stroke-width", 0.5);
		});

		// Create KDE plots on the diagonal of the triangle

		// Function to compute density estimate
		let kde = function (kernel, thresholds, data) {
			return thresholds.map((t) => [
				t,
				d3.mean(data, (d) => kernel(t - d)),
			]);
		};
		// Kernel function to use by KDE
		let epanechnikov = function (bandwidth) {
			return (x) =>
				Math.abs((x /= bandwidth)) <= 1
					? (0.75 * (1 - x * x)) / bandwidth
					: 0;
		};

		diagonalCells.each(function ([var1, var2]) {
			let varData = data.map((d) => +d[var1]);
			// Using data, x scale and draw the x axis
			const x = d3
				.scaleLinear()
				.domain(d3.extent(varData))
				.range([0, size - 2 * padding])
				.nice();

			let tmp = d3.select(this);
			tmp.append("g")
				.attr("id", `${var1}-kde-xaxis`)
				.attr("transform", `translate(0,${size - padding * 2})`)
				.call(d3.axisBottom(x).ticks(3));

			// Compute density estimate
			// https://en.wikipedia.org/wiki/Kernel_density_estimation#A_rule-of-thumb_bandwidth_estimator
			let bandwidth =
				1.06 * d3.deviation(varData) * varData.length ** (-1 / 5);
			let thresholds = x.ticks(40);
			let density = kde(epanechnikov(bandwidth), thresholds, varData);

			// Using density estimate, create y scale and draw y axis
			const y = d3
				.scaleLinear()
				.domain(d3.extent(density, (d) => d[1]))
				.range([size - 2 * padding, 0])
				.nice();
			tmp.append("g")
				.attr("id", `${var1}-kde-yaxis`)
				.call(d3.axisLeft(y).ticks(3));

			// Create an area chart for the KDE plot
			tmp.append("g")
				.attr("id", `${var1}-kde-area`)
				.selectAll("path")
				.data([density])
				.join("path")
				.attr("fill", "#f5cfa9")
				.attr("stroke", "#402D54")
				.attr("stroke-width", 1.5)
				.attr("stroke-linejoin", "round")
				.attr(
					"d",
					d3
						.area()
						.curve(d3.curveBasis) // Curve the line
						.x((d) => x(d[0])) // Data value
						.y0(y(0))
						.y1((d) => y(d[1])) // Density value
				);
		});

		// Create rectangles with Pearson correlation coefficients on the upper-right of matrix

		// From https://bl.ocks.org/nkullman/f65d5619843dc22e061d957249121408#computeStats.js
		let covar = function (arrX, arrY) {
			let u = d3.mean(arrX);
			let v = d3.mean(arrY);
			let arrXLen = arrX.length;
			let sq_dev = new Array(arrXLen);
			for (let i = 0; i < arrXLen; i++)
				sq_dev[i] = (arrX[i] - u) * (arrY[i] - v);
			return d3.sum(sq_dev) / (arrXLen - 1);
		};
		let computePearsons = function (arrX, arrY) {
			let num = covar(arrX, arrY);
			let denom = d3.deviation(arrX) * d3.deviation(arrY);
			return num / denom;
		};
		const divergingscale = d3
			.scaleDiverging()
			.domain([-1, 0, 1]) // Do [1, 0, -1] for interpolateRdBu
			.interpolator(d3.interpolatePuOr);

		upperCells.each(function ([var1, var2]) {
			let var1Vals = data.map((d) => +d[var1]);
			let var2Vals = data.map((d) => +d[var2]);

			let r = computePearsons(var1Vals, var2Vals);

			d3.select(this)
				.selectAll(".rGroup")
				.data([r])
				.join((enter) => {
					// Add rounded squares colored by correlation coefficient
					enter
						.append("rect")
						.attr("width", size - padding * 2)
						.attr("height", size - padding * 2)
						.attr("rx", 10)
						.attr("ry", 10)
						.attr("fill", (d) => divergingscale(d))
						.attr("stroke", "white")
						.on("mouseover", (event, d) => {
							// On mouseover, set stroke to black
							d3.select(event.target).attr("stroke", "black");
						})
						.on("mouseleave", (event, d) => {
							// Reset the stroke to white
							d3.select(event.target).attr("stroke", "white");
						});

					// Add text for Pearson's coefficient rounded to 3 decimals
					enter
						.append("text")
						.text((d) => `Corr: ${d3.format(".3f")(d)}`)
						.style("text-anchor", "middle")
						.attr(
							"transform",
							`translate(${size / 2 - padding}, ${
								size / 2 - padding
							})`
						)
						.style("font-size", 12)
						.classed("corr-text", true);
				});
		});
	}
}
