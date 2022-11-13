class Tree {
  constructor(container, globalAppState) {
    this.tree = this.createTree(container);
    this.margin = { left: 5, bottom: 5, top: 5, right: 5 };
    this.width = parseInt(this.tree.style('width')) - this.margin.left - this.margin.right;
    this.height = parseInt(this.tree.style('height')) - this.margin.top - this.margin.bottom;
    this.layout = d3.tree().size([this.height, this.width]);
    this.groupSelector = this.tree.selectAll('g').data(new Array(2).fill(0)).join('g'); // placeholder for g elements

    this.tree
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.nodes = globalAppState.data.map((node) => new Node(
      node.name,
      node.type,
      node.parent,
      node.nStates,
      node.nEvents,
      node.nAttributes,
      node.nParameters,
      node.nExceptions,
      node.nStateMachines
    ));

    this.nodes.forEach(childNode => childNode.parentNode = this.nodes.find(parentNode => parentNode.name === childNode.parentName));
    this.nodes.forEach(parentNode => parentNode.children = this.nodes.filter(childNode => childNode.parentName === parentNode.name));
    
    this.root = this.nodes.find(node => !node.parentNode);
    this.root = d3.hierarchy(this.root, (d) => d.children);
    
    this.colorScale = d3.scaleOrdinal()
      .domain(d3.group(this.nodes, d => d.type).keys())
      .range(d3.schemeSet2);

    this.radiusScale = d3.scaleLinear()
      .domain([
        d3.min(this.nodes, d => +d.nParameters),
        d3.max(this.nodes, d => +d.nParameters),
      ])
      .range([8, 16]);
  }

  createTree(container) {
    let tree = container.append('svg');
    return tree;
  }

  drawNodes(nodesSelector, nodes) {
    let nodeSelector = nodesSelector
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.y}, ${d.x})`);

    nodeSelector
      .append('circle')
      .attr('r', d => this.radiusScale(+d.data.nParameters))
      .attr('fill', d => this.colorScale(d.data.type))
      .attr('stroke', '#000')
      .on('mouseover', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(150)
          .attr('stroke-width', '3px');
      })
      .on('mouseout', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(150)
          .attr('stroke-width', '1px');
      });

    nodeSelector
      .append('text')
      .attr('dy', '.35em')
      .attr('x', d => this.radiusScale(+d.data.nParameters) + 5)
      .attr('text-anchor', 'start')
      .text(d => d.data.name);
  }

  drawLinks(linksSelector, links) {
    let linkSelector = linksSelector
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', '1px');

    let arcLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    linkSelector
      .attr('d', d => arcLink(d))
      .on('mouseover', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(50)
          .attr('stroke', '#000')
          .attr('stroke-width', '3px');
      })
      .on('mouseout', (e,d) => {
        d3.select(e.target)
          .transition()
          .ease(d3.easeLinear)
          .duration(50)
          .attr('stroke', '#ccc')
          .attr('stroke-width', '1px');
      });
  }

  render() {
    let nodes = this.layout(this.root).descendants();
    let links = this.layout(this.root).links();
    let nodesSelector = this.groupSelector.filter((d,i) => i === 0);
    let linksSelector = this.groupSelector.filter((d,i) => i === 1);
    this.drawNodes(nodesSelector, nodes);
    this.drawLinks(linksSelector, links);
    linksSelector.raise();
    nodesSelector.raise();
  }
}
