/** Class implementing the Node Graph with Sequence Information. */
class recipeSequence {
    /**
     * Creates a Node Sequence Chart Object
     */
    constructor(recipeEventData) {
		
		this.recipeEventData = recipeEventData;

        this.scaleLeanX = d3.scaleLinear()
            .domain([-50, 50])
            .range([0, this.svgWidth]);	
		this.tTime = 500;
		this.svgWidth = 600;
		this.nodeHeight = 25;
		this.margins = { top: 50, left: 20, right: 20, bottom: 50 }
		this.colorScale = d3.schemeSet1;
		this.categories = ["economy/fiscal issues","energy/environment","crime/justice","education",
							"health care","mental health/substance abuse"]
		window.gCategories = this.categories;
		window.gColorScale = this.colorScale;
		this.categoryLabels = ["Economy/fiscal issues","Energy/environment","Crime/justice","Education",
							"Health care","Mental health/substance abuse"]
					
        this.drawNodeGraph();			
		}
    
    drawNodeGraph() {
//		
//        Draw the headers for the Node Graph
//        
		console.log("Entering drawBubbles...", byTopic);
		
		var bubbleLabels = ["50","40","30","20","10","0","10","20","30","40","50"];
		var labelSpacing = (this.svgWidth - this.margins.left - this.margins.right) / 10;
		var total2radius = d3.scaleSqrt()
							 .domain([5,60])
							 .range([1.8,10]);
		
		var posXScale = .67;
		var posYScale = .55;
		var catOffset = 135;
		var firstCatY = 150;
		var firstCatLabelY = 100;
		
//		console.log("bubbble constants...", this.svgWidth, this.bubbleHeight, labelSpacing, bubbleLabels);
//		console.log("colors :", this.colorScale);
		
		function circleXPos(d) {
			if (byTopic) {return d.moveX * posXScale};
			return d.sourceX * posXScale}
			
		function circleYPos(d) {
			if (byTopic) {return d.moveY + firstCatY};
			return firstCatY + d.sourceY * posYScale}

		var bubbleD3 = d3.select('#bubbleChart');
		
		var bubbleLegend = bubbleD3.select('#bubbleHeader')
							.append('g')
							.selectAll('text')
							.data(['Democratic Leaning','Republican Leaning'])
							.enter()
							.append('text')
							.attr('width', this.svgWidth)
							.attr('height', this.bubbleHeight)
							.attr('y',20)
							.attr('x',(d,i) => (i) * 440 + 15)
							.style('font-weight', 700)
							.text((d) => d);
	
		var bubbleAxis = d3.select('#bubbleAxis')
						   .append('g')
						   .selectAll('text')
						   .data(bubbleLabels)
						   .enter()
						   .append('text')
						   .attr('y', 40)
						   .attr('x', (d,i) => (i) * labelSpacing + 15)
						   .style('font-weight', 700)
						   .style('fill', 'black')
						   .text((d) => d);

		d3.select('#bubbleBody').selectAll('*')
//								.transition().duration(500)
								.remove();

		var svg = d3.select("#bubbleBody");
		
		let myBrush = d3.brush();
		svg.append("g")
		   .attr("id","brush-layer")
		   .call(myBrush.on("start brush end", brushed));
		   
		   d3.select('#bubbleBody')
		     .selectAll('circle')
			 .transition().duration(500)
			 .attr('fill', (d) => this.colorScale[this.categories.indexOf(d.category)]);
		   				   	
		this.bubbleDisplay = d3.select('#bubbleBody')
							  .append('g')
							  .selectAll('circle')
							  .data(this.phraseData)
							  .enter()
							  .append('circle')
							  .attr('cy', (d) => circleYPos(d))
							  .attr('cx', (d) => circleXPos(d))
							  
							  .attr('r', (d) => total2radius(d.total))
							  .attr('id', (d,i) => (i))
							  .property("phr",(d) => d.phrase)
							  .property("difference", (d) => d.position.toFixed(1))
							  .property("freq", (d) => d.total * 2)
							  .attr('stroke', 'black')
							  .attr('stroke-width', 0.5)
//	 		 				  .each((d,i) => console.log("bubble: i,d = ", i, d.total))
							  .style('fill', (d,i) => this.colorScale[this.categories.indexOf(
									d.category)]);
									
//		console.log("Bubble display data = ", this.bubbleDisplay, this.bubbleDisplay[0]);
		
		window.bubbleData = this.bubbleDisplay;

		
		function brushed({selection}){
//			console.log("Entering brushed with selection = ", selection, bubbleData)
			window.brushedValues = [];
		    if (selection) {
				
				const [[x0, y0], [x1, y1]] = selection;
				let activeBrushNode = selection;
				window.brushActive = true;
				
//				console.log("Selection =", selection, x0, y0, x1, y1);

				brushedValues = bubbleData.filter(d => x0 <= circleXPos(d)  
											&& circleXPos(d) < x1 
											&& y0 <= circleYPos(d)  
											&& circleYPos(d) < y1)
//								   .transition().duration(500)
								   .style("fill", "steelblue")
//								   .each((d,i) => console.log("In filter: ", i,d.phrase,d.x, d.cx))
								   .data();
								   
//				console.log("In brushed function, brushedValues =  ",  brushedValues);
//				drawBrushedValues(brushedValues);
				
			} else {    

			// there is no brush currently. so we want to update the selection to none
				
				console.log("Clearing current brush and resetting bubble colors");
				brushedValues = [];
				brushActive = false;
				d3.select('#bubbleBody')
				  .selectAll('circle')
				  .transition().duration(500)
//				  .each((d,i) => console.log("in clear brush: ", i, d.category,gCategories.indexOf(d.category)))
				  .style('fill', (d,i) => gColorScale[gCategories.indexOf(d.category)]);
//				d3.select('#selection-output').html(`Selection: No brush`)
			}	
		}					

//
//		Display category headings before each category bubble chart if in category mode
//

		var topicDisplay = d3.select('#bubbleBody');
		
		if (byTopic) {
			topicDisplay.selectAll('text')
						 .data(this.categoryLabels)
						 .enter()
						 .append('text')
//						 .each((d,i) => console.log("bubble category labels: i,d = ", i, d))
						 .attr('x', this.margins.left)
						 .attr('y', (d,i) => firstCatLabelY + (i) * catOffset)
						 .style('font-size', '15px')
						 .style('font-weight', 700)
						 .style('fill', 'black')
						 .transition().duration(500)
						 .text((d) => d); 						 						
		}
		
		var x1 = d3.select("#topicCheckbox");		
		x1.on("click", (event, d) => {this.toggleTopicDisplay();});

//
//		Set up tooltip display process
//
		
		var toolTip = d3.select("#tip")
						.style("position", "absolute")
						.style("visibility", "invisible")
						.attr("class", "tooltip")
						.style('padding-left', '10px')
						.style('padding-right', '10px')
						.style("border", "1px solid #969696")
						.style('text-align','center')
						.style('font-weight', 700)
						.style('background','white')
						.style('fill', 'black')
						.style('opacity',0)
						.text("placeholder tooltip text");

//		this.bubbleDisplay.on('mouseover',function(){toolTip.text(); 
//		bubbleData.on('mouseover',function(){toolTip.text(); 

		topicDisplay.on('mouseover', function(){toolTip.text();
				if (event.target.id=='') {return};
//				console.log("Display pos = ", event, event.offsetX, event.offsetY, event.target.class, event.target);
				return toolTip.style("visibility", "visible");})

				    .on("mousemove", function(){
						if (typeof(event.target.id)=='') {return};
						return toolTip
								.style("top", (event.pageY-120)+"px")
								.style("left",(event.pageX-50)+"px")
								.style('opacity',70)
								.html("<p class='tooltip'>" + event.target.phr + "<br> R " +
										event.target.difference + "<br> in " +
									    event.target.freq + "% of speeches </p>")})

					.on("mouseout", function(){return toolTip
													.style('opacity',0)
													.style("visibility", "hidden");});																						
	}
	
	
	toggleTopicDisplay() {
		console.log("Entering toggleTopicDisplay...", byTopic);
		byTopic = !byTopic;
		if (!byTopic) {
			d3.select("#bubbleBody")
//			this.bubbleDisplay
			  .selectAll('*').remove();
//			d3.select("#bubbleBody")
//			  .selectAll('text').remove();
		}
		this.drawBubbles();
	}

//	import drawBrushedValues() from 'table.js';

    

}
