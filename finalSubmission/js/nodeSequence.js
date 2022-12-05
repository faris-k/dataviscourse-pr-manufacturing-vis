/** Class implementing the Node Graph with Sequence Information. */
class NodeSequence {
    /**
     * Creates a Node Sequence Chart Object
     */
    constructor(eventData) {
		
		this.eventData = eventData;

		this.svgWidth = 1100;
		this.titleHeight = 80;
		this.nodeHeight = 25;
		this.margins = { top: 50, left: 20, right: 20, bottom: 50 }
		this.colorScale = d3.schemeSet1;
		window.gColorScale = this.colorScale;
		this.categories = ["RobotArm","Aligner","ProcessingLocation"]
		window.gCategories = this.categories;
		this.brushActive = false;

        this.drawNodeGraph();			
		}
    
    drawNodeGraph() {
		
		console.log("Entering drawNodeGraph...");
		
		d3.select('#vizTitle')
		  .selectAll('*').remove();
		
		var nodeSequenceTitle = d3.select("#vizTitle")
							.append("g")
							.selectAll("text")
							.data(["Substrate Path Node List"])
							.enter()
							.append("text")
							.attr('width', this.svgWidth)
							.attr('height', this.titleHeight)
							.style('font-weight', 500)
							.style('font-size', "25px")
							.text((d) => d);
							
//		var div = d3.select("#vizBody");
//		let myBrush = d3.brush();
//		div.append("div")
//		   .attr("id","brush-layer");
//		   .call(myBrush.on("start brush end", brushed));
							
		console.log("After title in drawNodeGraph");
		   				   	
		window.eventData = this.eventDisplay;

		
		function brushed({selection}){
//			console.log("Entering brushed with selection = ", selection, eventData)
			window.brushedValues = [];
		    if (selection) {
				this.brushActive = false; return // take out to enable brush
				const [[x0, y0], [x1, y1]] = selection;
				let activeBrushNode = selection;
				window.brushActive = true;
				
//				console.log("Selection =", selection, x0, y0, x1, y1);

				brushedValues = eventData.filter(d => x0 <= circleXPos(d)  
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
				this.brushActive = false;
				d3.select('#vizBody')
				  .selectAll('circle')
				  .transition().duration(500)
//				  .each((d,i) => console.log("in clear brush: ", i, d.category,gCategories.indexOf(d.category)))
				  .style('fill', (d,i) => gColorScale[gCategories.indexOf(d.category)]);
//				d3.select('#selection-output').html(`Selection: No brush`)
			}	
		}					

//
//

		var topicDisplay = d3.select('#vizBody');
		
		
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

		topicDisplay.on('mouseover', function(){toolTip.text();
				if (event.target.id=='') {return};
//				console.log("Display pos = ", event, event.offsetX, event.offsetY, event.target.class, 			event.target);
				return toolTip.style("visibility", "visible");})

				    .on("mousemove", function(){
						return;
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
	
	

//	import drawBrushedValues() from 'table.js';

    

}
