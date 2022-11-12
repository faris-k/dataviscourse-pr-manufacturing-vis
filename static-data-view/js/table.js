class Table {
  constructor(container, global_app_state) {
    this.data = global_app_state.data;
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
        key: 'n_states',
        alterFunc: d => +d.n_states,
      },
      {
        sorted: false,
        descending: false,
        key: 'n_events',
        alterFunc: d => +d.n_events,
      },
      {
        sorted: false,
        descending: false,
        key: 'n_attributes',
        alterFunc: d => +d.n_attributes,
      },
      {
        sorted: false,
        descending: false,
        key: 'n_parameters',
        alterFunc: d => +d.n_parameters,
      },
      {
        sorted: false,
        descending: false,
        key: 'n_exceptions',
        alterFunc: d => +d.n_exceptions,
      },
      {
        sorted: false,
        descending: false,
        key: 'n_state_machines',
        alterFunc: d => +d.n_state_machines,
      },
    ];
    this.table = this.create_table(container);
  }

  create_table(container) {
    let table = container
      .append('table')
      .classed('table table-hover', true);

    let thead = table
      .append('thead')
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

  attach_sort_handlers() {
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

  row_to_cell_data_transform(d) {
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
    const n_states = {
      type: 'text',
      class: 'align-middle',
      value: d.n_states,
    };
    const n_events = {
      type: 'text',
      class: 'align-middle',
      value: d.n_events,
    };
    const n_attributes = {
      type: 'text',
      class: 'align-middle',
      value: d.n_attributes,
    };
    const n_parameters = {
      type: 'text',
      class: 'align-middle',
      value: d.n_parameters,
    };
    const n_exceptions = {
      type: 'text',
      class: 'align-middle',
      value: d.n_exceptions,
    };
    const n_state_machines = {
      type: 'text',
      class: 'align-middle',
      value: d.n_state_machines,
    };
    const data_list = [name, type, n_states, n_events, n_attributes, n_parameters, n_exceptions, n_state_machines];
    return data_list;
  }

  render() {
    let row_selector = this.table
      .select('tbody')
      .selectAll('tr')
      .data(this.data)
      .join('tr');

    let cell_selector = row_selector
      .selectAll('td')
      .data(this.row_to_cell_data_transform)
      .join('td');

    let text_selector = cell_selector
      .filter(d => d.type === 'text')
      .html(d => d.value)
      .attr('class', d => d.class);

    this.attach_sort_handlers();
  }
};
