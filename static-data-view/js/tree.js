class Tree {
  constructor(container, global_app_state) {
    this.tree = this.create_tree(container);
    this.margin = { left: 5, bottom: 5, top: 5, right: 5 };
    this.width = parseInt(this.tree.style('width')) - this.margin.left - this.margin.right;
    this.height = parseInt(this.tree.style('height')) - this.margin.top - this.margin.bottom;
    this.layout = d3.tree().size([this.height, this.width]);
    this.group_selector = this.tree.selectAll('g').data(new Array(2).fill(0)).join('g'); // placeholder for g elements

    this.tree
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.equipments = global_app_state.data.map((equipment) => new Equipment(
      equipment.name,
      equipment.type,
      equipment.parent,
      equipment.n_states,
      equipment.n_events,
      equipment.n_attributes,
      equipment.n_parameters,
      equipment.n_exceptions,
      equipment.n_state_machines
    ));

    this.equipments.forEach(child_equipment => child_equipment.parent_node = this.equipments.find(parent_equipment => parent_equipment.name === child_equipment.parent_name));
    this.equipments.forEach(parent_equipment => parent_equipment.children = this.equipments.filter(child_equipment => child_equipment.parent_name === parent_equipment.name));
    
    this.root = this.equipments.find(equipment => !equipment.parent_name.length);
    this.root = d3.hierarchy(this.root, (d) => d.children);
    
    this.color_scale = d3.scaleOrdinal()
      .domain(d3.group(this.equipments, d => d.type).keys())
      .range(d3.schemeSet2);

    this.radius_scale = d3.scaleLinear()
      .domain([
        d3.min(this.equipments, d => +d.n_parameters),
        d3.max(this.equipments, d => +d.n_parameters),
      ])
      .range([8, 16]);
  }

  create_tree(container) {
    let tree = container.append('svg');
    return tree;
  }

  draw_nodes(nodes_selector, nodes) {
    let node_selector = nodes_selector
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.y}, ${d.x})`);

    node_selector
      .append('circle')
      .attr('r', d => this.radius_scale(+d.data.n_parameters))
      .attr('fill', d => this.color_scale(d.data.type))
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

    node_selector
      .append('text')
      .attr('dy', '.35em')
      .attr('x', d => this.radius_scale(+d.data.n_parameters) + 5)
      .attr('text-anchor', 'start')
      .text(d => d.data.name);
  }

  draw_links(links_selector, links) {
    let link_selector = links_selector
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', '1px');

    let arc_link = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    link_selector
      .attr('d', d => arc_link(d))
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
    let nodes_selector = this.group_selector.filter((d,i) => i === 0);
    let links_selector = this.group_selector.filter((d,i) => i === 1);
    this.draw_nodes(nodes_selector, nodes);
    this.draw_links(links_selector, links);
    links_selector.raise();
    nodes_selector.raise();
  }
}
