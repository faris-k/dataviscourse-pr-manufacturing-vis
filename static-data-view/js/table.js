class Table {
  constructor(container, globalAppState) {
    this.data = globalAppState.data;
    this.headers = [
      {
        sorted: false,
        descending: false,
        key: 'name',
        alterFunc: d => d.name,
      },
      {
        sorted: false,
        descending: false,
        key: 'type',
        alterFunc: d => d.type,
      },
      {
        sorted: false,
        descending: false,
        key: 'nStates',
        alterFunc: d => +d.nStates,
      },
      {
        sorted: false,
        descending: false,
        key: 'nEvents',
        alterFunc: d => +d.nEvents,
      },
      {
        sorted: false,
        descending: false,
        key: 'nAttributes',
        alterFunc: d => +d.nAttributes,
      },
      {
        sorted: false,
        descending: false,
        key: 'nParameters',
        alterFunc: d => +d.nParameters,
      },
      {
        sorted: false,
        descending: false,
        key: 'nExceptions',
        alterFunc: d => +d.nExceptions,
      },
      {
        sorted: false,
        descending: false,
        key: 'nStateMachines',
        alterFunc: d => +d.nStateMachines,
      },
    ];
    this.table = this.createTable(container);
  }

  createTable(container) {
    let table = container
      .append('table')
      .classed('table', true)
      .classed('table-hover', true)
      .classed('table-bordered', true);

    let thead = table
      .append('thead')
      .classed('thead-light', true)
      .classed('text-center', true);

    thead
      .append('tr')
      .selectAll('th')
      .data(this.headers)
      .join('th')
      .attr('id', d => d.key)
      .text(d => d.key)
      .append('span')
      .classed('float-end', true)
      .call((selection) => {
        selection.append('i').classed('fa fa-fw fa-sort-asc', true);
        selection.append('i').classed('fa fa-fw fa-sort-desc', true);
      });

    table
      .append('tbody');

    return table;
  }

  attachSortHandlers() {
    this.table.selectAll('th').on('click', e => {
      this.headers.forEach((column) => {
        if (column.key === e.target.id) {
          this.data.sort((x, y) => !column.descending
            ? d3.descending(column.alterFunc(x), column.alterFunc(y))
            : d3.ascending(column.alterFunc(x), column.alterFunc(y))
          );
          column.sorted = true;
          this.table.select(`#${column.key}`).select('.fa-sort-asc').classed('sorted', !column.descending);
          this.table.select(`#${column.key}`).select('.fa-sort-desc').classed('sorted', column.descending);
          column.descending = !column.descending;
        }
        else {
          column.sorted = column.descending = false;
          this.table.select(`#${column.key}`).select('.fa-sort-asc').classed('sorted', column.sorted);
          this.table.select(`#${column.key}`).select('.fa-sort-desc').classed('sorted', column.sorted);
        }
        this.render();
      })
    });
  }

  rowToCellDataTransform(d) {
    const name = {
      type: 'text',
      class: 'align-middle',
      value: d.name,
    };
    const type = {
      type: 'text',
      class: 'align-middle',
      value: d.type,
    };
    const nStates = {
      type: 'text',
      class: 'align-middle',
      value: d.nStates,
    };
    const nEvents = {
      type: 'text',
      class: 'align-middle',
      value: d.nEvents,
    };
    const nAttributes = {
      type: 'text',
      class: 'align-middle',
      value: d.nAttributes,
    };
    const nParameters = {
      type: 'text',
      class: 'align-middle',
      value: d.nParameters,
    };
    const nExceptions = {
      type: 'text',
      class: 'align-middle',
      value: d.nExceptions,
    };
    const nStateMachines = {
      type: 'text',
      class: 'align-middle',
      value: d.nStateMachines,
    };
    const dataList = [name, type, nStates, nEvents, nAttributes, nParameters, nExceptions, nStateMachines];
    return dataList;
  }

  render() {
    let rowSelector = this.table
      .select('tbody')
      .selectAll('tr')
      .data(this.data)
      .join('tr');

    let cellSelector = rowSelector
      .selectAll('td')
      .data(this.rowToCellDataTransform)
      .join('td');

    let textSelector = cellSelector
      .filter(d => d.type === 'text')
      .html(d => d.value)
      .attr('class', d => d.class);

    this.attachSortHandlers();
  }
};
