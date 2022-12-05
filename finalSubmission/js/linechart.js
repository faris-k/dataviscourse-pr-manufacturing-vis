/** Class implementing the table, heavily borrows from HW5 */
class LineChart {
	/**
	 * Creates a LineChart Object
	 * @param globalApplicationState The shared global application state (has the data in it)
	 */
	constructor(globalApplicationState) {
		this.globalApplicationState = globalApplicationState;
		this.traceData = globalApplicationState.traceData;

		this.vizWidth = 900;
		this.vizHeight = 700;
		this.margin = { top: 25, left: 50, right: 25, bottom: 25 };

		const svg = d3
			.select("#linechart-div")
			.append("svg")
			.attr("id", "linechart-svg")
			.attr("width", this.vizWidth)
			.attr("height", this.vizHeight);

		let accordionParent = d3
			.select("#button-div")
			.append("div")
			.classed("accordion", true)
			.attr("id", "accordionExample");

		let accordionItem = accordionParent
			.append("div")
			.classed("accordion-item", true);

		let accordionHeader = accordionItem
			.append("h2")
			.classed("accordion-header", true)
			.attr("id", "headingOne");

		let accordionButton = accordionHeader
			.append("button")
			.classed("accordion-button", true)
			.attr("type", "button")
			.attr("data-bs-toggle", "collapse")
			.attr("data-bs-target", "#collapseOne")
			.attr("aria-expanded", "true")
			.attr("aria-controls", "collapseOne")
			.text("Variable Selection");

		let collapseDiv = accordionItem
			.append("div")
			.attr("id", "collapseOne")
			.classed("accordion-collapse", true)
			.classed("collapse", true)
			.classed("show", true)
			.attr("aria-labelledby", "headingOne")
			.attr("data-bs-parent", "#accordionExample");

		let accordionBody = collapseDiv
			.append("div")
			.classed("accordion-body", true);
		accordionBody.append("strong").text("Select variables to display:");

		let accordionContent = accordionBody
			.append("div")
			.classed("container", true)
			// .classed("text-center", true)
			.attr("id", "checkbox-container-div");

		let accordionContentCols = accordionContent
			.append("div")
			.classed("row", true)
			.classed("row-cols-3", true);

		this.allVar = Object.keys(this.traceData[0])
			.filter((d) => d.includes("Scaled"))
			.map((d) => d.slice(0, d.indexOf("_")));

		const colorScale = d3
			.scaleOrdinal()
			.domain(this.allVar)
			.range(d3.schemeTableau10);

		let checkForms = accordionContentCols
			.selectAll("myLegend")
			.data(this.allVar)
			.enter()
			.append("div")
			.classed("col", true)
			.append("div")
			.classed("form-check", true);

		let formCheckInputs = checkForms
			.append("input")
			.classed("form-check-input", true)
			.attr("type", "checkbox")
			.attr("value", "")
			.attr("id", (d) => `${d}-check-input`)
			.attr("checked", true);

		let formCheckLabels = checkForms
			.append("label")
			.classed("form-check-label", true)
			.attr("for", (d) => `flexCheck${d}`)
			.text((d) => d)
			.attr("id", (d) => d);

		function add(target, source) {
			source.forEach((v) => {
				let p = target.indexOf(v);
				if (p === -1) {
					target.push(v);
				} else {
					target.splice(p, 1);
				}
			});
			return target;
		}

		formCheckInputs.on("click", (event, d) => {
			let checked = event.target.checked;

			d3.selectAll(`.${d}`)
				.transition()
				.attr("opacity", checked ? 1 : 0);

			if (!globalApplicationState.selectedVars.includes(d)) {
				globalApplicationState.selectedVars.push(d);
				globalApplicationState.selectedVars.sort();
			} else {
				globalApplicationState.selectedVars.splice(
					globalApplicationState.selectedVars.indexOf(d),
					1
				);
				globalApplicationState.selectedVars.sort();
			}
		});

		// this.drawChart(this.traceData, 400);
		this.focusAndContext1(this.traceData);
	}

	focusAndContext1(data, nRows = 400) {
		/**
		 * Example from https://observablehq.com/@connor-roche/multi-line-chart-focus-context-w-mouseover-tooltip
		 */

		if (nRows === null) {
			nRows = data.length;
		}
		data = data.filter((d, i) => {
			return i <= nRows;
		});

		var svg = d3.select("#linechart-svg");

		// sets margins for both charts
		var focusChartMargin = { top: 20, right: 20, bottom: 250, left: 60 };
		var contextChartMargin = { top: 470, right: 20, bottom: 90, left: 60 };

		// width of both charts
		var chartWidth =
			this.vizWidth - focusChartMargin.left - focusChartMargin.right;

		// height of either chart
		var focusChartHeight =
			this.vizHeight - focusChartMargin.top - focusChartMargin.bottom;
		var contextChartHeight =
			this.vizHeight - contextChartMargin.top - contextChartMargin.bottom;

		svg.append("g")
			.attr(
				"transform",
				"translate(" +
					focusChartMargin.left +
					"," +
					focusChartMargin.top +
					")"
			)
			.attr("overflow", "visible");

		// Skip parseTime thru maxYAxisValue

		// set the height of both y axis
		var yFocus = d3.scaleLinear().range([focusChartHeight, 0]);
		var yContext = d3.scaleLinear().range([contextChartHeight, 0]);

		// set the width of both x axis
		var xFocus = d3.scaleTime().range([0, chartWidth]);
		var xContext = d3.scaleTime().range([0, chartWidth]);

		// create both x axis to be rendered
		var xAxisFocus = d3
			.axisBottom(xFocus)
			.ticks(10)
			.tickFormat(d3.timeFormat("%H:%M"));
		var xAxisContext = d3
			.axisBottom(xContext)
			.ticks(10)
			.tickFormat(d3.timeFormat("%H:%M"));

		// create the one y axis to be rendered
		var yAxisFocus = d3.axisLeft(yFocus);

		// build brush
		var brush = d3
			.brushX()
			.extent([
				[0, -10],
				[chartWidth, contextChartHeight],
			])
			.on("brush end", (event) =>
				brushed(event, this.globalApplicationState)
			);

		// build zoom for the focus chart
		// as specified in "filter" - zooming in/out can be done by pinching on the trackpad while mouse is over focus chart
		// zooming in can also be done by double clicking while mouse is over focus chart
		var zoom = d3
			.zoom()
			.scaleExtent([1, Infinity])
			.translateExtent([
				[0, 0],
				[chartWidth, focusChartHeight],
			])
			.extent([
				[0, 0],
				[chartWidth, focusChartHeight],
			])
			.on("zoom", (event) => zoomed(event, this.globalApplicationState))
			.filter(
				(event) =>
					// event.ctrlKey ||
					// event.type === "dblclick" ||
					event.type === "mousedown1" // "zooming breaks code"
			);

		// create a line for focus chart
		var lineFocus = d3
			.line()
			.x((d) => xFocus(d.time))
			.y((d) => yFocus(d.scaleVal))
			.defined((d) => d.scaleVal);
		// .curve(d3.curveBasis);

		// create line for context chart
		var lineContext = d3
			.line()
			.x((d) => xContext(d.time))
			.y((d) => yContext(d.scaleVal))
			.defined((d) => d.scaleVal)
			.curve(d3.curveBasis);

		// clip is created so when the focus chart is zoomed in the data lines don't extend past the borders
		var clip = svg
			.append("defs")
			.append("svg:clipPath")
			.attr("id", "clip")
			.append("svg:rect")
			.attr("width", chartWidth)
			.attr("height", focusChartHeight)
			.attr("x", 0)
			.attr("y", 0);

		// append the clip
		var focusChartLines = svg
			.append("g")
			.attr("class", "focus")
			.attr(
				"transform",
				"translate(" +
					focusChartMargin.left +
					"," +
					focusChartMargin.top +
					")"
			)
			.attr("clip-path", "url(#clip)")
			.attr("id", "focus-lines-g");

		// create focus chart
		var focus = svg
			.append("g")
			.attr("class", "focus")
			.attr(
				"transform",
				"translate(" +
					focusChartMargin.left +
					"," +
					focusChartMargin.top +
					")"
			);

		// create context chart
		var context = svg
			.append("g")
			.attr("class", "context")
			.attr(
				"transform",
				"translate(" +
					contextChartMargin.left +
					"," +
					(contextChartMargin.top + 50) +
					")"
			);

		// add data info to axis
		xFocus.domain(d3.extent(data, (d) => d.Time));
		yFocus.domain([0, 1]);
		xContext.domain(xFocus.domain());
		yContext.domain(yFocus.domain());

		// add axis to focus chart
		focus
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + focusChartHeight + ")")
			.call(xAxisFocus);
		focus.append("g").attr("class", "y-axis").call(yAxisFocus);

		// Get group names: keys of Object (take any row of data), then we want 3rd element and onwards
		const groups = Object.keys(data[0])
			.slice(2)
			.filter((d) => !d.includes("Scaled"));
		// console.log("groups", groups);

		// Reformat the data: we need an array of arrays of {x, y} tuples, e.g.:
		//  >   0: {name: 'Beta1', values: Array(401)}
		//  V   1: {name: 'Beta2', values: Array(401)}
		//          values: Array(401)
		//              {time: ___, scaleVal: ___, trueVal: ___}
		const dataReady = groups.map(function (groupName) {
			return {
				name: groupName,
				values: data.map((d) => {
					return {
						time: d.Time,
						scaleVal: +d[groupName + "_Scaled"],
						trueVal: +d[groupName],
					};
				}),
			};
		});

		// A color scale: one color for each group
		const colorScale = d3
			.scaleOrdinal()
			.domain(groups)
			.range(d3.schemeTableau10);

		// Create lines for the charts
		let focusChartPath = focusChartLines
			.selectAll("path")
			.data(dataReady)
			.join("path")
			.attr("class", (d, i) => groups[i])
			.attr("d", (d) => lineFocus(d.values))
			.attr("opacity", 1)
			.attr("fill", "none")
			.attr("stroke", (d, i) => colorScale(groups[i]))
			.attr("stroke-width", 1.75);

		context
			.selectAll("path")
			.data(dataReady)
			.join("path")
			.attr("class", (d, i) => groups[i])
			// .attr("d", (d) => lineContext(d.values))
			.attr("d", (d) => lineContext(d.values))
			.attr("fill", "none")
			.attr("stroke", (d, i) => colorScale(groups[i]))
			.attr("stroke-width", 1.5);

		// add x axis to context chart (y axis is not needed)
		context
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + contextChartHeight + ")")
			.call(xAxisContext);

		// add brush to context chart
		var contextBrush = context
			.append("g")
			.attr("class", "brush")
			.call(brush);

		// style brush resize handle
		var brushHandlePath = (d) => {
			var e = +(d.type === "e"),
				x = e ? 1 : -1,
				y = contextChartHeight + 10;
			return (
				"M" +
				0.5 * x +
				"," +
				y +
				"A6,6 0 0 " +
				e +
				" " +
				6.5 * x +
				"," +
				(y + 6) +
				"V" +
				(2 * y - 6) +
				"A6,6 0 0 " +
				e +
				" " +
				0.5 * x +
				"," +
				2 * y +
				"Z" +
				"M" +
				2.5 * x +
				"," +
				(y + 8) +
				"V" +
				(2 * y - 8) +
				"M" +
				4.5 * x +
				"," +
				(y + 8) +
				"V" +
				(2 * y - 8)
			);
		};

		var brushHandle = contextBrush
			.selectAll(".handle--custom")
			.data([{ type: "w" }, { type: "e" }])
			.enter()
			.append("path")
			.attr("class", "handle--custom")
			.attr("stroke", "#000")
			.attr("cursor", "ew-resize")
			.attr("d", brushHandlePath);

		// overlay the zoom area rectangle on top of the focus chart
		var rectOverlay = svg
			.append("rect")
			.attr("cursor", "move")
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.attr("class", "zoom")
			.attr("width", chartWidth)
			.attr("height", focusChartHeight)
			.attr(
				"transform",
				"translate(" +
					focusChartMargin.left +
					"," +
					focusChartMargin.top +
					")"
			)
			.attr("id", "rect-overlay")
			.call(zoom)
			.on("mousemove", (event, globalApplicationState) =>
				focusMouseMove(event, this.globalApplicationState)
			)
			.on("mouseover", focusMouseOver)
			.on("mouseout", focusMouseOut)
			.style("cursor", "auto");

		// create vertical line to follow mouse
		var mouseLine = focus
			.append("path")
			.attr("class", "mouse-line")
			.attr("stroke", "#303030")
			.attr("stroke-width", 2)
			.attr("opacity", "0");

		var tooltip = focus
			.append("g")
			.attr("class", "tooltip-wrapper")
			.attr("display", "none");

		var tooltipBackground = tooltip
			.append("rect")
			.attr("fill", "#e8e8e8")
			.attr("rx", 10);

		var tooltipText = tooltip.append("text");

		contextBrush.call(brush.move, [0, chartWidth / 2]);

		// focus chart x label
		focus
			.append("text")
			.attr(
				"transform",
				"translate(" +
					chartWidth / 2 +
					" ," +
					(focusChartHeight + focusChartMargin.top + 25) +
					")"
			)
			.style("text-anchor", "middle")
			.style("font-size", "18px")
			.text("Time");

		// focus chart y label
		focus
			.append("text")
			.attr("text-anchor", "middle")
			.attr(
				"transform",
				"translate(" +
					(-focusChartMargin.left + 20) +
					"," +
					focusChartHeight / 2 +
					")rotate(-90)"
			)
			.style("font-size", "18px")
			.text("Normalized Value");

		var brushBounds = null;

		function brushed(event, globalApplicationState) {
			if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

			// console.log("event", event);
			tooltip.attr("display", "none");
			focus.selectAll(".tooltip-line-circles").remove();
			mouseLine.attr("opacity", "0");
			var s = event.selection || xContext.range();
			brushBounds = s;

			xFocus.domain(s.map(xContext.invert, xContext));
			globalApplicationState.bounds = xFocus.domain();

			focusChartLines
				.selectAll(".line")
				.attr("stroke", "black")
				.attr("d", lineFocus);

			focusChartPath.attr("d", (d) => lineFocus(d.values));

			focus.select(".x-axis").call(xAxisFocus);
			svg.select(".zoom").call(
				zoom.transform,
				d3.zoomIdentity
					.scale(chartWidth / (s[1] - s[0]))
					.translate(-s[0], 0)
			);
			brushHandle
				.attr("display", null)
				.attr(
					"transform",
					(d, i) =>
						"translate(" + [s[i], -contextChartHeight - 20] + ")"
				);
		}

		function arrayEquals(a, b) {
			return (
				Array.isArray(a) &&
				Array.isArray(b) &&
				a.length === b.length &&
				a.every((val, index) => val === b[index])
			);
		}

		function zoomed(event, globalApplicationState) {
			if (event.sourceEvent && event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
			tooltip.attr("display", "none");
			focus.selectAll(".tooltip-line-circles").remove();
			mouseLine.attr("opacity", "0");
			var t = event.transform;
			xFocus.domain(t.rescaleX(xContext).domain());
			focusChartPath.attr("d", (d) => lineFocus(d.values));
			focus.select(".x-axis").call(xAxisFocus);
			var brushSelection = xFocus.range().map(t.invertX, t);

			if (!arrayEquals(brushSelection, brushBounds)) {
				// contextBrush.call(brush.move, brushSelection);
				brush.move(contextBrush, brushSelection);
				globalApplicationState.bounds = xFocus.domain();
			}

			// brush.move(contextBrush, brushSelection);
			// contextBrush.call(brush.move, brushSelection);
			brushHandle
				.attr("display", null)
				.attr(
					"transform",
					(d, i) =>
						"translate(" +
						[brushSelection[i], -contextChartHeight - 20] +
						")"
				);
		}

		const availableDates = data.map((d) => d.Time);

		let keys = Object.keys(data[0]).filter((d) => {
			if (d != "Time" && d != "Id") {
				return true;
			}
		});

		let FG = d3.flatGroup(data, (d) => d.Time);
		let groupValuesByX = {};
		FG.map((d) => {
			let vals = { ...d[1][0] };
			delete vals.Time;
			delete vals.Id;
			groupValuesByX[d[0]] = vals;
		});
		// console.log(groupValuesByX);
		// console.log("data afterwards", data);

		function focusMouseMove(event, globalApplicationState) {
			// console.log("focusMouseMove event", event);

			let mouse = [
				event.offsetX - focusChartMargin.left,
				event.offsetY - focusChartMargin.top,
			];
			// console.log("mouse", mouse);

			var dateOnMouse = xFocus.invert(mouse[0]);

			// console.log("dateOnMouse", new Date(dateOnMouse));
			let availableDates = data.map((d) => d.Time);
			// availableDates.sort();

			// console.log("availableDates[100]", availableDates);

			var nearestDateIndex = d3.bisect(availableDates, dateOnMouse);
			// console.log("nearestDateIndex", nearestDateIndex);
			// get the dates on either of the mouse cord
			var d0 = availableDates[nearestDateIndex - 1];
			var d1 = availableDates[nearestDateIndex];
			// console.log("d0, d1", d0, d1);
			var closestDate;
			if (d0 < xFocus.domain()[0]) {
				closestDate = d1;
			} else if (d1 > xFocus.domain()[1]) {
				closestDate = d0;
			} else {
				// decide which date is closest to the mouse
				closestDate = dateOnMouse - d0 > d1 - dateOnMouse ? d1 : d0;
			}
			// console.log("closestDate", closestDate);

			var nearestDateYValues = groupValuesByX[closestDate];
			var nearestDateXCord = xFocus(new Date(closestDate));

			// console.log("nearestDateYValues", nearestDateYValues);

			mouseLine
				.attr("d", `M ${nearestDateXCord} 0 V ${focusChartHeight}`)
				.attr("opacity", "1");

			tooltipText.selectAll(".tooltip-text-line").remove();
			focus.selectAll(".tooltip-line-circles").remove();
			// console.log("xFocus.domain()", xFocus.domain());
			var formatTime = d3.timeFormat("%H:%M");
			tooltipText
				.append("tspan")
				.attr("class", "tooltip-text-line")
				.attr("x", "5")
				.attr("y", "5")
				.attr("dy", "13px")
				.attr("font-weight", "bold")
				.text(`Time: ${formatTime(closestDate)}`);

			tooltipText
				.append("tspan")
				.attr("class", "tooltip-text-line")
				.attr("x", "5")
				// .attr("y", "5")
				.attr("dy", "17px")
				.attr("font-style", "italic")
				.text(`(scaled value, true value)`);

			let counter = 0;

			for (let key of globalApplicationState.selectedVars) {
				focus
					.append("circle")
					.attr("class", "tooltip-line-circles")
					.attr("r", 5)
					.attr("fill", colorScale(key))
					.attr("opacity", 1)
					.attr("cx", nearestDateXCord)
					.attr("cy", yFocus(nearestDateYValues[`${key}_Scaled`]));

				tooltipText
					.append("tspan")
					.attr("class", "tooltip-text-line")
					.attr("x", "5")
					.attr("dy", counter === 0 ? "20px" : `15px`)
					.attr("fill", colorScale(key))
					.attr("opacity", 1)
					.text(
						`${key}: ${nearestDateYValues[`${key}_Scaled`].toFixed(
							2
						)}, ${nearestDateYValues[key].toFixed(2)}`
					);
				counter++;
			}

			var tooltipWidth = tooltipText.node().getBBox().width;
			var tooltipHeight = tooltipText.node().getBBox().height;
			var rectOverlayWidth = rectOverlay.node().getBBox().width;
			tooltipBackground
				.attr("width", tooltipWidth + 10)
				.attr("height", tooltipHeight + 10);
			if (nearestDateXCord + tooltipWidth >= rectOverlayWidth) {
				tooltip.attr(
					"transform",
					"translate(" +
						(nearestDateXCord - tooltipWidth - 20) +
						"," +
						mouse[1] +
						")"
				);
			} else {
				tooltip.attr(
					"transform",
					"translate(" +
						(nearestDateXCord + 10) +
						"," +
						mouse[1] +
						")"
				);
			}
		}

		function focusMouseOver() {
			mouseLine.attr("opacity", "1");
			tooltip.attr("display", null);
		}

		function focusMouseOut() {
			mouseLine.attr("opacity", "0");
			tooltip.attr("display", "none");
			focus.selectAll(".tooltip-line-circles").remove();
		}

		this.globalApplicationState.bounds = xFocus.domain();
		// console.log(brushBounds);
		// console.log(this.globalApplicationState);
	}
}
