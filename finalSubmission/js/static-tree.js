class Tree {
  constructor(container, globalAppState) {
    this.tree = this.createTree(container);

    this.margin = { left: 40, right: 40, bottom: 40, top: 40, };
    this.width = parseInt(this.tree.style('width')) - this.margin.left - this.margin.right;
    this.height = parseInt(this.tree.style('height')) - this.margin.top - this.margin.bottom;

    this.legendBoxWidth = this.width;
    this.legendBoxHeight = 40;

    this.layout = d3.tree().size([this.height - this.legendBoxHeight - 30, this.width]);
    this.counter = 0;

    this.groupSelector = this.tree
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .selectAll('g')
      .data(new Array(5).fill(0)).join('g');

    this.nodesSelector = this.groupSelector.filter((d,i) => i === 0).attr('id', 'nodes');
    this.linksSelector = this.groupSelector.filter((d,i) => i === 1).attr('id', 'links');
    this.legendSelector = this.groupSelector.filter((d,i) => i === 2).attr('id', 'legend');
    this.tooltipSelector = this.groupSelector.filter((d,i) => i === 3).attr('id', 'tooltip');
    this.gridLineSelector = this.groupSelector.filter((d,i) => i === 4).attr('id', 'gridline');

    this.nodes = globalAppState.data;
    this.nodes.forEach(childNode => childNode.parentNode = this.nodes.find(parentNode => parentNode.name === childNode.parentName));
    this.nodes.forEach(parentNode => parentNode.children = this.nodes.filter(childNode => childNode.parentName === parentNode.name));

    this.normalScale = d3.scaleOrdinal()
      .domain(d3.group(this.nodes, d => d.type).keys())
      .range(globalAppState.theme.normal);
    
    this.brightScale = d3.scaleOrdinal()
      .domain(d3.group(this.nodes, d => d.type).keys())
      .range(globalAppState.theme.bright);

    this.radiusScale = d3.scaleLinear()
      .domain(d3.extent(this.nodes, d => d.utilization))
      .range([7, 15]);
  }

  createTree(container) {
    let tree = container.append('svg');
    return tree;
  }

  drawGridLines(source) {
    let nodes = this.layout(this.root).descendants();
    let data  = Array.from(d3.group(nodes, d => d.depth).keys())

    let grid = this.gridLineSelector
      .selectAll('line')
      .data(data);

    let gridEnter = grid.enter()
      .append('line');

    let gridUpdate = gridEnter.merge(grid);

    gridUpdate
      .attr('x1', d => data.length === 1 ? 0 : d * (this.width / (data.length - 1)))
      .attr('x2', d => data.length === 1 ? 0 : d * (this.width / (data.length - 1)))
      .attr('y1', 0.0)
      .attr('y2', this.height - this.legendBoxHeight)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-dasharray', 10)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 1);

    let gridExit = grid.exit()
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();

    let label = this.gridLineSelector
      .selectAll('text')
      .data(data);

    let labelEnter = label.enter()
      .append('text')
      .attr('transform', 'translate(-25,-10)')
      .text(d => `Depth ${d}`);

    let labelUpdate = labelEnter.merge(label);

    labelUpdate
      .attr('transform', d =>
        `translate(
          ${data.length === 1 ? -25 : d * (this.width / (data.length - 1)) - 25}, -10
        )`
      )
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('opacity', 1);

    let labelExit = label.exit()
      .transition()
      .duration(250)
      .ease(d3.easeLinear)
      .attr('opacity', 0)
      .remove();
  }

  drawLegend() {
    const legendXPos = 0.5 * (this.width - this.legendBoxWidth);
    const legendYPos = this.height - this.legendBoxHeight;

    this.legendSelector
      .attr('transform', `translate(${legendXPos}, ${legendYPos + 8})`);

    let legendBox = this.legendSelector
      .selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('width', this.legendBoxWidth)
      .attr('height', this.legendBoxHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black');

    const xCoords = (type) => {
      switch(type) {
        case 'Equipment':
          return 22;
        case 'Subsystem':
          return 13.0 * 'Equipment'.length + xCoords('Equipment');
        case 'IO Device':
          return 13.0 * 'Subsystem'.length + xCoords('Subsystem');
        case 'State Machine Instance':
          return 12.0 * 'IO Device'.length + xCoords('IO Device');
        case 'Logical Element':
          return 8.5 * 'State Machine Instance'.length + xCoords('State Machine Instance');
        case 'Semi Object Type':
          return 9.4 * 'Logical Element'.length + xCoords('Logical Element');
        case 'State Machine':
          return 9.5 * 'Semi Object Type'.length + xCoords('Semi Object Type');
        case 'Module':
          return 10.3 * 'State Machine'.length + xCoords('State Machine');
        case 'Material Location':
          return 15.0 * 'Module'.length + xCoords('Module');
      }
    };

    const yCoords = (type) => {
      return 0.5 * this.legendBoxHeight;
    }

    const radius = 6;

    this.legendSelector
      .selectAll('circle')
      .data(Array.from(d3.group(this.nodes, d => d.type).keys()))
      .join('circle')
      .attr('class', d => this.slugify(d))
      .attr('r', radius)
      .attr('fill', d => this.normalScale(d))
      .attr('stroke', d => this.brightScale(d))
      .attr('stroke-width', '1px')
      .attr('opacity', 0.3)
      .attr('transform', (d,i) => {
        return `translate(${xCoords(d)}, ${yCoords(d,i)})`;
      });
    
    this.legendSelector
      .selectAll('text')
      .data(Array.from(d3.group(this.nodes, d => d.type).keys()))
      .join('text')
      .attr('class', d => this.slugify(d))
      .attr('font-size', '11px')
      .attr('dominant-baseline', 'middle')
      .attr('opacity', 0.3)
      .attr('transform', (d,i) => {
        return `translate(${xCoords(d) + 16}, ${yCoords(d)})`;
      })
      .text(d => d);
  }

  drawTooltipInfoBox(d) {
    if (!d) return;

    const rectWidth = 270;
    const rectHeight = 100;

    const xCoords = (d) => d.y > 0.5 * this.width
      ? d.y - 20 - this.radiusScale(d.data.utilization) - 7 - rectWidth
      : d.y + 20 + this.radiusScale(d.data.utilization) + 7;

    const yCoords = (d) => d.x - 0.5 * rectHeight;

    this.tooltipSelector
      .attr('transform', `translate(${xCoords(d)}, ${yCoords(d)})`);

    this.tooltipSelector
      .append('rect')
      .data(_d => [d])
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', this.normalScale(d.data.type))
      .attr('stroke', this.brightScale(d.data.type))
      .attr('stroke-width', '2px')
      .attr('rx', 8)
      .transition()
      .ease(d3.easeLinear)
      .duration(250)
      .attr('opacity', 0.5);

    this.tooltipSelector
      .append('line')
      .data(_d => [d])
      .attr('x1', d.y > 0.5 * this.width ? rectWidth : -20)
      .attr('x2', d.y > 0.5 * this.width ? rectWidth + 20 : 0)
      .attr('y1', 0.5 * rectHeight)
      .attr('y2', 0.5 * rectHeight)
      .attr('fill', 'none')
      .attr('stroke', this.brightScale(d.data.type))
      .attr('stroke-width', '2px')
      .transition()
      .ease(d3.easeLinear)
      .duration(250)
      .attr('opacity', 0.5);

    this.tooltipSelector
      .selectAll('text')
      .data(_d => [d,d])
      .join('text')
      .attr('x', 0.50 * rectWidth)
      .attr('y', (d,i) => i === 0 ? 25 : 60)
      .attr('fill', this.brightScale(d.data.type))
      .attr('font-size', (d,i) => i === 0 ? '14px' : '30px')
      .attr('text-anchor', 'middle')
      .text((d,i) => i === 0 ? d.data.name : `${d3.format('.0f')(d.data.utilization)}%`);

    let chart = this.tooltipSelector
      .selectAll('g')
      .data(_d => [d])
      .join('g')
      .attr('transform', `translate(0,0)`);

    chart
      .selectAll('rect')
      .data(_d => [d,d])
      .join('rect')
      .attr('x', 0.5 * (rectWidth - 100))
      .attr('y', rectHeight - 25)
      .attr('width', (d,i) => i === 1
        ? d.data.utilization
        : 100
      )
      .attr('height', '10')
      .attr('fill', (d,i) => i === 1
        ? this.brightScale(d.data.type)
        : this.normalScale(d.data.type)
      )
      .attr('stroke', this.brightScale(d.data.type))
      .attr('stroke-width', '2px')
      .attr('rx', 5)
      .attr('opacity', (d,i) =>  i === 0 ? 0.5 : 1.0);
  }

  removeTooltipInfoBox() {
    this.tooltipSelector.selectAll('rect').each(function() {
      d3.select(this)
        .transition()
        .ease(d3.easeLinear)
        .duration(250)
        .attr('opacity', 0)
        .remove();
    });
    this.tooltipSelector.selectAll('line, text, g').each(function() {
      d3.select(this).remove();
    });
  }

  drawNodes(source) {
    let nodes = this.layout(this.root).descendants();

    let node = this.nodesSelector
      .selectAll('g')
      .data(nodes, d => d.id || (d.id = ++this.counter));

    let nodeEnter = node.enter()
      .append('g')
      .attr('transform', `translate(${source.y0}, ${source.x0})`)
      .on('click', (e, d) => {
        this.removeTooltipInfoBox();
        this.handleNodeClickEvent(d);
        nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });
      });

    let circle = nodeEnter.append('circle')
      .attr('r', 0)
      .attr('fill', d => this.normalScale(d.data.type))
      .attr('stroke', d => this.brightScale(d.data.type))
      .attr('cursor', d => d.children || d._children ? 'pointer' : '');

    circle
      .on('mouseover', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(150)
          .attr(
            'style',
            '-webkit-filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));' +
            '-moz-filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));' +
            'filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));'
          )
          .attr('r', d => this.radiusScale(d.data.utilization) + 7)
          .attr('stroke-width', '2px');

        this.tree.selectAll(`.${this.slugify(d.data.type)}`)
          .transition()
          .duration(300)
          .ease(d3.easeLinear)
          .attr(
            'style',
            '-webkit-filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));' +
            '-moz-filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));' +
            'filter: drop-shadow(40px 40px 40px rgba(0, 0, 0, 0.5));'
          )
          .attr('r', 8)
          .attr('stroke-width', '2px')
          .attr('opacity', 1);

        this.drawTooltipInfoBox(d);
      })
      .on('mouseout', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(150)
          .attr('r', d => this.radiusScale(d.data.utilization))
          .attr('stroke-width', '1px');

        this.tree.selectAll(`.${this.slugify(d.data.type)}`)
          .transition()
          .duration(300)
          .ease(d3.easeLinear)
          .attr('r', 5)
          .attr('stroke-width', '1px')
          .attr('opacity', 0.5);

        this.removeTooltipInfoBox();
      });

    let nodeUpdate = nodeEnter.merge(node)
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('transform', d => `translate(${d.y}, ${d.x})`);

    nodeUpdate
      .select('circle')
      .attr('r', d => this.radiusScale(d.data.utilization));

    nodeUpdate
      .select('text')
      .attr('fill-opacity', 1);

    let nodeExit = node.exit()
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${source.y}, ${source.x})`)
      .remove();

    nodeExit.select('circle')
      .attr('r', 0);

    nodeExit.select('text')
      .attr('fill-opacity', 0);
  }

  drawLinks(source) {
    const arcLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    let links = this.layout(this.root).links();

    let link = this.linksSelector
      .selectAll('path')
      .data(links, d => d.target.id);

    let linkEnter = link.enter()
      .insert('path', 'g')
      .attr('d', d => {
        let coords = { x: source.x0, y: source.y0 };
        return arcLink({ source: coords, target: coords });
      })
      .attr('fill', 'none')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', '1px');

    let linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('d', arcLink);

    let linkExit = link.exit()
      .transition()
      .duration(500)
      .ease(d3.easeLinear)
      .attr('d', d => {
        let coords = { x: source.x, y: source.y };
        return arcLink({ source: coords, target: coords });
      })
      .remove();
  }

  handleNodeClickEvent(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
    else {
      d.children = d._children;
      d._children = null;
    }
    this.drawNodes(d);
    this.drawLinks(d);
    this.drawGridLines(d);
  }

  slugify(text) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }

  render() {
    this.root = this.nodes.find(node => !node.parentNode);
    this.root = d3.hierarchy(this.root, (d) => d.children);
    this.root.x0 = 0.5 * this.height;
    this.root.y0 = 0;
    
    this.drawLegend();
    this.drawGridLines(this.root);
    this.drawNodes(this.root);
    this.drawLinks(this.root);

    this.linksSelector.raise();
    this.nodesSelector.raise();
    this.tooltipSelector.raise();
  }
}
