/** Class implementing the Bar Chart for Node Visit Timing. */
class MaterialSequecne {
//
//   Creates a Node Visit Bar Chart for Manufacturing Equipment Project
//     
    constructor(materialEventData) {
		console.log("Entering MaterialSequence...");
        this.materialEventData = materialEventData;
		
        

		this.svgWidth = 700;
		this.svgHeight = 900;
		this.phraseWidth = 150;
        this.freqVizWidth = 150;
		this.percVizWidth = 300;
		this.totalWidth = 100;
        this.vizHeight = 20;
		this.legendHeight = 50;
		
		this.blue = "#5588ff";
		this.ltblue = "#99ccff";
		this.drkblue = "#005073";
		this.red = "#ff0000";
		this.ltred = "#ff7b7b";
		this.drkred = "#a70000";
		this.white = "#ffffff";
		this.colorScale = d3.schemeSet1;
		this.margins = { top: 50, left: 20, right: 20, bottom: 50 }
		this.marginFactor = 0.9
		
		this.columnSelected = "None";
		
        this.scaleFreqX = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.marginFactor * this.freqVizWidth]);
			
        this.scalePercX = d3.scaleLinear()
            .domain([0,100])
            .range([0, this.marginFactor * this.percVizWidth/2]);
			
        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
		
//
//  Draw the legend for the table
//
		var phraseXStart = this.margins.left;
		var freqXStart = phraseXStart + this.phraseWidth;
		var freqLabelSpacing = this.freqVizWidth / 3;
		var percDemXStart = freqXStart + this.freqVizWidth;
		var percRepXStart = percDemXStart + this.percVizWidth / 2;
		var percLabelSpacing = this.percVizWidth / 4.7;

		
//		console.log("table drawLegend: ", freqXStart, freqLabelSpacing, percRepXStart, percLabelSpacing);
		
		let tableLegend = d3.select('#percRepAxis')
							.append('line')
							.attr('x1', 0)
							.attr('x2', 0)
//							.attr('y1', this.legendHeight / 2)
							.attr('y1', 25)
							.attr('y2', this.legendHeight)
							.attr('stroke', 'black')
							.attr('stroke-width', 1);
		
		d3.select('#phraseAxis')
		  .style('height', this.legendHeight);

		d3.select('#totalAxis')
		  .style('height', this.legendHeight);

		
		var freqLabels = ["0.0","0.5","1.0"];
		var mAxis = d3.select('#freqAxis')
				   .style('height', this.legendHeight)
				   .selectAll('text')
				   .data(freqLabels)
				   .enter()
				   .append('text')
				   .attr('y', 20)
				   .attr('x', (d,i) => (i) * freqLabelSpacing) 
				   .style('fill', 'black')
				   .text((d) => d);
				   	
		var percDemLabels = ["100","50","0"];
		d3.select('#percDemAxis')
				.style('height', this.legendHeight)
				.selectAll('text')
				.data(percDemLabels)
				.enter()
				.append('text')
				.attr("x", (d,i) => (i) * percLabelSpacing + 10)
				.attr("y", 20)
				.attr("fill", "black")
				.text((d) => d);
				
		var percRepLabels = ["50","100"];
		d3.select('#percRepAxis')
				.style('height', this.legendHeight)
				.selectAll('text')
				.data(percRepLabels)
				.enter()
				.append('text')
				.attr("x", (d,i) => (i+1) * this.marginFactor * percLabelSpacing - 10)
				.attr("y", 20)
				.attr("fill", "black")
				.text((d) => d);

//		Set up event listener to listen for brush activity in the bubbles and react accordingly
//

    }


    drawTable() {
		
		if (window.brushActive) {
			console.log("Going to display brushed selection in table !", brushedValues);
			if (this.brushedTableData.length != brushedValues.length) {
				this.brushedTableData = [];
				for (let i = 0; i < brushedValues.length; i++) {
					let phr = brushedValues[i].phrase;
					let index = this.tableData.findIndex(d => {return d.phrase === phr});
					this.brushedTableData.push(this.tableData[index]);
				};
				console.log("brushedTableData to display ", this.brushedTableData);	
			};
		};	
	
        this.updateHeaders();
		
        let rowSelection = d3.select('#phraseTableBody')
            .selectAll('tr')
            .data(window.brushActive ? this.brushedTableData : this.tableData)
            .join('tr');
			
//		console.log("rowSelection = ", rowSelection);

		console.log("drawTable 1: Here we are!");
		
        let displaySelection = rowSelection.selectAll('td')
            .data(this.phraseToTableTransform)
            .join('td');

        let svgSelect = displaySelection.selectAll('svg')
            .data(d => [d])
//			.each((d,i) => console.log("svgSelection: i, d = ", i, d))
            .join('svg')
            .attr('width', this.phraseWidth)
            .attr('height', this.vizHeight);
			
		console.log("svgSelect = ", svgSelect)

		let textSelection = svgSelect.filter(d => d.type === 'text');
		
		console.log("textSelection = ", textSelection);
		
		let txtSelect = textSelection.selectAll('svg')
				 .data(d => [d])
				 .enter().append('text')
				 .join('svg')
				 .attr('x', 0)
				 .attr('y', 10)
//				 .each((d,i) => console.log("txtSelect: i,d = ", i,d.value))
				 .text(d => d.value)
				 .style('fill', 'black');
		
		let vizSelection = svgSelect.filter(d => d.type === 'viz');
		
		console.log("vizSelection = ", vizSelection);
		
		let vizSelect = vizSelection.selectAll('svg')
				.data(d => [d])
//				.enter()
				.join('svg')
				.attr('width', this.freqVizWidth)
				.attr('height', this.vizHeight)
//				.each((d,i) => console.log("vizSelection: ", i, d.value))
				.attr('x', 0)
				.attr('y',0);
		
			
        this.addRectangles(vizSelect);
    }

    phraseToTableTransform(d) {
		
			let phraseInfo = {
				type: 'text',
				class: 'phrase',
				value: d.phrase,
				cat: d.category
				};

			let frequencyInfo = {
				type: 'viz',
				class: 'frequency',
				value: +d.total * 2,
				cat: d.category
				};
		
			let percentDemInfo = {
				type: 'viz',
				class: 'percentDem',
				value: +d.percent_of_d_speeches
				};
				
			let percentRepInfo = {
				type: 'viz',
				class: 'percentRep',
				value: +d.percent_of_r_speeches
				};
				
			let totalInfo = {
				type: 'text',
				class: 'total',
				value: +d.total
				};

			let dataList = [phraseInfo, frequencyInfo, percentDemInfo, percentRepInfo, totalInfo];
		
			return dataList;
		}


    updateHeaders() {
//        
//      update the column headers based on the sort state
//         
//		console.log("Entering updateHeaders: ", this.headerData);
		
		let ascCode = "\uf885";
		let dscCode = "\uf160";
		let ascAlphaCode = "\uf15e";
		let dscAlphaCode = "\uf881";
		let sortCode = "";
		
		let allHeaders = d3.select("#columnHeaders")
						   .selectAll(".fa")
						   .remove();
						   
		if (this.headerData[0].sorted) {
			sortCode = dscAlphaCode;
			if (this.headerData[0].ascending) {sortCode = ascAlphaCode};
		
			let phraseHeader = d3.select("#phrase")
								.classed("fas no-display", false)
								.append("text")
								.attr("class","fa")
								.attr("x",0)
								.attr("y",0)
								.attr("font-size","25px")
								.attr("fill","black")
								.text(sortCode);
		}

		if (this.headerData[1].sorted) {
			sortCode = dscCode;
			if (this.headerData[1].ascending) {sortCode = ascCode};
	
			let frequencyHeader = d3.select("#frequency")
								.classed("fas no-display", false)
								.append("text")
								.attr("class","fa")
								.attr("x",0)
								.attr("y",0)
								.attr("font-size","25px")
								.attr("fill","black")
								.text(sortCode);
		}

		if (this.headerData[2].sorted) {
			sortCode = dscCode;
			if (this.headerData[2].ascending) {sortCode = ascCode};
			
			let percentageHeader = d3.select("#percentage")
								.classed("fas no-display", false)
								.append("text")
								.attr("class","fa")
								.attr("x",0)
								.attr("y",0)
								.attr("font-size","25px")
								.attr("color", "blue")
								.attr("fill","blue")
								.text(sortCode);		
		}										     
		if (this.headerData[3].sorted) {
			sortCode = dscCode;
			if (this.headerData[3].ascending) {sortCode = ascCode};
			
			let totalHeader = d3.select("#total")
								.classed("fas no-display", false)
								.append("text")
								.attr("class","fa")
								.attr("x",0)
								.attr("y",0)
								.attr("font-size","25px")
								.attr("color", "blue")
								.attr("fill","blue")
								.text(sortCode);		
		}		
//		console.log("Leavinge updateHeaders: ", this.headerData);
    }

    addRectangles(containerSelect) {
//        
//         *add rectangles for the bar charts
//         
		console.log("addRectangles: containerSelect = ", containerSelect);
		
		let xShift = 0;
		
		let vizFreq = containerSelect.filter(d => d.class === 'frequency');
		let frequencyRectangles = vizFreq.selectAll('g')
							.data(d => [d])
							.enter()
							.append('rect')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', (d) => this.scaleFreqX(d.value))
							.attr('height', this.vizHeight - 3)
							.style('stroke', 'black')
						    .style('stroke-width', 0.5)
//	 		 				.each((d,i) => console.log("Freq rectangles: i,d = ", i, d.value, d.cat))
							.style('fill', (d,i) => gColorScale[gCategories.indexOf(d.cat)]);						
		
		let demPerc = containerSelect.filter(d => d.class === 'percentDem');
//		console.log("demPerc = ", polPerc);
		let percentdemRectangles = demPerc.selectAll('g')
							.data(d => [d])
							.enter()
							.append('rect')
							.attr('x', (d) => (this.percVizWidth / 2) - this.scalePercX(d.value) - xShift)
							.attr('width', (d) =>  this.scalePercX(d.value))
							.attr('height', this.vizHeight - 3)
							.style('stroke', 'black')
							.style('stroke-width', 0.5)
//							.each((d) => console.log("Dem percentage rectangles: ", d))
							.style('fill', this.ltblue);
		
		
		let repPerc = containerSelect.filter(d => d.class === 'percentRep');
		let percentRepRectangles = repPerc.selectAll('g')
							.data(d => [d])
							.enter()
							.append('rect')
							.attr('x', 0)
							.attr('y', 0)
							.attr('width', (d) => this.scalePercX(d.value))
							.attr('height', this.vizHeight - 3)
							.style('stroke', 'black')
							.style('stroke-width', 0.5)
//							.each(d => console.log("Republican rectangles: ", d))
							.style('fill', this.ltred);
										
//		console.log("addRectangles: marginExtraRectangles = ", marginExtraRectangles);
																				 
    }


    attachSortHandlers() { 
    
//         Attach click handlers to all the th elements inside the columnHeaders row.
//         The handler should sort based on that column and alternate between ascending/descending.
//         
//		console.log("Entering attachSortHandlers 1: ", this.headerData);
		
		function comp(a,b,ascend) {
			if (a > b) return ascend ? 1 : -1;
			if (a < b) return ascend ? -1 : 1;
			return 0;
		}
			
		let columnSelection = d3.select('#columnHeaders');
		columnSelection.on('click', (event, d) => 
		
		{
		console.log("click ",event.target.id);
		this.columnSelected = event.target.id;
			
		console.log("selected... ", this.columnSelected, this.headerData);
		if (this.columnSelected == "phrase") {
			this.headerData[0].sorted = true;
			this.headerData[1].sorted = false;
			this.headerData[2].sorted = false;
			this.headerData[3].sorted = false;
			this.headerData[0].ascending = !this.headerData[0].ascending;
			let asc = this.headerData[0].ascending;
			if (window.brushActive) {
				this.brushedTableData
				 .sort((rowA, rowB) => comp(rowA.phrase, rowB.phrase, asc));
			} else {	
				this.tableData
				.sort((rowA, rowB) => comp(rowA.phrase, rowB.phrase, asc));
			};
//			console.log("header data: ", this.headerData);
//			console.log("phrase sorted data =",  this.tableData);
			
		} else
		if (this.columnSelected == "frequency") {
			this.headerData[1].sorted = true;
			this.headerData[0].sorted = false;
			this.headerData[2].sorted = false;
			this.headerData[3].sorted = false;
			this.headerData[1].ascending = !this.headerData[1].ascending;
			let asc = this.headerData[1].ascending;
			if (window.brushActive) {
				console.log("Sorting just the brushed info");
				this.brushedTableData
				 .sort((rowA, rowB) => comp(+rowA.total, +rowB.total, asc));
			} else {	
			this.tableData
				.sort((rowA, rowB) => comp(+rowA.total, +rowB.total, asc));
			};

//			console.log("header data: ", this.headerData);
//			console.log("frequency sorted data =",  this.tableData);

		} else 
		if (this.columnSelected == "percentage") {
			this.headerData[2].sorted = true;
			this.headerData[0].sorted = false;
			this.headerData[1].sorted = false;
			this.headerData[3].sorted = false;
			this.headerData[2].ascending = !this.headerData[2].ascending;
			let asc = this.headerData[2].ascending;
			if (window.brushActive) {
				this.brushedTableData
				 .sort((rowA, rowB) => comp(+rowA.percent_of_d_speeches + +rowA.percent_of_r_speeches,  
				 +rowB.percent_of_d_speeches + +rowB.percent_of_r_speeches, asc));
			} else {	
			this.tableData
				.sort((rowA, rowB) => comp(+rowA.percent_of_d_speeches + +rowA.percent_of_r_speeches,  
				 +rowB.percent_of_d_speeches + +rowB.percent_of_r_speeches, asc));
			};

//			console.log("header data: ", this.headerData);
//			console.log("percentage sorted data =",  this.tableData);
		} else 
		if (this.columnSelected == "total") {
			this.headerData[3].sorted = true;
			this.headerData[0].sorted = false;
			this.headerData[1].sorted = false;
			this.headerData[2].sorted = false;
			this.headerData[3].ascending = !this.headerData[3].ascending;
			let asc = this.headerData[3].ascending;
			if (window.brushActive) {
				this.brushedTableData
				 .sort((rowA, rowB) => comp(+rowA.total, +rowB.total, asc));
			this.tableData
				.sort((rowA, rowB) => comp(+rowA.total, +rowB.total, asc));
			};

//			console.log("header data: ", this.headerData);
//			console.log("total sorted data =",  this.tableData);
		}

//		for (let i = 0; i < 100; i ++) {console.log("First 100 records = ", i, this.tableData[i])};
//		return;
		d3.select('#phraseTableBody')
		  .selectAll('*').remove();
		this.drawTable();
		})
    }


}
