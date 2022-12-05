class Table {
  constructor(container, globalAppState) {
    this.globalAppState = globalAppState;
    this.data = this.globalAppState.data;
    this.headers = [
      {
        name: 'Row'
      },
      {
        sorted: false,
        ascending: false,
        key: 'name',
        name: 'Name',
        alterFunc: d => d.name,
      },
      {
        sorted: false,
        ascending: false,
        key: 'type',
        name: 'Type',
        alterFunc: d => d.type,
      },
      {
        sorted: true,
        ascending: false,
        key: 'utilization',
        name: 'Parameters',
        alterFunc: d => d.utilization,
      }
    ];

    this.table = this.createTable(container);
    this.rows = [];

    this.normalScale = d3.scaleOrdinal()
      .domain(d3.group(this.data, d => d.type).keys())
      .range(globalAppState.theme.normal);

    this.brightScale = d3.scaleOrdinal()
      .domain(d3.group(this.data, d => d.type).keys())
      .range(globalAppState.theme.bright);

    this.margin = { top: 25, bottom: 0, left: 7, right: 12 };
    this.width = parseInt(this.table.select('svg').style('width')) - this.margin.left - this.margin.right;
    this.height = parseInt(this.table.select('svg').style('height'));

    this.normalizeUtilization = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.utilization))
      .range([0, 100]);

    this.data.map(d => d.utilization = this.normalizeUtilization(d.utilization));
    this.data.sort((x,y) => x.utilization < y.utilization ? +1 : -1);

    this.utilizationScale = d3.scaleLinear()
      .domain(this.normalizeUtilization.range())
      .range([0, this.width]);
  }

  createTable(container) {
    let table = container
      .append('div')
      .classed('table-responsive', true)
      .append('table')
      .classed('table', true)
      .classed('table-borderless', true);

    let thead = table.append('thead');

    thead.append('tr')
      .selectAll('th')
      .data(this.headers)
      .join('th')
      .call((selection) => {
        let selector = selection
          .filter((d,i) => i !== 0)
          .style('cursor', 'pointer')
          .attr('id', d => d.key)
          .html(d => d.name)
          .append('span')
          .classed('float-end', true);
        selector.append('i').classed('fa fa-fw fa-sort-asc', true);
        selector.append('i').classed('fa fa-fw fa-sort-desc', true);
      });

    thead.append('tr')
      .selectAll('td')
      .data(this.headers)
      .join('td')
      .call((selection) => {
        let types = Array.from(d3.group(this.data, d => d.type).keys());
        types.unshift('All Types');
        types.push('Custom Types');
        selection.filter((d,i) => i === 2)
          .append('div')
          .style('width', '60%')
          .classed('mx-auto', true)
          .append('select')
          .attr('id', 'table-equipment-type-filter')
          .classed('form-control shadow-none w-100', true)
          .selectAll('option')
          .data(types)
          .join('option')
          .attr('value', d => d)
          .text(d => d);

        let selector = selection.filter((d,i) => i === 3)
          .append('svg');
        selector.append('g')
          .classed('utilization-axis', true);
        selector.append('g')
          .classed('brush', true);
      });

    table.append('tbody')
    return table;
  }

  drawAxis(axisSelection) {
    let xaxis = d3.axisTop()
      .scale(this.utilizationScale).ticks(5).tickFormat(d => `${d}`);
    axisSelection
      .attr('transform', `translate(${this.margin.left}, ${0.5 * (this.height + 20)})`)
      .call(xaxis)
      .selectAll('.domain').remove();
  }

  drawBrush(brushSelector, axisSelection) {
    const brush = d3.brushX().extent([[-this.margin.left, 0], [this.width + this.margin.right, this.height]])
      .on('brush', ({ selection }) => {
        let data = null;
        if (selection) {
          const [xMin, xMax] = selection;
          axisSelection.selectAll('.tick').classed('hidden', d =>
            xMin > this.utilizationScale(d) ||
            xMax < this.utilizationScale(d)
          );

          if (this.rows.length) {
            this.table.select('#table-equipment-type-filter').property('value', 'Custom Types');
            data = this.rows.filter(d =>
              xMin <= this.utilizationScale(d.utilization) &&
              xMax >= this.utilizationScale(d.utilization)
            );
          }
          else {
            data = this.data.filter(d =>
              xMin <= this.utilizationScale(d.utilization) &&
              xMax >= this.utilizationScale(d.utilization)
            );
          }   
        } 
        this.render(data);
      })
      .on('end', ({ selection }) => {
        if (!selection) {
          axisSelection.selectAll('.tick').classed('hidden', false);
          if (this.rows.length) {
            this.table.select('#table-equipment-type-filter').property('value', 'All Types');
            this.render();
          }
          else {
            this.render(this.data);
          }    
        }
      });

    brushSelector
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(brush);
  }

  attachSortHandlers() {
    this.table.selectAll('thead th').on('click', e => {
      this.headers.forEach((column) => {
        if (column.key === e.target.id) {
          this.data.sort((x, y) => !column.ascending
            ? d3.ascending(column.alterFunc(x), column.alterFunc(y))
            : d3.descending(column.alterFunc(x), column.alterFunc(y))
          );
          column.sorted = true;
          this.table.select(`#${column.key}`).select('.fa-sort-asc').classed('sorted', column.ascending);
          this.table.select(`#${column.key}`).select('.fa-sort-desc').classed('sorted', !column.ascending);
          column.ascending = !column.ascending;
        }
        else {
          column.sorted = column.ascending = false;
          this.table.select(`#${column.key}`).select('.fa-sort-asc').classed('sorted', column.sorted);
          this.table.select(`#${column.key}`).select('.fa-sort-desc').classed('sorted', column.sorted);
        }
        this.render(this.data);
      })
    });
  }

  rowToCellDataTransform(d,i) {
    const row = {
      type: 'text',
      value: `<input class='form-check-input' type='checkbox'>`
    };
    const name = {
      type: 'text',
      value: d.name,
    };
    const type = {
      type: 'text',
      value:
        `<span
          class='node-type'
          style='
            color: ${this.brightScale(d.type)};
            background: ${this.normalScale(d.type)};
            border: 1px solid ${this.brightScale(d.type)};'
        >
          ${d.type}
        </span>`,
    };
    const utilization = {
      type: 'chart',
      value: d.utilization
    };
    const dataList = [row, name, type, utilization];
    return dataList;
  }

  drawBarChart(chartSelector) {
    let chart = chartSelector.selectAll('svg')
      .data(d => [d])
      .join('svg');

    let group = chart.selectAll('g')
      .data(d => [d])
      .join('g')
      .attr('transform', `translate(${this.margin.left}, ${0.5 * (this.height - 14)})`);

    group.selectAll('rect')
      .data(d => [d, d])
      .join('rect')
      .attr('x', this.utilizationScale.range()[0])
      .attr('width', (d,i) => i === 1
        ? this.utilizationScale(d.value)
        : this.utilizationScale.range()[1]
      )
      .attr('height', '14')
      .attr('fill', (d,i) => i === 1
        ? '#47be7d'
        : '#e4e6ef'
      )
      .attr('style', (d,i) => i === 1
        ? '-webkit-filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, .075));' +
          '-moz-filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, .075));' +
          'filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, .075));'
        : ''
      )
      .attr('rx', 4);
  }

  handleToggleRowSelection() {
    const that = this;
    this.table.selectAll('tbody tr').on('click', function() {
      let row = d3.select(this);
      let checkbox = row.select('input[type=checkbox]');
      let selected = checkbox.property('checked');
      row.select('input[type=checkbox]').property('checked', !selected);
      row.classed('selected', !selected);
      let name = row.select('td').data().pop().name;
      if (!selected)
        that.rows.push(that.globalAppState.data.find(d => d.name === name));
      else
        that.rows.splice(that.rows.findIndex(d => d.name === name), 1);
    });
  }

  handleTableEquipmentTypeFilter() {
    this.table.select('#table-equipment-type-filter')
      .on('change', (e) => {
        this.table.selectAll('.selected').classed('selected', false);
        let type = this.table.select(`#${e.target.id}`).property('value');
        if (type === 'All Types') {
          this.data = this.globalAppState.data;
          this.render();
        }
        else {
          this.data = this.globalAppState.data.filter(d => d.type === type);
          this.render(this.data);
        }      
      });
  }

  render(data = this.globalAppState.data) {
    let rowSelector = this.table
      .select('tbody')
      .selectAll('tr')
      .data(data)
      .join('tr');

    let cellSelector = rowSelector
      .selectAll('td')
      .data((d,i) => this.rowToCellDataTransform(d,i))
      .join('td');

    let textSelector = cellSelector
      .filter(d => d.type === 'text')
      .html(d => d.value);

    let chartSelector = cellSelector.filter(d => d.type === 'chart');
    let axisSelection = this.table.select('.utilization-axis');
    let brushSelector = this.table.select('.brush');

    this.drawBrush(brushSelector, axisSelection);
    this.drawAxis(axisSelection);
    this.drawBarChart(chartSelector);
    this.attachSortHandlers();
    this.handleToggleRowSelection();
    this.handleTableEquipmentTypeFilter();

    axisSelection.raise();
    brushSelector.raise();
  }
};
