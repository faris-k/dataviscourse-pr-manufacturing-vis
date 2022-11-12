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
		this.traceData = globalApplicationState.traceData.filter(
			(d, i) => d.Beta1 && i <= 400
		);

		this.vizHeight = 600;
		this.margin = { top: 10, left: 10, right: 10, bottom: 10 };
		this.vizSize = 900 - this.margin.left - this.margin.right;

		const svg = d3
			.select("#splom-div")
			.append("svg")
			.attr("width", this.vizSize + this.margin.left * 3)
			.attr("height", this.vizSize + this.margin.top * 3)
			.append("g")
			.attr(
				"transform",
				`translate(${this.margin.left},${this.margin.top})`
			);

		const allVar = [
			"Beta1",
			"Beta2",
			"ChiSquare1",
			"Exponential1",
			"InverseGamma1",
			"Laplace2",
			"Normal1",
		];
		const numVar = allVar.length;

		// Calculate the size of a single chart, keeping some padding between them
		let padding = 20;
		let size = this.vizSize / numVar;

		// Create a scale: gives the position of each pair each variable
		const position = d3
			.scalePoint()
			.domain(allVar)
			.range([0, this.vizSize - size]);

		allVar.forEach((d, i) => {
			// Add labels for main horizontal axis
			svg.append("text")
				.text(d)
				.style("text-anchor", "middle")
				.attr(
					"transform",
					`translate(${i * size + size / 2 + this.margin.left}, ${
						this.vizSize + 15
					})`
				)
				.style("font-size", 12);
			// Add text labels for main vertical axis
			svg.append("text")
				.text(d)
				.style("text-anchor", "middle")
				.attr(
					"transform",
					`translate(${0}, ${i * size + size / 2}) rotate(-90)`
				)
				.style("font-size", 12);
		});

		// Add scatter plots
		for (let i in allVar) {
			for (let j in allVar) {
				// Get current variable name
				let var1 = allVar[i];
				let var2 = allVar[j];

				console.log(var1, var2);

				// Skip diagonal entries in matrix (var1 === var2)
				if (var1 === var2) {
					continue;
				}

				// Add X Scale of each graph
				let xextent = d3.extent(this.traceData, function (d) {
					return +d[var1];
				});
				const x = d3
					.scaleLinear()
					.domain(xextent)
					.range([0, size - 2 * padding])
					.nice();

				// Add Y Scale of each graph
				let yextent = d3.extent(this.traceData, function (d) {
					return +d[var2];
				});
				const y = d3
					.scaleLinear()
					.domain(yextent)
					.range([size - 2 * padding, 0])
					.nice();

				// Add a 'g' at the right position
				const tmp = svg
					.append("g")
					.attr(
						"transform",
						`translate(${
							position(var1) + padding + this.margin.left
						},${position(var2) + padding})`
					);

				// Add X and Y axis in tmp
				tmp.append("g")
					.attr("transform", `translate(0,${size - padding * 2})`)
					.call(d3.axisBottom(x).ticks(3));
				tmp.append("g").call(d3.axisLeft(y).ticks(3));

				// Add circles to scatterplot
				tmp.selectAll("myCircles")
					.data(this.traceData)
					.join("circle")
					.attr("cx", (d) => x(+d[var1]))
					.attr("cy", (d) => y(+d[var2]))
					.attr("r", 3)
					.attr("fill", "#402D54")
					.attr("opacity", 0.5);
			}
		}

		// Add histograms along the diagonal
		for (let i in allVar) {
			for (let j in allVar) {
				// variable names
				let var1 = allVar[i];
				let var2 = allVar[j];

				// Add histograms only along the diagonal (where i === j)
				if (i != j) {
					continue;
				}

				// create X Scale
				let xextent = d3.extent(this.traceData, function (d) {
					return +d[var1];
				});
				const x = d3
					.scaleLinear()
					.domain(xextent)
					.range([0, size - 2 * padding])
					.nice();

				// Add a 'g' at the right position
				const tmp = svg
					.append("g")
					.attr(
						"transform",
						`translate(${position(var1) + padding},${
							position(var2) + padding
						})`
					);

				// Add x axis
				tmp.append("g")
					.attr("transform", `translate(0,${size - padding * 2})`)
					.call(d3.axisBottom(x).ticks(3));

				// set the parameters for the histogram
				const histogram = d3
					.histogram()
					.value((d) => +d[var1])
					.domain(x.domain()) // then the domain of the graphic
					.thresholds(x.ticks(15)); // then the numbers of bins

				// And apply this function to data to get the bins
				const bins = histogram(this.traceData);

				// Y axis: scale and draw
				const y = d3
					.scaleLinear()
					.domain([0, d3.max(bins, (d) => d.length)])
					.range([size - 2 * padding, 0])
					.nice();

				// append rectangles to svg
				tmp.append("g")
					.selectAll("rect")
					.data(bins)
					.join("rect")
					.attr("x", 1)
					.attr(
						"transform",
						(d) => `translate(${x(d.x0)},${y(d.length)})`
					)
					.attr("width", (d) => x(d.x1) - x(d.x0))
					.attr("height", (d) => size - 2 * padding - y(d.length))
					.style("fill", "#D18975")
					.attr("stroke", "white");

				// // KDE
				// let kde = this.kernelDensityEstimator(
				// 	this.kernelEpanechnikov(7),
				// 	x.ticks(40)
				// );
				// let density = kde(
				// 	this.traceData.map(function (d) {
				// 		return +d[var1];
				// 	})
				// );

				// tmp.append("g")
				// 	.append("path")
				// 	.datum(density)
				// 	.attr("fill", "#69b3a2")
				// 	.attr("opacity", ".8")
				// 	.attr("stroke", "#000")
				// 	.attr("stroke-width", 1)
				// 	.attr("stroke-linejoin", "round")
				// 	.attr(
				// 		"d",
				// 		d3
				// 			.line()
				// 			.curve(d3.curveBasis)
				// 			.x(function (d) {
				// 				return x(d[0]);
				// 			})
				// 			.y(function (d) {
				// 				return y(d[1]);
				// 			})
				// 	);
			}
		}
	}

	// Functions for KDE plots instead of histograms
	kernelDensityEstimator(kernel, X) {
		return function (V) {
			return X.map(function (x) {
				return [
					x,
					d3.mean(V, function (v) {
						return kernel(x - v);
					}),
				];
			});
		};
	}
	kernelEpanechnikov(k) {
		return function (v) {
			return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
		};
	}
}
